import { useEffect } from "react";
import gql from "graphql-tag";
import { useApolloClient, useQuery } from "@apollo/client";
import { StdIn } from "./__generated__/StdIn";
import { StdInQuery } from "./__generated__/StdInQuery";

const STDIN_SUBSCRIPTION = gql`
  subscription StdIn {
    stdin
  }
`;

const STDIN_QUERY = gql`
  query StdInQuery {
    stdin
  }
`;

export function useReceiveStdin(fn: (data: string) => void) {
  const client = useApolloClient();

  const { data } = useQuery<StdInQuery>(STDIN_QUERY);

  useEffect(() => {
    const observable = client.subscribe<StdIn>({ query: STDIN_SUBSCRIPTION });
    const subscription = observable.subscribe((observer) => {
      if (observer.data) {
        fn(observer.data.stdin);
      }
    });
    return () => subscription.unsubscribe();
  }, [client]);

  return data?.stdin || null;
}
