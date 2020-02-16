import { createContext, useContext } from "react";
import { ApolloClient } from "@apollo/client";
import { IndexingStore } from "./indexing-store";

export function initStores(client: ApolloClient<any>) {
  return {
    indexingStore: new IndexingStore(client),
  };
}

type Stores = ReturnType<typeof initStores>;

const StoresContext = createContext<Stores>(null as never);

export const StoresProvider = StoresContext.Provider;

export function useStores() {
  return useContext(StoresContext);
}
