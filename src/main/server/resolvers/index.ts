import os from "os";
import { GraphQLDateTime, GraphQLDate, GraphQLTime } from "graphql-iso-date";
import { withFilter } from "graphql-subscriptions";
import {
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
      stdin(parent, { limit, beforeRowId, filter }) {
        const lines = database
          .lines("stdin", { limit, beforeRowId, filter })
          .map((res) => ({
            __typename: "Line" as const,
            timestamp: new Date(res.timestamp),
            rowid: res.rowid,
            text: res.text,
          }));

        console.log("stdin", { limit, beforeRowId, filter }, lines.length);

        return lines;
      },
      numLines(parent, { beforeRowId, filter }) {
        return database.numLines("stdin", beforeRowId, filter);
      },
      suggest(parent, { limit, offset, prefix }) {
        return database.suggest("stdin", prefix, {
          limit: limit || 10,
          offset: offset || 0,
        });
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
