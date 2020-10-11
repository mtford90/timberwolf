import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import gql from "graphql-tag";
import { WebsocketPortSubscription } from "./__generated__/WebsocketPortSubscription";
import { WebsocketPortQuery } from "./__generated__/WebsocketPortQuery";

const WEBSOCKET_PORT_QUERY = gql`
  query WebsocketPortQuery {
    systemInfo {
      websocketPort
    }
  }
`;

const WEBSOCKET_PORT_SUBSCRIPTION = gql`
  subscription WebsocketPortSubscription {
    systemInfo {
      websocketPort
    }
  }
`;

export function useWebsocketPort() {
  const { loading, data, error, subscribeToMore } = useQuery<
    WebsocketPortQuery
  >(WEBSOCKET_PORT_QUERY);

  useEffect(() => {
    const unsubscribe = subscribeToMore<WebsocketPortSubscription>({
      document: WEBSOCKET_PORT_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data?.systemInfo) return prev;

        return {
          systemInfo: subscriptionData.data.systemInfo,
        };
      },
    });

    return () => unsubscribe();
  }, [subscribeToMore]);

  useEffect(() => {
    // TODO: Handle error properly
    if (error) {
      console.error(error);
    }
  }, [error]);

  const port = data?.systemInfo?.websocketPort;
  return { loading, port };
}
