import { ApolloServer, PubSub } from "apollo-server";
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from "graphql-iso-date";
import getPort from "get-port";
import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { random } from "lodash";
import schema from "../src/main/server/schema.graphql";
import { Log, Resolvers } from "../src/graphql-types.generated";
import { SystemEvent } from "../__generated__/globalTypes";
import { UnwrapPromise } from "../src/common/type-utils";

export async function getMockGQLEnvironment() {
  const pubSub = new PubSub();
  let sources: string[] = [];

  const resolvers: Resolvers = {
    DateTime: GraphQLDateTime,
    Date: GraphQLDate,
    Time: GraphQLTime,
    Query: {
      source() {
        return sources.map((id) => ({ id, __typename: "Source" }));
      },
    },
    Subscription: {
      logs: {
        subscribe: () => pubSub.asyncIterator(["logs"]),
      },
      systemEvent: {
        subscribe: () => pubSub.asyncIterator(["systemEvent"]),
      },
      systemInfo: {
        subscribe: () => pubSub.asyncIterator(["systemInfo"]),
      },
    },
    Mutation: {
      deleteSource: jest.fn((parent, { sourceId }) => sourceId),
    },
  };

  const server = new ApolloServer({
    typeDefs: schema,
    resolvers: resolvers as never,
  });

  const port = await getPort({ port: random(2000, 50000) });

  const { url, subscriptionsUrl, server: httpServer } = await server.listen(
    port
  );

  console.log("listening", url, subscriptionsUrl);

  const httpLink = new HttpLink({ uri: url });

  const wsLink = new WebSocketLink({
    uri: subscriptionsUrl,
    options: {
      reconnect: true,
    },
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  const cache = new InMemoryCache();

  const client = new ApolloClient({
    link: splitLink,
    cache,
  });

  return {
    client,
    resolvers,
    emitSystemEvent: (systemEvent: SystemEvent) => {
      return pubSub.publish("systemEvent", { systemEvent });
    },
    stop: () => {
      server.stop();
      httpServer.close();
    },
    emitLog: (log: Log) => {
      setImmediate(() => {
        pubSub
          .publish("logs", {
            logs: log,
          })
          .catch((err) => {
            console.error(err);
          });
      });
    },
    setSources: (ss: string[]) => {
      console.log("setSources", ss);
      sources = ss;
    },
  };
}

export type MockGQLEnvironment = UnwrapPromise<
  ReturnType<typeof getMockGQLEnvironment>
>;
