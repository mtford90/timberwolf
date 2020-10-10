import { useEffect } from "react";
import { useQuery } from "@apollo/client";

import { last } from "lodash";

import gql from "graphql-tag";
import { useAsyncAction } from "../use-async-action";
import {
  LogsSubscription,
  LogsSubscriptionVariables,
} from "./__generated__/LogsSubscription";
import { LogsQuery, LogsQueryVariables } from "./__generated__/LogsQuery";
import { useNumLogs } from "./use-num-logs";

export const LOGS_SUBSCRIPTION = gql`
  subscription LogsSubscription($source: String, $filter: String) {
    logs(sourceId: $source, filter: $filter) {
      rowid
      timestamp
      text
    }
  }
`;

export const LOGS_QUERY = gql`
  query LogsQuery(
    $source: String!
    $limit: Int!
    $beforeRowId: Int
    $filter: String
  ) {
    logs(
      sourceId: $source
      limit: $limit
      beforeRowId: $beforeRowId
      filter: $filter
    ) {
      rowid
      timestamp
      text
    }
  }
`;

/**
 * Receives all logs, and all future logs from the specified source
 */
export function useReceiveLogs({
  source,
  limit = 10,
  filter,
}: {
  source: string;
  limit?: number;
  filter?: string;
}) {
  const { data, subscribeToMore, loading: loadingLines, fetchMore } = useQuery<
    LogsQuery,
    LogsQueryVariables
  >(LOGS_QUERY, {
    variables: {
      source,
      limit,
      filter,
    },
  });

  useEffect(() => {
    const unsubscribe = subscribeToMore<
      LogsSubscription,
      LogsSubscriptionVariables
    >({
      document: LOGS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const previous = prev.logs || [];

        return {
          logs: [subscriptionData.data.logs, ...previous],
        };
      },
      variables: {
        filter,
        source,
      },
    });

    // TODO: Is this necessary?
    // Observed a weird issue where a hard refresh didn't cause subscription to be
    // destroyed on unmount during hard refresh of electron client
    window.addEventListener("beforeunload", unsubscribe);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", unsubscribe);
    };
  }, [subscribeToMore, filter, source]);

  const beforeRowId = last(data?.logs)?.rowid;

  const { numLogs, loading: loadingNumLines } = useNumLogs(
    source,
    beforeRowId,
    filter
  );

  const {
    loading: loadingMore,
    action: loadMore,
    error: errorLoadingMore,
  } = useAsyncAction(async () => {
    if (data?.logs) {
      const variables = {
        limit,
        beforeRowId,
      };
      await fetchMore({
        variables,
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;

          return {
            logs: [...prev.logs, ...fetchMoreResult.logs],
          };
        },
      });
    }
  }, [beforeRowId, fetchMore, data]);

  return {
    data: data?.logs || null,
    hasMore: numLogs > 0,
    loading: loadingLines || loadingNumLines,
    loadMore,
    loadingMore,
    errorLoadingMore,
  };
}
