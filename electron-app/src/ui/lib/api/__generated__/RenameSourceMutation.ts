/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RenameSourceMutation
// ====================================================

export interface RenameSourceMutation_renameSource {
  __typename: "Source";
  id: string;
}

export interface RenameSourceMutation {
  renameSource: RenameSourceMutation_renameSource | null;
}

export interface RenameSourceMutationVariables {
  id: string;
  name: string;
}
