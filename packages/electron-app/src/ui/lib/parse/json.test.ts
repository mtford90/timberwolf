import { JsonLogNode, LogNode, LogNodeType, matchJSON } from "./json";

describe("matchJSON", () => {
  test("No JSON", () => {
    const testStr = `DEBUG  [workflow-upload-orchestrator] file observation`;

    const nodes = matchJSON(testStr);

    expect(nodes).toEqual([
      {
        type: LogNodeType.TEXT,
        text: "DEBUG  [workflow-upload-orchestrator] file observation",
        startIndex: 0,
        endIndex: 54,
      },
    ]);
  });

  test("JSON Object @ beginning", () => {
    const testStr = `{"file": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/info_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd.json", "listenerId": "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412", "mask": 128, "path": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows", "types": [128]} DEBUG  [workflow-upload-orchestrator] file observation`;

    const nodes = matchJSON(testStr);

    expect(nodes).toEqual<LogNode[]>([
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: {
          file:
            "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/info_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd.json",
          listenerId: "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412",
          mask: 128,
          path:
            "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows",
          types: [128],
        },
        startIndex: 0,
        endIndex: 474,
      },
      {
        type: LogNodeType.TEXT,
        text: " DEBUG  [workflow-upload-orchestrator] file observation",
        startIndex: 474,
        endIndex: 529,
      },
    ]);
  });

  test("JSON Object nested between text", () => {
    const testStr = `DEBUG  [workflow-upload-orchestrator] file observation {"file": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/info_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd.json", "listenerId": "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412", "mask": 128, "path": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows", "types": [128]} sasd`;

    const nodes = matchJSON(testStr);

    expect(nodes).toEqual<LogNode[]>([
      {
        type: LogNodeType.TEXT,
        text: "DEBUG  [workflow-upload-orchestrator] file observation ",
        startIndex: 0,
        endIndex: 55,
      },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: {
          file:
            "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/info_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd.json",
          listenerId: "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412",
          mask: 128,
          path:
            "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows",
          types: [128],
        },
        startIndex: 55,
        endIndex: 529,
      },
      { type: LogNodeType.TEXT, text: " sasd", startIndex: 529, endIndex: 534 },
    ]);
  });

  test("JSON Object @ end", () => {
    const testStr = `DEBUG  [workflow-upload-orchestrator] file observation {"file": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/info_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd.json", "listenerId": "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412", "mask": 128, "path": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows", "types": [128]}`;

    const nodes = matchJSON(testStr);

    expect(nodes).toEqual<LogNode[]>([
      {
        type: LogNodeType.TEXT,
        text: "DEBUG  [workflow-upload-orchestrator] file observation ",
        startIndex: 0,
        endIndex: 55,
      },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: {
          file:
            "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/info_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd.json",
          listenerId: "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412",
          mask: 128,
          path:
            "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows",
          types: [128],
        },
        startIndex: 55,
        endIndex: 529,
      },
    ]);
  });

  test("Two nested JSON object, seperated by a space", () => {
    const line = `DEBUG  [workflow-upload-orchestrator] file observation {"file": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/info_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd.json"} {"listenerId": "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412", "mask": {"xyz": 123}, "path": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows", "types": [128]} sasd`;

    const nodes = matchJSON(line);

    expect(nodes).toEqual<LogNode[]>([
      {
        type: LogNodeType.TEXT,
        text: "DEBUG  [workflow-upload-orchestrator] file observation ",
        startIndex: 0,
        endIndex: 55,
      },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: {
          file:
            "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda/info_45c8e1b0-6d87-4bc1-ba90-0b2ca1d452bd.json",
        },
        startIndex: 55,
        endIndex: 355,
      },
      { type: LogNodeType.TEXT, text: " ", startIndex: 355, endIndex: 356 },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: {
          listenerId: "9a59ed7c-eff0-42ba-aa64-5bf3b7c23412",
          mask: { xyz: 123 },
          path:
            "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows",
          types: [128],
        },
        startIndex: 356,
        endIndex: 539,
      },
      { type: LogNodeType.TEXT, text: " sasd", startIndex: 539, endIndex: 544 },
    ]);
  });

  test("JSON Array @ beginning", () => {
    const testStr = `[1, 2, 3] yo`;

    const nodes = matchJSON(testStr);

    expect(nodes).toEqual<LogNode[]>([
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: [1, 2, 3],
        startIndex: 0,
        endIndex: 9,
      },
      { type: LogNodeType.TEXT, text: " yo", startIndex: 9, endIndex: 12 },
    ]);
  });

  test("JSON Array nested", () => {
    const testStr = `yo [1, 2, 3] yo`;

    const nodes = matchJSON(testStr);

    console.log(nodes);

    expect(nodes).toEqual<LogNode[]>([
      { type: LogNodeType.TEXT, text: "yo ", startIndex: 0, endIndex: 3 },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: [1, 2, 3],
        startIndex: 3,
        endIndex: 12,
      },
      { type: LogNodeType.TEXT, text: " yo", startIndex: 12, endIndex: 15 },
    ]);
  });

  test("JSON Array @ end", () => {
    const testStr = `yo [1, 2, 3]`;

    const nodes = matchJSON(testStr);

    console.log(nodes);

    expect(nodes).toEqual<LogNode[]>([
      { type: LogNodeType.TEXT, text: "yo ", startIndex: 0, endIndex: 3 },
      {
        type: LogNodeType.JSON,
        object: [1, 2, 3],
        isJavascript: false,
        startIndex: 3,
        endIndex: 12,
      },
    ]);
  });

  test("JSON Arrays, nested, seperated by space", () => {
    const testStr = `yo [1, 2, 3] [4, 5, 6] asdas`;

    const nodes = matchJSON(testStr);

    console.log(nodes);

    expect(nodes).toEqual<LogNode[]>([
      { type: LogNodeType.TEXT, text: "yo ", startIndex: 0, endIndex: 3 },
      {
        type: LogNodeType.JSON,
        object: [1, 2, 3],
        isJavascript: false,
        startIndex: 3,
        endIndex: 12,
      },
      { type: LogNodeType.TEXT, text: " ", startIndex: 12, endIndex: 13 },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: [4, 5, 6],
        startIndex: 13,
        endIndex: 22,
      },
      { type: LogNodeType.TEXT, text: " asdas", startIndex: 22, endIndex: 28 },
    ]);
  });

  test("JSON Arrays, nested, next to each other", () => {
    const testStr = `yo [1, 2, 3][4, 5, 6] asdas`;

    const nodes = matchJSON(testStr);

    console.log(nodes);

    expect(nodes).toEqual<LogNode[]>([
      { type: LogNodeType.TEXT, text: "yo ", startIndex: 0, endIndex: 3 },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: [1, 2, 3],
        startIndex: 3,
        endIndex: 12,
      },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: [4, 5, 6],
        startIndex: 12,
        endIndex: 21,
      },
      { type: LogNodeType.TEXT, text: " asdas", startIndex: 21, endIndex: 27 },
    ]);
  });

  test("JSON Array, multiple data types", () => {
    const testStr = `yo [1, "2", {"x": 123}]`;

    const nodes = matchJSON(testStr);

    console.log(JSON.stringify(nodes, null, 2));

    expect(nodes).toEqual<LogNode[]>([
      {
        type: LogNodeType.TEXT,
        text: "yo ",
        startIndex: 0,
        endIndex: 3,
      },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: [
          1,
          "2",
          {
            x: 123,
          },
        ],
        startIndex: 3,
        endIndex: 23,
      },
    ]);
  });

  test("JSON Arrays and objects", () => {
    const testStr = `yo [1, "2", {"x": 123}]{"y": 1} 324234 {"x": 763}`;

    const nodes = matchJSON(testStr);

    console.log(JSON.stringify(nodes, null, 2));

    expect(nodes).toEqual<LogNode[]>([
      {
        type: LogNodeType.TEXT,
        text: "yo ",
        startIndex: 0,
        endIndex: 3,
      },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: [
          1,
          "2",
          {
            x: 123,
          },
        ],
        startIndex: 3,
        endIndex: 23,
      },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: {
          y: 1,
        },
        startIndex: 23,
        endIndex: 31,
      },
      {
        type: LogNodeType.TEXT,
        text: " 324234 ",
        startIndex: 31,
        endIndex: 39,
      },
      {
        type: LogNodeType.JSON,
        isJavascript: false,
        object: {
          x: 763,
        },
        startIndex: 39,
        endIndex: 49,
      },
    ]);
  });

  test("mismatched brackets: [ }", () => {
    const testStr = `yo [1,2,3} as`;

    const nodes = matchJSON(testStr);

    console.log(JSON.stringify(nodes, null, 2));

    expect(nodes).toEqual([
      {
        type: LogNodeType.TEXT,
        text: "yo [1,2,3} as",
        startIndex: 0,
        endIndex: 13,
      },
    ]);
  });

  test("mismatched brackets: { ]", () => {
    const testStr = `yo {1,2,3] as`;

    const nodes = matchJSON(testStr);

    console.log(JSON.stringify(nodes, null, 2));

    expect(nodes).toEqual<LogNode[]>([
      {
        type: LogNodeType.TEXT,
        text: "yo {1,2,3] as",
        startIndex: 0,
        endIndex: 13,
      },
    ]);
  });

  test("[Object] notation and ISO datetimes from logging javascript objects (e.g. in react native metro)", () => {
    const testStr = `{"workflowToUpload": {"customerId": "ddd18590-6ab7-11e9-94af-3aaca69310c8", "error": false, "fileName": "1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda", "organizationId": "8351ec7a-6ab9-11e9-9d14-1aa083c926ce", "path": "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda", "payload": {"applicationId": "c1b2bde3-52f3-44fe-9c9a-aa9c15ec9734", "applicationVersion": "0.4.1", "dateTime": 2020-02-17T19:15:08.836Z, "id": "0999f04a-986e-4740-be21-2b4ffc2dedda", "organizationId": "8351ec7a-6ab9-11e9-9d14-1aa083c926ce", "tz": "Europe/London", "workflowDefinitionId": "ec5f8087-822a-4967-b7e4-d1ed72ddc10a", "workflowDefinitionVersion": "0.0.5", "workflowInputs": [Object], "workflowInputsSchema": "MonitoringV1.json", "workflowTypeId": "c730ae0a-a2cd-11e7-8b2d-b2b3c9a1a96a"}, "timestamp": 1581966924343, "workflowId": "0999f04a-986e-4740-be21-2b4ffc2dedda"}}`;

    const nodes = matchJSON(testStr);

    expect(nodes).toEqual<JsonLogNode[]>([
      {
        type: LogNodeType.JSON,
        isJavascript: true,
        object: {
          workflowToUpload: {
            customerId: "ddd18590-6ab7-11e9-94af-3aaca69310c8",
            error: false,
            fileName: "1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda",
            organizationId: "8351ec7a-6ab9-11e9-9d14-1aa083c926ce",
            path:
              "/storage/emulated/0/Android/data/com.xpertsea.mobileapp.staging/files/workflows/a830a970-f987-11e9-b4d8-66674c84890a/ddd18590-6ab7-11e9-94af-3aaca69310c8/8351ec7a-6ab9-11e9-9d14-1aa083c926ce/1581966924343_0999f04a-986e-4740-be21-2b4ffc2dedda",
            payload: {
              applicationId: "c1b2bde3-52f3-44fe-9c9a-aa9c15ec9734",
              applicationVersion: "0.4.1",
              // This is the important bit
              dateTime: "[js.Date(2020-02-17T19:15:08.836Z)]",
              id: "0999f04a-986e-4740-be21-2b4ffc2dedda",
              organizationId: "8351ec7a-6ab9-11e9-9d14-1aa083c926ce",
              tz: "Europe/London",
              workflowDefinitionId: "ec5f8087-822a-4967-b7e4-d1ed72ddc10a",
              workflowDefinitionVersion: "0.0.5",
              // Also this
              workflowInputs: "[js.Object]",
              workflowInputsSchema: "MonitoringV1.json",
              workflowTypeId: "c730ae0a-a2cd-11e7-8b2d-b2b3c9a1a96a",
            },
            timestamp: 1581966924343,
            workflowId: "0999f04a-986e-4740-be21-2b4ffc2dedda",
          },
        },
        startIndex: 0,
        endIndex: 1050,
      },
    ]);
  });
});
