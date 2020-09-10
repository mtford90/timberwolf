import { PubSub } from "graphql-subscriptions";
import { LogsPublisher } from "./logs-publisher";
import { Database } from "../database";

export function initPublishers(database: Database) {
  const pubSub = new PubSub();

  return {
    stdin: new LogsPublisher({ pubSub, database }),
  };
}

export type Publishers = ReturnType<typeof initPublishers>;
