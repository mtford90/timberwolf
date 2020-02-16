/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: IndexProgressSub
// ====================================================

export interface IndexProgressSub_indexing_IndexingProgressEvent {
  __typename: "IndexingProgressEvent";
  path: string;
  totalBytes: number;
  bytesRead: number;
}

export interface IndexProgressSub_indexing_IndexingCloseEvent {
  __typename: "IndexingCloseEvent";
  path: string;
}

export interface IndexProgressSub_indexing_IndexingErrorEvent {
  __typename: "IndexingErrorEvent";
  path: string;
  description: string;
}

export type IndexProgressSub_indexing = IndexProgressSub_indexing_IndexingProgressEvent | IndexProgressSub_indexing_IndexingCloseEvent | IndexProgressSub_indexing_IndexingErrorEvent;

export interface IndexProgressSub {
  indexing: IndexProgressSub_indexing;
}
