import os from "os";
import { Resolvers } from "../../../graphql-types.generated";
import { Publishers } from "../publishers";
import { FileIndexer } from "../files/indexing/FileIndexer";

export type ResolverDependencies = {
  publishers: Publishers;
  indexer: FileIndexer;
};

export function initResolvers({
  publishers,
  indexer,
}: ResolverDependencies): Resolvers {
  return {
    Query: {
      numCpus() {
        return os.cpus().length;
      },
      stdin() {
        return publishers.stdin.stdinLines;
      },
      progress() {
        return Array.from(publishers.indexing.progress.entries()).map(
          ([key, value]) => ({
            __typename: "IndexingProgressEvent",
            path: key,
            ...value,
          })
        );
      },
    },
    Mutation: {
      index: async (_parent, { path }) => {
        await indexer.index(path);

        return {
          __typename: "IndexResult",
          ok: true,
        };
      },
    },
    Subscription: {
      stdin: {
        subscribe: () => publishers.stdin.asyncIterator(),
      },
      fileOpen: {
        subscribe: () => publishers.fileOpen.asyncIterator(),
      },
      indexing: {
        subscribe: () => publishers.indexing.asyncIterator(),
      },
    },
  };
}
