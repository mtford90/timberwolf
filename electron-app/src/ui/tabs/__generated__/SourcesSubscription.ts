/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: SourcesSubscription
// ====================================================

export interface SourcesSubscription_source {
  __typename: "Source";
  id: number;
  name: string;
}

export interface SourcesSubscription {
  source: SourcesSubscription_source[];
}
