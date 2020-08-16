import { useEffect, useRef, useState } from "react";
import { compact, sortBy } from "lodash";
import { Row } from "../../components/LogRow";
import { useWorker } from "../../worker/use-worker";
import { Line } from "../../../graphql-types.generated";

export function useParseLogNodes(lines?: Line[] | null) {
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

  const parseCache = useRef(new Map<number, Row>());

  useEffect(() => {
    if (lines && worker) {
      const notCached: Line[] = [];

      const cached = compact(
        lines.map((l) => {
          const cachedRow = parseCache.current.get(l.rowid);

          if (!cachedRow) {
            notCached.push(l);
          }

          return cachedRow;
        })
      );

      worker
        .parseLogs(notCached)
        .then((res) => {
          res.forEach((row) => {
            parseCache.current.set(row.rowid, row);
          });
          setState((s) => ({
            ...s,
            error: null,
            loading: false,
            rows: sortBy([...cached, ...res], (r) => r.rowid),
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
  }, [lines, worker]);

  return state;
}
