import { act, renderHook } from "@testing-library/react-hooks";
import { MockedProvider } from "@apollo/client/testing";
import React from "react";

import {
  SOURCES_QUERY,
  SOURCES_SUBSCRIPTION,
  TAB_EVENTS_SUBSCRIPTION,
  useTabs,
} from "./use-tabs";
import { DELETE_SOURCE_MUTATION } from "../lib/api/use-sources-api";

function render(mocks: any) {
  const utils = renderHook(() => useTabs(), {
    wrapper: ({ children }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        <>{children as any}</>
      </MockedProvider>
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

function getMocks(
  initialSources: string[] = [],
  nextSource: string | null = null,
  deletions: string[] = []
) {
  return [
    {
      request: {
        query: SOURCES_QUERY,
      },
      result: {
        data: {
          source: initialSources.map((id) => ({ id, __typename: "Source" })),
        },
      },
    },
    {
      request: {
        query: SOURCES_SUBSCRIPTION,
      },
      result: {
        data: {
          logs: {
            source: nextSource
              ? { id: nextSource, __typename: "Source" }
              : null,
          },
        },
      },
    },
    {
      request: {
        query: TAB_EVENTS_SUBSCRIPTION,
      },
      result: {
        data: {
          systemEvent: null,
        },
      },
    },
    ...deletions.map((source) => {
      return {
        request: {
          query: DELETE_SOURCE_MUTATION,
          variables: { id: source },
        },
        result: {
          data: null,
        },
      };
    }),
  ];
}

describe("useTabs", () => {
  describe("when start with two tabs", () => {
    describe("and one tab is provided by the subscription", () => {
      const mocks = getMocks(["stdin", "my log"], "ws:/my other log");

      it("should render 3 tabs", async () => {
        const { result, waitFor } = render(mocks);

        expect(result.current.selectedTabId).toBeFalsy();
        expect(result.current.tabs).toHaveLength(0);

        await waitFor(() => Boolean(result.current.tabs.length));

        expect(result.current.tabs).toHaveLength(3);
        console.log(result.current.tabs);
      });
    });
  });

  describe("delete tab", () => {
    describe("when a tab is deleted", () => {
      describe("if there is a tab remaining", () => {
        const mocks = getMocks(["stdin", "ws:/my log"], null);

        describe("if the tab to be deleted is selected", () => {
          async function setup() {
            const { result, waitFor, selectTab } = render(mocks);
            await waitFor(() => Boolean(result.current.tabs.length));

            expect(result.current.tabs).toHaveLength(2);

            await selectTab("ws:/my log");
            act(() => result.current.deleteTab("ws:/my log"));
            await waitFor(() => result.current.tabs.length === 1);

            return { result };
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
            const { result, waitFor, selectTab } = render(mocks);
            await waitFor(() => Boolean(result.current.tabs.length));

            expect(result.current.tabs).toHaveLength(2);

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
        const mocks = getMocks(["ws:/my log"], null, ["ws:/my log"]);

        it("should no longer have a selected tab", async () => {
          const { result, waitFor } = render(mocks);

          console.log(0);
          await waitFor(() => Boolean(result.current.tabs.length));

          console.log(1);
          expect(result.current.tabs).toHaveLength(1);
          console.log(2);

          act(() => result.current.deleteTab("ws:/my log"));

          await waitFor(() => result.current.tabs.length === 0);

          expect(result.current.selectedTabId).toBe(null);
        });
      });
    });
  });

  describe("add tab", () => {
    const mocks = getMocks();

    describe("when not specifying a name", () => {
      it("should use default name", async () => {
        const { result, waitForNextUpdate } = await render(mocks);
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
          const { result, waitForNextUpdate } = await render(mocks);
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
        const { result, waitFor, waitForNextUpdate } = await render(mocks);
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
    const mocks = getMocks();

    describe("when renaming an existing tab", () => {
      it("should change the name", async () => {
        const { result, waitFor } = render(mocks);
        await waitFor(() => Boolean(result.current.tabs.length));
        act(() => result.current.renameTab("ws:/my log", "My Tab"));
        await waitFor(() => result.current.tabs[1].name === "My Tab");
      });
    });
  });
});
