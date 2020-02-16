import {
  renderHook,
  act,
  RenderHookResult,
} from "@testing-library/react-hooks";
import { range } from "lodash";
import { useTabs } from "./use-tabs";
import { Tab } from "./types";

function mockTab(index: number): Tab {
  return {
    type: "file",
    path: `/path/to/file${index}`,
    id: `file${index}`,
  };
}

function mockTabs(n: number, startIndex = 1): Tab[] {
  return range(startIndex, n + startIndex).map((index) => {
    return mockTab(index);
  });
}

describe("use-tabs", () => {
  let sut: RenderHookResult<
    Parameters<typeof useTabs>,
    ReturnType<typeof useTabs>
  >;

  afterEach(() => {
    sut.unmount();
  });

  describe("initialisation", () => {
    const initialTabs: Tab[] = mockTabs(2);

    describe("when initial selection not specified", () => {
      beforeEach(async () => {
        sut = renderHook(() => useTabs(initialTabs));
      });

      it("should select the first tab", async () => {
        expect(sut.result.current.selectedTab).toEqual(mockTab(1));
      });

      it("should set the index to 0", async () => {
        expect(sut.result.current.selectedTabIndex).toEqual(0);
      });
    });

    describe("when initial selection specified", () => {
      beforeEach(async () => {
        sut = renderHook(() => useTabs(initialTabs, 1));
      });

      it("should select the first tab", async () => {
        expect(sut.result.current.selectedTab).toEqual(mockTab(2));
      });

      it("should set the index to 1", async () => {
        expect(sut.result.current.selectedTabIndex).toEqual(1);
      });
    });
  });

  describe("when adding a tab", () => {
    describe("with no existing tabs", () => {
      const tabsToAdd = mockTabs(2);

      beforeEach(async () => {
        sut = renderHook(() => useTabs([]));

        const { result, waitFor } = sut;

        act(() => {
          result.current.addTabs(tabsToAdd);
        });

        await waitFor(() =>
          Boolean(result.current.tabs.length && result.current.selectedTab)
        );
      });

      it("should select the first tab", async () => {
        expect(sut.result.current.selectedTab).toEqual(mockTab(1));
      });

      it("should have correct tab index", async () => {
        expect(sut.result.current.selectedTabIndex).toEqual(0);
      });

      it("should have set the tabs", async () => {
        expect(sut.result.current.tabs).toEqual(tabsToAdd);
      });
    });
    describe("with existing tabs", () => {
      beforeEach(async () => {
        const initialTabs = mockTabs(1);

        sut = renderHook(() => useTabs(initialTabs));

        const { result, waitFor } = sut;

        act(() => {
          result.current.addTabs(mockTabs(2, 2));
        });

        await waitFor(() =>
          Boolean(result.current.tabs.length && result.current.selectedTab)
        );
      });

      it("should select the first new tab", async () => {
        expect(sut.result.current.selectedTab).toEqual(mockTab(2));
      });

      it("should set the correct tab index", async () => {
        expect(sut.result.current.selectedTabIndex).toEqual(1);
      });

      it("should have set the tabs", async () => {
        expect(sut.result.current.tabs).toEqual(mockTabs(3));
      });
    });
  });

  describe("when removing a tab", () => {
    describe("when it's selected", () => {
      describe("when its the only tab", () => {
        const initialTabs = mockTabs(1);

        beforeEach(() => {
          sut = renderHook(() => useTabs(initialTabs));

          act(() => {
            sut.result.current.removeTab(0);
          });
        });

        it("should no longer have a selected tab index", async () => {
          await sut.waitFor(() => sut.result.current.selectedTabIndex === null);
        });

        it("should no longer have a selected tab", async () => {
          await sut.waitFor(() => sut.result.current.selectedTab === null);
        });
      });

      describe("when its the first tab", () => {
        const initialTabs: Tab[] = mockTabs(3);

        beforeEach(async () => {
          sut = renderHook(() => useTabs(initialTabs, 0));

          act(() => {
            sut.result.current.removeTab(0);
          });

          await sut.waitFor(() => sut.result.current.tabs.length === 2);

          console.log(sut.result.current);
        });

        it("selected tab index should be the same", async () => {
          await sut.waitFor(() => sut.result.current.selectedTabIndex === 0);
        });

        it("should have shifted the tab from the right", async () => {
          expect(sut.result.current.selectedTab).toEqual(mockTab(2));
        });
      });

      describe("when its the middle tab", () => {
        const initialTabs: Tab[] = mockTabs(3);

        beforeEach(async () => {
          sut = renderHook(() => useTabs(initialTabs, 1));

          act(() => {
            sut.result.current.removeTab(1);
          });

          await sut.waitFor(() => sut.result.current.tabs.length === 2);

          console.log(sut.result.current);
        });

        it("selected tab index should be the same", async () => {
          await sut.waitFor(() => sut.result.current.selectedTabIndex === 0);
        });

        it("should have shifted the tab from the right", async () => {
          expect(sut.result.current.selectedTab).toEqual(mockTab(1));
        });
      });

      describe("when its the last tab", () => {
        const initialTabs: Tab[] = mockTabs(3);

        beforeEach(async () => {
          sut = renderHook(() => useTabs(initialTabs, 2));

          act(() => {
            sut.result.current.removeTab(2);
          });

          await sut.waitFor(() => sut.result.current.tabs.length === 2);
        });

        it("should have shifted the tab from the right", async () => {
          await sut.waitFor(() => sut.result.current.selectedTabIndex === 1);
          expect(sut.result.current.selectedTab).toEqual(mockTab(2));
        });
      });

      describe("when there's two tabs and it's the second one", () => {
        const initialTabs: Tab[] = mockTabs(2);

        beforeEach(async () => {
          sut = renderHook(() => useTabs(initialTabs, 1));

          act(() => {
            sut.result.current.removeTab(1);
          });

          await sut.waitFor(() => sut.result.current.tabs.length === 1);

          console.log(sut.result.current);
        });

        it("selected tab index should be the same", async () => {
          await sut.waitFor(() => sut.result.current.selectedTabIndex === 0);
        });

        it("should have shifted the tab from the right", async () => {
          expect(sut.result.current.selectedTab).toEqual(mockTab(1));
        });
      });
    });

    describe("when it's not the selected tab", () => {
      const initialTabs: Tab[] = mockTabs(3);

      beforeEach(async () => {
        sut = renderHook(() => useTabs(initialTabs));

        act(() => {
          sut.result.current.removeTab(1);
        });

        await sut.waitFor(() => sut.result.current.tabs.length === 2);
      });

      it("should have the same tab index", async () => {
        expect(sut.result.current.selectedTabIndex).toEqual(0);
      });

      it("should have the same tab", async () => {
        expect(sut.result.current.selectedTab).toEqual(initialTabs[0]);
      });
    });
  });
});
