import { PubSub } from "graphql-subscriptions";
import { StdinPublisher } from "./stdin-publisher";

export function initPublishers() {
  const pubSub = new PubSub();

  return {
    stdin: new StdinPublisher(pubSub),
  };
}

export type Publishers = ReturnType<typeof initPublishers>;
