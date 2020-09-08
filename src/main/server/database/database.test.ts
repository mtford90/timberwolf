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
          path,
          text:
            " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
        },
        {
          path,
          text: " DEBUG  [workflow-upload-orchestrator] deleted session binary",
        },
        {
          path,
          text:
            " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
        },
        {
          path: "/Users/mtford/Playground/log/log2.txt",
          text: " DEBUG  [workflow-upload-orchestrator] deleted session binary",
        },
        {
          path: "/another/path",
          text: "xyz",
        },
      ])
      .map((row) => row.rowid);
  });

  describe("lines", () => {
    describe("when getting many", () => {
      it("should return the rows", async () => {
        const many = await db.getMany(rowIds, {
          fields: ["rowid", "path", "text"],
        });

        expect(many).toMatchInlineSnapshot(`
                  Array [
                    Object {
                      "path": "/Users/mtford/Playground/log/log.txt",
                      "rowid": 1,
                      "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
                    },
                    Object {
                      "path": "/Users/mtford/Playground/log/log.txt",
                      "rowid": 2,
                      "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
                    },
                    Object {
                      "path": "/Users/mtford/Playground/log/log.txt",
                      "rowid": 3,
                      "text": " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
                    },
                    Object {
                      "path": "/Users/mtford/Playground/log/log2.txt",
                      "rowid": 4,
                      "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
                    },
                    Object {
                      "path": "/another/path",
                      "rowid": 5,
                      "text": "xyz",
                    },
                  ]
              `);
      });
    });

    describe("when querying for lines", () => {
      let results: ReturnType<typeof db.lines>;

      describe("with a filter", () => {
        beforeEach(() => {
          results = db.lines(path, {
            fields: ["rowid", "path", "text"],
            filter: "workflow-upload-orchestrator",
          });
        });

        it("should return the filtered lines", async () => {
          expect(results).toMatchInlineSnapshot(`
                      Array [
                        Object {
                          "path": "/Users/mtford/Playground/log/log.txt",
                          "rowid": 2,
                          "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
                        },
                        Object {
                          "path": "/Users/mtford/Playground/log/log.txt",
                          "rowid": 1,
                          "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
                        },
                      ]
                  `);
        });
      });

      describe("without a filter", () => {
        beforeEach(() => {
          results = db.lines(path, {
            fields: ["rowid", "path", "text"],
          });
        });

        it("should return all the lines", async () => {
          expect(results).toMatchInlineSnapshot(`
                      Array [
                        Object {
                          "path": "/Users/mtford/Playground/log/log.txt",
                          "rowid": 3,
                          "text": " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
                        },
                        Object {
                          "path": "/Users/mtford/Playground/log/log.txt",
                          "rowid": 2,
                          "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
                        },
                        Object {
                          "path": "/Users/mtford/Playground/log/log.txt",
                          "rowid": 1,
                          "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
                        },
                      ]
                  `);
        });
      });

      describe("with an offset", () => {
        beforeEach(() => {
          results = db.lines(path, {
            fields: ["rowid", "path", "text"],
            beforeRowId: 2,
          });
        });

        it("should return only the first line", async () => {
          expect(results).toMatchInlineSnapshot(`
                      Array [
                        Object {
                          "path": "/Users/mtford/Playground/log/log.txt",
                          "rowid": 1,
                          "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
                        },
                      ]
                  `);
        });
      });
    });

    describe("numLines", () => {
      describe("without rowId", () => {
        it("should return all lines", async () => {
          const n = await db.numLines(path);
          expect(n).toEqual(3);
        });
      });

      describe("with rowId", () => {
        it("should return lines before the rowId", async () => {
          const n = await db.numLines(path, rowIds[2]);
          expect(n).toEqual(2);
        });
      });

      describe("with a filter", () => {
        it("should return filtered lines", async () => {
          const n = await db.numLines(path, null, "session-binary-uploader");
          expect(n).toEqual(1);
        });
      });

      describe("with a filter & rowid", () => {
        it("should return filtered lines", async () => {
          const n = await db.numLines(path, 2, "workflow-upload-orchestrator");
          expect(n).toEqual(1);
        });
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
  });
});
