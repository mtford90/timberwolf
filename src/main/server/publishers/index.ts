import { PubSub } from "graphql-subscriptions";
import { StdinPublisher } from "./stdin-publisher";
import { Database } from "../database";

export function initPublishers(database: Database) {
  const pubSub = new PubSub();

  return {
    stdin: new StdinPublisher({ pubSub, database }),
  };
}

export type Publishers = ReturnType<typeof initPublishers>;
