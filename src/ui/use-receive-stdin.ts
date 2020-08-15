import { useEffect } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { StdInQuery, StdInQueryVariables } from "./__generated__/StdInQuery";
import {
  StdInSubscription,
  StdInSubscriptionVariables,
} from "./__generated__/StdInSubscription";

const STDIN_SUBSCRIPTION = gql`
  subscription StdInSubscription($filter: String) {
    stdin(filter: $filter) {
      rowid
      timestamp
      text
    }
  }
`;

const STDIN_QUERY = gql`
  query StdInQuery($limit: Int!, $offset: Int!, $filter: String) {
    stdin(limit: $limit, offset: $offset, filter: $filter) {
      rowid
      timestamp
      text
    }
  }
`;

export function useReceiveStdin({
  limit = 10,
  offset = 0,
  filter,
}: { limit?: number; offset?: number; filter?: string } = {}) {
  const { data, subscribeToMore } = useQuery<StdInQuery, StdInQueryVariables>(
    STDIN_QUERY,
    {
      variables: {
        limit,
        offset,
        filter,
      },
    }
  );

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
          stdin: [...prev.stdin, subscriptionData.data.stdin],
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

  return data?.stdin || null;
}
