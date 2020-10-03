/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: LogsSubscription
// ====================================================

export interface LogsSubscription_logs {
  __typename: "Log";
  rowid: number;
  timestamp: any;
  text: string;
}

export interface LogsSubscription {
  logs: LogsSubscription_logs;
}

export interface LogsSubscriptionVariables {
  source?: string | null;
  filter?: string | null;
}
