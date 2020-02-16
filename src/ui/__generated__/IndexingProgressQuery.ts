/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: IndexingProgressQuery
// ====================================================

export interface IndexingProgressQuery_progress {
  __typename: "IndexingProgressEvent";
  bytesRead: number;
  totalBytes: number;
  path: string;
}

export interface IndexingProgressQuery {
  progress: IndexingProgressQuery_progress[];
}
