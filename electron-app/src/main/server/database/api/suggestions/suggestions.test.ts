import { Database } from "../../index";

describe("suggestions", () => {
  const db = new Database();

  beforeAll(async () => {
    await db.init();
  });

  afterEach(() => {
    db.clearAll();
  });

  const sourceName = "my source";

  let sourceId: number;

  beforeEach(async () => {
    sourceId = db.sources.create(sourceName);

    await db.logs
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
          sourceId: db.sources.create("/Users/mtford/Playground/log/log2.txt"),
          text: " DEBUG  [workflow-upload-orchestrator] deleted session binary",
        },
        {
          sourceId: db.sources.create("/another/path"),
          text: "xyz",
        },
      ])
      .map((row) => row.rowid);
  });

  it("should suggest stuff", async () => {
    const { id } = db.sources.getByName(sourceName)!;
    const res = db.suggestions.suggest(id, "up");
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
    const { id } = db.sources.getByName(sourceName)!;
    const res = db.suggestions.suggest(id, "upload");
    expect(res.includes("upload")).toBeFalsy();
  });

  it("should not include the prefix if fulfilled, and should be case insensitive", async () => {
    const { id } = db.sources.getByName(sourceName)!;
    const res = db.suggestions.suggest(id, "UPLOAD");
    console.log("res", res);
    expect(res.includes("upload")).toBeFalsy();
  });
});
