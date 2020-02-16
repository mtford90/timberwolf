import { useState } from "react";
import * as React from "react";
import { useReceiveStdin } from "../use-receive-stdin";

export default function TabStdIn() {
  const [received, setReceived] = useState<string[]>([]);

  const initial = useReceiveStdin((stdin) => {
    setReceived((r) => [...r, stdin]);
  });

  return (
    <div>
      <code>initial: {JSON.stringify(initial)}</code>
      <br />
      <code>{JSON.stringify(received)}</code>
    </div>
  );
}
