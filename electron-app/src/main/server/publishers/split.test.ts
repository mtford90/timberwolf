import { splitText } from "./split";

describe("log splitting", () => {
  it("should split by new lines", async () => {
    const split = splitText("my log\nmy second log");

    expect(split).toEqual(["my log", "my second log"]);
  });
});
