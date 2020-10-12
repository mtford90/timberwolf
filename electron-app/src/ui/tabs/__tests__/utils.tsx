import { ApolloClient, ApolloProvider } from "@apollo/client";
import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";
import { useTabsApi } from "../use-tabs-api";
import { mockApollo } from "../../../../tests/mock-apollo";
import { Log } from "../../../graphql-types.generated";

export async function render(client: ApolloClient<any>) {
  const utils = renderHook(() => useTabsApi(), {
    wrapper: ({ children }) => (
      <ApolloProvider client={client}>
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
  };
}

export async function getApollo(sources: string[] = []) {
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

  return {
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
  };
}
