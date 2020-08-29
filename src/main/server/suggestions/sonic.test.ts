import { v4 as guid } from "uuid";
import path from "path";
import { Sonic } from "./sonic";

describe("sonic", () => {
  const sonic = new Sonic(
    path.resolve(__dirname, "../../../../sonic.template.cfg"),
    path.resolve(__dirname, "../../../../resources/mac/sonic"),
    "/tmp"
  );

  beforeAll(async () => {
    await sonic.run();
  });

  beforeEach(async () => {
    await sonic.clearAll();
  });

  afterAll(async () => {
    await sonic.terminate();
  });

  describe("suggest", () => {
    let tabId: string;

    beforeEach(async () => {
      tabId = guid();
      await Promise.all([
        sonic.store(tabId, "1", "my log"),
        sonic.store(tabId, "2", "my other log"),
        sonic.store(tabId, "3", "chatbox code"),
        sonic.store(tabId, "4", "123"),
      ]);
    });

    it("should return relevent results", async () => {
      const suggestions = await sonic.suggest(tabId, "co");
      console.log("suggestions", suggestions);
    });
  });
});
