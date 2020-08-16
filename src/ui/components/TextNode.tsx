import * as React from "react";
import styled from "styled-components";
import { TextLogNode } from "../lib/parse/json";

const Pre = styled.pre`
  max-width: 100%;
  white-space: pre-wrap;
  overflow-wrap: break-word;
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
    <Pre style={style} className={className}>
      {node.text}
    </Pre>
  );
}
