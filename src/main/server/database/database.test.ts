import { Database } from "./index";

describe("database", () => {
  const db = new Database();

  beforeAll(async () => {
    await db.init();
  });

  afterEach(() => {
    db.clearAll();
  });

  const path = "/Users/mtford/Playground/log/log.txt";

  let rowIds: number[];

  beforeEach(async () => {
    rowIds = await db
      .insert([
        {
          source: path,
          text:
            " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
        },
        {
          source: path,
          text: " DEBUG  [workflow-upload-orchestrator] deleted session binary",
        },
        {
          source: path,
          text:
            " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
        },
        {
          source: "/Users/mtford/Playground/log/log2.txt",
          text: " DEBUG  [workflow-upload-orchestrator] deleted session binary",
        },
        {
          source: "/another/path",
          text: "xyz",
        },
      ])
      .map((row) => row.rowid);
  });

  describe("logs", () => {
    describe("when getting many", () => {
      it("should return the rows", async () => {
        const many = await db.getMany(rowIds, {
          fields: ["rowid", "source", "text"],
        });

        expect(many).toMatchInlineSnapshot(`
          Array [
            Object {
              "rowid": 1,
              "source": "/Users/mtford/Playground/log/log.txt",
              "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
            },
            Object {
              "rowid": 2,
              "source": "/Users/mtford/Playground/log/log.txt",
              "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
            },
            Object {
              "rowid": 3,
              "source": "/Users/mtford/Playground/log/log.txt",
              "text": " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
            },
            Object {
              "rowid": 4,
              "source": "/Users/mtford/Playground/log/log2.txt",
              "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
            },
            Object {
              "rowid": 5,
              "source": "/another/path",
              "text": "xyz",
            },
          ]
        `);
      });
    });

    describe("when querying for logs", () => {
      let results: ReturnType<typeof db.logs>;

      describe("with a filter", () => {
        beforeEach(() => {
          results = db.logs(path, {
            fields: ["rowid", "source", "text"],
            filter: "workflow-upload-orchestrator",
          });
        });

        it("should return the filtered logs", async () => {
          expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "rowid": 2,
                "source": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
              },
              Object {
                "rowid": 1,
                "source": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
              },
            ]
          `);
        });
      });

      describe("without a filter", () => {
        beforeEach(() => {
          results = db.logs(path, {
            fields: ["rowid", "source", "text"],
          });
        });

        it("should return all the logs", async () => {
          expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "rowid": 3,
                "source": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
              },
              Object {
                "rowid": 2,
                "source": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
              },
              Object {
                "rowid": 1,
                "source": "/Users/mtford/Playground/log/log.txt",
                "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
              },
            ]
          `);
        });
      });

      describe("with an offset", () => {
        beforeEach(() => {
          results = db.logs(path, {
            fields: ["rowid", "source", "text"],
            beforeRowId: 2,
          });
        });

        it("should return only the first line", async () => {
          expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "rowid": 1,
                "source": "/Users/mtford/Playground/log/log.txt",
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
          const n = await db.numLogs(path);
          expect(n).toEqual(3);
        });
      });

      describe("with rowId", () => {
        it("should return logs before the rowId", async () => {
          const n = await db.numLogs(path, rowIds[2]);
          expect(n).toEqual(2);
        });
      });

      describe("with a filter", () => {
        it("should return filtered logs", async () => {
          const n = await db.numLogs(path, null, "session-binary-uploader");
          expect(n).toEqual(1);
        });
      });

      describe("with a filter & rowid", () => {
        it("should return filtered logs", async () => {
          const n = await db.numLogs(path, 2, "workflow-upload-orchestrator");
          expect(n).toEqual(1);
        });
      });
    });

    describe("sources", () => {
      it("should return all sources", async () => {
        const sources = db.sources();
        expect(sources).toHaveLength(3);
        expect(sources).toContain("/Users/mtford/Playground/log/log2.txt");
        expect(sources).toContain("/another/path");
        expect(sources).toContain("/Users/mtford/Playground/log/log.txt");
      });
    });
  });

  describe("suggestions", () => {
    it("should suggest stuff", async () => {
      const res = db.suggest(path, "up");
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
      const res = db.suggest(path, "upload");
      expect(res.includes("upload")).toBeFalsy();
    });

    it("should not include the prefix if fulfilled, and should be case insensitive", async () => {
      const res = db.suggest(path, "UPLOAD");
      console.log("res", res);
      expect(res.includes("upload")).toBeFalsy();
    });
  });
});
