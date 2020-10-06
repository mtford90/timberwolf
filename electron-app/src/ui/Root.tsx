import * as React from "react";
import { useState } from "react";

import styled, { createGlobalStyle } from "styled-components";
import LogsTab from "./tabs/LogsTab";
import FilterInput from "./components/FilterInput";
import { useTabs } from "./tabs/use-tabs";
import { EmptyScreen } from "./EmptyScreen";

const RootContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.backgroundColor};
`;

const Header = styled.div`
  border-bottom-color: ${(props) => props.theme.colors.borderColor};
  border-bottom-width: 1px;
  border-bottom-style: solid;
`;

const Footer = styled.div``;

const GlobalStyle = createGlobalStyle`
  * {
    color: ${(props) => props.theme.colors.textColor};
  }
  
  pre {
    background-color: ${(props) => props.theme.colors.inputBackground};
    padding: 0.5rem;
    font-size: 0.8em;
    white-space: pre-wrap;   
  }
  
  button {
    &:focus {
      outline: 0;
    }
  }
`;

const Tab = styled.button<{ selected: boolean }>`
  background-color: ${(props) =>
    props.selected ? props.theme.colors.transparentHover : "transparent"};
  border-style: solid;
  border-left-width: 0;
  border-bottom-width: 0;
  border-right-width: 1px;
  border-top-width: 0;
  border-color: ${(props) => props.theme.colors.borderColor};
  cursor: pointer;

  padding: 0.5rem;

  &:hover {
    background-color: ${(props) => props.theme.colors.transparentHover};
  }
`;

export default function Root() {
  const [filter, setFilter] = useState("");

  const { tabs, setSelectedTab, selectedTab } = useTabs();

  return (
    <RootContainer>
      <GlobalStyle />
      <Header>
        {tabs.map((tab) => (
          <Tab
            selected={tab === selectedTab}
            key={tab}
            type="button"
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </Tab>
        ))}
      </Header>
      {selectedTab ? (
        <LogsTab source={selectedTab} filter={filter} />
      ) : (
        <EmptyScreen />
      )}

      {selectedTab && (
        <Footer>
          <FilterInput source={selectedTab} onChangeText={setFilter} />
        </Footer>
      )}
    </RootContainer>
  );
}
