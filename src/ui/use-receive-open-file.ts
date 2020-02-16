import gql from "graphql-tag";
import { useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import { FileOpenSub } from "./__generated__/FileOpenSub";

const FILE_OPEN_SUB = gql`
  subscription FileOpenSub {
    fileOpen
  }
`;

export function useReceiveOpenFile(fn: (paths: string[]) => void) {
  const client = useApolloClient();
  useEffect(() => {
    const observable = client.subscribe<FileOpenSub>({ query: FILE_OPEN_SUB });
    const subscription = observable.subscribe((observer) => {
      if (observer.data) {
        fn(observer.data.fileOpen);
      }
    });
    return () => subscription.unsubscribe();
  }, [client]);
}
