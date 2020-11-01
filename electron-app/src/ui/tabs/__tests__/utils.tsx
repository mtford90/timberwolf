import { mockApollo } from "../../../../tests/mock-apollo";

export async function getTestHarness(
  config: { sources?: Array<{ id: number; name: string }> } = {}
) {
  const { sources = [] } = config;

  const mockedApollo = await mockApollo((pubSub) => ({
    Query: {
      source: () =>
        sources.map((source) => ({
          ...source,
          __typename: "Source" as const,
        })),
    },
    Subscription: {
      logs: {
        subscribe: () => pubSub.asyncIterator(["logs"]),
      },
      systemEvent: {
        subscribe: () => pubSub.asyncIterator(["systemEvent"]),
      },
      systemInfo: {
        subscribe: () => pubSub.asyncIterator(["systemInfo"]),
      },
      source: {
        subscribe: () => pubSub.asyncIterator(["source"]),
        resolve: () =>
          sources.map((source) => ({
            ...source,
            __typename: "Source" as const,
          })),
      },
    },
    Mutation: {
      deleteSource: jest.fn((parent, { id }) => {
        const index = sources.findIndex((s) => s.id === id);
        if (index > -1) {
          sources.splice(index, 1);
        }
        return id;
      }),
      renameSource: jest.fn((parent, { id, name }) => {
        const sourceToRename = sources.find((s) => s.id === id);
        if (sourceToRename) {
          sourceToRename.name = name;
          return { ...sourceToRename, __typename: "Source" as const };
        }
        throw new Error("No such source");
      }),
      createSource: (parent, { source }) => {
        const newSource = {
          ...source,
          id: sources.length,
        };
        sources.push(newSource);
        return {
          ...newSource,
          __typename: "Source" as const,
        };
      },
    },
  }));

  return {
    ...mockedApollo,
    addSource: (newSource: { id: number; name: string }) => {
      sources.push(newSource);
      setImmediate(() => {
        mockedApollo.pubSub
          .publish("source", {
            source: sources.map((s) => ({
              id: s,
              name: s,
              __typename: "Source",
            })),
          })
          .catch((err) => {
            console.error(err);
          });
      });
    },
  };
}
