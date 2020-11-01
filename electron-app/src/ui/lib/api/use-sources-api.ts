import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { useMemo } from "react";

import { usePromiseCancellation } from "../hooks/use-promise-cancellation";
import {
  CreateSourceMutation,
  CreateSourceMutationVariables,
} from "./__generated__/CreateSourceMutation";
import {
  RenameSourceMutation,
  RenameSourceMutationVariables,
} from "./__generated__/RenameSourceMutation";
import {
  DeleteSourceMutation,
  DeleteSourceMutationVariables,
} from "./__generated__/DeleteSourceMutation";

export const CREATE_SOURCE_MUTATION = gql`
  mutation CreateSourceMutation($source: SourceInput!) {
    createSource(source: $source) {
      id
      name
    }
  }
`;
export const RENAME_SOURCE_MUTATION = gql`
  mutation RenameSourceMutation($id: Int!, $name: String!) {
    renameSource(id: $id, name: $name) {
      id
      name
    }
  }
`;
export const DELETE_SOURCE_MUTATION = gql`
  mutation DeleteSourceMutation($id: Int!) {
    deleteSource(id: $id)
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
      createSource: async (name: string) => {
        const res = await createSource({
          variables: {
            source: {
              name,
            },
          },
        });

        if (res.errors?.length) {
          // TODO: Handle errors properly
          console.error(res.errors);
          throw new Error("Faced graphql errors");
        }

        if (!res.data?.createSource) {
          throw new Error("No source created");
        }

        return res.data.createSource;
      },
      renameSource: async (id: number, name: string) => {
        const res = await renameSource({
          variables: {
            id,
            name,
          },
        });

        if (res.errors?.length) {
          // TODO: Handle errors properly
          console.error(res.errors);
          throw new Error("Faced graphql errors");
        }

        if (!res.data?.renameSource) {
          throw new Error("Source doesn't exist");
        }

        return res.data.renameSource;
      },
      deleteSource: (id: number) => {
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
