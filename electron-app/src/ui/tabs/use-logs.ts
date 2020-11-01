import { useEffect, useRef } from "react";
import { last } from "lodash";
import { useReceiveLogs } from "./use-receive-logs";
import { useParseLogNodes } from "../lib/parse/use-parse-log-nodes";

export function useLogs(
  source: number,
  filter: string,
  events: {
    onReset: () => void;
    onInit: () => void;
    onChanged: (latestRowId: number) => void;
  }
) {
  const {
    data: received,
    loadMore,
    loadingMore,
    errorLoadingMore,
    loading,
    hasMore,
  } = useReceiveLogs({
    source,
    limit: 100,
    filter,
  });

  const { rows } = useParseLogNodes(received);

  const previousLastRowIdRef = useRef<number>();

  const lastRowId = last(rows)?.rowid;

  // Reset the state when a filter is applied
  useEffect(() => {
    previousLastRowIdRef.current = undefined;
    events.onReset();
  }, [filter]);

  useEffect(() => {
    if (!lastRowId) {
      // There are no logs. Therefore no reason to scroll
      return;
    }

    const previousLastRowId = previousLastRowIdRef.current;

    if (!previousLastRowId) {
      // The scroll view just initialised. Scroll to the bottom
      previousLastRowIdRef.current = lastRowId;
      events.onInit();
      return;
    }

    // If the previous last row id does not match the latest, then either of the following is true:
    //   - We've received new logs
    //   - The logs have changed for some reason e.g. due to filtering
    const logsHaveChanged = lastRowId !== previousLastRowId;

    if (logsHaveChanged) {
      // Store the last row id so we can use it next time
      previousLastRowIdRef.current = lastRowId;
      events.onChanged(lastRowId);
    }
  }, [lastRowId]);

  return {
    logs: rows,
    fetchMore: loadMore,
    loadingMore,
    errorLoadingMore,
    hasMore,
    loading,
  };
}
