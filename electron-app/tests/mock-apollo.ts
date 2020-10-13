import { ApolloServer, PubSub } from "apollo-server";
import getPort from "get-port";
import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { random } from "lodash";
import schema from "../src/main/server/schema.graphql";
import { Resolvers } from "../src/graphql-types.generated";
import { UnwrapPromise } from "../src/common/type-utils";

/**
 * Create a mocked apollo server & client for use during testing.
 *
 * Note: I tried all of MockedProvider, mockServer & SchemaLink and none worked well with subscriptions...
 */
export async function mockApollo(getResolvers: (pubSub: PubSub) => Resolvers) {
  const pubSub = new PubSub();

  const server = new ApolloServer({
    typeDefs: schema,
    resolvers: getResolvers(pubSub) as never,
  });

  const port = await getPort({ port: random(2000, 50000) });

  const { url, subscriptionsUrl, server: httpServer } = await server.listen(
    port
  );

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
    // This is the client for use with ApolloProvider
    client,
    // This is the pubSub instance for use with publishing data to graphql subscriptions
    pubSub,
    // This terminates the apollo server (and the underlying http server for good measure, since apollo's own stop method seems to be buggy...
    stop: () => {
      server.stop();
      httpServer.close();
    },
  };
}

export type MockGQLEnvironment = UnwrapPromise<ReturnType<typeof mockApollo>>;
