import { PubSub } from "graphql-subscriptions";
import mitt from "mitt";
import { last } from "lodash";
import { IndexingPublisher } from "./indexing-publisher";
import {
  FileIndexer,
  FileIndexerProgressEvent,
} from "../files/indexing/FileIndexer";
import { Database } from "../database";
import { deepMock } from "../../../../tests/util";
import { IndexingEvent } from "../../../graphql-types.generated";

describe("indexing-publisher", () => {
  describe("when reading a file", () => {
    let pubSub: PubSub;
    let indexer: FileIndexer;
    let database: Database;
    let sut: IndexingPublisher;

    const path = "/Users/mtford/Playground/log/log.txt";

    beforeEach(() => {
      pubSub = new PubSub();
      database = new Database();
      database.init();
      indexer = new FileIndexer(database);
      sut = new IndexingPublisher(pubSub, indexer);
      sut.init();
    });

    afterEach(() => {
      sut.dispose();
      database.clearAll();
      database.close();
    });

    it("should emit the correct events", async () => {
      indexer.index(path);

      const all: IndexingEvent[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for await (const result of sut) {
        all.push(result.indexing);
        if (result.indexing.__typename === "IndexingCloseEvent") {
          break;
        } else if (result.indexing.__typename === "IndexingErrorEvent") {
          throw new Error(result.indexing.description);
        }
      }

      expect(last(all.filter((e) => e.__typename === "IndexingProgressEvent")))
        .toMatchInlineSnapshot(`
        Object {
          "__typename": "IndexingProgressEvent",
          "bytesRead": 14438,
          "path": "/Users/mtford/Playground/log/log.txt",
          "totalBytes": 14438,
        }
      `);

      expect(last(all)).toMatchInlineSnapshot(`
        Object {
          "__typename": "IndexingCloseEvent",
          "path": "/Users/mtford/Playground/log/log.txt",
        }
      `);
    });
  });

  describe("caching", () => {
    let pubSub: PubSub;
    let indexer: FileIndexer;
    let sut: IndexingPublisher;
    const emitter = mitt();

    beforeEach(() => {
      pubSub = new PubSub();
      indexer = deepMock<FileIndexer>({
        on: jest.fn().mockImplementation((e, fn) => {
          emitter.on(e, fn);
        }),
        off: jest.fn().mockImplementation((e, fn) => {
          emitter.off(e, fn);
        }),
      });
      sut = new IndexingPublisher(pubSub, indexer);
      sut.init();
    });

    describe("when receive progress", () => {
      const event: FileIndexerProgressEvent = {
        totalBytes: 10,
        bytesRead: 0,
        path: "/path/to/file",
      };

      beforeEach(() => {
        emitter.emit("progress", event);
      });

      it("should cache the progress", async () => {
        expect(sut.progress.get("/path/to/file")).toEqual({
          totalBytes: 10,
          bytesRead: 0,
        });
      });
    });

    describe("when the channel closes", () => {
      const event: FileIndexerProgressEvent = {
        totalBytes: 10,
        bytesRead: 0,
        path: "/path/to/file",
      };

      beforeEach(() => {
        emitter.emit("progress", event);
        expect(sut.progress.get("/path/to/file")).toEqual({
          totalBytes: 10,
          bytesRead: 0,
        });
        emitter.emit("close", { path: "/path/to/file" });
      });

      it("should remove from the cache", async () => {
        expect(sut.progress.has("/path/to/file")).toBeFalsy();
      });
    });
  });
});
