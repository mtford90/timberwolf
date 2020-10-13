import { act } from "@testing-library/react-hooks";
import "isomorphic-fetch";
import { getTestHarness, TestHarness } from "./utils";

let harness: TestHarness;

afterEach(() => harness?.stop());

describe("useTabs", () => {
  describe("when start with two tabs", () => {
    describe("and one tab is provided by the subscription", () => {
      beforeEach(async () => {
        harness = await getTestHarness({ sources: ["stdin", "my source"] });
      });

      it("should render 3 tabs", async () => {
        const { result, waitFor, waitForNextUpdate, emitLog } = harness;

        await waitForNextUpdate();

        await waitFor(() => Boolean(result.current.tabs.length));

        expect(result.current.tabs).toHaveLength(2);

        emitLog({
          __typename: "Log",
          text: "some text",
          timestamp: Date.now(),
          source: {
            __typename: "Source",
            id: "my other log",
          },
          rowid: 10,
        });

        await waitFor(() => result.current.tabs.length === 3);

        expect(result.current.tabs[2].id).toEqual("my other log");
      });
    });
  });

  describe("delete tab", () => {
    describe("when a tab is deleted", () => {
      describe("if there is a tab remaining", () => {
        describe("if the tab to be deleted is selected", () => {
          beforeEach(async () => {
            harness = await getTestHarness({
              sources: ["stdin", "my source"],
            });
          });

          async function setup() {
            const { result, waitFor, selectTab } = harness;
            await waitFor(() => result.current.tabs.length === 2);
            await selectTab("my source");
            act(() => result.current.deleteTab("my source"));
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
          beforeEach(async () => {
            harness = await getTestHarness({
              sources: ["stdin", "my source"],
            });
          });

          async function setup() {
            const { result, waitFor, selectTab } = harness;
            await waitFor(() => result.current.tabs.length === 2);
            await selectTab("my source");
            act(() => result.current.deleteTab("stdin"));
            await waitFor(() => result.current.tabs.length === 1);
            return result;
          }

          it("should only return the remaining tab", async () => {
            const result = await setup();
            expect(result.current.tabs[0]).toEqual({
              name: "my source",
              id: "my source",
            });
          });

          it("should select the remaining tab", async () => {
            const result = await setup();
            expect(result.current.selectedTabId).toEqual("my source");
          });
        });
      });

      describe("if it is the last tab remaining", () => {
        beforeEach(async () => {
          harness = await getTestHarness();
        });

        it("should no longer have a selected tab", async () => {
          const { result, waitFor } = harness;
          await waitFor(() => Boolean(result.current.tabs.length));
          act(() => result.current.deleteTab("my source"));
          await waitFor(() => result.current.tabs.length === 0);
          expect(result.current.selectedTabId).toBe(null);
        });
      });
    });
  });

  describe("add tab", () => {
    describe("when not specifying a name", () => {
      beforeEach(async () => {
        harness = await getTestHarness();
      });

      it("should use default name", async () => {
        const { result, waitForNextUpdate } = harness;
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
          const { result, waitForNextUpdate } = harness;
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
      beforeEach(async () => {
        harness = await getTestHarness();
      });

      it("should use the name", async () => {
        const { result, waitFor, waitForNextUpdate } = harness;
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
      beforeEach(async () => {
        harness = await getTestHarness({ sources: ["stdin", "my source"] });
      });

      it("should change the name", async () => {
        const { result, waitFor } = harness;
        await waitFor(() => result.current.tabs.length === 2);
        act(() => result.current.renameTab("my source", "My Tab"));
        await waitFor(() => result.current.tabs[1].name === "My Tab");
      });
    });
  });
});
