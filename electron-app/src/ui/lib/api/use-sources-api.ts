import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
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

  return {
    createSource: (id: string, name: string) => {
      createSource({
        variables: {
          source: {
            id,
            name,
          },
        },
      }).catch((err) => {
        // TODO.ERROR: Deal with errors
        console.error(err);
      });
    },
    renameSource: (id: string, name: string) => {
      renameSource({
        variables: {
          id,
          name,
        },
      }).catch((err) => {
        // TODO.ERROR: Deal with errors
        console.error(err);
      });
    },
    deleteSource: (id: string) => {
      deleteSource({
        variables: {
          id,
        },
      }).catch((err) => {
        // TODO.ERROR: Deal with errors
        console.error(err);
      });
    },
  };
}
