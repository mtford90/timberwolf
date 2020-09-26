import { parseMessage } from "./validation";

describe("websocket message validation", () => {
  const timestamp = Date.now();

  describe("when valid", () => {
    it("should return message", async () => {
      const payload = {
        name: "my tab",
        timestamp,
        text: "[debug] hello",
      };

      const res = await parseMessage(JSON.stringify(payload));

      expect(res).toEqual(payload);
    });
  });

  describe("when invalid", () => {
    it("should reject", async () => {
      const payload = {
        name: "my tab",
        text: "[debug] hello",
      };

      await expect(parseMessage(JSON.stringify(payload))).rejects.toBeTruthy();
    });
  });
});
