import { PubSub } from "graphql-subscriptions";
import fs from "mz/fs";
import { random } from "lodash";
import { Publisher } from "./publisher";
import { Database } from "../database";

export type StdinReadStream = typeof process.stdin;

export class LogsPublisher extends Publisher<"logs"> {
  private stdin: NodeJS.ReadStream & { fd: 0 };

  private database: Database;

  constructor({
    pubSub,
    database,
    stdin = process.stdin,
  }: {
    pubSub: PubSub;
    database: Database;
    stdin?: StdinReadStream;
  }) {
    super("logs", pubSub);
    this.stdin = stdin;
    this.database = database;
  }

  init() {
    this.stdin.resume();
    this.stdin.setEncoding("utf8");

    this.stdin.on("data", this.receive);
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

            this.receive(Buffer.from(log, "utf8"));
          }, 1000);
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  receive = (data: Buffer) => {
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

  dispose() {
    this.stdin.off("data", this.receive);
  }
}
