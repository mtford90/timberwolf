/* eslint-disable */
import {ApolloLink, FetchResult, Observable, Operation} from "@apollo/client";
import {deserializeError} from "serialize-error";
import {SerializableGraphQLRequest} from "./types";
import {print} from "graphql";

function serializeOperation(operation: Operation): SerializableGraphQLRequest {
  return {
    operationName: operation.operationName,
    variables: operation.variables,
    query: print(operation.query),
  };
}

/**
 * Enabl
 */
export class GqlIpcLink extends ApolloLink {
  public request(operation: Operation) {
    const op = serializeOperation(operation);

    return new Observable(
      (observer: ZenObservable.SubscriptionObserver<FetchResult>) => {
        const requestId = window.gql.request(op, {
          onComplete(): void {
            observer.complete();
          }, onData(data: any): void {
            observer.next(data);
          }, onError(error: any): void {
            observer.error(deserializeError(error))
          },
        });

        return () => {
          window.gql.cancel(requestId)
        }
      }
    );
  }
}

