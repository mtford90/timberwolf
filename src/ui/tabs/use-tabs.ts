import gql from "graphql-tag";
import { useApolloClient, useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { uniq } from "lodash";
import { SourcesQuery } from "./__generated__/SourcesQuery";
import { SourcesSubscription } from "./__generated__/SourcesSubscription";

/**
 * Returns all sources
 */
export const SOURCES_QUERY = gql`
  query SourcesQuery {
    source
  }
`;

/**
 * Subscribe to all incoming logs, extracting just the source (e.g. stdin/websocket)
 */
export const SOURCES_SUBSCRIPTION = gql`
  subscription SourcesSubscription {
    logs {
      source
    }
  }
`;

/**
 * Hook to provide list of tabs to render.
 *
 * Provides new tabs as necessary depending on the source of incoming data
 */
export function useTabs() {
  const { data } = useQuery<SourcesQuery>(SOURCES_QUERY);

  const client = useApolloClient();

  const [sources, setSources] = useState(data?.source || []);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  function ensureTab(firstTab: string) {
    setSelectedTab((tab) => {
      if (!tab) {
        return firstTab;
      }

      return tab;
    });
  }

  useEffect(() => {
    if (data?.source && data?.source.length) {
      setSources((s) => uniq([...s, ...data?.source]));
      const firstTab = data.source[0];
      ensureTab(firstTab);
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
        setSources((s) => uniq([...s, latestSource]));
        ensureTab(latestSource);
      }
    });

    return () => subscription.unsubscribe();
  }, [client]);

  const deleteTab = useCallback(
    (source: string) => {
      setSources((ss) => {
        const index = ss.findIndex((s) => s === source);

        if (index > -1) {
          const newSources = [...ss];
          newSources.splice(index, 1);
          return newSources;
        }
        return ss;
      });
    },
    [setSources]
  );

  return { tabs: sources, selectedTab, setSelectedTab, deleteTab };
}
