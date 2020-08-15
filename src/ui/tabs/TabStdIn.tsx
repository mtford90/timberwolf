import { useEffect, useState } from "react";
import * as React from "react";
import { useReceiveStdin } from "../use-receive-stdin";
import { useParseLogNodes } from "../lib/parse/use-parse-log-nodes";
import { LogRow } from "../components/LogRow";

export default function TabStdIn() {
  const [received, setReceived] = useState<string[]>([]);

  const initial = useReceiveStdin((stdin) => {
    setReceived((r) => [...r, stdin]);
  });

  useEffect(() => {
    if (initial) {
      setReceived(initial);
    }
  }, [initial]);

  const { rows } = useParseLogNodes(received);

  return (
    <div>
      {rows.map((row, index) => (
        <LogRow key={row.id} row={row} index={index} />
      ))}
    </div>
  );
}
