import { PubSub } from "graphql-subscriptions";
import { LogsPublisher } from "./logs-publisher";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";

export function initPublishers(
  database: Database,
  websocketServer: WebsocketServer
) {
  const pubSub = new PubSub();

  return {
    logs: new LogsPublisher({ pubSub, database, websocketServer }),
  };
}

export type Publishers = ReturnType<typeof initPublishers>;
