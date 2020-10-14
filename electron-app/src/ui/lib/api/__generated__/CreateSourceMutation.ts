/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SourceInput } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: CreateSourceMutation
// ====================================================

export interface CreateSourceMutation_createSource {
  __typename: "Source";
  id: string;
}

export interface CreateSourceMutation {
  createSource: CreateSourceMutation_createSource | null;
}

export interface CreateSourceMutationVariables {
  source: SourceInput;
}
