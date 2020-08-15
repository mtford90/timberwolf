/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: StdInSubscription
// ====================================================

export interface StdInSubscription_stdin {
  __typename: "Line";
  rowid: number;
  timestamp: any;
  text: string;
}

export interface StdInSubscription {
  stdin: StdInSubscription_stdin;
}

export interface StdInSubscriptionVariables {
  filter?: string | null;
}
