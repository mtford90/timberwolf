import { PubSub } from "graphql-subscriptions";
import { Publisher } from "./publisher";
import { SystemEvent } from "../../../graphql-types.generated";

export class SystemEventsPublisher extends Publisher<"systemEvent"> {
  constructor({ pubsub }: { pubsub: PubSub }) {
    super("systemEvent", pubsub);
  }

  sendNewTabEvent() {
    this.publish(SystemEvent.NewTab);
  }

  sendCloseTabEvent() {
    this.publish(SystemEvent.CloseTab);
  }

  sendNewWindowEvent() {
    this.publish(SystemEvent.NewWindow);
  }

  dispose(): void {}

  init(): void {}
}
