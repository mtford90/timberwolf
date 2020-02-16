import * as React from "react";
import styled, { DefaultTheme, ThemedStyledProps } from "styled-components";
import { LogNode, LogNodeType } from "../lib/parse/json";
import { TextNode as _Text } from "./TextNode";
import { JsonNode } from "./JSON";

export interface Row {
  id: string;
  nodes: Array<LogNode & { id: string }>;
}

const Text = styled(_Text)`
  align-self: flex-start;
`;

const RowContainer = styled.div`
  width: 100vw;
  background-color: ${(
    props: ThemedStyledProps<{ odd: boolean }, DefaultTheme>
  ) => (props.odd ? props.theme.colors.oddRow : "transparent")};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  overflow: hidden;
`;

export function LogRow({ row, index }: { row: Row; index: number }) {
  return (
    <RowContainer odd={Boolean(index % 2)}>
      {row.nodes.map((node) => {
        if (node.type === LogNodeType.TEXT) {
          return <Text key={node.id} node={node} />;
        }

        return <JsonNode key={node.id} node={node} />;
      })}
    </RowContainer>
  );
}
