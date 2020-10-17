import { Database } from "./index";

describe("database", () => {
  const db = new Database();

  beforeAll(async () => {
    await db.init();
  });

  afterEach(() => {
    db.clearAll();
  });

  const sourceId = "/Users/mtford/Playground/log/log.txt";

  describe("logs", () => {
    let rowIds: number[];

    beforeEach(async () => {
      rowIds = await db
        .insert([
          {
            sourceId,
            text:
              " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
          },
          {
            sourceId,
            text:
              " DEBUG  [workflow-upload-orchestrator] deleted session binary",
          },
          {
            sourceId,
            text:
              " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
          },
          {
            sourceId: "/Users/mtford/Playground/log/log2.txt",
            text:
              " DEBUG  [workflow-upload-orchestrator] deleted session binary",
          },
          {
            sourceId: "/another/path",
            text: "xyz",
          },
        ])
        .map((row) => row.rowid);
    });

    describe("when getting many", () => {
      it("should return the rows", async () => {
        const many = await db.getManyLogs(rowIds, {
          fields: ["rowid", "source_id", "text"],
        });

        expect(many).toMatchInlineSnapshot(`
          Array [
            Object {
              "rowid": 1,
              "source_id": "/Users/mtford/Playground/log/log.txt",
              "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
            },
            Object {
              "rowid": 2,
              "source_id": "/Users/mtford/Playground/log/log.txt",
              "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
            },
            Object {
              "rowid": 3,
              "source_id": "/Users/mtford/Playground/log/log.txt",
              "text": " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
            },
            Object {
              "rowid": 4,
              "source_id": "/Users/mtford/Playground/log/log2.txt",
              "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
            },
            Object {
              "rowid": 5,
              "source_id": "/another/path",
              "text": "xyz",
            },
          ]
        `);
      });
    });

    describe("when querying for logs", () => {
      let results: ReturnType<typeof db.getLogs>;

      describe("with a filter", () => {
        beforeEach(() => {
          results = db.getLogs(sourceId, {
            fields: ["rowid", "source_id", "text"],
            filter: "workflow-upload-orchestrator",
          });
        });

        it("should return the filtered logs", async () => {
          expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "rowid": 2,
                "source_id": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
              },
              Object {
                "rowid": 1,
                "source_id": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
              },
            ]
          `);
        });
      });

      describe("without a filter", () => {
        beforeEach(() => {
          results = db.getLogs(sourceId, {
            fields: ["rowid", "source_id", "text"],
          });
        });

        it("should return all the logs", async () => {
          expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "rowid": 3,
                "source_id": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
              },
              Object {
                "rowid": 2,
                "source_id": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
              },
              Object {
                "rowid": 1,
                "source_id": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
              },
            ]
          `);
        });
      });

      describe("with an offset", () => {
        beforeEach(() => {
          results = db.getLogs(sourceId, {
            fields: ["rowid", "source_id", "text"],
            beforeRowId: 2,
          });
        });

        it("should return only the first line", async () => {
          expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "rowid": 1,
                "source_id": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
              },
            ]
          `);
        });
      });
    });

    describe("numLogs", () => {
      describe("without rowId", () => {
        it("should return all logs", async () => {
          const n = await db.numLogs(sourceId);
          expect(n).toEqual(3);
        });
      });

      describe("with rowId", () => {
        it("should return logs before the rowId", async () => {
          const n = await db.numLogs(sourceId, rowIds[2]);
          expect(n).toEqual(2);
        });
      });

      describe("with a filter", () => {
        it("should return filtered logs", async () => {
          const n = await db.numLogs(sourceId, null, "session-binary-uploader");
          expect(n).toEqual(1);
        });
      });

      describe("with a filter & rowid", () => {
        it("should return filtered logs", async () => {
          const n = await db.numLogs(
            sourceId,
            2,
            "workflow-upload-orchestrator"
          );
          expect(n).toEqual(1);
        });
      });
    });
  });

  describe("suggestions", () => {
    beforeEach(async () => {
      await db
        .insert([
          {
            sourceId,
            text:
              " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
          },
          {
            sourceId,
            text:
              " DEBUG  [workflow-upload-orchestrator] deleted session binary",
          },
          {
            sourceId,
            text:
              " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
          },
          {
            sourceId: "/Users/mtford/Playground/log/log2.txt",
            text:
              " DEBUG  [workflow-upload-orchestrator] deleted session binary",
          },
          {
            sourceId: "/another/path",
            text: "xyz",
          },
        ])
        .map((row) => row.rowid);
    });

    it("should suggest stuff", async () => {
      const res = db.suggest(sourceId, "up");
      expect(res).toMatchInlineSnapshot(`
        Array [
          "upload",
          "uploader",
          "uploadFile",
          "uploadFile(attempt: 1):",
        ]
      `);
    });

    it("should not include the prefix if fulfilled", async () => {
      const res = db.suggest(sourceId, "upload");
      expect(res.includes("upload")).toBeFalsy();
    });

    it("should not include the prefix if fulfilled, and should be case insensitive", async () => {
      const res = db.suggest(sourceId, "UPLOAD");
      console.log("res", res);
      expect(res.includes("upload")).toBeFalsy();
    });
  });

  describe("sources", () => {
    describe("upsertSource", () => {
      describe("when upserting a source that does not exist", () => {
        describe("with no name", () => {
          it("should create the source", async () => {
            db.upsertSource("xyz");
            const res = db.getSource("xyz");
            expect(res).toEqual({
              id: "xyz",
              name: null,
            });
          });
        });

        describe("when a named source already exists", () => {
          it("should not override the name", async () => {
            db.upsertSource("xyz", "named source");
            db.upsertSource("xyz");
            const res = db.getSource("xyz");
            expect(res).toEqual({
              id: "xyz",
              name: "named source",
            });
          });
        });
      });

      it("should emit an event", async () => {
        const spy = jest.fn();
        db.on("upsert:source", spy);
        db.upsertSource("xyz");
        expect(spy).toHaveBeenCalledWith("xyz");
      });
    });

    describe("getSources", () => {
      it("should return sources", async () => {
        db.upsertSource("xyz", "named source");
        db.upsertSource("abc", "another source");
        expect(db.getSources()).toEqual([
          { id: "xyz", name: "named source" },
          { id: "abc", name: "another source" },
        ]);
      });
    });

    describe("overrideSourceName", () => {
      it("should change the name", async () => {
        db.upsertSource("xyz", "named source");
        db.overrideSourceName("xyz", "renamed");
        const res = db.getSource("xyz");
        expect(res).toEqual({
          id: "xyz",
          name: "renamed",
        });
      });

      it("should ignore normal name changes", async () => {
        db.upsertSource("xyz", "named source");
        db.overrideSourceName("xyz", "renamed");
        db.upsertSource("xyz", "second rename");
        const res = db.getSource("xyz");
        expect(res).toEqual({
          id: "xyz",
          name: "renamed",
        });
      });

      it("should emit an event", async () => {
        const spy = jest.fn();
        db.upsertSource("xyz");
        db.on("update:source", spy);
        db.overrideSourceName("xyz", "renamed");
        expect(spy).toHaveBeenCalledWith("xyz");
      });
    });

    describe("deleteSource", () => {
      it("should delete the source", async () => {
        db.upsertSource("xyz");
        db.deleteSource("xyz");
        const res = db.getSource("xyz");
        expect(res).toBe(null);
      });

      it("should emit an event", async () => {
        db.upsertSource("xyz");
        const spy = jest.fn();
        db.on("delete:source", spy);
        db.deleteSource("xyz");
        expect(spy).toHaveBeenCalledWith("xyz");
      });
    });
  });
});
