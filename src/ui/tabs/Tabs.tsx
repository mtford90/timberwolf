import * as React from "react";
import { useMemo, useRef } from "react";
import styled from "styled-components";
import Close from "@spectrum-icons/workflow/Close";
import { compact, last } from "lodash";
import { useDropzone } from "react-dropzone";
import { useButton } from "@react-aria/button";
import TabStdIn from "./TabStdIn";
import { TabFile } from "./TabFile";
import { useTabs } from "./use-tabs";
import { useReceiveOpenFile } from "../use-receive-open-file";

const TabButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  .spectrum-Tabs-itemLabel {
    padding-right: 0.6rem;
  }
`;

const CloseButtonContainer = styled.button`
  position: relative;
  display: flex;

  background-color: transparent;
  padding: 0;
  text-align: center;

  &:hover {
    background-color: rgba(128, 128, 128, 0.17);
  }

  height: 12px;
  width: 12px;

  border-width: 0;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  cursor: pointer;

  svg {
    display: block;
  }
`;

const TabsContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

function CloseButton({ onClick }: { onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  const { buttonProps } = useButton(
    {
      elementType: "button",
      onPress: () => {
        onClick();
      },
    },
    ref
  );

  return (
    <CloseButtonContainer {...buttonProps} ref={ref}>
      <Close size="XXS" />
    </CloseButtonContainer>
  );
}

function getFileName(path: string) {
  return last(path.split("/"));
}

// TODO: Replace with Tabs component from react-spectrum once it's available
export function Tabs() {
  const {
    tabs,
    selectedTab,
    selectTab,
    addTabs,
    removeTab,
    selectedTabIndex,
  } = useTabs([
    { type: "stdin", id: "stdin" },
    {
      type: "file",
      path: "/Users/mtford/Playground/log/log.txt",
      id: "/Users/mtford/Playground/log/log.txt",
    },
  ]);

  const ids = useMemo(() => new Set(compact(tabs.map((t) => t.id))), [tabs]);

  const { getRootProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Do something with the files
      const newTabs = acceptedFiles
        .filter((f) => {
          return !ids.has(f.path);
        })
        .map((f) => ({
          type: "file" as const,
          path: f.path,
          id: f.path,
        }));

      addTabs(newTabs);
    },
    accept: ["text/plain"],
  });

  console.log("selectedTab", selectedTab);
  console.log("tabs", tabs);

  const rootDropzoneProps = getRootProps();

  const tabWidths = useRef<HTMLDivElement[]>([]);

  const selectedTabRect =
    (selectedTabIndex !== null &&
      tabWidths.current[selectedTabIndex]?.getBoundingClientRect()) ||
    undefined;

  const onTabClick = (index: number) => selectTab(index);

  useReceiveOpenFile((paths) => {
    addTabs(
      paths.map((p) => ({
        type: "file" as const,
        path: p,
        id: p,
      }))
    );
  });

  return (
    <TabsContainer {...rootDropzoneProps}>
      <div className="spectrum-Tabs spectrum-Tabs--horizontal">
        {tabs.map((tab, index) => {
          const tabTitle =
            tab.type === "file" ? getFileName(tab.path) : tab.type;

          return (
            <>
              <TabButton
                ref={(e) => {
                  if (e) {
                    tabWidths.current[index] = e;
                  }
                }}
                key={tab.type === "file" ? tab.path : tab.type}
                className="spectrum-Tabs-item is-selected"
                tabIndex={
                  selectedTabIndex !== null ? selectedTabIndex : undefined
                }
                role="button"
                onClick={() => onTabClick(index)}
              >
                <div className="spectrum-Tabs-itemLabel">{tabTitle}</div>
                <div>
                  <CloseButton
                    onClick={() => {
                      removeTab(index);
                    }}
                  />
                </div>
              </TabButton>
            </>
          );
        })}
        <div
          className="spectrum-Tabs-selectionIndicator"
          style={{
            width: selectedTabRect?.width,
            left: selectedTabRect?.left,
          }}
        />
      </div>
      <div style={{ flex: 1, overflowX: "hidden", overflowY: "scroll" }}>
        {selectedTab?.type === "stdin" && <TabStdIn />}
        {selectedTab?.type === "file" && (
          <TabFile filePath={selectedTab.path} />
        )}
      </div>
    </TabsContainer>
  );
}
