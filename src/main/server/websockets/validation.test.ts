import { parseMessage } from "./validation";

describe("websocket message validation", () => {
  describe("when object", () => {
    describe("when valid", () => {
      describe("with a timestamp", () => {
        it("should return message", async () => {
          const payload = {
            name: "my tab",
            timestamp: 2,
            text: "[debug] hello",
          };

          const res = await parseMessage(JSON.stringify(payload));

          expect(res).toEqual(payload);
        });
      });

      describe("without a timestamp", () => {
        it("should add a timestamp & return message", async () => {
          const payload = {
            name: "my tab",
            text: "[debug] hello",
          };

          const res = await parseMessage(JSON.stringify(payload));

          expect(res).toEqual(expect.objectContaining(payload));
          // noinspection SuspiciousTypeOfGuard
          expect(typeof res.timestamp === "number").toBeTruthy();
        });
      });
    });

    describe("when invalid", () => {
      it("should reject", async () => {
        const payload = {
          text: "[debug] hello",
        };

        await expect(
          parseMessage(JSON.stringify(payload))
        ).rejects.toBeTruthy();
      });
    });
  });

  describe("when string", () => {
    it("should use default name & timestamp", async () => {
      const payload = "my log!";
      const res = await parseMessage(payload);
      expect(res).toEqual(
        expect.objectContaining({
          name: "websocket",
          text: "my log!",
        })
      );

      // noinspection SuspiciousTypeOfGuard
      expect(typeof res.timestamp === "number").toBeTruthy();
    });
  });
});
