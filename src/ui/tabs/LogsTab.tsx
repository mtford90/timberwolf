import * as React from "react";
import styled from "styled-components";
import { LogRow } from "../components/LogRow";
import { useScrollController, useScrollTracking } from "./scroll";
import { useUnseen } from "./use-unseen";
import { useLogs } from "./use-logs";

const LogRows = styled.div`
  margin-top: auto;
`;

const Container = styled.div`
  display: flex;
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  justify-content: flex-end;
`;

const NewRows = styled.div`
  background-color: red;
  position: absolute;
  left: 20px;
  bottom: 100px;
  color: white;
  font-weight: bold;
  padding: 10px;
  border-radius: 10px;
  font-size: 1.2em;
  cursor: pointer;
`;

export default function LogsTab({
  source,
  filter,
}: {
  filter: string;
  source: string;
}) {
  const unseen = useUnseen<number>();

  const { scroller, ref } = useScrollController();

  const logs = useLogs(source, filter, {
    onReset() {
      unseen.clear();
    },
    onInit() {
      scroller?.scrollToBottom();
    },
    onChanged(latestRowId: number) {
      if (scroller?.shouldFollowNewLogs) {
        // The scroll view is scrolled all the way to the bottom, so we can scroll it automatically
        scroller?.scrollToBottom();
      } else {
        // The scroll view is frozen due to scroll upwards. Therefore we can add unseen logs to notify
        // the user
        unseen.add(latestRowId);
      }
    },
  });

  const onScroll = useScrollTracking({
    scrollController: scroller,
    onScrolledToRow: unseen.clear,
  });

  return (
    <>
      <Container ref={ref} onScroll={onScroll}>
        <LogRows>
          {logs.hasMore && (
            <button
              type="button"
              onClick={() => logs.fetchMore()}
              disabled={logs.loadingMore}
            >
              Load more
            </button>
          )}
          {logs.logs.map((log) => (
            <LogRow key={log.rowid} row={log} />
          ))}
        </LogRows>
        {unseen.items.length ? (
          <NewRows
            onClick={() => {
              scroller?.scrollToBottom();
            }}
          >
            {unseen.items.length} new logs
          </NewRows>
        ) : null}
      </Container>
    </>
  );
}
