import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import AutosizeInput from "react-input-autosize";
import { transparentize } from "polished";
import useDebouncedValue from "../use-debounced-value";
import { Suggest, SuggestVariables } from "./__generated__/Suggest";

const CLASS_NAME_AUTOSIZE_INPUT = "AutosizeInput";

const Wrapper = styled.div`
  width: 100%;
  padding: 1rem;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  border-top-color: ${(props) => props.theme.colors.borderColor};
  border-top-width: 1px;
  border-top-style: solid;

  .${CLASS_NAME_AUTOSIZE_INPUT} {
    border-radius: 0;
    border: none;
    padding: 0;
    &:focus {
      outline: 0;
    }

    background-color: transparent;
  }
`;

const Suggestion = styled.div`
  flex: 1;
  color: ${(props) => transparentize(0.3, props.theme.colors.textColor)};
  position: relative;
  // TODO: Is there a nicer way to position this? Perhaps use inline content-editable instead of an input alongside this
  right: 1.6px;
`;

const SUGGESTIONS_QUERY = gql`
  query Suggest($source: String!, $prefix: String!) {
    suggest(source: $source, prefix: $prefix)
  }
`;

const TAB_KEY_CODE = 9;
const DOWN_KEY_CODE = 40;
const UP_KEY_CODE = 38;

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function useSuggestions(source: string, debouncedFilter: string) {
  // TODO: Handle loading & error (nprogress?
  const trimmed = useMemo(() => debouncedFilter.trim(), [debouncedFilter]);

  const { data } = useQuery<Suggest, SuggestVariables>(SUGGESTIONS_QUERY, {
    variables: {
      source,
      prefix: trimmed,
    },
    skip: !trimmed,
  });

  return data?.suggest;
}

export default function FilterInput({
  source,
  onChangeText,
}: {
  source: string;
  onChangeText: (text: string) => void;
}) {
  const [filter, setFilter] = useState("");

  const debouncedFilter = useDebouncedValue(filter);
  const suggestions = useSuggestions(source, debouncedFilter);

  useEffect(() => {
    console.log("received new suggestions", suggestions);
  }, [suggestions]);

  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const firstSuggestion = suggestions && suggestions[suggestionIndex];

  useEffect(() => {
    onChangeText(debouncedFilter);
    setSuggestionIndex(0);
  }, [debouncedFilter]);

  const onChange = useCallback((e) => setFilter(e.target.value), [setFilter]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasNextSuggestion = Boolean(
    suggestions && suggestions[suggestionIndex + 1]
  );

  const hasPreviousSuggestion = Boolean(
    suggestions && suggestions[suggestionIndex - 1]
  );

  return (
    <Wrapper
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        inputRef.current?.focus();
      }}
    >
      <AutosizeInput
        inputRef={(input) => {
          inputRef.current = input;
        }}
        inputClassName={CLASS_NAME_AUTOSIZE_INPUT}
        value={filter}
        autoFocus
        onChange={onChange}
        placeholder="Search Logs"
        onKeyDown={(e) => {
          const halt = () => {
            e.preventDefault();
            e.stopPropagation();
          };

          if (e.keyCode === TAB_KEY_CODE) {
            halt();
            if (firstSuggestion) {
              setFilter(firstSuggestion);
            }
          } else if (e.keyCode === DOWN_KEY_CODE) {
            halt();
            if (hasNextSuggestion) setSuggestionIndex(suggestionIndex + 1);
          } else if (e.keyCode === UP_KEY_CODE) {
            halt();
            if (hasPreviousSuggestion) setSuggestionIndex(suggestionIndex - 1);
          }
        }}
      />
      <Suggestion>
        {firstSuggestion?.replace(
          new RegExp(`^${escapeRegExp(filter)}`, "i"),
          ""
        )}
      </Suggestion>
      {/* <div> */}
      {/*  {hasPreviousSuggestion && ( */}
      {/*    <button */}
      {/*      type="button" */}
      {/*      onClick={() => { */}
      {/*        setSuggestionIndex(suggestionIndex - 1); */}
      {/*      }} */}
      {/*    > */}
      {/*      ^ */}
      {/*    </button> */}
      {/*  )} */}
      {/*  {hasNextSuggestion && ( */}
      {/*    <button */}
      {/*      type="button" */}
      {/*      onClick={() => { */}
      {/*        setSuggestionIndex(suggestionIndex + 1); */}
      {/*      }} */}
      {/*    > */}
      {/*      v */}
      {/*    </button> */}
      {/*  )} */}
      {/* </div> */}
    </Wrapper>
  );
}
