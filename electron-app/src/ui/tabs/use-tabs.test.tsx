import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";

import { GraphQLDate, GraphQLDateTime, GraphQLTime } from "graphql-iso-date";
import { ApolloServer, PubSub } from "apollo-server";
import { WebSocketLink } from "@apollo/client/link/ws";

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import getPort from "get-port";
import { getMainDefinition } from "@apollo/client/utilities";
import { useTabs } from "./use-tabs";

import schema from "../../main/server/schema.graphql";
import { Log, Resolvers } from "../../graphql-types.generated";
import { SystemEvent } from "../../../__generated__/globalTypes";
import "isomorphic-fetch";

async function getMockedApolloClient(initialSources: string[] = []) {
  const pubSub = new PubSub();

  const resolvers: Resolvers = {
    DateTime: GraphQLDateTime,
    Date: GraphQLDate,
    Time: GraphQLTime,
    Query: {
      source() {
        return initialSources.map((id) => ({ id, __typename: "Source" }));
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
      deleteSource: (parent, { sourceId }) => sourceId,
    },
  };

  const server = new ApolloServer({
    typeDefs: schema,
    resolvers: resolvers as never,
  });

  const port = await getPort({ port: 4000 });

  const { url, subscriptionsUrl } = await server.listen(port);

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
    pubSub,
    emitSystemEvent: (systemEvent: SystemEvent) => {
      return pubSub.publish("systemEvent", { systemEvent });
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
  };
}

async function render(initialSources: string[] = []) {
  const { client, ...rest } = await getMockedApolloClient(initialSources);

  const utils = renderHook(() => useTabs(), {
    wrapper: ({ children }) => (
      <ApolloProvider client={client}>
        <>{children as any}</>
      </ApolloProvider>
    ),
  });

  return {
    ...utils,
    ...rest,
    selectTab: async (tabId: string) => {
      act(() => utils.result.current.setSelectedTabId(tabId));
      await utils.waitFor(() =>
        Boolean(utils.result.current.selectedTabId === tabId)
      );
    },
  };
}

describe("useTabs", () => {
  describe("when start with two tabs", () => {
    describe("and one tab is provided by the subscription", () => {
      it("should render 3 tabs", async () => {
        const { result, waitFor, waitForNextUpdate, pubSub } = await render([
          "stdin",
          "my log",
        ]);

        await waitForNextUpdate();

        await waitFor(() => Boolean(result.current.tabs.length));

        expect(result.current.tabs).toHaveLength(2);

        setImmediate(() => {
          pubSub
            .publish("logs", {
              logs: {
                __typename: "Log",
                text: "some text",
                timestamp: Date.now(),
                source: {
                  __typename: "Source",
                  id: "ws:/my other log",
                },
                rowid: 10,
              },
            })
            .catch((err) => {
              console.error(err);
            });
        });

        await waitFor(() => result.current.tabs.length === 3);

        expect(result.current.tabs[2].id).toEqual("ws:/my other log");
      });
    });
  });

  // describe("delete tab", () => {
  //   describe("when a tab is deleted", () => {
  //     describe("if there is a tab remaining", () => {
  //       const mocks = getMockedApolloClient(["stdin", "ws:/my log"], null);
  //
  //       describe("if the tab to be deleted is selected", () => {
  //         async function setup() {
  //           const { result, waitFor, selectTab } = render(mocks);
  //           await waitFor(() => Boolean(result.current.tabs.length));
  //
  //           expect(result.current.tabs).toHaveLength(2);
  //
  //           await selectTab("ws:/my log");
  //           act(() => result.current.deleteTab("ws:/my log"));
  //           await waitFor(() => result.current.tabs.length === 1);
  //
  //           return { result };
  //         }
  //
  //         it("should only return the remaining tab", async () => {
  //           const { result } = await setup();
  //
  //           expect(result.current.tabs[0]).toEqual({
  //             name: "stdin",
  //             id: "stdin",
  //           });
  //         });
  //
  //         it("should select the remaining tab", async () => {
  //           const { result } = await setup();
  //
  //           expect(result.current.selectedTabId).toEqual("stdin");
  //         });
  //       });
  //
  //       describe("if the tab to be deleted is not selected", () => {
  //         async function setup() {
  //           const { result, waitFor, selectTab } = render(mocks);
  //           await waitFor(() => Boolean(result.current.tabs.length));
  //
  //           expect(result.current.tabs).toHaveLength(2);
  //
  //           await selectTab("ws:/my log");
  //           act(() => result.current.deleteTab("stdin"));
  //           await waitFor(() => result.current.tabs.length === 1);
  //
  //           return { result };
  //         }
  //
  //         it("should only return the remaining tab", async () => {
  //           const { result } = await setup();
  //
  //           expect(result.current.tabs[0]).toEqual({
  //             name: "ws:/my log",
  //             id: "ws:/my log",
  //           });
  //         });
  //
  //         it("should select the remaining tab", async () => {
  //           const { result } = await setup();
  //
  //           expect(result.current.selectedTabId).toEqual("ws:/my log");
  //         });
  //       });
  //     });
  //
  //     describe("if it is the last tab remaining", () => {
  //       const mocks = getMockedApolloClient(["ws:/my log"], null, [
  //         "ws:/my log",
  //       ]);
  //
  //       it("should no longer have a selected tab", async () => {
  //         const { result, waitFor } = render(mocks);
  //
  //         console.log(0);
  //         await waitFor(() => Boolean(result.current.tabs.length));
  //
  //         console.log(1);
  //         expect(result.current.tabs).toHaveLength(1);
  //         console.log(2);
  //
  //         act(() => result.current.deleteTab("ws:/my log"));
  //
  //         await waitFor(() => result.current.tabs.length === 0);
  //
  //         expect(result.current.selectedTabId).toBe(null);
  //       });
  //     });
  //   });
  // });
  //
  // describe("add tab", () => {
  //   const mocks = getMockedApolloClient();
  //
  //   describe("when not specifying a name", () => {
  //     it("should use default name", async () => {
  //       const { result, waitForNextUpdate } = await render(mocks);
  //       await waitForNextUpdate();
  //       act(() => {
  //         result.current.addTab();
  //       });
  //       expect(result.current.tabs).toEqual(
  //         expect.arrayContaining([{ name: "New Tab", id: expect.anything() }])
  //       );
  //     });
  //
  //     describe("when adding a multiple new tabs with default name", () => {
  //       it("should suffix with #2 & #3", async () => {
  //         const { result, waitForNextUpdate } = await render(mocks);
  //         await waitForNextUpdate();
  //         act(() => {
  //           result.current.addTab();
  //         });
  //         act(() => {
  //           result.current.addTab();
  //         });
  //         act(() => {
  //           result.current.addTab();
  //         });
  //         expect(result.current.tabs).toEqual(
  //           expect.arrayContaining([
  //             { name: "New Tab", id: expect.anything() },
  //             { name: "New Tab 2", id: expect.anything() },
  //             { name: "New Tab 3", id: expect.anything() },
  //           ])
  //         );
  //       });
  //     });
  //   });
  //
  //   describe("when specifying a name", () => {
  //     it("should use the name", async () => {
  //       const { result, waitFor, waitForNextUpdate } = await render(mocks);
  //       await waitForNextUpdate();
  //       act(() => {
  //         result.current.addTab("my tab");
  //       });
  //       await waitFor(() => Boolean(result.current.tabs.length));
  //       expect(result.current.tabs).toEqual(
  //         expect.arrayContaining([{ name: "my tab", id: expect.anything() }])
  //       );
  //     });
  //   });
  // });
  //
  // describe("rename tab", () => {
  //   const mocks = getMockedApolloClient();
  //
  //   describe("when renaming an existing tab", () => {
  //     it("should change the name", async () => {
  //       const { result, waitFor } = render(mocks);
  //       await waitFor(() => Boolean(result.current.tabs.length));
  //       act(() => result.current.renameTab("ws:/my log", "My Tab"));
  //       await waitFor(() => result.current.tabs[1].name === "My Tab");
  //     });
  //   });
  // });
});
