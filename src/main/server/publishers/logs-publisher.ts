import { PubSub } from "graphql-subscriptions";
import fs from "mz/fs";
import { random } from "lodash";
import { Publisher } from "./publisher";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";
import { WebsocketMessage } from "../websockets/validation";
import { splitText } from "./split";

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
    this.mockStdIn();
  }

  /**
   * Randomly generate stdin input for use in development
   */
  private mockStdIn() {
    const env = process.env.NODE_ENV || "development";
    if (env === "development") {
      fs.readFile("/Users/mtford/Playground/log/log.txt").then(
        (buffer) => {
          const logs = buffer.toString("utf8").split("\n");
          setInterval(() => {
            const index = random(0, logs.length - 1);
            const log = logs[index];

            this.receiveStdin(Buffer.from(log, "utf8"));
          }, 1000);
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  private receiveStdin = (data: Buffer) => {
    const incoming = data.toString();
    const split = splitText(incoming);

    const dbEntries = this.database.insert(
      split.map((s) => ({ source: "stdin", text: s, timestamp: Date.now() }))
    );

    dbEntries.forEach((entry) => {
      this.publish({
        __typename: "Log",
        rowid: entry.rowid,
        text: entry.text,
        timestamp: new Date(entry.timestamp),
        source: "stdin",
      });
    });
  };

  private receiveWebsocketMessage = (message: WebsocketMessage) => {
    const split = splitText(message.text);
    const source = `ws/${message.name}`;

    const toInsert = split.map((s) => {
      return {
        source,
        text: s,
        timestamp: message.timestamp,
      };
    });

    const rows = this.database.insert(toInsert);

    rows.forEach((r) => {
      this.publish({
        __typename: "Log",
        rowid: r.rowid,
        text: r.text,
        timestamp: new Date(r.timestamp),
        source: r.source,
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
