import { MockedResponse, MockLink } from "@apollo/client/testing";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { when } from "mobx";
import { IndexingStore } from "./indexing-store";
import { INDEX_PROGRESS_QUERY, INDEX_PROGRESS_SUBSCRIPTION } from "./gql";
import { IndexingProgressQuery } from "../__generated__/IndexingProgressQuery";
import { IndexProgressSub } from "../__generated__/IndexProgressSub";

describe("indexing store", () => {
  let sut: IndexingStore;

  afterEach(() => {
    sut.dispose();
  });

  describe("initialisation", () => {
    it("should populate with latest index progress", async () => {
      const mockQueryResponse: MockedResponse<IndexingProgressQuery> = {
        request: { query: INDEX_PROGRESS_QUERY },
        result: {
          data: {
            progress: [
              {
                __typename: "IndexingProgressEvent",
                totalBytes: 10,
                bytesRead: 0,
                path: "/path/to/file",
              },
            ],
          },
        },
      };

      const mockSubResponse: MockedResponse<IndexProgressSub> = {
        request: { query: INDEX_PROGRESS_SUBSCRIPTION },
        result: {
          data: undefined,
        },
      };

      const mockLink = new MockLink([mockQueryResponse, mockSubResponse]);

      const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: mockLink,
      });

      sut = new IndexingStore(client);

      await sut.init();

      expect(sut.progress).toMatchInlineSnapshot(`
        Object {
          "/path/to/file": Object {
            "bytesRead": 0,
            "totalBytes": 10,
          },
        }
      `);
    });
  });

  describe("subscription", () => {
    let client: ApolloClient<any>;
    let link: MockLink;

    beforeEach(() => {
      const mockQueryResponse: MockedResponse<IndexingProgressQuery> = {
        request: { query: INDEX_PROGRESS_QUERY },
        result: {
          data: {
            progress: [
              {
                __typename: "IndexingProgressEvent",
                totalBytes: 10,
                bytesRead: 0,
                path: "/path/to/file",
              },
            ],
          },
        },
      };

      link = new MockLink([mockQueryResponse]);

      client = new ApolloClient<any>({
        cache: new InMemoryCache(),
        link,
      });

      sut = new IndexingStore(client);
    });

    describe("when receiving close event", () => {
      beforeEach(async () => {
        const mockSubResponse: MockedResponse<IndexProgressSub> = {
          request: { query: INDEX_PROGRESS_SUBSCRIPTION },
          result: {
            data: {
              indexing: {
                __typename: "IndexingCloseEvent",
                path: "/path/to/file",
              },
            },
          },
        };

        link.addMockedResponse(mockSubResponse);

        await sut.init();
        await when(() => Boolean(sut.progress.size));

        expect(sut.progress).toMatchInlineSnapshot(`
                  Object {
                    "/path/to/file": Object {
                      "bytesRead": 0,
                      "totalBytes": 10,
                    },
                  }
              `);
      });

      it("should delete progress", async () => {
        await when(() => !sut.progress.size);

        expect(sut.progress).toMatchInlineSnapshot(`Object {}`);
      });
    });

    describe("when receiving progress event for a different file", () => {
      beforeEach(async () => {
        const mockSubResponse: MockedResponse<IndexProgressSub> = {
          request: { query: INDEX_PROGRESS_SUBSCRIPTION },
          result: {
            data: {
              indexing: {
                __typename: "IndexingProgressEvent",
                path: "/path/to/file2",
                totalBytes: 10,
                bytesRead: 0,
              },
            },
          },
        };

        link.addMockedResponse(mockSubResponse);

        await sut.init();
        await when(() => sut.progress.size === 1);

        expect(sut.progress).toMatchInlineSnapshot(`
                  Object {
                    "/path/to/file": Object {
                      "bytesRead": 0,
                      "totalBytes": 10,
                    },
                  }
              `);
      });

      it("should add new progress", async () => {
        await when(() => sut.progress.size === 2);

        expect(sut.progress).toMatchInlineSnapshot(`
          Object {
            "/path/to/file": Object {
              "bytesRead": 0,
              "totalBytes": 10,
            },
            "/path/to/file2": Object {
              "bytesRead": 0,
              "totalBytes": 10,
            },
          }
        `);
      });
    });

    describe("when receiving progress event for same file", () => {
      beforeEach(async () => {
        const mockSubResponse: MockedResponse<IndexProgressSub> = {
          request: { query: INDEX_PROGRESS_SUBSCRIPTION },
          result: {
            data: {
              indexing: {
                __typename: "IndexingProgressEvent",
                path: "/path/to/file",
                totalBytes: 10,
                bytesRead: 5,
              },
            },
          },
        };

        link.addMockedResponse(mockSubResponse);

        await sut.init();
        await when(() => sut.progress.size === 1);

        expect(sut.progress).toMatchInlineSnapshot(`
                  Object {
                    "/path/to/file": Object {
                      "bytesRead": 0,
                      "totalBytes": 10,
                    },
                  }
              `);
      });

      it("should update progress", async () => {
        await when(() => sut.progress.get("/path/to/file")?.bytesRead === 5);

        expect(sut.progress).toMatchInlineSnapshot(`
          Object {
            "/path/to/file": Object {
              "bytesRead": 5,
              "totalBytes": 10,
            },
          }
        `);
      });
    });
  });
});
