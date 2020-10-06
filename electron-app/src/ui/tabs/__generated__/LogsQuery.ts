/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LogsQuery
// ====================================================

export interface LogsQuery_logs {
  __typename: "Log";
  rowid: number;
  timestamp: any;
  text: string;
}

export interface LogsQuery {
  logs: LogsQuery_logs[];
}

export interface LogsQueryVariables {
  source: string;
  limit: number;
  beforeRowId?: number | null;
  filter?: string | null;
}
