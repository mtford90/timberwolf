/* eslint-disable */
import { IpcRenderer } from "electron";
import {GraphQLChannelPayload, SerializableGraphQLRequest} from "./types";
import {GRAPHQL_CHANNEL} from "./constants";

type Listener = { onData: (data: any) => void; onError: (error: any) => void; onComplete: () => void };

/**
 * Enables graphql communication over the IPC renderer
 */
export class GqlIpcDispatcher {
  private listeners: Map<
    string,
    Listener
  > = new Map();

  private counter = 0;

  private ipc: IpcRenderer;

  protected listener = (event: any, id: any, type: any, data: any) => {
    if (!this.listeners.has(id)) {
      console.error(`Missing observer for query id ${id}.`);
    }

    const listener = this.listeners.get(id);
    // eslint-disable-next-line
    switch (type) {
      case "data": {
        return listener && listener.onData(data);
      }

      case "error": {
        this.listeners.delete(id);
        return listener && listener.onError(data);
      }

      case "complete": {
        this.listeners.delete(id);
        return listener && listener.onComplete();
      }
    }
  };

  constructor(ipc: IpcRenderer) {
    this.ipc = ipc;
    this.ipc.on(GRAPHQL_CHANNEL, this.listener);
  }

  bind() {
    return {
      // TODO: Perhaps use a `receive` function here using the requestId, rather than these listeners.
      // Use of these listeners causes a world safe javascript error - which probably isn't a problem once
      // world safe javascript is enabled, but still, probably nicer not to have to use cross-world javascript execution at all
      request: (request: SerializableGraphQLRequest, listener: Listener): string => {
        const requestId = `${++this.counter}`;
        this.send({type: 'request', request, id: requestId});
        this.listeners.set(requestId, listener);
        return requestId;
      },
      cancel: (requestId: string) => {
        this.send({type: 'cancel-request', id: requestId});
        this.listeners.delete(requestId)
      }
    }
  }

  private send(payload: GraphQLChannelPayload) {
    this.ipc.send(GRAPHQL_CHANNEL, payload);
  }

  public dispose() {
    this.ipc.off(GRAPHQL_CHANNEL, this.listener);
  }
}
