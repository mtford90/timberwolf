import { PubSub } from "graphql-subscriptions";
import { LogsPublisher } from "./logs-publisher";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";
import { SystemInfoPublisher } from "./system-info-publisher";
import { SystemEventsPublisher } from "./system-events-publisher";

export function initPublishers(
  database: Database,
  websocketServer: WebsocketServer
) {
  const pubSub = new PubSub();

  return {
    logs: new LogsPublisher({ pubSub, database, websocketServer }),
    systemInfo: new SystemInfoPublisher({ pubsub: pubSub, websocketServer }),
    systemEvents: new SystemEventsPublisher({ pubsub: pubSub }),
  };
}

export type Publishers = ReturnType<typeof initPublishers>;
