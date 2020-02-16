import { PubSub } from "graphql-subscriptions";
import mitt from "mitt";
import { StdinPublisher } from "./stdin-publisher";
import { deepMock } from "../../../../tests/util";

describe("stdin publisher", () => {
  let pubSub: PubSub;
  let emitter: ReturnType<typeof mitt>;
  let sut: StdinPublisher;
  let stdin: typeof process.stdin;

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
    sut = new StdinPublisher(pubSub, stdin);
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
      pubSub.subscribe("stdin", (received) => {
        expect(received).toEqual({ stdin: line });
        done();
      });
      emitter.emit("data", Buffer.from(line, "utf8"));
    });

    it("should store the line", async () => {
      const line = "testing\n";
      emitter.emit("data", Buffer.from(line, "utf8"));
      expect(sut.stdinLines).toEqual([line]);
    });
  });
});
