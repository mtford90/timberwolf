import { createContext, useContext } from "react";
import { ApolloClient } from "@apollo/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function initStores(client: ApolloClient<any>) {
  return {};
}

type Stores = ReturnType<typeof initStores>;

const StoresContext = createContext<Stores>(null as never);

export const StoresProvider = StoresContext.Provider;

export function useStores() {
  return useContext(StoresContext);
}
