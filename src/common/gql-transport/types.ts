/* eslint-disable */
import { ApolloLink } from "@apollo/client";
import { GraphQLSchema } from "graphql";
import { IpcMain } from "electron";

export interface SchemaLinkOptions {
  schema: GraphQLSchema;
  root?: any;
  context?: any;
}

export interface IpcExecutorOptions {
  link: ApolloLink;
  ipc: IpcMain;
  channel?: string;
}

export interface SerializableGraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
  context?: Record<string, any>;
  extensions?: Record<string, any>;
}

export type GraphQLChannelPayload = {
  type: 'request';
  id: string;
  request: SerializableGraphQLRequest;
} | {
  type: 'cancel-request';
  id: string;
}
