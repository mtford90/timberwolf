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
    database = new Database();
    database.insert = jest.fn(database.insert.bind(database));
    database.init();
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
    database.close();
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
        const line = "testing";
        pubSub.subscribe("logs", (received) => {
          expect(received).toEqual(
            expect.objectContaining({
              logs: expect.objectContaining({
                text: "testing",
                source: "stdin",
              }),
            })
          );
          done();
        });
        stdinEmitter.emit("data", Buffer.from(line, "utf8"));
      });

      it("should store the line", async () => {
        const line = "testing";
        stdinEmitter.emit("data", Buffer.from(line, "utf8"));
        expect(database.insert).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ text: "testing", source: "stdin" }),
          ])
        );
      });

      describe("when incoming text has new lines", () => {
        it("should split into multiple logs", async () => {
          const incoming = "my log\nmy second log";
          stdinEmitter.emit("data", Buffer.from(incoming, "utf8"));
          expect(database.insert).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({ text: "my log", source: "stdin" }),
              expect.objectContaining({
                text: "my second log",
                source: "stdin",
              }),
            ])
          );
        });
      });
    });

    describe("from websocket", () => {
      describe("when incoming text has no newlines", () => {
        const timestamp = 123;

        const message: WebsocketMessage = {
          name: "my logger",
          timestamp,
          text: "a log",
        };

        it("should publish", (done) => {
          pubSub.subscribe("logs", (received) => {
            console.log(received);

            expect(received).toEqual(
              expect.objectContaining({
                logs: expect.objectContaining({
                  source: "ws/my logger",
                  timestamp,
                  text: "a log",
                }),
              })
            );

            done();
          });

          websocketEmitter.emit("message", message);
        });

        it("should store the log", async () => {
          websocketEmitter.emit("message", message);

          expect(database.insert).toHaveBeenCalledWith([
            { text: "a log", source: "ws/my logger", timestamp },
          ]);
        });
      });

      describe("when incoming text has new lines", () => {
        const timestamp = 123;

        const websocketName = "my logger";

        const message: WebsocketMessage = {
          name: websocketName,
          timestamp,
          text: "a log\nanother log",
        };

        it("should split into multiple logs", async () => {
          websocketEmitter.emit("message", message);
          expect(database.insert).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({
                text: "a log",
                timestamp,
                source: `ws/${websocketName}`,
              }),
              expect.objectContaining({
                text: "another log",
                timestamp,
                source: `ws/${websocketName}`,
              }),
            ])
          );
        });
      });
    });
  });
});
