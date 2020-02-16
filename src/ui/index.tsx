import "../common/promises";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { Normalize } from "styled-normalize";
import { Provider, defaultTheme } from "@adobe/react-spectrum";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { useMemo } from "react";
import * as theme from "./theme";
import Root from "./Root";
import { MonoFont } from "./static/font-styles/mono";

import "@spectrum-css/vars/dist/spectrum-global.css";
import "@spectrum-css/vars/dist/spectrum-medium.css";
import "@spectrum-css/vars/dist/spectrum-light.css";
import "@spectrum-css/tabs/dist/index-vars.css";
import "@spectrum-css/button/dist/index-vars.css";
import { GqlIpcLink } from "../common/gql-transport/ipc-link";
import { initStores, StoresProvider } from "./stores";

const GlobalStyle = createGlobalStyle`
  code {
    font-family: "JetBrains Mono", monospace;
  }
  
  pre {
    margin: 0;
    font-family: "JetBrains Mono", monospace;
  }
  
  html {
    box-sizing: border-box;
  }
    
  *, *:before, *:after {
    box-sizing: inherit;
  }
`;

function App() {
  const apolloClient = useMemo(() => {
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: new GqlIpcLink(),
    });
  }, []);

  const stores = useMemo(() => initStores(apolloClient), [apolloClient]);

  return (
    <ApolloProvider client={apolloClient}>
      <Provider theme={defaultTheme}>
        <ThemeProvider theme={theme}>
          <StoresProvider value={stores}>
            <Normalize />
            <MonoFont />
            <GlobalStyle />
            <Root />
          </StoresProvider>
        </ThemeProvider>
      </Provider>
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
