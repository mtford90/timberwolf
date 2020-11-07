import { Database } from "./index";

describe("database", () => {
  const db = new Database();

  beforeAll(async () => {
    await db.init();
  });

  afterEach(() => {
    db.clearAll();
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
            name: "named source",
          },
          {
            id: 2,
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
          id: 1,
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
