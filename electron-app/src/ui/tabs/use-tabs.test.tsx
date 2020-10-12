import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";

import { ApolloClient, ApolloProvider } from "@apollo/client";
import { useTabsApi } from "./use-tabs-api";
import "isomorphic-fetch";
import { getMockGQLEnvironment } from "../../../tests/mock-apollo";

async function render(client: ApolloClient<any>) {
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

describe("useTabs", () => {
  describe("when start with two tabs", () => {
    describe("and one tab is provided by the subscription", () => {
      it("should render 3 tabs", async () => {
        const env = await getMockGQLEnvironment();

        try {
          env.setSources(["stdin", "my log"]);
          const { result, waitFor, waitForNextUpdate } = await render(
            env.client
          );

          await waitForNextUpdate();

          await waitFor(() => Boolean(result.current.tabs.length));

          expect(result.current.tabs).toHaveLength(2);

          env.emitLog({
            __typename: "Log",
            text: "some text",
            timestamp: Date.now(),
            source: {
              __typename: "Source",
              id: "ws:/my other log",
            },
            rowid: 10,
          });

          await waitFor(() => result.current.tabs.length === 3);

          expect(result.current.tabs[2].id).toEqual("ws:/my other log");
        } finally {
          env.stop();
        }
      });
    });
  });

  describe("delete tab", () => {
    describe("when a tab is deleted", () => {
      describe("if there is a tab remaining", () => {
        describe("if the tab to be deleted is selected", () => {
          async function setup() {
            const env = await getMockGQLEnvironment();
            env.setSources(["stdin", "ws:/my log"]);
            const { result, waitFor, selectTab } = await render(env.client);
            await waitFor(() => result.current.tabs.length === 2);

            await selectTab("ws:/my log");
            act(() => result.current.deleteTab("ws:/my log"));
            await waitFor(() => result.current.tabs.length === 1);
            return { result, waitFor };
          }

          it("should only return the remaining tab", async () => {
            const { result } = await setup();

            expect(result.current.tabs[0]).toEqual({
              name: "stdin",
              id: "stdin",
            });
          });

          it("should select the remaining tab", async () => {
            const { result } = await setup();

            expect(result.current.selectedTabId).toEqual("stdin");
          });
        });

        describe("if the tab to be deleted is not selected", () => {
          async function setup() {
            const env = await getMockGQLEnvironment();
            env.setSources(["stdin", "ws:/my log"]);
            const { result, waitFor, selectTab } = await render(env.client);
            await waitFor(() => result.current.tabs.length === 2);

            await selectTab("ws:/my log");
            act(() => result.current.deleteTab("stdin"));
            await waitFor(() => result.current.tabs.length === 1);

            return { result };
          }

          it("should only return the remaining tab", async () => {
            const { result } = await setup();

            expect(result.current.tabs[0]).toEqual({
              name: "ws:/my log",
              id: "ws:/my log",
            });
          });

          it("should select the remaining tab", async () => {
            const { result } = await setup();

            expect(result.current.selectedTabId).toEqual("ws:/my log");
          });
        });
      });

      describe("if it is the last tab remaining", () => {
        it("should no longer have a selected tab", async () => {
          const otherEnv = await getMockGQLEnvironment();
          otherEnv.setSources(["ws:/my log"]);
          const { result, waitFor } = await render(otherEnv.client);
          await waitFor(() => Boolean(result.current.tabs.length));
          act(() => result.current.deleteTab("ws:/my log"));
          await waitFor(() => result.current.tabs.length === 0);
          expect(result.current.selectedTabId).toBe(null);
        });
      });
    });
  });

  describe("add tab", () => {
    describe("when not specifying a name", () => {
      it("should use default name", async () => {
        const env = await getMockGQLEnvironment();
        const { result, waitForNextUpdate } = await render(env.client);
        await waitForNextUpdate();
        act(() => {
          result.current.addTab();
        });
        expect(result.current.tabs).toEqual(
          expect.arrayContaining([{ name: "New Tab", id: expect.anything() }])
        );
      });

      describe("when adding a multiple new tabs with default name", () => {
        it("should suffix with #2 & #3", async () => {
          const env = await getMockGQLEnvironment();
          const { result, waitForNextUpdate } = await render(env.client);
          await waitForNextUpdate();
          act(() => {
            result.current.addTab();
          });
          act(() => {
            result.current.addTab();
          });
          act(() => {
            result.current.addTab();
          });
          expect(result.current.tabs).toEqual(
            expect.arrayContaining([
              { name: "New Tab", id: expect.anything() },
              { name: "New Tab 2", id: expect.anything() },
              { name: "New Tab 3", id: expect.anything() },
            ])
          );
        });
      });
    });

    describe("when specifying a name", () => {
      it("should use the name", async () => {
        const env = await getMockGQLEnvironment();
        const { result, waitFor, waitForNextUpdate } = await render(env.client);
        await waitForNextUpdate();
        act(() => {
          result.current.addTab("my tab");
        });
        await waitFor(() => Boolean(result.current.tabs.length));
        expect(result.current.tabs).toEqual(
          expect.arrayContaining([{ name: "my tab", id: expect.anything() }])
        );
      });
    });
  });

  describe("rename tab", () => {
    describe("when renaming an existing tab", () => {
      it("should change the name", async () => {
        const env = await getMockGQLEnvironment();
        env.setSources(["stdin", "my log"]);
        const { result, waitFor, unmount } = await render(env.client);
        await waitFor(() => result.current.tabs.length === 2);
        act(() => result.current.renameTab("my log", "My Tab"));
        await waitFor(() => result.current.tabs[1].name === "My Tab");
        unmount();
      });
    });
  });
});
