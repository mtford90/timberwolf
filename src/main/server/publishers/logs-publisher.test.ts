import { PubSub } from "graphql-subscriptions";
import mitt from "mitt";
import { LogsPublisher } from "./logs-publisher";
import { deepMock } from "../../../../tests/util";
import { Database } from "../database";

describe("logs publisher", () => {
  let pubSub: PubSub;
  let emitter: ReturnType<typeof mitt>;
  let sut: LogsPublisher;
  let stdin: typeof process.stdin;
  let database: Database;

  beforeEach(() => {
    pubSub = new PubSub();
    emitter = mitt();
    stdin = deepMock<typeof process.stdin>({
      resume: jest.fn(),
      setEncoding: jest.fn(),
      on: jest.fn().mockImplementation((event: any, handler: any) => {
        emitter.on(event, handler);
      }),
      off: jest.fn().mockImplementation((event: any, handler: any) => {
        emitter.off(event, handler);
      }),
    });
    database = deepMock<Database>({
      insert: jest.fn(() => [
        { rowid: 0, source: "/", timestamp: 0, text: "" },
      ]),
    });
    sut = new LogsPublisher({ pubSub, stdin, database });
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
      emitter.emit("data", Buffer.from(line, "utf8"));
    });

    it("should store the line", async () => {
      const line = "testing";
      emitter.emit("data", Buffer.from(line, "utf8"));
      expect(database.insert).toHaveBeenCalledWith([
        { text: "testing", source: "stdin" },
      ]);
    });
  });
});
