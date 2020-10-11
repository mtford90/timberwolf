import gql from "graphql-tag";
import { useApolloClient, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { sortBy, uniqBy } from "lodash";
import { v4 as guid } from "uuid";
import { SourcesQuery } from "./__generated__/SourcesQuery";
import { SourcesSubscription } from "./__generated__/SourcesSubscription";
import { TabEventsSubscription } from "./__generated__/TabEventsSubscription";
import { SystemEvent } from "../../../__generated__/globalTypes";
import { Source } from "../../graphql-types.generated";
import { useSourcesAPI } from "../lib/api/use-sources-api";
import { useLocalStorage } from "../lib/hooks/use-local-storage";

/**
 * Returns all sources
 */
export const SOURCES_QUERY = gql`
  query SourcesQuery {
    source {
      id
      name
    }
  }
`;

/**
 * Subscribe to all incoming logs, extracting just the source (e.g. stdin/websocket)
 */
export const SOURCES_SUBSCRIPTION = gql`
  subscription SourcesSubscription {
    logs {
      source {
        id
        name
      }
    }
  }
`;

export const TAB_EVENTS_SUBSCRIPTION = gql`
  subscription TabEventsSubscription {
    systemEvent
  }
`;

interface Tab {
  name: string;
  id: string;
}

function sourceToTab(source: Source): Tab {
  return {
    name: source.name || source.id,
    id: source.id,
  };
}

/**
 * Hook to provide list of tabs to render.
 *
 * Provides new tabs as necessary depending on the source of incoming data
 */
export function useTabs() {
  const { data } = useQuery<SourcesQuery>(SOURCES_QUERY);
  const api = useSourcesAPI();

  const client = useApolloClient();

  const [tabs, setTabs] = useLocalStorage<Tab[]>(
    "tabs",
    (data?.source ?? []).map(sourceToTab)
  );

  const [selectedTabId, setSelectedTabId] = useLocalStorage<string | null>(
    "selectedTab",
    null
  );

  const [editingTab, setEditingTab] = useState<string | null>(null);

  function ensureTab(firstTab: string) {
    setSelectedTabId((tab) => {
      if (!tab) {
        return firstTab;
      }

      return tab;
    });
  }

  useEffect(() => {
    if (data?.source && data?.source.length) {
      setTabs((prevTabs) => {
        // TODO.TEST: Order preservation
        return sortBy(data.source.map(sourceToTab), (t) =>
          prevTabs.findIndex((pt) => pt.id === t.id)
        );
      });
      const firstTab = data.source[0];
      ensureTab(firstTab.id);
    }
  }, [data?.source]);

  // TODO: Why doesn't useSubscription work with tests & MockedProvider?
  // I did originally use `useSubscription` for this - but it causes a strange error in the tests:
  //   - Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement.
  useEffect(() => {
    const observable = client.subscribe<SourcesSubscription>({
      query: SOURCES_SUBSCRIPTION,
    });

    const subscription = observable.subscribe((next) => {
      // TODO: Handle errors in here
      const latestSource = next.data?.logs.source;
      if (latestSource) {
        setTabs((s) =>
          uniqBy([...s, sourceToTab(latestSource)], (tab) => tab.id)
        );
        ensureTab(latestSource.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [client]);

  const deleteTab = (id: string) => {
    api.deleteSource(id);
    setTabs((ss) => {
      const index = ss.findIndex((s) => s.id === id);

      if (index > -1) {
        const newSources = [...ss];
        newSources.splice(index, 1);

        if (selectedTabId === id) {
          // Replace the selected tab with the tab that now exists at the same index, or else choose the prior
          const newSelectedTab = newSources[index] || newSources[index - 1];
          setSelectedTabId(newSelectedTab?.id ?? null);
        }

        return newSources;
      }
      return ss;
    });
  };

  const addTab = (name?: string) => {
    const tabId = guid();
    setTabs((ts) => {
      if (name) {
        api.createSource(tabId, name);

        return [...ts, { name, id: tabId }];
      }
      const numDefaultNamedTabs = ts.filter((t) => t.name.startsWith("New Tab"))
        .length;

      const defaultName = numDefaultNamedTabs
        ? `New Tab ${numDefaultNamedTabs + 1}`
        : `New Tab`;

      api.createSource(tabId, defaultName);

      return [...ts, { name: defaultName, id: tabId }];
    });

    setSelectedTabId(tabId);
    setEditingTab(tabId);

    return tabId;
  };

  const renameTab = (id: string, name: string) => {
    api.renameSource(id, name);
    setTabs((ts) => {
      const index = ts.findIndex((t) => t.id === id);
      if (index > -1) {
        const newTabs = [...ts];
        newTabs[index] = {
          id,
          name,
        };
        return newTabs;
      }
      return ts;
    });
  };

  const reorder = (startIndex: number, endIndex: number) => {
    setTabs((ts) => {
      const next = Array.from(ts);
      const [removed] = next.splice(startIndex, 1);
      next.splice(endIndex, 0, removed);
      return next;
    });
  };

  // TODO.TEST: Tab events
  useEffect(() => {
    const observable = client.subscribe<TabEventsSubscription>({
      query: TAB_EVENTS_SUBSCRIPTION,
    });

    const subscription = observable.subscribe((observer) => {
      const systemEvent = observer.data?.systemEvent;

      if (systemEvent) {
        if (systemEvent === SystemEvent.CLOSE_TAB && selectedTabId) {
          deleteTab(selectedTabId);
        } else if (systemEvent === SystemEvent.NEW_TAB) {
          addTab();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [client, addTab, deleteTab, selectedTabId]);

  return {
    tabs,
    selectedTabId,
    selectedTabIndex: tabs.findIndex((tab) => tab.id === selectedTabId),
    setSelectedTabId,
    setEditingTab,
    editingTab,
    deleteTab,
    addTab,
    renameTab,
    reorder,
  };
}
