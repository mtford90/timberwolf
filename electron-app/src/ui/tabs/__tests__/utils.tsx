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
    setSources: (ss: string[]) => {
      sources = ss;
    },
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
  };
}

export type TestHarness = UnwrapPromise<ReturnType<typeof getTestHarness>>;
