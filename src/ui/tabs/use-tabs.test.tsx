import { act, renderHook } from "@testing-library/react-hooks";
import { MockedProvider } from "@apollo/client/testing";
import React from "react";

import { SOURCES_QUERY, SOURCES_SUBSCRIPTION, useTabs } from "./use-tabs";

function setup(mocks: any) {
  return renderHook(() => useTabs(), {
    wrapper: ({ children }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        <>{children as any}</>
      </MockedProvider>
    ),
  });
}

describe("useTabs", () => {
  describe("when start with two tabs", () => {
    describe("and one tab is provided by the subscription", () => {
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
              logs: {
                source: "ws:/my other log",
              },
            },
          },
        },
      ];

      it("should render 3 tabs", async () => {
        const { result, waitFor } = setup(mocks);

        expect(result.current.selectedTab).toBeFalsy();
        expect(result.current.tabs).toHaveLength(0);

        await waitFor(() => Boolean(result.current.tabs.length));

        expect(result.current.tabs).toHaveLength(3);
        console.log(result.current.tabs);
      });
    });
  });

  describe("delete tab", () => {
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
          data: null,
        },
      },
    ];

    describe("when a tab is deleted", () => {
      it("should only return the remaining tab", async () => {
        const { result, waitFor } = setup(mocks);
        await waitFor(() => Boolean(result.current.tabs.length));

        expect(result.current.tabs).toHaveLength(2);

        act(() => result.current.deleteTab("ws:/my log"));

        await waitFor(() => result.current.tabs.length === 1);

        console.log(result.current.tabs);

        expect(result.current.tabs[0]).toEqual("stdin");
      });
    });
  });
});
