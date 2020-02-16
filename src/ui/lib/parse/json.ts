import XRegExp, { Match } from "xregexp";

export enum LogNodeType {
  JSON = "json",
  TEXT = "text",
}

interface LogNodeBase {
  startIndex: number;
  endIndex: number;
}

export interface TextLogNode extends LogNodeBase {
  type: LogNodeType.TEXT;
  text: string;
}

type JSONObjectType =
  | Record<string, unknown>
  | Array<string | Record<string, unknown> | number | JSONObjectType>;

export interface JsonLogNode extends LogNodeBase {
  type: LogNodeType.JSON;
  object: JSONObjectType;
  isJavascript: boolean;
}

export type LogNode = TextLogNode | JsonLogNode;

function bracketsArePaired(leftBracketMatch: Match, rightBracketMatch: Match) {
  if (leftBracketMatch.value === "[") {
    return rightBracketMatch.value === "]";
  }
  return rightBracketMatch.value === "}";
}

function flattenNodes(nodes: LogNode[]): LogNode[] {
  const flattened: LogNode[] = [];

  let current: TextLogNode | null = null;

  nodes.forEach((node) => {
    if (node.type !== LogNodeType.TEXT) {
      if (current) {
        flattened.push(current);
        current = null;
      }
      flattened.push(node);
    } else if (current) {
      current.text += node.text;
      current.endIndex = node.endIndex;
    } else {
      current = node;
    }
  });

  if (current) {
    flattened.push(current);
  }

  return flattened;
}

/**
 * e.g. logs in React Native metro will replace deep objects with [Object] and log the date as an ISO datetime without
 * being wrapped in quotes. This just means we can parse "json-like" logs.
 */
function replaceJavascriptPlaceholders(potentialJSON: string) {
  const objectRegexp = /: \[Object]/g;
  const arrayRegexp = /: \[Array]/g;
  const dateRegexp = /: (\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))/g;

  // FIXME: Regexps being applied twice here. Room for improvement?
  const isJavascript = Boolean(
    potentialJSON.match(objectRegexp)?.length ||
      potentialJSON.match(arrayRegexp)?.length ||
      potentialJSON.match(dateRegexp)?.length
  );

  return {
    isJavascript,
    replaced: potentialJSON
      .replace(objectRegexp, `: "[js.Object]"`)
      .replace(arrayRegexp, `: "[js.Array]"`)
      .replace(dateRegexp, `: "[js.Date($1)]"`),
  };
}

export function matchJSON(line: string): LogNode[] {
  const matches = XRegExp.matchRecursive(line, "{|\\[", "}|\\]", "g", {
    valueNames: ["text", "left-bracket", "contents", "right-bracket"],
  });

  const nodes: LogNode[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];

    if (match.name === "text") {
      nodes.push({
        type: LogNodeType.TEXT,
        text: match.value,
        startIndex: match.start,
        endIndex: match.end,
      });
    } else if (match.name === "left-bracket") {
      i++;
      const contentMatch = matches[i];
      i++;
      const rightBracketMatch = matches[i];

      const potentialJSON =
        match.value + contentMatch.value + rightBracketMatch.value;

      if (bracketsArePaired(match, rightBracketMatch)) {
        try {
          const { replaced, isJavascript } = replaceJavascriptPlaceholders(
            potentialJSON
          );
          const parsed = JSON.parse(replaced);

          nodes.push({
            type: LogNodeType.JSON,
            object: parsed,
            startIndex: match.start,
            endIndex: rightBracketMatch.end,
            isJavascript,
          });
        } catch (_err) {
          nodes.push({
            type: LogNodeType.TEXT,
            text: potentialJSON,
            startIndex: match.start,
            endIndex: rightBracketMatch.end,
          });
        }
      } else {
        nodes.push({
          type: LogNodeType.TEXT,
          text: potentialJSON,
          startIndex: match.start,
          endIndex: rightBracketMatch.end,
        });
      }
    }
  }

  return flattenNodes(nodes);
}
