import { v4 as guid } from "uuid";
import { matchJSON } from "../lib/parse/json";
import { Row } from "../components/LogRow";
import { Line } from "../../graphql-types.generated";

function getRow(line: Line): Row {
  const logNodes = matchJSON(line.text);

  return {
    ...line,
    nodes: logNodes.map((node) => ({ ...node, id: guid() })),
  };
}

export const getRows = (message: Line[]) => {
  if (!message) {
    throw new Error("No message passed");
  }

  return message.map((datum) => {
    return getRow(datum);
  });
};
