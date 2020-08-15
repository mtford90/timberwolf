import { PubSub } from "graphql-subscriptions";
import fs from "mz/fs";
import { random } from "lodash";
import { Publisher } from "./publisher";
import { Database } from "../database";

export type StdinReadStream = typeof process.stdin;

export class StdinPublisher extends Publisher<"stdin"> {
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
    super("stdin", pubSub);
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
          const lines = buffer.toString("utf8").split("\n");
          setInterval(() => {
            const index = random(0, lines.length - 1);
            const line = lines[index];

            this.receive(Buffer.from(line, "utf8"));
          }, 5000);
          setTimeout(() => {
            // eslint-disable-next-line no-buffer-constructor
          }, 5000);
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  receive = (data: Buffer) => {
    const text = data.toString();
    const [newLine] = this.database.insert([{ path: "stdin", text }]);
    this.publish({
      __typename: "Line",
      rowid: newLine.rowid,
      text: newLine.text,
      timestamp: new Date(newLine.timestamp),
    }).catch((err) => {
      // TODO: Handle err properly
      console.error(err);
    });
  };

  dispose() {
    this.stdin.off("data", this.receive);
  }
}
