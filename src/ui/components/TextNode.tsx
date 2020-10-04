import * as React from "react";
import styled from "styled-components";
import { TextLogNode } from "../lib/parse/json";

const Container = styled.span`
  max-width: 100%;
  display: inline-block;
`;

export function TextNode({
  node,
  className = "",
  style,
}: {
  node: TextLogNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <Container style={style} className={className}>
      {node.text}
    </Container>
  );
}
