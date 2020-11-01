import { PubSub } from "graphql-subscriptions";
import { Publisher } from "./publisher";
import { Database } from "../database";

export class SourcePublisher extends Publisher<"source"> {
  private db: Database;

  constructor({ pubSub, db }: { pubSub: PubSub; db: Database }) {
    super("source", pubSub);
    this.db = db;
  }

  /**
   * Emit all sources to graphql subscriptions
   */
  private publishSources() {
    const sources = this.db.getSources();
    const gqlSources = sources.map((source) => ({
      ...source,
      __typename: "Source" as const,
    }));
    this.publish(gqlSources);
  }

  dispose(): void {
    this.db.off("delete:source", this.handleEvent);
    this.db.off("update:source", this.handleEvent);
    this.db.off("create:source", this.handleEvent);
  }

  init(): void {
    this.db.on("delete:source", this.handleEvent);
    this.db.on("update:source", this.handleEvent);
    this.db.on("create:source", this.handleEvent);
  }

  handleEvent = () => {
    this.publishSources();
  };
}
