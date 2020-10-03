import { PubSub } from "graphql-subscriptions";
import mitt from "mitt";
import { LogsPublisher } from "./logs-publisher";
import { deepMock } from "../../../../tests/util";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";
import { WebsocketMessage } from "../websockets/validation";

describe("logs publisher", () => {
  let pubSub: PubSub;
  let stdinEmitter: ReturnType<typeof mitt>;
  let websocketEmitter: ReturnType<typeof mitt>;
  let sut: LogsPublisher;
  let stdin: typeof process.stdin;
  let database: Database;
  let websocketServer: WebsocketServer;

  beforeEach(() => {
    pubSub = new PubSub();
    stdinEmitter = mitt();
    stdin = deepMock<typeof process.stdin>({
      resume: jest.fn(),
      setEncoding: jest.fn(),
      on: jest.fn().mockImplementation((event: any, handler: any) => {
        stdinEmitter.on(event, handler);
      }),
      off: jest.fn().mockImplementation((event: any, handler: any) => {
        stdinEmitter.off(event, handler);
      }),
    });
    database = deepMock<Database>({
      insert: jest.fn(() => [
        { rowid: 0, source: "/", timestamp: 0, text: "" },
      ]),
    });
    websocketEmitter = mitt();
    websocketServer = new WebsocketServer(websocketEmitter);
    sut = new LogsPublisher({
      pubSub,
      stdin,
      database,
      websocketServer,
    });
    sut.init();
  });

  afterEach(() => {
    sut.dispose();
  });

  describe("when initialized", () => {
    it("should resume stdin", async () => {
      expect(stdin.resume).toHaveBeenCalled();
    });
  });

  describe("when receiving data", () => {
    describe("from stdin", () => {
      it("should publish", (done) => {
        const line = "testing\n";
        pubSub.subscribe("logs", (received) => {
          expect(received).toMatchInlineSnapshot(`
                      Object {
                        "logs": Object {
                          "__typename": "Log",
                          "rowid": 0,
                          "source": "stdin",
                          "text": "",
                          "timestamp": 1970-01-01T00:00:00.000Z,
                        },
                      }
                  `);
          done();
        });
        stdinEmitter.emit("data", Buffer.from(line, "utf8"));
      });

      it("should store the line", async () => {
        const line = "testing";
        stdinEmitter.emit("data", Buffer.from(line, "utf8"));
        expect(database.insert).toHaveBeenCalledWith([
          { text: "testing", source: "stdin" },
        ]);
      });

      it("should split into multiple logs with new lines", async () => {
        const incoming = "my log\nmy second log";
        stdinEmitter.emit("data", Buffer.from(incoming, "utf8"));
        expect(database.insert).toHaveBeenCalledTimes(2);
        expect(database.insert).toHaveBeenCalledWith([
          { text: "my log", source: "stdin" },
        ]);
        expect(database.insert).toHaveBeenCalledWith([
          { text: "my second log", source: "stdin" },
        ]);
      });
    });

    describe("from websocket", () => {
      const timestamp = 123;

      const message: WebsocketMessage = {
        name: "my log",
        timestamp,
        text: "a log",
      };

      it("should publish", (done) => {
        pubSub.subscribe("logs", (received) => {
          expect(received).toMatchInlineSnapshot(`
            Object {
              "logs": Object {
                "__typename": "Log",
                "rowid": 0,
                "source": "ws/my log",
                "text": "a log",
                "timestamp": 123,
              },
            }
          `);
          done();
        });

        websocketEmitter.emit("message", message);
      });

      it("should store the log", async () => {
        websocketEmitter.emit("message", message);

        expect(database.insert).toHaveBeenCalledWith([
          { text: "a log", source: "ws/my log", timestamp },
        ]);
      });
    });
  });
});
