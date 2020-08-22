import gql from "graphql-tag";

export const STDIN_SUBSCRIPTION = gql`
  subscription StdInSubscription($filter: String) {
    stdin(filter: $filter) {
      rowid
      timestamp
      text
    }
  }
`;

export const STDIN_QUERY = gql`
  query StdInQuery($limit: Int!, $beforeRowId: Int, $filter: String) {
    stdin(limit: $limit, beforeRowId: $beforeRowId, filter: $filter) {
      rowid
      timestamp
      text
    }
  }
`;

export const NUM_LINES_QUERY = gql`
  query NumLinesQuery($rowId: Int, $filter: String) {
    numLines(beforeRowId: $rowId, filter: $filter)
  }
`;
