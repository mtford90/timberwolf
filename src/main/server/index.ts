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
import { FileIndexer } from "./files/indexing/FileIndexer";
import { Database } from "./database";

export default function configureServer({ database }: { database: Database }) {
  const indexer = new FileIndexer(database);

  const publishers = initPublishers(indexer);

  values(publishers).forEach((pub) => {
    pub.init();
  });

  const resolvers = initResolvers({ publishers, indexer });

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
