import { first } from "lodash";
import * as React from "react";
import { JsonLogNode } from "../../lib/parse/json";
import { theme } from "./theme";

export const renderLabel = (node: JsonLogNode, keys: string[]) => {
  if (keys.length > 1) {
    return <span>{first(keys)}:</span>;
  }

  if (node.isJavascript) {
    if (Array.isArray(node.object)) {
      return <span>Array</span>;
    }
    return <span>Object</span>;
  }

  return <span>json</span>;
};

export const renderValue = (
  isJavascript: boolean,
  displayValue: string | number,
  rawValue?: string | number | boolean | null
) => {
  if (isJavascript) {
    if (rawValue === "[js.Object]") {
      return <span style={{ color: theme.base08 }}>[Object]</span>;
    }
    if (rawValue === "[js.Array]") {
      return <span style={{ color: theme.base08 }}>[Array]</span>;
    }

    const dateRegexp = /^\[js.Date\((.*)\)]$/g;

    const res =
      rawValue && typeof rawValue === "string"
        ? rawValue.match(dateRegexp)
        : null;

    if (res && res.length) {
      const dateStr = res[0].replace(/^\[js.Date\(/g, "").replace(/\)]$/g, "");

      return <span style={{ color: theme.base0E }}>{dateStr}</span>;
    }
  }

  return <>{displayValue}</>;
};
