import { PubSub } from "graphql-subscriptions";
import { Publisher } from "./publisher";
import {
  FileIndexer,
  FileIndexerCloseEvent,
  FileIndexerErrorEvent,
  FileIndexerProgressEvent,
} from "../files/indexing/FileIndexer";

export class IndexingPublisher extends Publisher<"indexing"> {
  private indexer: FileIndexer;

  private cache = new Map<string, { totalBytes: number; bytesRead: number }>();

  constructor(pubsub: PubSub, indexer: FileIndexer) {
    super("indexing", pubsub);
    this.indexer = indexer;
  }

  dispose(): void {
    this.indexer.off("progress", this.receiveProgress);
    this.indexer.off("error", this.receiveError);
    this.indexer.off("close", this.receiveClose);
  }

  init(): void {
    this.indexer.on("progress", this.receiveProgress);
    this.indexer.on("error", this.receiveError);
    this.indexer.on("close", this.receiveClose);
  }

  private receiveProgress = (e: FileIndexerProgressEvent) => {
    console.log("receiveProgress", e);
    this.cache.set(e.path, {
      totalBytes: e.totalBytes,
      bytesRead: e.bytesRead,
    });

    this.publish({ ...e, __typename: "IndexingProgressEvent" }).catch((err) => {
      console.error(err);
      // TODO: Handle error (perhaps handele errors in the parent publisher class instead
    });
  };

  private receiveError = (e: FileIndexerErrorEvent) => {
    this.publish({
      path: e.path,
      description: e.error.message || "Unknown Error",
      __typename: "IndexingErrorEvent",
    }).catch((err) => {
      console.error(err);
      // TODO: Handle error (perhaps handele errors in the parent publisher class instead
    });
  };

  private receiveClose = (e: FileIndexerCloseEvent) => {
    this.cache.delete(e.path);
    this.publish({
      path: e.path,
      __typename: "IndexingCloseEvent",
    }).catch((err) => {
      console.error(err);
      // TODO: Handle error (perhaps handele errors in the parent publisher class instead
    });
  };

  get progress() {
    return this.cache;
  }

  getProgress(path: string) {
    return this.cache.get(path);
  }
}
