import { v4 as guid } from "uuid";
import { matchJSON } from "../lib/parse/json";
import { Row } from "../components/LogRow";

function getRow(e: string) {
  const logNodes = matchJSON(e);

  const row: Row = {
    id: guid(),
    nodes: logNodes.map((node) => ({ ...node, id: guid() })),
  };

  return row;
}

export const getRows = (message: unknown) => {
  if (!message) {
    throw new Error("No message passed");
  }

  if (typeof message === "string") {
    const row = getRow(message);
    return [row];
  }
  if (Array.isArray(message)) {
    return message.map((datum: unknown) => {
      if (typeof datum === "string") {
        return getRow(datum);
      }
      throw new Error(`Unexpected type "${typeof datum}"`);
    });
  }
  throw new Error(`Unexpected type "${typeof message}"`);
};
