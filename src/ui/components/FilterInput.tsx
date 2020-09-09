import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import AutosizeInput from "react-input-autosize";
import useDebouncedValue from "../use-debounced-value";
import { Suggest, SuggestVariables } from "./__generated__/Suggest";

const CLASS_NAME_AUTOSIZE_INPUT = "AutosizeInput";

const Wrapper = styled.div`
  width: 100%;
  padding: 2rem;

  display: flex;
  flex-direction: row;

  .${CLASS_NAME_AUTOSIZE_INPUT} {
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-bottom: none;

    &:focus {
      outline: 0;
    }

    background-color: red;
  }
`;

const Suggestion = styled.div`
  flex: 1;
`;

const SUGGESTIONS_QUERY = gql`
  query Suggest($prefix: String!) {
    suggest(prefix: $prefix)
  }
`;

const TAB_KEY_CODE = 9;
const DOWN_KEY_CODE = 40;
const UP_KEY_CODE = 38;

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function useSuggestions(debouncedFilter: string) {
  // TODO: Handle loading & error (nprogress?
  const trimmed = useMemo(() => debouncedFilter.trim(), [debouncedFilter]);

  const { data } = useQuery<Suggest, SuggestVariables>(SUGGESTIONS_QUERY, {
    variables: {
      prefix: trimmed,
    },
    skip: !trimmed,
  });

  return data?.suggest;
}

export default function FilterInput({
  onChangeText,
}: {
  onChangeText: (text: string) => void;
}) {
  const [filter, setFilter] = useState("");

  const debouncedFilter = useDebouncedValue(filter);
  const suggestions = useSuggestions(debouncedFilter);
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
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.keyCode === TAB_KEY_CODE) {
            e.preventDefault();
            if (firstSuggestion) {
              setFilter(firstSuggestion);
            }
          } else if (e.keyCode === DOWN_KEY_CODE && hasNextSuggestion) {
            e.preventDefault();
            setSuggestionIndex(suggestionIndex + 1);
          } else if (e.keyCode === UP_KEY_CODE && hasPreviousSuggestion) {
            e.preventDefault();
            setSuggestionIndex(suggestionIndex - 1);
          }
        }}
      />
      <Suggestion>
        {firstSuggestion?.replace(
          new RegExp(`^${escapeRegExp(filter)}`, "i"),
          ""
        )}
      </Suggestion>
      <div>
        {hasPreviousSuggestion && (
          <button
            type="button"
            onClick={() => {
              setSuggestionIndex(suggestionIndex - 1);
            }}
          >
            ^
          </button>
        )}
        {hasNextSuggestion && (
          <button
            type="button"
            onClick={() => {
              setSuggestionIndex(suggestionIndex + 1);
            }}
          >
            v
          </button>
        )}
      </div>
    </Wrapper>
  );
}
