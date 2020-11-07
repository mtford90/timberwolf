import { PubSub } from "graphql-subscriptions";
import mitt from "mitt";
import { LogsPublisher } from "./logs-publisher";
import { deepMock } from "../../../../tests/util";
import { Database } from "../database";
import { WebsocketServer } from "../websockets";
import { WebsocketMessage } from "../websockets/validation";
import { DEFAULT_SOURCE } from "../websockets/constants";

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
    database.logs.insert = jest.fn(database.logs.insert.bind(database));
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
                source: expect.objectContaining({
                  name: "stdin",
                }),
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
        const sourceId = database.sources.getByName("stdin")?.id;
        expect(database.logs.insert).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ text: "testing", sourceId }),
          ])
        );
      });

      describe("when incoming text has new lines", () => {
        it("should split into multiple logs", async () => {
          const incoming = "my log\nmy second log";
          stdinEmitter.emit("data", Buffer.from(incoming, "utf8"));
          const sourceId = database.sources.getByName("stdin")?.id;
          expect(database.logs.insert).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({ text: "my log", sourceId }),
              expect.objectContaining({
                text: "my second log",
                sourceId,
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
                  source: expect.objectContaining({
                    name: "my logger",
                  }),
                  text: "a log",
                }),
              })
            );

            expect(received.logs.timestamp).toEqual(new Date(timestamp));

            done();
          });

          websocketEmitter.emit("message", message);
        });

        it("should store the log", async () => {
          websocketEmitter.emit("message", message);

          const sourceId = database.sources.getByName("my logger")?.id;

          expect(database.logs.insert).toHaveBeenCalledWith([
            { text: "a log", sourceId, timestamp },
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
          const sourceId = database.sources.getByName(websocketName)?.id;
          expect(database.logs.insert).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({
                text: "a log",
                timestamp,
                sourceId,
              }),
              expect.objectContaining({
                text: "another log",
                timestamp,
                sourceId,
              }),
            ])
          );
        });
      });

      describe("when only id provided", () => {
        it("should use that id", async () => {
          const sourceId = database.sources.create("my source");

          const message: WebsocketMessage = {
            id: sourceId,
            timestamp: 123,
            text: "a log",
          };

          websocketEmitter.emit("message", message);

          expect(database.logs.insert).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({
                text: "a log",
                sourceId,
              }),
            ])
          );
        });
      });

      describe("when only name provided", () => {
        it("should upsert based on the name", async () => {
          const message: WebsocketMessage = {
            timestamp: 123,
            text: "a log",
            name: "my source",
          };

          websocketEmitter.emit("message", message);

          const sourceId = database.sources.getByName("my source")?.id;

          expect(database.logs.insert).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({
                text: "a log",
                sourceId,
              }),
            ])
          );
        });
      });

      describe("when neither name or id provided", () => {
        it("should use default name", async () => {
          const message: WebsocketMessage = {
            timestamp: 123,
            text: "a log",
          };

          websocketEmitter.emit("message", message);

          const sourceId = database.sources.getByName(DEFAULT_SOURCE)?.id;

          expect(database.logs.insert).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({
                text: "a log",
                sourceId,
              }),
            ])
          );
        });
      });
    });
  });
});
