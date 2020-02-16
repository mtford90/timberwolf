import * as React from "react";
import styled from "styled-components";
import { TextLogNode } from "../lib/parse/json";

const Preformatted = styled.pre`
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  display: inline-block;
  max-width: 100%;
`;

export function TextNode({
  node,
  className,
  style,
}: {
  node: TextLogNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <Preformatted className={className} style={style}>
      {node.text}
    </Preformatted>
  );
}
