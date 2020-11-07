import { Database } from "..";

describe("logs", () => {
  const db = new Database();

  beforeAll(async () => {
    await db.init();
  });

  afterEach(() => {
    db.clearAll();
  });

  const sourceName = "my source";

  let sourceId: number;
  let rowIds: number[];

  beforeEach(async () => {
    sourceId = db.createSource(sourceName);
    rowIds = await db.logs
      .insert([
        {
          sourceId,
          text:
            " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
        },
        {
          sourceId,
          text: " DEBUG  [workflow-upload-orchestrator] deleted session binary",
        },
        {
          sourceId,
          text:
            " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
        },
        {
          sourceId: db.createSource("/Users/mtford/Playground/log/log2.txt"),
          text: " DEBUG  [workflow-upload-orchestrator] deleted session binary",
        },
        {
          sourceId: db.createSource("/another/path"),
          text: "xyz",
        },
      ])
      .map((row) => row.rowid);
  });

  describe("when getting many", () => {
    it("should return the rows", async () => {
      const many = await db.logs.getMany(rowIds, {
        fields: ["rowid", "source_id", "text"],
      });

      expect(many).toMatchInlineSnapshot(`
          Array [
            Object {
              "rowid": 1,
              "source_id": 1,
              "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
            },
            Object {
              "rowid": 2,
              "source_id": 1,
              "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
            },
            Object {
              "rowid": 3,
              "source_id": 1,
              "text": " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
            },
            Object {
              "rowid": 4,
              "source_id": 2,
              "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
            },
            Object {
              "rowid": 5,
              "source_id": 3,
              "text": "xyz",
            },
          ]
        `);
    });
  });

  describe("when querying for logs", () => {
    let results: ReturnType<typeof db.logs.findMany>;

    describe("with a filter", () => {
      beforeEach(() => {
        const { id } = db.getSourceByName(sourceName)!;
        results = db.logs.findMany(id, {
          fields: ["rowid", "source_id", "text"],
          filter: "workflow-upload-orchestrator",
        });
      });

      it("should return the filtered logs", async () => {
        expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "rowid": 2,
                "source_id": 1,
                "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
              },
              Object {
                "rowid": 1,
                "source_id": 1,
                "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
              },
            ]
          `);
      });
    });

    describe("without a filter", () => {
      beforeEach(() => {
        const { id } = db.getSourceByName(sourceName)!;
        results = db.logs.findMany(id, {
          fields: ["rowid", "source_id", "text"],
        });
      });

      it("should return all the logs", async () => {
        expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "rowid": 3,
                "source_id": 1,
                "text": " DEBUG  [session-binary-uploader] uploadFile(attempt: 1): 45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd, (/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/binary_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd)",
              },
              Object {
                "rowid": 2,
                "source_id": 1,
                "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
              },
              Object {
                "rowid": 1,
                "source_id": 1,
                "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
              },
            ]
          `);
      });
    });

    describe("with an offset", () => {
      beforeEach(() => {
        const { id } = db.getSourceByName(sourceName)!;
        results = db.logs.findMany(id, {
          fields: ["rowid", "source_id", "text"],
          beforeRowId: 2,
        });
      });

      it("should return only the first line", async () => {
        expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "rowid": 1,
                "source_id": 1,
                "text": " DEBUG  [workflow-upload-orchestrator] operation was performed - trying another tick",
              },
            ]
          `);
      });
    });
  });

  describe("when counting", () => {
    describe("without rowId", () => {
      it("should return all logs", async () => {
        const { id } = db.getSourceByName(sourceName)!;
        const n = await db.logs.count(id);
        expect(n).toEqual(3);
      });
    });

    describe("with rowId", () => {
      it("should return logs before the rowId", async () => {
        const { id } = db.getSourceByName(sourceName)!;
        const n = await db.logs.count(id, rowIds[2]);
        expect(n).toEqual(2);
      });
    });

    describe("with a filter", () => {
      it("should return filtered logs", async () => {
        const { id } = db.getSourceByName(sourceName)!;
        const n = await db.logs.count(id, null, "session-binary-uploader");
        expect(n).toEqual(1);
      });
    });

    describe("with a filter & rowid", () => {
      it("should return filtered logs", async () => {
        const { id } = db.getSourceByName(sourceName)!;
        const n = await db.logs.count(id, 2, "workflow-upload-orchestrator");
        expect(n).toEqual(1);
      });
    });
  });
});
