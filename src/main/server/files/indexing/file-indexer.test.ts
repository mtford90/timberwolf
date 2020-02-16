import { last } from "lodash";
import { FileIndexer, FileIndexerProgressEvent } from "./FileIndexer";
import { Database } from "../../database";

describe("Indexer", () => {
  let db: Database;
  let indexer: FileIndexer;
  const path = "/Users/mtford/Playground/log/log.txt";

  beforeEach(() => {
    db = new Database();
    indexer = new FileIndexer(db);
    return db.init();
  });

  describe("indexing", () => {
    it("should index the lines", async () => {
      const results = await db.lines(path, "workflow-upload-orchestrator", {
        limit: 100,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(results).toMatchSnapshot();

      results.forEach((result) => {
        expect(result.text).toContain("workflow-upload-orchestrator");
      });
    });

    describe("events", () => {
      let progressEvents: FileIndexerProgressEvent[] = [];

      beforeEach((done) => {
        const subscriptions = [
          indexer.on("close", () => {
            console.log("closed!");
            subscriptions.forEach((fn) => fn());
            done();
          }),
          indexer.on("progress", (e) => progressEvents.push(e)),
          indexer.on("error", done),
        ];

        indexer.index(path);
      });

      afterEach(() => {
        progressEvents = [];
      });

      it("should emit progress events whilst indexing the file", async () => {
        expect(progressEvents.length).toBeTruthy();
        const lastEvent = last(progressEvents)!;
        expect(lastEvent.bytesRead / lastEvent.totalBytes).toEqual(1);
      });
    });

    describe("cache", () => {
      describe("when indexing has finished", () => {
        beforeEach((done) => {
          indexer.index(path);
          indexer.on("close", () => done());
        });

        it("should have cached the number of lines", async () => {
          expect(indexer.files.get(path)?.lines).toEqual(74);
        });
      });
    });
  });
});
