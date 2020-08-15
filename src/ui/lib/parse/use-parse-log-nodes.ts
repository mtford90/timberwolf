import { useEffect, useState } from "react";
import { Row } from "../../components/LogRow";
import { useWorker } from "../../worker/use-worker";

export function useParseLogNodes(logStr: string | string[] | null) {
  const [state, setState] = useState<{
    error: unknown;
    loading: boolean;
    rows: Row[];
  }>({
    loading: false,
    error: null,
    rows: [],
  });

  const { worker } = useWorker();

  useEffect(() => {
    const toParse = Array.isArray(logStr) ? logStr.join("\n") : logStr;

    if (toParse && worker) {
      worker
        .parseLogs(toParse.split(/\n|\r|\r\n/g))
        .then((res) => {
          setState((s) => ({
            ...s,
            error: null,
            loading: false,
            rows: res,
          }));
        })
        .catch((err) => {
          console.error(err);
          setState((s) => ({
            ...s,
            error: null,
            loading: false,
          }));
        });
    }

    return () => {};
  }, [logStr, worker]);

  return state;
}
