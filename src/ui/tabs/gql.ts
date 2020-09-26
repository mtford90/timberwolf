import gql from "graphql-tag";

export const LOGS_SUBSCRIPTION = gql`
  subscription LogsSubscription($source: String, $filter: String) {
    logs(source: $source, filter: $filter) {
      rowid
      timestamp
      text
    }
  }
`;

export const LOGS_QUERY = gql`
  query LogsQuery(
    $source: String!
    $limit: Int!
    $beforeRowId: Int
    $filter: String
  ) {
    logs(
      source: $source
      limit: $limit
      beforeRowId: $beforeRowId
      filter: $filter
    ) {
      rowid
      timestamp
      text
    }
  }
`;

export const NUM_LOGS_QUERY = gql`
  query NumLogsQuery($source: String!, $rowId: Int, $filter: String) {
    numLogs(source: $source, beforeRowId: $rowId, filter: $filter)
  }
`;
