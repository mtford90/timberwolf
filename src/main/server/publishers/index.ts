import { PubSub } from "graphql-subscriptions";
import { StdinPublisher } from "./stdin-publisher";
import { FileOpenPublisher } from "./file-open-publisher";
import { FileIndexer } from "../files/indexing/FileIndexer";
import { IndexingPublisher } from "./indexing-publisher";

export function initPublishers(indexer: FileIndexer) {
  const pubSub = new PubSub();

  return {
    stdin: new StdinPublisher(pubSub),
    fileOpen: new FileOpenPublisher(pubSub),
    indexing: new IndexingPublisher(pubSub, indexer),
  };
}

export type Publishers = ReturnType<typeof initPublishers>;
