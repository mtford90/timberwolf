import gql from "graphql-tag";
import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { sortBy, uniqBy } from "lodash";
import { TabEventsSubscription } from "./__generated__/TabEventsSubscription";
import { SystemEvent } from "../../../__generated__/globalTypes";
import { useSourcesAPI } from "../lib/api/use-sources-api";
import { useLocalStorage } from "../lib/hooks/use-local-storage";
import { SourcesSubscription } from "./__generated__/SourcesSubscription";
import { generateName } from "../../common/id-generation";
import { Source } from "../../graphql-types.generated";
import { SourcesQuery } from "./__generated__/SourcesQuery";

export const TAB_EVENTS_SUBSCRIPTION = gql`
  subscription TabEventsSubscription {
    systemEvent
  }
`;

export const SOURCES_QUERY = gql`
  query SourcesQuery {
    source {
      id
      name
    }
  }
`;

export const SOURCES_SUBSCRIPTION = gql`
  subscription SourcesSubscription {
    source {
      id
      name
    }
  }
`;

function useSources() {
  const { data } = useQuery<SourcesQuery>(SOURCES_QUERY);

  return data?.source;
}

function useSourcesSubscription() {
  const { data } = useSubscription<SourcesSubscription>(
    SOURCES_SUBSCRIPTION,
    {}
  );

  return data?.source;
}

/**
 * Hook to provide list of tabs to render.
 *
 * Provides new tabs as necessary depending on the source of incoming data
 */
export function useTabsApi() {
  const sources = useSources();

  console.log("sources", sources);

  const latestSources = useSourcesSubscription();

  console.log("latestSources", latestSources);

  const api = useSourcesAPI();

  const client = useApolloClient();

  const [tabs, setTabs] = useLocalStorage<Source[]>("tabs", sources || []);

  const [selectedTabId, setSelectedTabId] = useLocalStorage<number | null>(
    "selectedTab",
    null
  );

  const [editingTab, setEditingTab] = useState<number | null>(null);

  const ensureTab = useCallback(
    (firstTab: number) => {
      setSelectedTabId((tab) => {
        if (!tab) {
          return firstTab;
        }

        return tab;
      });
    },
    [setSelectedTabId]
  );

  useEffect(() => {
    if (sources && sources.length) {
      setTabs((prevTabs) => {
        // TODO.TEST: Order preservation
        return sortBy(sources, (t) =>
          prevTabs.findIndex((pt) => pt.id === t.id)
        );
      });
      const firstTab = sources[0];
      ensureTab(firstTab.id);
    }
  }, [sources, ensureTab, setTabs]);

  useEffect(() => {
    if (latestSources && latestSources.length) {
      setTabs((prevTabs) => {
        return uniqBy([...prevTabs, ...latestSources], (s) => s.id);
      });
      const firstTab = latestSources[0];
      if (firstTab) {
        ensureTab(firstTab.id);
      }
    }
  }, [latestSources, setTabs, ensureTab]);

  const deleteTab = useCallback(
    (id: number) => {
      api.deleteSource(id);
      setTabs((ss) => {
        const index = ss.findIndex((s) => s.id === id);

        if (index > -1) {
          const newSources = [...ss];
          newSources.splice(index, 1);

          setSelectedTabId((prevSelectedTabId) => {
            if (id === prevSelectedTabId) {
              const newSelectedTab = newSources[index] || newSources[index - 1];
              return newSelectedTab?.id ?? null;
            }

            return prevSelectedTabId;
          });

          return newSources;
        }
        return ss;
      });
    },
    [api, setSelectedTabId, setTabs]
  );

  const addTab = useCallback(
    (name = "New Tab") => {
      // TODO: Move name generation to server
      const generatedName = generateName(
        name,
        tabs.map((t) => t.name)
      );

      api
        .createSource(generatedName)
        .then((source) => {
          setSelectedTabId(source.id);
          setEditingTab(source.id);
          setTabs((ts) => {
            return [...ts, source];
          });
        })
        .catch((err) => {
          // TODO: handle error
          console.error(err);
        });
    },
    [api, setSelectedTabId, setEditingTab, setTabs, tabs]
  );

  const renameTab = (id: number, name: string) => {
    api
      .renameSource(id, name)
      .then((source) => {
        setTabs((ts) => {
          const index = ts.findIndex((t) => t.id === id);
          if (index > -1) {
            const newTabs = [...ts];
            newTabs[index] = source;
            return newTabs;
          }
          return ts;
        });
      })
      .catch((err) => {
        // TODO: handle error
        console.error(err);
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
