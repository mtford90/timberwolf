import * as React from "react";
import styled from "styled-components";
import { LogNode, LogNodeType } from "../lib/parse/json";
import { TextNode } from "./TextNode";
import { JsonNode } from "./JSON";
import { Line } from "../../graphql-types.generated";

export const MIN_LOG_ROW_HEIGHT_PX = 28;

const Container = styled.div`
  &:nth-child(odd) {
    background-color: #f6f6f6;
  }

  width: 100vw;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  align-items: center;
  min-height: ${MIN_LOG_ROW_HEIGHT_PX}px;
`;

export type Row = Line & {
  nodes: Array<LogNode & { id: string }>;
};

export const LogRow = React.memo(
  ({ row }: { row: Row }) => {
    return (
      <Container data-row-id={row.rowid}>
        <div
          style={{
            fontWeight: "bold",
            marginRight: "0.5rem",
            color: "red",
          }}
        >
          {row.rowid}
        </div>
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
  },
  (prev, next) => {
    return prev.row.rowid === next.row.rowid;
  }
);
