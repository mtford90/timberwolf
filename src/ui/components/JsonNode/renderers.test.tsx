import { JsonLogNode } from "../../lib/parse/json";
import { deepMock } from "../../../../tests/util";
import { renderLabel, renderValue } from "./renderers";

describe("renderLabel", () => {
  describe("not javascript", () => {
    test("multiple keys", () => {
      expect(
        renderLabel(
          deepMock<JsonLogNode>({ isJavascript: false }),
          ["blah", "root"]
        )
      ).toMatchInlineSnapshot(`
        <span>
          blah
          :
        </span>
      `);
    });

    test("single keys", () => {
      expect(
        renderLabel(
          deepMock<JsonLogNode>({ isJavascript: false }),
          ["root"]
        )
      ).toMatchInlineSnapshot(`
        <span>
          json
        </span>
      `);
    });
  });

  describe("is javascript", () => {
    test("array", () => {
      expect(
        renderLabel(
          deepMock<JsonLogNode>({ isJavascript: true, object: [] }),
          ["root"]
        )
      ).toMatchInlineSnapshot(`
        <span>
          Array
        </span>
      `);
    });

    test("object", () => {
      expect(
        renderLabel(
          deepMock<JsonLogNode>({ isJavascript: true, object: {} }),
          ["root"]
        )
      ).toMatchInlineSnapshot(`
        <span>
          Object
        </span>
      `);
    });
  });
});

describe("renderValue", () => {
  describe("isJavascript", () => {
    test("[js.Object]", () => {
      expect(renderValue(true, "{}", "[js.Object]")).toMatchInlineSnapshot(`
        <span
          style={
            Object {
              "color": "#ab4642",
            }
          }
        >
          [Object]
        </span>
      `);
    });

    test("[js.Array]", () => {
      expect(renderValue(true, "[]", "[js.Array]")).toMatchInlineSnapshot(`
        <span
          style={
            Object {
              "color": "#ab4642",
            }
          }
        >
          [Array]
        </span>
      `);
    });

    test("[js.Date()]", () => {
      const rawValue = "[js.Date(1994-11-05T08:15:30-05:00)]";

      expect(
        renderValue(true, "[js.Date(1994-11-05T08:15:30-05:00)]", rawValue)
      ).toMatchInlineSnapshot(`
        <span
          style={
            Object {
              "color": "#ba8baf",
            }
          }
        >
          1994-11-05T08:15:30-05:00
        </span>
      `);
    });
  });
});
