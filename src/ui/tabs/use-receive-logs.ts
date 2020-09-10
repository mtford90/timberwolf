import { useEffect } from "react";
import { useQuery } from "@apollo/client";

import { last } from "lodash";
import { LOGS_QUERY, LOGS_SUBSCRIPTION, NUM_LOGS_QUERY } from "./gql";

import { useAsyncAction } from "../use-async-action";
import {
  LogsSubscription,
  LogsSubscriptionVariables,
} from "./__generated__/LogsSubscription";
import {
  NumLogsQuery,
  NumLogsQueryVariables,
} from "./__generated__/NumLogsQuery";
import { LogsQuery, LogsQueryVariables } from "./__generated__/LogsQuery";

export function useNumLogs(source: string, rowId?: number, filter?: string) {
  const { data, loading } = useQuery<NumLogsQuery, NumLogsQueryVariables>(
    NUM_LOGS_QUERY,
    {
      variables: {
        rowId,
        source,
        filter,
      },
    }
  );

  return {
    loading,
    numLogs: data?.numLogs || 0,
  };
}

/**
 * Hook up to stdin provided over gql
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
    // Keep adding new logs to stdin as we receive them
    const unsubscribe = subscribeToMore<
      LogsSubscription,
      LogsSubscriptionVariables
    >({
      document: LOGS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          logs: [subscriptionData.data.logs, ...prev.logs],
        };
      },
      variables: {
        filter,
        source,
      },
    });

    window.addEventListener("beforeunload", unsubscribe);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", unsubscribe);
    };
  }, [subscribeToMore, filter]);

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
      console.log("fetching more", variables);
      const dunno = await fetchMore({
        variables,
        updateQuery(prev, { fetchMoreResult }) {
          if (!fetchMoreResult) return prev;

          return {
            logs: [...prev.logs, ...fetchMoreResult.logs],
          };
        },
      });
      console.log("fetched more", dunno);
    } else {
      console.log("not fetching more", data);
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
