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
    describe("stdin", () => {
      describe("without filter", () => {
        const mockLines = [
          {
            rowid: 1,
            source: "/path/to/something",
            timestamp: 343,
            text: "xy",
          },
        ];

        const deps = deepMock<ResolverDependencies>({
          database: {
            logs: jest.fn(() => mockLines),
          },
        });

        const resolvers = initResolvers(deps);

        const response = resolvers.Query?.logs?.(
          parent,
          { limit: 10, beforeRowId: 10, source: "stdin" },
          context,
          resolveInfo
        );

        it("should return the logs from the db", async () => {
          expect(response).toMatchInlineSnapshot(`
            Array [
              Object {
                "__typename": "Log",
                "rowid": 1,
                "source": "stdin",
                "text": "xy",
                "timestamp": 1970-01-01T00:00:00.343Z,
              },
            ]
          `);
        });

        it("should call with the correct params", async () => {
          expect(deps.database.logs).toBeCalledWith("stdin", {
            limit: 10,
            beforeRowId: 10,
          });
        });
      });
      describe("with filter", () => {
        const mockLines = [
          {
            rowid: 1,
            source: "/path/to/something",
            timestamp: 343,
            text: "xy",
          },
        ];

        const deps = deepMock<ResolverDependencies>({
          database: {
            logs: jest.fn(() => mockLines),
          },
        });

        const resolvers = initResolvers(deps);

        const response = resolvers.Query?.logs?.(
          parent,
          { limit: 10, beforeRowId: 10, filter: "yo", source: "stdin" },
          context,
          resolveInfo
        );

        it("should return the logs from the db", async () => {
          expect(response).toMatchInlineSnapshot(`
            Array [
              Object {
                "__typename": "Log",
                "rowid": 1,
                "source": "stdin",
                "text": "xy",
                "timestamp": 1970-01-01T00:00:00.343Z,
              },
            ]
          `);
        });

        it("should call with the correct params", async () => {
          expect(deps.database.logs).toBeCalledWith("stdin", {
            limit: 10,
            filter: "yo",
            beforeRowId: 10,
          });
        });
      });
    });
    describe("suggest", () => {
      it("should call the database suggest api", async () => {
        const deps = deepMock<ResolverDependencies>({
          database: {
            suggest: jest.fn(() => ["hello"]),
          },
        });

        const resolvers = initResolvers(deps);
        const result = resolvers.Query?.suggest?.(
          parent,
          {
            limit: 20,
            offset: 10,
            prefix: "h",
          },
          context,
          resolveInfo
        );

        expect(result).toEqual(["hello"]);

        expect(deps.database.suggest).toHaveBeenCalledWith("stdin", "h", {
          limit: 20,
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

          const stdin = resolvers.Subscription?.logs;

          if (typeof stdin === "object") {
            const iterator: AsyncIterator<{ stdin: string }> = stdin.subscribe(
              parent,
              {
                source: "stdin",
              },
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

          const stdin = resolvers.Subscription?.logs;

          if (typeof stdin === "object") {
            const iterator = stdin.subscribe(
              parent,
              {
                source: "stdin",
                filter: "bl",
              },
              context,
              resolveInfo
            ) as AsyncIterator<Pick<Subscription, "logs">>;

            const filteredPayload: Pick<Subscription, "logs"> = {
              logs: {
                __typename: "Log",
                text: "123",
                timestamp: 0,
                rowid: 1,
                source: "stdin",
              },
            };

            const matchingPayload: Pick<Subscription, "logs"> = {
              logs: {
                __typename: "Log",
                text: "blah",
                timestamp: 0,
                rowid: 2,
                source: "stdin",
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
