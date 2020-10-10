import styled from "styled-components";
import React, { MouseEventHandler, Ref, useEffect, useRef } from "react";
import AutosizeInput from "react-input-autosize";

import {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from "react-beautiful-dnd";
import DeleteIcon from "./delete.svg";

const CLASS_NAME_AUTOSIZE_INPUT = "AutosizeInput";

const Button = styled.div<{ selected?: boolean }>`
  background-color: ${(props) =>
    props.selected ? props.theme.colors.hover.main : "transparent"};
  border-style: solid;
  border-left-width: 0;
  border-bottom-width: 0;
  border-right-width: 1px;
  border-top-width: 0;
  border-color: ${(props) => props.theme.colors.borderColor};
  cursor: pointer;

  padding: 0.5rem;

  &:hover {
    background-color: ${(props) => props.theme.colors.hover.main};
  }
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  .${CLASS_NAME_AUTOSIZE_INPUT} {
    border-radius: 0;
    border: none;
    padding: 0;
    margin: 0;
    &:focus {
      outline: 0;
    }

    background-color: transparent;
  }
`;

const DeleteButton = styled.button`
  background-color: transparent;
  border: none;
  width: 18px;
  height: 18px;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  > svg {
    height: 14px;
    width: 14px;
  }

  &:hover {
    background-color: ${(props) => props.theme.colors.hover.light};
  }
  margin-left: 0.25rem;
`;

const TAB_KEY_CODE = 9;
const ENTER_KEY_CODE = 13;

function useFocusWhenEditing(editing: undefined | boolean) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const inputElem = inputRef.current;
    if (inputElem) {
      if (editing) {
        inputElem.focus();
        const numChars = inputElem.value.length;
        if (numChars) {
          inputElem.setSelectionRange(0, numChars);
        }
      } else {
        inputElem.blur();
      }
    }
  }, [editing]);

  return inputRef;
}

type DragProps = Partial<DraggableProvidedDraggableProps> &
  Partial<DraggableProvidedDragHandleProps>;

export default function Tab({
  selected,
  onClick,
  children,
  onDeleteClick,
  editing = false,
  onNameChange,
  onDoubleClick,
  style,
  innerRef,
  ...dragProps
}: {
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: () => void;
  onDeleteClick?: () => void;
  onNameChange?: (newName: string) => void;
  editing?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  innerRef?: Ref<HTMLDivElement>;
} & DragProps) {
  const inputRef = useFocusWhenEditing(editing);

  return (
    <Button
      selected={selected}
      role="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      {...dragProps}
      ref={innerRef}
      style={style}
    >
      {editing && typeof children === "string" && onNameChange ? (
        <AutosizeInput
          inputClassName={CLASS_NAME_AUTOSIZE_INPUT}
          inputRef={(input) => {
            inputRef.current = input;
          }}
          defaultValue={children}
          onBlur={(e) => {
            onNameChange?.(e.target.value);
          }}
          onKeyDown={(e) => {
            const halt = () => {
              e.preventDefault();
              e.stopPropagation();
            };

            if (e.keyCode === TAB_KEY_CODE || e.keyCode === ENTER_KEY_CODE) {
              if (typeof children !== "string") {
                throw new Error(
                  "Child must be a string if implementing tab name change"
                );
              }

              halt();
              const newName = (inputRef.current?.value || "").trim();
              if (newName.length) {
                onNameChange?.(newName);
              } else if (inputRef.current) {
                inputRef.current.value = children;
              }
              inputRef.current?.blur();
            }
          }}
        />
      ) : (
        <div>{children}</div>
      )}

      {onDeleteClick && (
        <DeleteButton
          type="button"
          onClick={(e) => {
            // This is important to avoid "selecting" the tab as well as deleting it
            e.stopPropagation();
            e.preventDefault();

            onDeleteClick?.();
          }}
        >
          <DeleteIcon />
        </DeleteButton>
      )}
    </Button>
  );
}
