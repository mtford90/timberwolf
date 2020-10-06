import * as React from "react";
import { useEffect } from "react";
import styled from "styled-components";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";

import WolfIcon from "./wolf.svg";
import { EmptyScreenSubscription } from "./__generated__/EmptyScreenSubscription";
import { EmptyScreenQuery } from "./__generated__/EmptyScreenQuery";
import { Example } from "./Example";

const EmptyContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  flex-direction: column;
  padding-left: 1rem;
  padding-right: 1rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

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

const Icon = styled(WolfIcon)`
  width: 80px;
  height: 80px;
  margin-bottom: 1em;
  margin-left: auto;
  margin-right: auto;
`;

export function EmptyScreen({ loading }: { loading?: boolean }) {
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
    <EmptyContainer>
      <Icon />
      {showLoadingIndicator ? (
        <div>Loading</div>
      ) : (
        <>
          <div
            style={{
              textAlign: "center",
              fontSize: "0.9em",
              marginBottom: "1rem",
            }}
          >
            Nothing to see here
          </div>
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
    </EmptyContainer>
  );
}
