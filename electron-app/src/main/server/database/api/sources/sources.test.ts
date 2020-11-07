import { Database } from "../../index";

describe("sources", () => {
  const db = new Database();

  beforeAll(async () => {
    await db.init();
  });

  afterEach(() => {
    db.clearAll();
  });

  describe("createSource", () => {
    describe("when a named source already exists", () => {
      it("should generate a new name", async () => {
        const id = db.sources.create("named source");
        const secondId = db.sources.create("named source");
        expect(db.sources.get(id)).toEqual(
          expect.objectContaining({
            name: "named source",
          })
        );
        expect(db.sources.get(secondId)).toEqual(
          expect.objectContaining({
            name: "named source (1)",
          })
        );
      });
    });

    it("should emit an event", async () => {
      const spy = jest.fn();
      db.on("create:source", spy);
      const id = db.sources.create("xyz");
      expect(spy).toHaveBeenCalledWith(id);
    });
  });

  describe("upsertSource", () => {
    it("should generate a new name", async () => {
      const id = db.sources.create("named source");
      expect(db.sources.upsert("named source")).toEqual(id);
    });
  });

  describe("getSources", () => {
    it("should return sources", async () => {
      db.sources.create("named source");
      db.sources.create("another source");
      expect(db.sources.all()).toEqual([
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
      const id = db.sources.create("named source");
      db.sources.rename(id, "renamed");
      const res = db.sources.get(id);
      expect(res).toEqual({
        id: 1,
        name: "renamed",
      });
    });

    it("should emit an event", async () => {
      const spy = jest.fn();
      const id = db.sources.create("xyz");
      db.on("update:source", spy);
      db.sources.rename(id, "renamed");
      expect(spy).toHaveBeenCalledWith(id);
    });
  });

  describe("deleteSource", () => {
    it("should delete the source", async () => {
      const id = db.sources.create("xyz");
      db.sources.delete(id);
      const res = db.sources.get(id);
      expect(res).toBe(null);
    });

    it("should delete all associated logs", async () => {
      const id = db.sources.create("xyz");
      await db.logs.insert([
        {
          sourceId: id,
          text: "hi",
          timestamp: Date.now(),
        },
      ]);
      const logsBeforeDelete = await db.logs.findMany(id);
      expect(logsBeforeDelete).toHaveLength(1);
      db.sources.delete(id);
      const res = db.sources.get(id);
      expect(res).toBe(null);
      const logs = await db.logs.findMany(id);
      expect(logs).toHaveLength(0);
    });

    it("should emit an event", async () => {
      const id = db.sources.create("xyz");
      const spy = jest.fn();
      db.on("delete:source", spy);
      db.sources.delete(id);
      expect(spy).toHaveBeenCalledWith(id);
    });
  });
});
