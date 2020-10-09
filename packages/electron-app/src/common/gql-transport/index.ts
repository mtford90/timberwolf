/* eslint-disable */
import {createAsyncIterator, forAwaitEach, isAsyncIterable} from "iterall";
import {
  ApolloLink,
  FetchResult,
  Observable,
  execute as executeLink,
  Operation,
} from "@apollo/client";
import {getMainDefinition} from "@apollo/client/utilities";
import {parse, execute, subscribe, ExecutionArgs} from "graphql";
import {serializeError} from "serialize-error";
import {
  SchemaLinkOptions,
  IpcExecutorOptions, GraphQLChannelPayload,
} from "./types";
import {IpcMainEvent} from 'electron'

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

const BREAK = {}

async function forAwaitEachBreakable (collection: any, callback: any) {
  try {
    await forAwaitEach(collection, callback)
  } catch (error) {
    if (error !== BREAK) {
      throw error
    }
  }
}

export const createApolloSchemaLink = <TRoot = any>(options: SchemaLinkOptions) => {
  const handleRequest = async (request: Operation, observer: any, isCancelled: () => boolean) => {
    try {
      const context = options.context && (await options.context(request));

      if (isCancelled()) {
        return
      }

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

      await forAwaitEachBreakable(iterable, (value: any) => {
        if (isCancelled()) {
          throw BREAK
        }
        observer.next(value)
      });

      observer.complete();
    } catch (error) {
      observer.error(error);
    }
  };

  const createObservable = (request: Operation) => {
    return new Observable<FetchResult>((observer) => {
      let cancelled = false;

      handleRequest(request, observer, () => cancelled);

      return () => {
        cancelled = true;
      }
    });
  };

  return new ApolloLink((request) => createObservable(request));
};

export const initialGraphqlIpc = (options: IpcExecutorOptions) => {
  const channel = options.channel || "graphql";
  const subscriptions = new Map<string, ReturnType<typeof Observable.prototype.subscribe>>();

  const listener = (event: IpcMainEvent, payload: GraphQLChannelPayload) => {
    if (payload.type === 'request') {
      const {request, id} = payload;
      const result: Observable<FetchResult> = executeLink(options.link, {
        ...request,
        query: parse(request.query),
      });

      const sendIpc = (type: any, data?: any) => {
        const sender = event.sender;
        if (!sender.isDestroyed()) {
          sender.send(channel, id, type, data);
        }
      };

      subscriptions.set(id, result.subscribe(
        (data) => sendIpc("data", data),
        (error) => {
          sendIpc("error", serializeError(error))
          subscriptions.delete(id)
        },
        () => {
          sendIpc("complete")
          subscriptions.delete(id)
        }
      ))
    } else if (payload.type === 'cancel-request') {
      subscriptions.get(payload.id)?.unsubscribe()
      subscriptions.delete(payload.id)
    }
  };

  options.ipc.on(channel, listener);

  return () => {
    options.ipc.removeListener(channel, listener as any);
  };
};
