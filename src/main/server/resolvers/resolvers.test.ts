import { GraphQLResolveInfo } from "graphql";
import { initResolvers, ResolverDependencies } from "./index";
import { deepMock } from "../../../../tests/util";
import { FileIndexer } from "../files/indexing/FileIndexer";
import { Publishers } from "../publishers";

const resolveInfo = deepMock<GraphQLResolveInfo>({});
const context = {};
const parent = {};

describe("resolvers", () => {
  describe("query", () => {
    describe("progress", () => {
      it("should return an array of latest progress events", async () => {
        const resolvers = initResolvers({
          publishers: deepMock<Publishers>({
            indexing: {
              progress: new Map(
                Object.entries({
                  "/path/to/file": {
                    bytesRead: 0,
                    totalBytes: 10,
                  },
                })
              ),
            },
          }),
          indexer: deepMock<FileIndexer>({}),
        });

        const progress = resolvers.Query?.progress?.(
          parent,
          {},
          context,
          resolveInfo
        );

        expect(progress).toMatchInlineSnapshot(`
          Array [
            Object {
              "__typename": "IndexingProgressEvent",
              "bytesRead": 0,
              "path": "/path/to/file",
              "totalBytes": 10,
            },
          ]
        `);
      });
    });
  });

  describe("mutation", () => {
    describe("index", () => {
      it("should call the index service", async () => {
        const path = "/path/to/file";

        const deps = deepMock<ResolverDependencies>({
          indexer: { index: jest.fn() },
        });

        const resolvers = initResolvers(deps);

        await resolvers.Mutation?.index?.(
          parent,
          { path },
          context,
          resolveInfo
        );

        expect(deps.indexer.index).toHaveBeenCalledWith(path);
      });
    });
  });
});
