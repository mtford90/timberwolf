import gql from "graphql-tag";
import { useQuery, useSubscription } from "@apollo/client";
import { DarkModeQuery } from "./__generated__/DarkModeQuery";
import { DarkModeSubscription } from "./__generated__/DarkModeSubscription";
import { darkTheme, lightTheme, Theme } from "./theme";

const SYSTEM_INFO_QUERY = gql`
  query DarkModeQuery {
    systemInfo {
      darkModeEnabled
    }
  }
`;
const SYSTEM_INFO_SUBSCRIPTION = gql`
  subscription DarkModeSubscription {
    systemInfo {
      darkModeEnabled
    }
  }
`;

function useIsDarkMode() {
  const { data: queryData } = useQuery<DarkModeQuery>(SYSTEM_INFO_QUERY);
  const { data: subscriptionData } = useSubscription<DarkModeSubscription>(
    SYSTEM_INFO_SUBSCRIPTION
  );

  return (
    subscriptionData?.systemInfo?.darkModeEnabled ??
    queryData?.systemInfo?.darkModeEnabled
  );
}

export function useTheme(): Theme {
  const isDarkMode = useIsDarkMode();

  return isDarkMode ? darkTheme : lightTheme;
}
