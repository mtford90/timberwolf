/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: SourcesSubscription
// ====================================================

export interface SourcesSubscription_logs_source {
  __typename: "Source";
  id: string;
  name: string | null;
}

export interface SourcesSubscription_logs {
  __typename: "Log";
  source: SourcesSubscription_logs_source;
}

export interface SourcesSubscription {
  logs: SourcesSubscription_logs | null;
}
