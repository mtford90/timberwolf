import * as React from "react";

import styled from "styled-components";
import { useState } from "react";
import TabStdIn from "./tabs/TabStdIn";
import useDebounce from "./use-debounce";

const InputPane = styled.input`
  width: 100%;
  padding: 2rem;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;

  &:focus {
    outline: 0;
  }
`;

const RootContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentPane = styled.div`
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
`;

export default function Root() {
  const [filter, setFilter] = useState("");

  const debouncedFilter = useDebounce(filter);

  return (
    <RootContainer>
      <ContentPane>
        <TabStdIn filter={debouncedFilter} />
      </ContentPane>
      <InputPane value={filter} onChange={(e) => setFilter(e.target.value)} />
    </RootContainer>
  );
}
