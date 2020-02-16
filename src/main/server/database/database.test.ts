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

  beforeEach(async () => {
    await db.insert([
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
    ]);
  });

  test("insert -> query -> clear", async () => {
    const results = await db.lines(path, "workflow-upload-orchestrator", {
      fields: ["rowid", "path", "text"],
    });

    expect(results).toMatchInlineSnapshot(`
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
      ]
    `);

    await db.clear(path);

    const clearedResults = await db.lines(
      path,
      "workflow-upload-orchestrator",
      {
        fields: ["rowid", "path", "text"],
      }
    );

    expect(clearedResults.length).toBeFalsy();

    const otherFilesResults = await db.lines(
      "/Users/mtford/Playground/log/log2.txt",
      "workflow-upload-orchestrator",
      {
        fields: ["rowid", "path", "text"],
      }
    );

    expect(otherFilesResults).toMatchInlineSnapshot(`
      Array [
        Object {
          "path": "/Users/mtford/Playground/log/log2.txt",
          "rowid": 4,
          "text": " DEBUG  [workflow-upload-orchestrator] deleted session binary",
        },
      ]
    `);
  });

  test("numLines", async () => {
    const n = await db.numLines(path);
    expect(n).toEqual(3);
  });
});
