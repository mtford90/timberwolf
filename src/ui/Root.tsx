import * as React from "react";
import styled from "styled-components";

import TabStdIn from "./tabs/TabStdIn";

const RootContainer = styled.div`
  width: 100vw;
`;

export default function Root() {
  return (
    <RootContainer>
      <TabStdIn />
    </RootContainer>
  );
}
