/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: EmptyScreenSubscription
// ====================================================

export interface EmptyScreenSubscription_systemInfo {
  __typename: "SystemInfo";
  websocketPort: number | null;
  executablePath: string;
}

export interface EmptyScreenSubscription {
  systemInfo: EmptyScreenSubscription_systemInfo | null;
}
