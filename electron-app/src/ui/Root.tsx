import * as React from "react";
import { useState } from "react";

import styled, { createGlobalStyle } from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import LogsTab from "./tabs/LogsTab";
import FilterInput from "./components/FilterInput";
import { useTabs } from "./tabs/use-tabs";
import { EmptyScreen } from "./EmptyScreen";
import Tab from "./tabs/Tab";

import AddIcon from "./tabs/add.svg";

const RootContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.backgroundColor};
`;

const Header = styled.div`
  border-bottom-color: ${(props) => props.theme.colors.borderColor};
  border-bottom-width: 1px;
  border-bottom-style: solid;
  display: flex;
  flex-direction: row;
`;

const GlobalStyle = createGlobalStyle`
  * {
    color: ${(props: any) => props.theme.colors.textColor};
  }
  
  pre {
    background-color: ${(props: any) => props.theme.colors.inputBackground};
    padding: 0.5rem;
    font-size: 0.8em;
    white-space: pre-wrap;   
  }
  
  button {
    &:focus {
      outline: 0;
    }
  }
`;

const List = styled.div`
  display: flex;
  overflow: auto;
`;

export default function Root() {
  const [filter, setFilter] = useState("");

  const {
    tabs,
    setSelectedTabId,
    selectedTabId,
    addTab,
    renameTab,
    deleteTab,
    editingTab,
    setEditingTab,
    reorder,
  } = useTabs();

  return (
    <DragDropContext
      onDragEnd={(result) => {
        // dropped outside the list
        if (!result.destination) {
          return;
        }

        reorder(result.source.index, result.destination.index);
      }}
    >
      <RootContainer>
        <GlobalStyle />
        {Boolean(tabs.length) && (
          <Header>
            <Droppable droppableId="droppable" direction="horizontal">
              {(provided) => {
                return (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ display: "flex", overflow: "auto" }}
                  >
                    {tabs.map((tab, index) => {
                      return (
                        <Draggable
                          key={tab.id}
                          draggableId={tab.id}
                          index={index}
                        >
                          {(draggableProvided) => {
                            return (
                              <Tab
                                selected={tab.id === selectedTabId}
                                editing={editingTab === tab.id}
                                onClick={() => {
                                  setSelectedTabId(tab.id);
                                  setEditingTab(null);
                                }}
                                onDeleteClick={() => deleteTab(tab.id)}
                                onDoubleClick={() => setEditingTab(tab.id)}
                                onNameChange={(name) => {
                                  renameTab(tab.id, name);
                                  setEditingTab(null);
                                }}
                                innerRef={draggableProvided.innerRef}
                                {...draggableProvided.draggableProps}
                                {...draggableProvided.dragHandleProps}
                                style={draggableProvided.draggableProps.style}
                              >
                                {tab.name}
                              </Tab>
                            );
                          }}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </List>
                );
              }}
            </Droppable>
            <Tab onClick={() => addTab()}>
              <AddIcon width={14} height={14} />
            </Tab>
          </Header>
        )}
        {selectedTabId ? (
          <LogsTab
            source={selectedTabId}
            filter={filter}
            onFilterChange={setFilter}
          />
        ) : (
          <EmptyScreen onAddTab={() => addTab()} />
        )}
      </RootContainer>
    </DragDropContext>
  );
}
