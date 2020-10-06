import { PubSub } from "graphql-subscriptions";
import { LogsPublisher } from "./logs-publisher";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";
import { SystemInfoPublisher } from "./system-info-publisher";

export function initPublishers(
  database: Database,
  websocketServer: WebsocketServer
) {
  const pubSub = new PubSub();

  return {
    logs: new LogsPublisher({ pubSub, database, websocketServer }),
    systemInfo: new SystemInfoPublisher({ pubsub: pubSub, websocketServer }),
  };
}

export type Publishers = ReturnType<typeof initPublishers>;
