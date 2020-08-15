import { GraphQLResolveInfo } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { initResolvers, ResolverDependencies } from "./index";
import { deepMock } from "../../../../tests/util";
import { Subscription } from "../../../graphql-types.generated";

const resolveInfo = deepMock<GraphQLResolveInfo>({});
const context = {};
const parent = {};

jest.mock("os", () => ({ cpus: () => [{}, {}, {}, {}] }));

describe("resolvers", () => {
  describe("query", () => {
    describe("numCpus", () => {
      it("should return the number of cpus", async () => {
        const resolvers = initResolvers(deepMock<ResolverDependencies>({}));

        const response = resolvers.Query?.numCpus?.(
          parent,
          {},
          context,
          resolveInfo
        );

        expect(response).toMatchInlineSnapshot(`4`);
      });
    });
    describe("stdin without filter", () => {
      const mockLines = [
        {
          rowid: 1,
          path: "/path/to/something",
          timestamp: 343,
          text: "xy",
        },
      ];

      const deps = deepMock<ResolverDependencies>({
        database: {
          lines: jest.fn(() => mockLines),
        },
      });

      const resolvers = initResolvers(deps);

      const response = resolvers.Query?.stdin?.(
        parent,
        { limit: 10, offset: 10 },
        context,
        resolveInfo
      );

      it("should return the lines from the db", async () => {
        expect(response).toEqual(["xy"]);
      });

      it("should call with the correct params", async () => {
        expect(deps.database.lines).toBeCalledWith("stdin", {
          limit: 10,
          offset: 10,
        });
      });
    });

    describe("stdin with filter", () => {
      const mockLines = [
        {
          rowid: 1,
          path: "/path/to/something",
          timestamp: 343,
          text: "xy",
        },
      ];

      const deps = deepMock<ResolverDependencies>({
        database: {
          lines: jest.fn(() => mockLines),
        },
      });

      const resolvers = initResolvers(deps);

      const response = resolvers.Query?.stdin?.(
        parent,
        { limit: 10, offset: 10, filter: "yo" },
        context,
        resolveInfo
      );

      it("should return the lines from the db", async () => {
        expect(response).toEqual(["xy"]);
      });

      it("should call with the correct params", async () => {
        expect(deps.database.lines).toBeCalledWith("stdin", {
          limit: 10,
          filter: "yo",
          offset: 10,
        });
      });
    });
  });

  describe("subscriptions", () => {
    describe("stdin", () => {
      const pubSub = new PubSub();

      describe("with no filter", () => {
        it("should emit a payload", (done) => {
          const resolvers = initResolvers(
            deepMock<ResolverDependencies>({
              publishers: {
                stdin: {
                  asyncIterator() {
                    return pubSub.asyncIterator("stdin");
                  },
                },
              },
            })
          );

          const stdin = resolvers.Subscription?.stdin;

          if (typeof stdin === "object") {
            const iterator: AsyncIterator<{ stdin: string }> = stdin.subscribe(
              parent,
              {},
              context,
              resolveInfo
            ) as AsyncIterator<{ stdin: string }>;

            const payload = { stdin: "blah" };

            iterator
              .next()
              .then((x) => {
                expect(x).toEqual({ done: false, value: payload });
                done();
              })
              .catch(done);

            pubSub.publish("stdin", payload).catch(done);
          } else {
            throw new Error("Expected stdin to be a subscription object");
          }
        });
      });

      describe("with a filter", () => {
        it("should only emit matching payloads", (done) => {
          const resolvers = initResolvers(
            deepMock<ResolverDependencies>({
              publishers: {
                stdin: {
                  asyncIterator() {
                    return pubSub.asyncIterator("stdin");
                  },
                },
              },
            })
          );

          const stdin = resolvers.Subscription?.stdin;

          if (typeof stdin === "object") {
            const iterator = stdin.subscribe(
              parent,
              {
                filter: "bl",
              },
              context,
              resolveInfo
            ) as AsyncIterator<Pick<Subscription, "stdin">>;

            const filteredPayload: Pick<Subscription, "stdin"> = {
              stdin: {
                __typename: "Line",
                text: "123",
                timestamp: 0,
                rowid: 1,
              },
            };

            const matchingPayload: Pick<Subscription, "stdin"> = {
              stdin: {
                __typename: "Line",
                text: "blah",
                timestamp: 0,
                rowid: 2,
              },
            };

            iterator
              .next()
              .then((x) => {
                expect(x).toEqual({ done: false, value: matchingPayload });
                done();
              })
              .catch(done);

            pubSub.publish("stdin", filteredPayload).catch(done);
            pubSub.publish("stdin", matchingPayload).catch(done);
          } else {
            throw new Error("Expected stdin to be a subscription object");
          }
        });
      });
    });
  });
});
