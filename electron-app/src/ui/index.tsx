import "../common/promises";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { ApolloProvider } from "@apollo/client";
import Root from "./Root";

import { useInitElectronApolloClient } from "../common/gql-transport/apollo";

import "normalize.css";
import "./index.css";
import { useTheme } from "./lib/use-theme";

function ThemedRoot() {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <Root />
    </ThemeProvider>
  );
}

function App() {
  const apolloClient = useInitElectronApolloClient();

  return (
    <ApolloProvider client={apolloClient}>
      <ThemedRoot />
    </ApolloProvider>
  );
}

function renderApp() {
  const app = <App />;

  const mountNode = document.getElementById("root");

  ReactDOM.render(app, mountNode);
}

renderApp();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((module as any).hot) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (module as any).hot.accept("./Root", renderApp);
}
