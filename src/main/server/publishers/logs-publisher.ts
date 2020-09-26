import { PubSub } from "graphql-subscriptions";
import fs from "mz/fs";
import { random } from "lodash";
import { Publisher } from "./publisher";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";
import { WebsocketMessage } from "../websockets/validation";

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
    const text = data.toString();
    const [newLine] = this.database.insert([{ source: "stdin", text }]);
    this.publish({
      __typename: "Log",
      rowid: newLine.rowid,
      text: newLine.text,
      timestamp: new Date(newLine.timestamp),
      source: "stdin",
    }).catch((err) => {
      // TODO: Handle err properly
      console.error(err);
    });
  };

  private receiveWebsocketMessage = (message: WebsocketMessage) => {
    const [newLine] = this.database.insert([
      {
        source: `ws/${message.name}`,
        text: message.text,
        timestamp: message.timestamp,
      },
    ]);

    const source = `ws/${message.name}`;

    this.publish({
      __typename: "Log",
      rowid: newLine.rowid,
      text: message.text,
      timestamp: message.timestamp,
      source,
    }).catch((err) => {
      // TODO: Handle err properly
      console.error(err);
    });
  };

  dispose() {
    this.stdin.off("data", this.receiveStdin);
    this.websocketServer?.off("message", this.receiveWebsocketMessage);
  }
}
