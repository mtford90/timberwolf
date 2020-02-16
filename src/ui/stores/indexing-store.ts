import { ApolloClient } from "@apollo/client";
import { observable, runInAction } from "mobx";
import { IndexingProgressQuery } from "../__generated__/IndexingProgressQuery";
import { IndexProgressSub } from "../__generated__/IndexProgressSub";
import { INDEX_PROGRESS_QUERY, INDEX_PROGRESS_SUBSCRIPTION } from "./gql";

export class IndexingStore {
  private client: ApolloClient<any>;

  private sub?: ZenObservable.Subscription;

  constructor(client: ApolloClient<any>) {
    this.client = client;
  }

  @observable
  readonly progress: Map<
    string,
    { totalBytes: number; bytesRead: number }
  > = new Map();

  async init() {
    const { data } = await this.client.query<IndexingProgressQuery>({
      query: INDEX_PROGRESS_QUERY,
    });

    // TODO: handle error from above

    if (data?.progress) {
      runInAction(() => {
        data.progress.forEach((p) => {
          this.progress.set(p.path, {
            totalBytes: p.totalBytes,
            bytesRead: p.bytesRead,
          });
        });
      });
    }

    this.initSubscription();
  }

  private initSubscription() {
    const observableSub = this.client.subscribe<IndexProgressSub>({
      query: INDEX_PROGRESS_SUBSCRIPTION,
    });

    this.sub = observableSub.subscribe((o) => {
      if (o.data) {
        const event = o.data.indexing;
        if (event.__typename === "IndexingCloseEvent") {
          runInAction(() => {
            this.progress.delete(event.path);
          });
        } else if (event.__typename === "IndexingProgressEvent") {
          runInAction(() => {
            this.progress.set(event.path, {
              totalBytes: event.totalBytes,
              bytesRead: event.bytesRead,
            });
          });
        } else {
          console.error(new Error(event.description));
          // TODO: Handle errors properly...
        }
      }
    });
  }

  dispose() {
    this.sub?.unsubscribe();
    this.sub = undefined;
  }
}
