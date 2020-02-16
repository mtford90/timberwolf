import { getRows } from "./parse";

describe("getRows", () => {
  test("string", () => {
    const rows = getRows(
      ' DEBUG  [workflow-upload-orchestrator] file observation {"file": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda", "listenerId": "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412", "mask": 1073742080, "path": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows", "types": [256]}\n'
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].nodes).toHaveLength(3);
  });

  test("array", () => {
    const rows = getRows([
      ' DEBUG  [workflow-upload-orchestrator] file observation {"file": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda", "listenerId": "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412", "mask": 1073742080, "path": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows", "types": [256]}\n',
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].nodes).toHaveLength(3);
  });

  test("anything else", () => {
    expect(() => getRows(4)).toThrow();
    expect(() => getRows({})).toThrow();
    expect(() => getRows([4])).toThrow();
    expect(() => getRows([{}])).toThrow();
  });
});
