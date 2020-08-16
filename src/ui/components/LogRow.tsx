import * as React from "react";
import styled from "styled-components";
import { LogNode, LogNodeType } from "../lib/parse/json";
import { TextNode } from "./TextNode";
import { JsonNode } from "./JSON";
import { Line } from "../../graphql-types.generated";

const Container = styled.div`
  &:nth-child(odd) {
    background-color: #f6f6f6;
  }

  width: 100vw;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  align-items: center;
  min-height: 28px;
`;

export type Row = Line & {
  nodes: Array<LogNode & { id: string }>;
};

export function LogRow({ row }: { row: Row }) {
  return (
    <Container>
      {row.nodes.map((node) => {
        if (node.type === LogNodeType.TEXT) {
          return (
            <TextNode
              style={{ alignSelf: "flex-start" }}
              key={node.id}
              node={node}
            />
          );
        }

        return <JsonNode key={node.id} node={node} />;
      })}
    </Container>
  );
}
