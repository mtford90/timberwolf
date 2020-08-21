import * as React from "react";
import { useReceiveStdin } from "../use-receive-stdin";
import { useParseLogNodes } from "../lib/parse/use-parse-log-nodes";
import { LogRow } from "../components/LogRow";

export default function TabStdIn({ filter }: { filter: string }) {
  const received = useReceiveStdin({ filter });

  const { rows } = useParseLogNodes(received);

  return (
    <div>
      {rows.map((row) => (
        <LogRow key={row.rowid} row={row} />
      ))}
    </div>
  );
}
