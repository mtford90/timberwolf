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

const NewRowsContainer = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  left: 0;
  bottom: 0;
`;

const NewRows = styled.div`
  background-color: #388858;
  color: white;
  font-weight: bold;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.9em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadMoreButton = styled.button`
  margin-left: auto;
  margin-right: auto;
  font-size: 1em;
  padding: 1rem;
  background-color: transparent;
  border: none;
  width: 100%;
  text-align: center;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    background-color: ${(props) => props.theme.colors.transparentHover};
  }

  &:focus {
    outline: 0;
  }
`;

const DownArrowContainer = styled.span`
  display: block;
  height: 20px;
  width: 20px;
`;

function DownArrow() {
  return (
    <DownArrowContainer>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M15.707 4.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 011.414 0zm0 6a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L10 14.586l4.293-4.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </DownArrowContainer>
  );
}

export default function LogsTab({
  filter,
  source,
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
    <Container ref={ref} onScroll={onScroll}>
      <>
        <LogRows>
          {logs.hasMore && (
            <LoadMoreButton
              type="button"
              onClick={() => logs.fetchMore()}
              disabled={logs.loadingMore}
            >
              Load more
            </LoadMoreButton>
          )}
          {logs.logs.map((log) => (
            <LogRow key={log.rowid} row={log} />
          ))}
        </LogRows>
        <NewRowsContainer>
          {unseen.items.length ? (
            <NewRows
              onClick={() => {
                scroller?.scrollToBottom();
              }}
            >
              <DownArrow />
              {unseen.items.length}
            </NewRows>
          ) : null}
        </NewRowsContainer>
      </>
    </Container>
  );
}
