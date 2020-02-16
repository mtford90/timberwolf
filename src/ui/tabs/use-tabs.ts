import { useCallback, useState } from "react";
import { first } from "lodash";
import { Tab } from "./types";

export function useTabs(initialTabs: Tab[], initialSelection = 0) {
  const [{ tabs, selectedTab }, setState] = useState<{
    tabs: Tab[];
    selectedTab: Tab | null;
  }>({
    tabs: initialTabs,
    selectedTab: initialTabs[initialSelection] || null,
  });

  const selectTab = useCallback(
    (index: number) => {
      const tab = tabs[index];
      if (tab) {
        const newState = {
          tabs,
          selectedTab: tab,
        };

        setState(newState);
      }
    },
    [tabs]
  );

  const addTabs = useCallback(
    (newTabs: Tab[]) => {
      if (newTabs.length) {
        setState({
          tabs: [...tabs, ...newTabs],
          selectedTab: newTabs[0],
        });
      }
    },
    [tabs]
  );

  const removeTab = useCallback(
    (index: number) => {
      const selectedTabId = selectedTab?.id;
      console.log("selectedTabId", selectedTabId);
      const newTabs = [...tabs];
      const deletedTab = first(newTabs.splice(index, 1));
      const newSelectedTab =
        deletedTab && deletedTab.id === selectedTabId
          ? newTabs[Math.max(0, index - 1)]
          : selectedTab;

      const newState = {
        tabs: newTabs,
        selectedTab: newSelectedTab || null,
      };

      setState(newState);
    },
    [tabs, selectedTab]
  );

  let selectedTabIndex = selectedTab
    ? tabs.findIndex((t) => t.id === selectedTab.id)
    : null;

  if (selectedTabIndex === -1) selectedTabIndex = null;

  console.log("use-tabs selectedTab", selectedTab);

  return {
    tabs,
    addTabs,
    removeTab,
    selectedTab,
    selectTab,
    selectedTabIndex,
  };
}
