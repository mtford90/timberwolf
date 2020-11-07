import { Database } from "./index";

describe("database", () => {
  const db = new Database();

  beforeAll(async () => {
    await db.init();
  });

  afterEach(() => {
    db.clearAll();
  });

  const sourceName = "my source";

  let sourceId: number;

  beforeEach(() => {
    sourceId = db.createSource(sourceName);
  });

  describe("suggestions", () => {
    beforeEach(async () => {
      await db.logs
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
            sourceId: db.createSource("/Users/mtford/Playground/log/log2.txt"),
            text:
              " DEBUG  [workflow-upload-orchestrator] deleted session binary",
          },
          {
            sourceId: db.createSource("/another/path"),
            text: "xyz",
          },
        ])
        .map((row) => row.rowid);
    });

    it("should suggest stuff", async () => {
      const { id } = db.getSourceByName(sourceName)!;
      const res = db.suggest(id, "up");
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
      const { id } = db.getSourceByName(sourceName)!;
      const res = db.suggest(id, "upload");
      expect(res.includes("upload")).toBeFalsy();
    });

    it("should not include the prefix if fulfilled, and should be case insensitive", async () => {
      const { id } = db.getSourceByName(sourceName)!;
      const res = db.suggest(id, "UPLOAD");
      console.log("res", res);
      expect(res.includes("upload")).toBeFalsy();
    });
  });

  describe("sources", () => {
    describe("createSource", () => {
      describe("when a named source already exists", () => {
        it("should generate a new name", async () => {
          const id = db.createSource("named source");
          const secondId = db.createSource("named source");
          expect(db.getSource(id)).toEqual(
            expect.objectContaining({
              name: "named source",
            })
          );
          expect(db.getSource(secondId)).toEqual(
            expect.objectContaining({
              name: "named source (1)",
            })
          );
        });
      });

      it("should emit an event", async () => {
        const spy = jest.fn();
        db.on("create:source", spy);
        const id = db.createSource("xyz");
        expect(spy).toHaveBeenCalledWith(id);
      });
    });

    describe("upsertSource", () => {
      it("should generate a new name", async () => {
        const id = db.createSource("named source");
        expect(db.upsertSource("named source")).toEqual(id);
      });
    });

    describe("getSources", () => {
      it("should return sources", async () => {
        db.createSource("named source");
        db.createSource("another source");
        expect(db.getSources()).toEqual([
          {
            id: 1,
            name: "my source",
          },
          {
            id: 2,
            name: "named source",
          },
          {
            id: 3,
            name: "another source",
          },
        ]);
      });
    });

    describe("renameSource", () => {
      it("should change the name", async () => {
        const id = db.createSource("named source");
        db.renameSource(id, "renamed");
        const res = db.getSource(id);
        expect(res).toEqual({
          id: 2,
          name: "renamed",
        });
      });

      it("should emit an event", async () => {
        const spy = jest.fn();
        const id = db.createSource("xyz");
        db.on("update:source", spy);
        db.renameSource(id, "renamed");
        expect(spy).toHaveBeenCalledWith(id);
      });
    });

    describe("deleteSource", () => {
      it("should delete the source", async () => {
        const id = db.createSource("xyz");
        db.deleteSource(id);
        const res = db.getSource(id);
        expect(res).toBe(null);
      });

      it("should delete all associated logs", async () => {
        const id = db.createSource("xyz");
        await db.logs.insert([
          {
            sourceId: id,
            text: "hi",
            timestamp: Date.now(),
          },
        ]);
        const logsBeforeDelete = await db.logs.findMany(id);
        expect(logsBeforeDelete).toHaveLength(1);
        db.deleteSource(id);
        const res = db.getSource(id);
        expect(res).toBe(null);
        const logs = await db.logs.findMany(id);
        expect(logs).toHaveLength(0);
      });

      it("should emit an event", async () => {
        const id = db.createSource("xyz");
        const spy = jest.fn();
        db.on("delete:source", spy);
        db.deleteSource(id);
        expect(spy).toHaveBeenCalledWith(id);
      });
    });
  });
});
