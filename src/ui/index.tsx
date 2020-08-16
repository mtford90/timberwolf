import "../common/promises";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { ApolloProvider } from "@apollo/client";
import { useMemo } from "react";
import * as theme from "./theme";
import Root from "./Root";

import { initStores, StoresProvider } from "./stores";
import { useInitElectronApolloClient } from "../common/gql-transport/apollo";

import "./index.css";

function App() {
  const apolloClient = useInitElectronApolloClient();

  const stores = useMemo(() => initStores(apolloClient), [apolloClient]);

  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <StoresProvider value={stores}>
          <Root />
        </StoresProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

function renderApp() {
  const app = <App />;

  const mountNode = document.getElementById("root");

  ReactDOM.render(app, mountNode);
}

renderApp();

if ((module as any).hot) {
  (module as any).hot.accept("./Root", renderApp);
}
