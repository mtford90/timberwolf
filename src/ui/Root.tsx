import * as React from "react";
import styled from "styled-components";

import { Tabs } from "./tabs/Tabs";

const RootContainer = styled.div`
  width: 100vw;
`;

export default function Root() {
  return (
      <RootContainer>
        <Tabs />
      </RootContainer>
  );
}
