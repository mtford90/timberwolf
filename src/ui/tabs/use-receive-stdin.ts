import { useEffect } from "react";
import { useQuery } from "@apollo/client";

import { last, uniqBy } from "lodash";
import { STDIN_QUERY, STDIN_SUBSCRIPTION, NUM_LINES_QUERY } from "./gql";
import { StdInQuery, StdInQueryVariables } from "./__generated__/StdInQuery";
import {
  StdInSubscription,
  StdInSubscriptionVariables,
} from "./__generated__/StdInSubscription";
import {
  NumLinesQuery,
  NumLinesQueryVariables,
} from "./__generated__/NumLinesQuery";
import { useAsyncAction } from "../use-async-action";

export function useNumLines(rowId?: number, filter?: string) {
  const { data, loading } = useQuery<NumLinesQuery, NumLinesQueryVariables>(
    NUM_LINES_QUERY,
    {
      variables: {
        rowId,
        filter,
      },
    }
  );

  return {
    loading,
    numLines: data?.numLines || 0,
  };
}

/**
 * Hook up to stdin provided over gql
 */
export function useReceiveStdin({
  limit = 10,
  filter,
}: { limit?: number; filter?: string } = {}) {
  const { data, subscribeToMore, loading: loadingLines, fetchMore } = useQuery<
    StdInQuery,
    StdInQueryVariables
  >(STDIN_QUERY, {
    variables: {
      limit,
      filter,
    },
  });

  useEffect(() => {
    // Keep adding new lines to stdin as we receive them
    const unsubscribe = subscribeToMore<
      StdInSubscription,
      StdInSubscriptionVariables
    >({
      document: STDIN_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          stdin: [subscriptionData.data.stdin, ...prev.stdin],
        };
      },
      variables: {
        filter,
      },
    });

    window.addEventListener("beforeunload", unsubscribe);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", unsubscribe);
    };
  }, [subscribeToMore, filter]);

  const beforeRowId = last(data?.stdin)?.rowid;

  const { numLines, loading: loadingNumLines } = useNumLines(
    beforeRowId,
    filter
  );

  const {
    loading: loadingMore,
    action: loadMore,
    error: errorLoadingMore,
  } = useAsyncAction(async () => {
    if (data?.stdin) {
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
            stdin: [...prev.stdin, ...fetchMoreResult.stdin],
          };
        },
      });
      console.log("fetched more", dunno);
    } else {
      console.log("not fetching more", data);
    }
  }, [beforeRowId, fetchMore, data]);

  return {
    data: data?.stdin || null,
    hasMore: numLines > 0,
    loading: loadingLines || loadingNumLines,
    loadMore,
    loadingMore,
    errorLoadingMore,
  };
}
