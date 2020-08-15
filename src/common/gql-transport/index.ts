/* eslint-disable */
import { createAsyncIterator, forAwaitEach, isAsyncIterable } from "iterall";
import {
  ApolloLink,
  FetchResult,
  Observable,
  execute as executeLink,
  Operation,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { parse, execute, subscribe, ExecutionArgs } from "graphql";
import { serializeError } from "serialize-error";
import {
  SerializableGraphQLRequest,
  SchemaLinkOptions,
  IpcExecutorOptions,
} from "./types";

const isSubscription = (query: any) => {
  const main = getMainDefinition(query);
  return (
    main.kind === "OperationDefinition" && main.operation === "subscription"
  );
};

const ensureIterable = (data: any) => {
  if (isAsyncIterable(data)) {
    return data;
  }

  return createAsyncIterator([data]);
};

export const createSchemaLink = <TRoot = any>(options: SchemaLinkOptions) => {
  const handleRequest = async (request: Operation, observer: any) => {
    try {
      const context = options.context && (await options.context(request));
      const args: ExecutionArgs = {
        schema: options.schema,
        rootValue: options.root,
        contextValue: context,
        variableValues: request.variables,
        operationName: request.operationName,
        document: request.query
      };

      const result = isSubscription(request.query)
        ? subscribe(args)
        : execute(args);
      const iterable = ensureIterable(await result) as AsyncIterable<any>;
      await forAwaitEach(iterable, (value: any) => {
        observer.next(value)
      });
      observer.complete();
    } catch (error) {
      observer.error(error);
    }
  };

  const createObservable = (request: Operation) => {
    return new Observable<FetchResult>((observer) => {
      handleRequest(request, observer);
    });
  };

  return new ApolloLink((request) => createObservable(request));
};

export const createIpcExecutor = (options: IpcExecutorOptions) => {
  const channel = options.channel || "graphql";
  const listener = (event: any, id: any, request: SerializableGraphQLRequest) => {
    const result: Observable<FetchResult> = executeLink(options.link, {
      ...request,
      query: parse(request.query),
    });

    const sendIpc = (type: any, data?: any) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send(channel, id, type, data);
      }
    };

    return result.subscribe(
      (data) => sendIpc("data", data),
      (error) => sendIpc("error", serializeError(error)),
      () => sendIpc("complete")
    );
  };

  options.ipc.on(channel, listener);

  return () => {
    options.ipc.removeListener(channel, listener as any);
  };
};
