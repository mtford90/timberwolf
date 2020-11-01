/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RenameSourceMutation
// ====================================================

export interface RenameSourceMutation_renameSource {
  __typename: "Source";
  id: number;
  name: string;
}

export interface RenameSourceMutation {
  renameSource: RenameSourceMutation_renameSource | null;
}

export interface RenameSourceMutationVariables {
  id: number;
  name: string;
}
