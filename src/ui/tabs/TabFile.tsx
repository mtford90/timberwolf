import * as React from "react";
import { useParseLogNodes } from "../lib/parse/use-parse-log-nodes";
import { LogRow } from "../components/LogRow";

type Props = { filePath: string };

// eslint-disable-next-line no-empty-pattern
export function TabFile({}: Props) {
  // const { loading: loadingFile, data, error: loadError } = useLoadFile(
  //   filePath
  // );

  const loadError = null as any;
  const loadingFile = false as any;
  const data = null as any;

  const { rows, loading: parsingNodes, error: parseError } = useParseLogNodes(
    data?.readFile?.data || null
  );

  const error = loadError || parseError;

  const loading = loadingFile || parsingNodes;

  React.useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {rows.map((row, index) => (
        <LogRow key={row.id} row={row} index={index} />
      ))}
    </div>
  );
}
