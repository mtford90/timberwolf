import os from "os";
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from "graphql-iso-date";
import { nativeTheme } from "electron";
import { Resolvers } from "../../../graphql-types.generated";
import { Publishers } from "../publishers";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";
import { getExecutablePath } from "./executable-path";
import { logsSubscriptionResolver } from "./subscriptions/logs";

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
      numLogs(parent, { sourceId, beforeRowId, filter }) {
        return database.numLogs(sourceId, beforeRowId, filter);
      },
      suggest(parent, { sourceId, limit, offset, prefix }) {
        return database.suggest(sourceId, prefix, {
          limit: limit || 10,
          offset: offset || 0,
        });
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
      logs: logsSubscriptionResolver(() => publishers.logs.asyncIterator()),
      systemInfo: {
        subscribe: () => publishers.systemInfo.asyncIterator(),
      },
      systemEvent: {
        subscribe: () => publishers.systemEvents.asyncIterator(),
      },
      source: {
        subscribe: () => publishers.source.asyncIterator(),
        resolve: () =>
          database
            .getSources()
            .map((s) => ({ ...s, __typename: "Source" as const })),
      },
    },

    Mutation: {
      createSource(parent, { source: inputSource }) {
        const id = database.createSource(inputSource.name);
        const source = database.getSource(id);

        if (!source) {
          throw new Error("Something went very wrong. Source was not created");
        }

        return {
          ...source,
          __typename: "Source",
        };
      },
      deleteSource(parent, { id }) {
        database.deleteSource(id);
        return id;
      },
      renameSource(parent, { id, name }) {
        database.renameSource(id, name);
        const source = database.getSource(id);

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
