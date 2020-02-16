import { PubSub } from "graphql-subscriptions";
import { Publisher } from "./publisher";

export class StdinPublisher extends Publisher<"stdin"> {
  stdinLines: string[] = [];

  private stdin: NodeJS.ReadStream & { fd: 0 };

  constructor(pubSub: PubSub, stdin: typeof process.stdin = process.stdin) {
    super("stdin", pubSub);
    this.stdin = stdin;
  }

  init() {
    this.stdin.resume();
    this.stdin.setEncoding("utf8");

    this.stdin.on("data", this.receive);

    // TODO: Remove
    setTimeout(() => {
      // eslint-disable-next-line no-buffer-constructor
      this.receive(new Buffer(`yoooo {"x": 1}`));
    }, 5000);
  }

  receive = (data: Buffer) => {
    const str = data.toString();
    this.stdinLines.push(str);
    this.publish(str).catch((err) => {
      // TODO: Handle err properly
      console.error(err);
    });
  };

  dispose() {
    this.stdin.off("data", this.receive);
  }
}
