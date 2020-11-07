import { PubSub } from "graphql-subscriptions";
import { Publisher } from "./publisher";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";
import { WebsocketMessage } from "../websockets/validation";
import { splitText } from "./split";
import { DEFAULT_SOURCE } from "../websockets/constants";

export type StdinReadStream = typeof process.stdin;

export class LogsPublisher extends Publisher<"logs"> {
  private stdin: NodeJS.ReadStream & { fd: 0 };

  private database: Database;

  private websocketServer?: WebsocketServer;

  constructor({
    pubSub,
    database,
    stdin = process.stdin,
    websocketServer,
  }: {
    pubSub: PubSub;
    database: Database;
    stdin?: StdinReadStream;
    websocketServer?: WebsocketServer;
  }) {
    super("logs", pubSub);
    this.stdin = stdin;
    this.database = database;
    this.websocketServer = websocketServer;
  }

  init() {
    this.stdin.resume();
    this.stdin.setEncoding("utf8");
    this.stdin.on("data", this.receiveStdin);
    this.websocketServer?.on("message", this.receiveWebsocketMessage);
    this.websocketServer?.on("error", this.receiveWebsocketError);
  }

  private receiveStdin = (data: Buffer) => {
    const incoming = data.toString();
    const split = splitText(incoming);

    const sourceId = this.database.sources.upsert("stdin");

    const dbEntries = this.database.logs.insert(
      split.map((s) => ({ sourceId, text: s, timestamp: Date.now() }))
    );

    const source = this.database.sources.getByName("stdin");

    if (!source) {
      throw new Error(
        "Something went very wrong. The STDIN source was not created"
      );
    }

    dbEntries.forEach((entry) => {
      this.publish({
        __typename: "Log",
        rowid: entry.rowid,
        text: entry.text,
        timestamp: new Date(entry.timestamp),
        source: {
          __typename: "Source",
          ...source,
        },
      });
    });
  };

  private receiveWebsocketMessage = (message: WebsocketMessage) => {
    const split = splitText(message.text);
    const { name, id } = message;

    const sourceId = id || this.database.sources.upsert(name || DEFAULT_SOURCE);

    const toInsert = split.map((s) => {
      return {
        sourceId,
        text: s,
        timestamp: message.timestamp,
      };
    });

    const rows = this.database.logs.insert(toInsert);

    const source = this.database.sources.get(sourceId);

    if (!source) {
      throw new Error("Something went very wrong. Source was not created");
    }

    rows.forEach((r) => {
      this.publish({
        __typename: "Log",
        rowid: r.rowid,
        text: r.text,
        timestamp: new Date(r.timestamp),
        source: {
          ...source,
          __typename: "Source",
        },
      });
    });
  };

  private receiveWebsocketError = (error: Error) => {
    // TODO: improve error handling
    console.error(error);
  };

  dispose() {
    this.stdin.off("data", this.receiveStdin);
    this.websocketServer?.off("message", this.receiveWebsocketMessage);
    this.websocketServer?.off("error", this.receiveWebsocketError);
  }
}
