import * as React from "react";
import { useEffect } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { EmptyScreenSubscription } from "./__generated__/EmptyScreenSubscription";
import { EmptyScreenQuery } from "./__generated__/EmptyScreenQuery";
import { Example } from "../components/Example";
import Button from "../components/Button";
import { TimberwolfLogo } from "../components/TimberwolfLogo";
import { Container } from "../components/Container";

const EMPTY_SCREEN_QUERY = gql`
  query EmptyScreenQuery {
    systemInfo {
      websocketPort
      executablePath
    }
  }
`;

const EMPTY_SCREEN_SUBSCRIPTION = gql`
  subscription EmptyScreenSubscription {
    systemInfo {
      websocketPort
      executablePath
    }
  }
`;

export function EmptyScreen({
  loading,
  onAddTab,
}: {
  loading?: boolean;
  onAddTab: () => void;
}) {
  const { loading: queryLoading, data, subscribeToMore } = useQuery<
    EmptyScreenQuery
  >(EMPTY_SCREEN_QUERY);

  useEffect(() => {
    const unsubscribe = subscribeToMore<EmptyScreenSubscription>({
      document: EMPTY_SCREEN_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          systemInfo: subscriptionData.data.systemInfo,
        };
      },
    });

    return () => unsubscribe();
  }, [subscribeToMore]);

  const showLoadingIndicator =
    !data?.systemInfo.websocketPort || queryLoading || loading;

  return (
    <Container>
      <TimberwolfLogo />
      {showLoadingIndicator ? (
        <div>Loading</div>
      ) : (
        <>
          <Button label="Add New Datasource" onClick={onAddTab} centred />
          <Example
            title="Try piping from stdin"
            subtitle="Note: this will open a new window"
          >
            cat /path/to/log.txt | {data?.systemInfo?.executablePath}
          </Example>
          <Example title="Try sending a websocket message">
            {`npm install -g wscat
wscat -c ws://localhost:${data?.systemInfo?.websocketPort}
# then just send random messages & they will appear as logs
`}
          </Example>
        </>
      )}
    </Container>
  );
}
