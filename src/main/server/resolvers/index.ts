import os from "os";
import { Resolvers } from "../../../graphql-types.generated";
import { Publishers } from "../publishers";

export type ResolverDependencies = {
  publishers: Publishers;
};

export function initResolvers({ publishers }: ResolverDependencies): Resolvers {
  return {
    Query: {
      numCpus() {
        return os.cpus().length;
      },
      stdin() {
        return publishers.stdin.stdinLines;
      },
    },

    Subscription: {
      stdin: {
        subscribe: () => publishers.stdin.asyncIterator(),
      },
    },
  };
}
