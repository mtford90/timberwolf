import { ApolloProvider } from "@apollo/client";
import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";
import { mockApollo } from "../../../../tests/mock-apollo";
import { Log } from "../../../graphql-types.generated";
import { useTabsApi } from "../use-tabs-api";
import { UnwrapPromise } from "../../../common/type-utils";

export async function getTestHarness(config: { sources?: string[] } = {}) {
  let { sources = [] } = config;

  const mockedApollo = await mockApollo((pubSub) => ({
    Query: {
      source: () =>
        sources.map((id) => ({ id, __typename: "Source" as const })),
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
      source: {
        subscribe: () => pubSub.asyncIterator(["source"]),
        resolve: () =>
          sources.map((id) => ({ id, __typename: "Source" as const })),
      },
    },
    Mutation: {
      deleteSource: jest.fn((parent, { sourceId }) => sourceId),
    },
  }));

  const utils = renderHook(() => useTabsApi(), {
    wrapper: ({ children }) => (
      <ApolloProvider client={mockedApollo.client}>
        <>{children as any}</>
      </ApolloProvider>
    ),
  });

  return {
    ...utils,
    selectTab: async (tabId: string) => {
      act(() => utils.result.current.setSelectedTabId(tabId));
      await utils.waitFor(() =>
        Boolean(utils.result.current.selectedTabId === tabId)
      );
    },
    ...mockedApollo,
    emitLog: (log: Log) => {
      setImmediate(() => {
        mockedApollo.pubSub
          .publish("logs", {
            logs: log,
          })
          .catch((err) => {
            console.error(err);
          });
      });
    },
    updateSources: (newSources: string[]) => {
      sources = newSources;
      setImmediate(() => {
        mockedApollo.pubSub
          .publish("source", {
            source: newSources.map((s) => ({
              id: s,
              name: s,
              __typename: "Source",
            })),
          })
          .catch((err) => {
            console.error(err);
          });
      });
    },
    addSource: (newSource: string) => {
      sources.push(newSource);
      setImmediate(() => {
        mockedApollo.pubSub
          .publish("source", {
            source: sources.map((s) => ({
              id: s,
              name: s,
              __typename: "Source",
            })),
          })
          .catch((err) => {
            console.error(err);
          });
      });
    },
  };
}

export type TestHarness = UnwrapPromise<ReturnType<typeof getTestHarness>>;
