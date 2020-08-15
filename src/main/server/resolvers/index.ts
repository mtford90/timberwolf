import os from "os";
import { GraphQLDateTime, GraphQLDate, GraphQLTime } from "graphql-iso-date";
import { withFilter } from "graphql-subscriptions";
import {
  Line,
  Resolvers,
  SubscriptionStdinArgs,
  Subscription,
} from "../../../graphql-types.generated";
import { Publishers } from "../publishers";
import { Database } from "../database";

export type ResolverDependencies = {
  publishers: Publishers;
  database: Database;
};

export function initResolvers({
  publishers,
  database,
}: ResolverDependencies): Resolvers {
  return {
    DateTime: GraphQLDateTime,
    Date: GraphQLDate,
    Time: GraphQLTime,
    Query: {
      numCpus() {
        return os.cpus().length;
      },
      stdin(parent, { limit, offset, filter }) {
        return database
          .lines("stdin", { limit, offset, filter })
          .map((res) => ({
            __typename: "Line",
            timestamp: new Date(res.timestamp),
            rowid: res.rowid,
            text: res.text,
          }));
      },
    },

    Subscription: {
      stdin: {
        subscribe: withFilter(
          () => publishers.stdin.asyncIterator(),
          (
            payload: Pick<Subscription, "stdin">,
            variables: SubscriptionStdinArgs
          ) => {
            return variables.filter
              ? payload.stdin.text.indexOf(variables.filter) > -1
              : true;
          }
        ),
      },
    },
  };
}
