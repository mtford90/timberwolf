import { GraphQLResolveInfo } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { initialiseGQLResolvers, ResolverDependencies } from "./index";
import { deepMock } from "../../../../tests/util";
import { Subscription } from "../../../graphql-types.generated";
import { LogRow } from "../database";

const resolveInfo = deepMock<GraphQLResolveInfo>({});
const context = {};
const parent = {};

jest.mock("os", () => ({ cpus: () => [{}, {}, {}, {}] }));

describe("resolvers", () => {
  describe("query", () => {
    describe("numCpus", () => {
      it("should return the number of cpus", async () => {
        const resolvers = initialiseGQLResolvers(
          deepMock<ResolverDependencies>({})
        );

        const response = resolvers.Query?.numCpus?.(
          parent,
          {},
          context,
          resolveInfo
        );

        expect(response).toMatchInlineSnapshot(`4`);
      });
    });
    describe("logs", () => {
      describe("without filter", () => {
        const mockLines = [
          {
            rowid: 1,
            source_id: "/path/to/something",
            timestamp: 343,
            text: "xy",
          },
        ];

        const deps = deepMock<ResolverDependencies>({
          database: {
            getLogs: jest.fn(() => mockLines),
          },
        });

        const resolvers = initialiseGQLResolvers(deps);

        const response = resolvers.Query?.logs?.(
          parent,
          { limit: 10, beforeRowId: 10, sourceId: "stdin" },
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
          expect(deps.database.getLogs).toBeCalledWith("stdin", {
            limit: 10,
            beforeRowId: 10,
          });
        });
      });
      describe("with filter", () => {
        const mockLines: LogRow[] = [
          {
            rowid: 1,
            source_id: "/path/to/something",
            timestamp: 343,
            text: "xy",
          },
        ];

        const deps = deepMock<ResolverDependencies>({
          database: {
            getLogs: jest.fn(() => mockLines),
          },
        });

        const resolvers = initialiseGQLResolvers(deps);

        const response = resolvers.Query?.logs?.(
          parent,
          { limit: 10, beforeRowId: 10, filter: "yo", sourceId: "stdin" },
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
          expect(deps.database.getLogs).toBeCalledWith("stdin", {
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

        const resolvers = initialiseGQLResolvers(deps);
        const result = resolvers.Query?.suggest?.(
          parent,
          {
            source: "stdin",
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
          const resolvers = initialiseGQLResolvers(
            deepMock<ResolverDependencies>({
              publishers: {
                logs: {
                  asyncIterator() {
                    return pubSub.asyncIterator("logs");
                  },
                },
              },
            })
          );

          const logs = resolvers.Subscription?.logs;

          if (typeof logs === "object") {
            const iterator: AsyncIterator<{ stdin: string }> = logs.subscribe(
              parent,
              {
                sourceId: "stdin",
              },
              context,
              resolveInfo
            ) as AsyncIterator<{ stdin: string }>;

            const payload = {
              logs: {
                sourceId: "stdin",
                text: "hi",
              },
            };

            iterator
              .next()
              .then((x) => {
                expect(x).toEqual({ done: false, value: payload });
                done();
              })
              .catch(done);

            pubSub.publish("logs", payload).catch(done);
          } else {
            throw new Error("Expected stdin to be a subscription object");
          }
        });
      });

      describe("with a filter", () => {
        it("should only emit matching payloads", (done) => {
          const resolvers = initialiseGQLResolvers(
            deepMock<ResolverDependencies>({
              publishers: {
                logs: {
                  asyncIterator() {
                    return pubSub.asyncIterator("logs");
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
                sourceId: "stdin",
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
                source: {
                  id: "stdin",
                  __typename: "Source",
                },
              },
            };

            const matchingPayload: Pick<Subscription, "logs"> = {
              logs: {
                __typename: "Log",
                text: "blah",
                timestamp: 0,
                rowid: 2,
                source: {
                  id: "stdin",
                  __typename: "Source",
                },
              },
            };

            iterator
              .next()
              .then((x) => {
                expect(x).toEqual({ done: false, value: matchingPayload });
                done();
              })
              .catch(done);

            pubSub.publish("logs", filteredPayload).catch(done);
            pubSub.publish("logs", matchingPayload).catch(done);
          } else {
            throw new Error("Expected stdin to be a subscription object");
          }
        });
      });
    });
  });
});
