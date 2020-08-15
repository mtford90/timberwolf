import { useMemo } from "react";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { GqlIpcLink } from "./link";

export function useInitElectronApolloClient() {
  return useMemo(() => {
    const link = new GqlIpcLink();
    // Tell the link to start listening to the ipc renderer
    return new ApolloClient({
      cache: new InMemoryCache(),
      link,
    });
  }, []);
}
