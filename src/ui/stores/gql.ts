import gql from "graphql-tag";

export const INDEX_PROGRESS_QUERY = gql`
  query IndexingProgressQuery {
    progress {
      bytesRead
      totalBytes
      path
    }
  }
`;
export const INDEX_PROGRESS_SUBSCRIPTION = gql`
  subscription IndexProgressSub {
    indexing {
      __typename
      ... on IndexingProgressEvent {
        path
        totalBytes
        bytesRead
      }
      ... on IndexingCloseEvent {
        path
      }
      ... on IndexingErrorEvent {
        path
        description
      }
    }
  }
`;
