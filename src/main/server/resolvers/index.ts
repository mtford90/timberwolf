import os from "os";
import { GraphQLDateTime, GraphQLDate, GraphQLTime } from "graphql-iso-date";
import { withFilter } from "graphql-subscriptions";
import {
  Resolvers,
  Subscription,
  SubscriptionLogsArgs,
} from "../../../graphql-types.generated";
import { Publishers } from "../publishers";
import { Database } from "../database";

export type ResolverDependencies = {
  publishers: Publishers;
  database: Database;
};

export function initialiseGQLResolvers({
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
      logs(parent, { source, limit, beforeRowId, filter }) {
        const logs = database
          .logs(source, { limit, beforeRowId, filter })
          .map((res) => ({
            __typename: "Log" as const,
            timestamp: new Date(res.timestamp),
            rowid: res.rowid,
            text: res.text,
            source,
          }));

        console.log("stdin", { limit, beforeRowId, filter }, logs.length);

        return logs;
      },
      source() {
        return database.sources();
      },
      numLogs(parent, { source, beforeRowId, filter }) {
        return database.numLogs(source, beforeRowId, filter);
      },
      suggest(parent, { source, limit, offset, prefix }) {
        return database.suggest(source, prefix, {
          limit: limit || 10,
          offset: offset || 0,
        });
      },
    },

    Subscription: {
      logs: {
        subscribe: withFilter(
          () => {
            return publishers.logs.asyncIterator();
          },
          (
            payload: Pick<Subscription, "logs">,
            variables: SubscriptionLogsArgs
          ) => {
            if (variables.filter) {
              const match = payload.logs.text.indexOf(variables.filter) > -1;
              if (!match) return false;
            }

            if (variables.source) {
              const match = payload.logs.source === variables.source;
              if (!match) return false;
            }

            return true;
          }
        ),
      },
    },
  };
}
