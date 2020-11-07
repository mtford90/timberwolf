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
        const source = database.sources.get(sourceId);

        if (!source) {
          throw new Error("No such source");
        }

        return database.logs
          .findMany(sourceId, { limit, beforeRowId, filter })
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
        return database.sources
          .all()
          .map((s) => ({ ...s, __typename: "Source" }));
      },
      numLogs(parent, { sourceId, beforeRowId, filter }) {
        return database.logs.count(sourceId, beforeRowId, filter);
      },
      suggest(parent, { sourceId, limit, offset, prefix }) {
        return database.suggestions.suggest(sourceId, prefix, {
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
          database.sources
            .all()
            .map((s) => ({ ...s, __typename: "Source" as const })),
      },
    },

    Mutation: {
      createSource(parent, { source: inputSource }) {
        const id = database.sources.create(inputSource.name);
        const source = database.sources.get(id);

        if (!source) {
          throw new Error("Something went very wrong. Source was not created");
        }

        return {
          ...source,
          __typename: "Source",
        };
      },
      deleteSource(parent, { id }) {
        database.sources.delete(id);
        return id;
      },
      renameSource(parent, { id, name }) {
        database.sources.rename(id, name);
        const source = database.sources.get(id);

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
