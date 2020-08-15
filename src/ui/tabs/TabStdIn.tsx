import * as React from "react";
import { useReceiveStdin } from "../use-receive-stdin";
import { useParseLogNodes } from "../lib/parse/use-parse-log-nodes";
import { LogRow } from "../components/LogRow";

export default function TabStdIn() {
  const received = useReceiveStdin();

  const { rows } = useParseLogNodes(received?.map((r) => r.text) || []);

  return (
    <div>
      {rows.map((row, index) => (
        <LogRow key={row.id} row={row} index={index} />
      ))}
    </div>
  );
}
