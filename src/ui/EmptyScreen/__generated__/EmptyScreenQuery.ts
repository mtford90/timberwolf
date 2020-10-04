/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: EmptyScreenQuery
// ====================================================

export interface EmptyScreenQuery_systemInfo {
  __typename: "SystemInfo";
  websocketPort: number | null;
  executablePath: string;
}

export interface EmptyScreenQuery {
  systemInfo: EmptyScreenQuery_systemInfo;
}
