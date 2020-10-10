import { useApolloClient } from "@apollo/client";
import { useEffect } from "react";
import gql from "graphql-tag";
import { SourcesSubscription } from "../../tabs/__generated__/SourcesSubscription";
import { Source } from "../../../graphql-types.generated";

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

export function useSourcesSubscription(
  receiveSource: (latestSource: Source) => void
) {
  const client = useApolloClient();

  useEffect(() => {
    const observable = client.subscribe<SourcesSubscription>({
      query: SOURCES_SUBSCRIPTION,
    });

    const subscription = observable.subscribe((next) => {
      // TODO: Handle errors in here
      const latestSource = next.data?.logs?.source;
      if (latestSource) {
        receiveSource(latestSource);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, receiveSource]);
}
