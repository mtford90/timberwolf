import { PubSub } from "graphql-subscriptions";
import { Publisher } from "./publisher";

export class FileOpenPublisher extends Publisher<"fileOpen"> {
  constructor(pubSub: PubSub) {
    super("fileOpen", pubSub);
  }

  init() {}

  dispatchOpenFile(paths: string[]) {
    this.publish(paths).catch((err) => {
      // TODO: Handle errors
      console.error(err);
    });
  }

  dispose() {}
}
