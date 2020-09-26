import * as React from "react";
import { useState } from "react";

import styled from "styled-components";
import LogsTab from "./tabs/LogsTab";
import FilterInput from "./components/FilterInput";
import { useTabs } from "./tabs/use-tabs";

const RootContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export default function Root() {
  const [filter, setFilter] = useState("");

  const { tabs, setSelectedTab, selectedTab } = useTabs();

  return (
    <RootContainer>
      <>
        <div>
          {tabs.map((tab) => (
            <button type="button" onClick={() => setSelectedTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        {selectedTab && <LogsTab source={selectedTab} filter={filter} />}
        <FilterInput source="stdin" onChangeText={setFilter} />
      </>
    </RootContainer>
  );
}
