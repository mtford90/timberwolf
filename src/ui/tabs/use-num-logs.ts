import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import {
  NumLogsQuery,
  NumLogsQueryVariables,
} from "./__generated__/NumLogsQuery";

export const NUM_LOGS_QUERY = gql`
  query NumLogsQuery($source: String!, $rowId: Int, $filter: String) {
    numLogs(source: $source, beforeRowId: $rowId, filter: $filter)
  }
`;

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
