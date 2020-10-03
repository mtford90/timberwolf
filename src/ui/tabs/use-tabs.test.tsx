import { renderHook } from "@testing-library/react-hooks";
import { MockedProvider } from "@apollo/client/testing";
import React from "react";

import { SOURCES_QUERY, SOURCES_SUBSCRIPTION, useTabs } from "./use-tabs";

function setup() {
  const mocks = [
    {
      request: {
        query: SOURCES_QUERY,
      },
      result: {
        data: {
          source: ["stdin", "ws:/my log"],
        },
      },
    },
    {
      request: {
        query: SOURCES_SUBSCRIPTION,
      },
      result: {
        data: {
          source: "ws:/my other log",
        },
      },
    },
  ];

  return renderHook(() => useTabs(), {
    wrapper: ({ children }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children as any}
      </MockedProvider>
    ),
  });
}

describe("useTabs", () => {
  it("should work", async () => {
    const { result, waitFor } = setup();

    expect(result.current.selectedTab).toBeFalsy();
    expect(result.current.tabs).toHaveLength(0);

    await waitFor(() => Boolean(result.current.tabs.length));

    expect(result.current.tabs).toHaveLength(3);
  });
});
