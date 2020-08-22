/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: StdInQuery
// ====================================================

export interface StdInQuery_stdin {
  __typename: "Line";
  rowid: number;
  timestamp: any;
  text: string;
}

export interface StdInQuery {
  stdin: StdInQuery_stdin[];
}

export interface StdInQueryVariables {
  limit: number;
  beforeRowId?: number | null;
  filter?: string | null;
}
