import { ipcMain } from "electron";
import { makeExecutableSchema } from "graphql-tools";
import fs from "fs";
import path from "path";
import { values } from "lodash";
import {
  initialGraphqlIpc,
  createApolloSchemaLink,
} from "../../common/gql-transport";
import { initPublishers } from "./publishers";
import { initialiseGQLResolvers } from "./resolvers";
import { Database } from "./database";
import { WebsocketServer } from "./websockets";

type ConfigureServerOptions = {
  database: Database;
  websocketServer: WebsocketServer;
};

export default function configureServer({
  database,
  websocketServer,
}: ConfigureServerOptions) {
  const publishers = initPublishers(database, websocketServer);

  values(publishers).forEach((pub) => {
    pub.init();
  });

  const resolvers = initialiseGQLResolvers({
    publishers,
    database,
    websocketServer,
  });

  const link = createApolloSchemaLink({
    schema: makeExecutableSchema({
      typeDefs: fs
        .readFileSync(path.resolve(__dirname, "./schema.graphql"))
        .toString(),
      resolvers: resolvers as never,
    }),
  });

  initialGraphqlIpc({ link, ipc: ipcMain });

  return { publishers };
}
