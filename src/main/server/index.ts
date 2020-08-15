import { ipcMain } from "electron";
import { makeExecutableSchema } from "graphql-tools";
import fs from "fs";
import path from "path";
import { values } from "lodash";
import {
  createIpcExecutor,
  createSchemaLink,
} from "../../common/gql-transport";
import { initPublishers } from "./publishers";
import { initResolvers } from "./resolvers";
import { Database } from "./database";

export default function configureServer({ database }: { database: Database }) {
  const publishers = initPublishers(database);

  values(publishers).forEach((pub) => {
    pub.init();
  });

  const resolvers = initResolvers({ publishers, database });

  const link = createSchemaLink({
    schema: makeExecutableSchema({
      typeDefs: fs
        .readFileSync(path.resolve(__dirname, "./schema.graphql"))
        .toString(),
      resolvers: resolvers as never,
    }),
  });

  createIpcExecutor({ link, ipc: ipcMain });

  return { publishers };
}
