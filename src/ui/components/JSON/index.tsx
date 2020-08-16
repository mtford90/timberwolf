import JSONTree from "react-json-tree";
import * as React from "react";
import styled from "styled-components";
import { JsonLogNode } from "../../lib/parse/json";
import { renderLabel, renderValue } from "./renderers";
import { theme } from "./theme";

const CodeBlock = styled.code`
  display: inline-block;
  max-width: 100vw;

  ul {
    // Hide react-json-tree default background colour
    background-color: transparent !important;

    // Hide default margins
    margin: 0 !important;

    // Bring the tree inline with the text
    // TODO: Better way of handling this?
    position: relative;
    bottom: 3px;
  }
`;

const ItemWrapper = styled.span`
  > span {
    margin-left: 0;
    padding-left: 0;
  }
`;

export function JsonNode({ node }: { node: JsonLogNode }) {
  const valueRenderer = React.useCallback(
    (
      displayValue: string | number,
      rawValue?: string | number | boolean | null
    ) => {
      return renderValue(node.isJavascript, displayValue, rawValue);
    },
    // FIXME: UUID for each node?
    [node.isJavascript]
  );

  const labelRenderer = React.useCallback(
    (keyPath: string[]) => {
      return renderLabel(node, keyPath);
    },
    // FIXME: UUID for each node?
    [node.object, node.isJavascript]
  );

  return (
    <CodeBlock>
      <JSONTree
        data={node.object}
        invertTheme
        theme={theme}
        hideRoot={false}
        sortObjectKeys
        shouldExpandNode={() => false}
        valueRenderer={valueRenderer}
        labelRenderer={labelRenderer}
        getItemString={(type: unknown, data: unknown, itemType: string) => {
          return <ItemWrapper className="item-wrapper">{itemType}</ItemWrapper>;
        }}
      />
    </CodeBlock>
  );
}
