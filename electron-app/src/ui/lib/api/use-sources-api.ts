import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";
import {
  CreateSourceMutation,
  CreateSourceMutationVariables,
} from "../../tabs/__generated__/CreateSourceMutation";
import {
  RenameSourceMutation,
  RenameSourceMutationVariables,
} from "../../tabs/__generated__/RenameSourceMutation";
import {
  DeleteSourceMutation,
  DeleteSourceMutationVariables,
} from "../../tabs/__generated__/DeleteSourceMutation";
import { usePromiseCancellation } from "../hooks/use-promise-cancellation";

export const CREATE_SOURCE_MUTATION = gql`
  mutation CreateSourceMutation($source: SourceInput!) {
    createSource(source: $source) {
      id
    }
  }
`;
export const RENAME_SOURCE_MUTATION = gql`
  mutation RenameSourceMutation($id: String!, $name: String!) {
    renameSource(sourceId: $id, name: $name) {
      id
    }
  }
`;
export const DELETE_SOURCE_MUTATION = gql`
  mutation DeleteSourceMutation($id: String!) {
    deleteSource(sourceId: $id)
  }
`;

export function useSourcesAPI() {
  const [createSource] = useMutation<
    CreateSourceMutation,
    CreateSourceMutationVariables
  >(CREATE_SOURCE_MUTATION);

  const [renameSource] = useMutation<
    RenameSourceMutation,
    RenameSourceMutationVariables
  >(RENAME_SOURCE_MUTATION);

  const [deleteSource] = useMutation<
    DeleteSourceMutation,
    DeleteSourceMutationVariables
  >(DELETE_SOURCE_MUTATION);

  const { register } = usePromiseCancellation();

  return useMemo(
    () => ({
      createSource: (id: string, name: string) => {
        register(
          createSource({
            variables: {
              source: {
                id,
                name,
              },
            },
          })
        );
      },
      renameSource: (id: string, name: string) => {
        register(
          renameSource({
            variables: {
              id,
              name,
            },
          })
        );
      },
      deleteSource: (id: string) => {
        register(
          deleteSource({
            variables: {
              id,
            },
          })
        );
      },
    }),
    [register, createSource, deleteSource, renameSource]
  );
}
