import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import useDebouncedValue from "../use-debounced-value";
import { Suggest, SuggestVariables } from "./__generated__/Suggest";

const InputPane = styled.input`
  width: 100%;
  padding: 2rem;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;

  &:focus {
    outline: 0;
  }
`;

const SUGGESTIONS_QUERY = gql`
  query Suggest($prefix: String!) {
    suggest(prefix: $prefix)
  }
`;

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

export function Input({
  onChangeText,
}: {
  onChangeText: (text: string) => void;
}) {
  const [filter, setFilter] = useState("");

  const debouncedFilter = useDebouncedValue(filter);
  const suggestions = useSuggestions(debouncedFilter);

  console.log("suggestions", suggestions);

  useEffect(() => {
    onChangeText(debouncedFilter);
  }, [debouncedFilter]);

  const onChange = useCallback((e) => setFilter(e.target.value), [setFilter]);

  return <InputPane value={filter} onChange={onChange} />;
}
