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
      logs(parent, { sourceId, limit, beforeRowId, filter }) {
        const source = database.getSource(sourceId);

        if (!source) {
          throw new Error("No such source");
        }

        return database
          .getLogs(sourceId, { limit, beforeRowId, filter })
          .map((res) => ({
            __typename: "Log" as const,
            timestamp: new Date(res.timestamp),
            rowid: res.rowid,
            text: res.text,
            source: {
              ...source,
              __typename: "Source",
            },
          }));
      },
      source() {
        return database
          .getSources()
          .map((s) => ({ ...s, __typename: "Source" }));
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
            const log = payload.logs;

            if (!log) return false;

            if (variables.filter) {
              const match = log.text.indexOf(variables.filter) > -1;
              if (!match) return false;
            }

            if (variables.sourceId) {
              const match = log.source.id === variables.sourceId;
              if (!match) return false;
            }

            return true;
          }
        ),
      },
      systemInfo: {
        subscribe: () => publishers.systemInfo.asyncIterator(),
      },
      systemEvent: {
        subscribe: () => publishers.systemEvents.asyncIterator(),
      },
    },

    Mutation: {
      createSource(parent, { source }) {
        database.upsertSource(source.id, source.name);
        // The command line client should never be able to override the name of the tab, since it was set in the client
        // TODO.TEST: Test that the mutation overrides the name
        database.overrideSourceName(source.id, source.name);
        return {
          ...source,
          __typename: "Source",
        };
      },
      deleteSource(parent, { sourceId }) {
        database.deleteSource(sourceId);
        return sourceId;
      },
      renameSource(parent, { sourceId, name }) {
        database.overrideSourceName(sourceId, name);
        const source = database.getSource(sourceId);
        return source
          ? {
              ...source,
              __typename: "Source",
            }
          : null;
      },
    },
  };
}
