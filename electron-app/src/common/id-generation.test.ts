import { generateIdentifier } from "./id-generation";

describe("id generation", () => {
  describe("when none existing", () => {
    it("should create a kebab case identifier", async () => {
      expect(generateIdentifier("My Source")).toEqual("my-source");
    });
  });

  describe("when existing", () => {
    it("should create a suffixed kebab case identifier", async () => {
      expect(generateIdentifier("My Source", ["my-source"])).toEqual(
        "my-source-1"
      );
    });
  });

  describe("when a suffixed id exists, but it doesnt match", () => {
    it("should not suffix", async () => {
      expect(generateIdentifier("My Source", ["my-source-1"])).toEqual(
        "my-source"
      );
    });
  });
});
