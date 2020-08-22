import { useMemo } from "react";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { concatPagination } from "@apollo/client/utilities";
import { GqlIpcLink } from "./link";

export function useInitElectronApolloClient() {
  concatPagination();
  return useMemo(() => {
    const link = new GqlIpcLink();
    // Tell the link to start listening to the ipc renderer
    return new ApolloClient({
      cache: new InMemoryCache(),
      link,
    });
  }, []);
}
