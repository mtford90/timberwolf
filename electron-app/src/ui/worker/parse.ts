import { v4 as guid } from "uuid";
import { matchJSON } from "../lib/parse/json";
import { Row } from "../components/LogRow";
import { Log } from "../../graphql-types.generated";

function getRow(log: Log): Row {
  const logNodes = matchJSON(log.text);

  return {
    ...log,
    nodes: logNodes.map((node) => ({ ...node, id: guid() })),
  };
}

export const getRows = (message: Log[]) => {
  if (!message) {
    throw new Error("No message passed");
  }

  return message.map((datum) => {
    return getRow(datum);
  });
};
