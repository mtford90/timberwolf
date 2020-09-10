import * as React from "react";
import { useState } from "react";

import styled from "styled-components";
import LogsTab from "./tabs/LogsTab";
import FilterInput from "./components/FilterInput";

const RootContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export default function Root() {
  const [filter, setFilter] = useState("");

  return (
    <RootContainer>
      <LogsTab source="stdin" filter={filter} />
      <FilterInput source="stdin" onChangeText={setFilter} />
    </RootContainer>
  );
}
