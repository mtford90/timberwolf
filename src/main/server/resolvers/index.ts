import os from "os";
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from "graphql-iso-date";
import { withFilter } from "graphql-subscriptions";
import { nativeTheme } from "electron";
import {
  Resolvers,
  Subscription,
  SubscriptionLogsArgs,
} from "../../../graphql-types.generated";
import { Publishers } from "../publishers";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";
import { getExecutablePath } from "./executable-path";

export type ResolverDependencies = {
  publishers: Publishers;
  database: Database;
  websocketServer: WebsocketServer;
};

export function initialiseGQLResolvers({
  publishers,
  database,
  websocketServer,
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
        return database
          .logs(source, { limit, beforeRowId, filter })
          .map((res) => ({
            __typename: "Log" as const,
            timestamp: new Date(res.timestamp),
            rowid: res.rowid,
            text: res.text,
            source,
          }));
      },
      source() {
        return database.sources();
      },
      numLogs(parent, { source, beforeRowId, filter }) {
        return database.numLogs(source, beforeRowId, filter);
      },
      suggest(parent, { source, limit, offset, prefix }) {
        const suggestions = database.suggest(source, prefix, {
          limit: limit || 10,
          offset: offset || 0,
        });

        console.log(`[resolvers] suggest: ${suggestions.join(", ")}`, {
          source,
          limit,
          offset,
          prefix,
        });

        return suggestions;
      },
      systemInfo() {
        return {
          __typename: "SystemInfo",
          darkModeEnabled: nativeTheme.shouldUseDarkColors,
          executablePath: getExecutablePath(),
          websocketPort: websocketServer.port,
        };
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
      systemInfo: {
        subscribe: () => publishers.systemInfo.asyncIterator(),
      },
    },
  };
}
