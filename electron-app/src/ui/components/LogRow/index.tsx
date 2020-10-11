import * as React from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { transparentize } from "polished";
import { LogNode, LogNodeType } from "../../lib/parse/json";
import { JsonNode } from "../JsonNode";
import { Log } from "../../../graphql-types.generated";

export const MIN_LOG_ROW_HEIGHT_PX = 20;

const Container = styled.div`
  flex: 1;
  min-height: ${MIN_LOG_ROW_HEIGHT_PX}px;
  font-size: 0.8em;
  line-height: 2em;
  padding-left: 0.4rem;
  padding-right: 0.4rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-top-color: ${(props) => props.theme.colors.borderColor};
  border-top-width: 1px;
  border-top-style: solid;
`;

const Time = styled.span`
  display: inline-block;
  font-size: 0.9em;
  font-weight: bold;
  margin-right: 0.5rem;
  color: ${(props) => transparentize(0.3, props.theme.colors.textColor)};
`;

export type Row = Log & {
  nodes: Array<LogNode & { id: string }>;
};

export const LogRow = React.memo(
  ({ row }: { row: Row }) => {
    return (
      <Container data-row-id={row.rowid}>
        <Time>{format(new Date(row.timestamp), "HH:mm:ss.SSS")}</Time>
        {row.nodes.map((node) => {
          if (node.type === LogNodeType.TEXT) {
            return node.text;
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
