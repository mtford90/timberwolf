import { act, renderHook } from "@testing-library/react-hooks";
import "isomorphic-fetch";
import { ApolloClient, ApolloProvider } from "@apollo/client";
import React from "react";
import { getTestHarness } from "./utils";
import { useTabsApi } from "../use-tabs-api";
import { stopAllServers } from "../../../../tests/mock-apollo";

describe("useTabsApi", () => {
  function render(client: ApolloClient<any>) {
    const utils = renderHook(() => useTabsApi(), {
      wrapper: ({ children }) => (
        <ApolloProvider client={client}>
          <>{children as any}</>
        </ApolloProvider>
      ),
    });

    return {
      ...utils,
      selectTab: async (tabId: number) => {
        act(() => utils.result.current.setSelectedTabId(tabId));
        await utils.waitFor(() =>
          Boolean(utils.result.current.selectedTabId === tabId)
        );
      },
    };
  }

  afterEach(() => {
    // jest-dom does not clear local storage after each test...
    window.localStorage.clear();
  });

  afterAll(() => {
    stopAllServers();
  });

  describe("when start with two tabs", () => {
    describe("and one tab is provided by the subscription", () => {
      it("should render 3 tabs", async () => {
        const { addSource, client } = await getTestHarness({
          sources: [
            { id: 1, name: "stdin" },
            { id: 2, name: "my source" },
          ],
        });

        const { waitFor, waitForNextUpdate, result } = render(client);

        await waitForNextUpdate();

        await waitFor(() => Boolean(result.current.tabs.length));

        expect(result.current.tabs).toHaveLength(2);

        const newSource = {
          id: 3,
          name: "my other source",
        };

        addSource(newSource);

        await waitFor(() => result.current.tabs.length === 3);

        console.log(result.current.tabs);

        expect(result.current.tabs[2]).toEqual(
          expect.objectContaining(newSource)
        );
      });
    });
  });

  describe("delete tab", () => {
    describe("when a tab is deleted", () => {
      describe("if there is a tab remaining", () => {
        describe("if the tab to be deleted is selected", () => {
          const stdin = { id: 1, name: "stdin" };
          const otherSource = { id: 2, name: "my source" };

          async function setup() {
            const { client, resolvers } = await getTestHarness({
              sources: [stdin, otherSource],
            });

            const { waitFor, result, selectTab } = render(client);

            await waitFor(() => result.current.tabs.length === 2);
            await selectTab(otherSource.id);
            act(() => result.current.deleteTab(otherSource.id));
            await waitFor(() =>
              expect(resolvers.Mutation?.deleteSource).toHaveBeenCalled()
            );
            await waitFor(() => result.current.tabs.length === 1);
            return { result, waitFor };
          }

          it("should only return the remaining tab", async () => {
            const { result } = await setup();

            expect(result.current.tabs[0]).toEqual(
              expect.objectContaining(stdin)
            );
          });

          it("should select the remaining tab", async () => {
            const { result } = await setup();
            expect(result.current.selectedTabId).toEqual(stdin.id);
          });
        });

        describe("if the tab to be deleted is not selected", () => {
          const stdin = { id: 1, name: "stdin" };
          const otherSource = { id: 2, name: "my source" };

          async function setup() {
            const { client } = await getTestHarness({
              sources: [stdin, otherSource],
            });

            const { waitFor, result, selectTab } = render(client);
            await waitFor(() => result.current.tabs.length === 2);
            await selectTab(otherSource.id);
            act(() => result.current.deleteTab(stdin.id));
            await waitFor(() => result.current.tabs.length === 1);
            return result;
          }

          it("should only return the remaining tab", async () => {
            const result = await setup();
            expect(result.current.tabs[0]).toEqual(
              expect.objectContaining(otherSource)
            );
          });

          it("should select the remaining tab", async () => {
            const result = await setup();
            expect(result.current.selectedTabId).toEqual(otherSource.id);
          });
        });
      });

      describe("if it is the last tab remaining", () => {
        const source = {
          id: 1,
          name: "my source",
        };

        it("should no longer have a selected tab", async () => {
          const { client } = await getTestHarness({
            sources: [source],
          });
          const { waitFor, result } = render(client);
          await waitFor(() => Boolean(result.current.tabs.length));
          act(() => result.current.deleteTab(source.id));
          await waitFor(() => result.current.tabs.length === 0);
          expect(result.current.selectedTabId).toBe(null);
        });
      });
    });
  });

  describe("add tab", () => {
    describe("when not specifying a name", () => {
      it("should use default name", async () => {
        const { client } = await getTestHarness();
        const { waitFor, result } = render(client);
        act(() => {
          result.current.addTab();
        });
        await waitFor(() => Boolean(result.current.tabs.length));
        expect(result.current.tabs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: "New Tab", id: expect.anything() }),
          ])
        );
      });

      describe("when adding a multiple tabs", () => {
        it("should add the tabs", async () => {
          const { client } = await getTestHarness();
          const { waitFor, result } = render(client);
          act(() => {
            result.current.addTab("1");
          });
          act(() => {
            result.current.addTab("2");
          });
          act(() => {
            result.current.addTab("3");
          });

          await waitFor(() => result.current.tabs.length >= 3);

          console.log(result.current.tabs);

          expect(result.current.tabs).toHaveLength(3);

          expect(result.current.tabs).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ name: "1" }),
              expect.objectContaining({ name: "2" }),
              expect.objectContaining({ name: "3" }),
            ])
          );
        });
      });
    });

    describe("when specifying a name", () => {
      it("should use the name", async () => {
        const { client } = await getTestHarness();
        const { waitFor, result } = render(client);
        act(() => {
          result.current.addTab("my tab");
        });
        await waitFor(() => Boolean(result.current.tabs.length));
        expect(result.current.tabs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: "my tab", id: expect.anything() }),
          ])
        );
      });
    });
  });

  describe("rename tab", () => {
    describe("when renaming an existing tab", () => {
      const stdin = { id: 1, name: "stdin" };
      const otherSource = { id: 2, name: "my source" };

      it("should change the name", async () => {
        const { client } = await getTestHarness({
          sources: [stdin, otherSource],
        });
        const { waitFor, result } = render(client);
        await waitFor(() => result.current.tabs.length === 2);
        act(() => result.current.renameTab(otherSource.id, "My Tab"));
        await waitFor(() => result.current.tabs[1].name === "My Tab");
      });
    });
  });
});
