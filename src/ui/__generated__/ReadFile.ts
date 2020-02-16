/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ReadFile
// ====================================================

export interface ReadFile_readFile {
  __typename: "ReadFileResponse";
  data: string | null;
}

export interface ReadFile {
  readFile: ReadFile_readFile | null;
}

export interface ReadFileVariables {
  path: string;
}
