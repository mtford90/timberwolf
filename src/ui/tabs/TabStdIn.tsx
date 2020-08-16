import * as React from "react";
import styled from "styled-components";
import { useReceiveStdin } from "../use-receive-stdin";
import { useParseLogNodes } from "../lib/parse/use-parse-log-nodes";
import { LogRow } from "../components/LogRow";

const Input = styled.input`
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 10rem;
`;

export default function TabStdIn() {
  const received = useReceiveStdin();

  const { rows } = useParseLogNodes(received);

  return (
    <div>
      {rows.map((row) => (
        <LogRow key={row.rowid} row={row} />
      ))}
      <Input />
    </div>
  );
}
