import getPort from "get-port";
import mitt from "mitt";

import * as WebSocket from "ws";
import { parseMessage, WebsocketMessage } from "./validation";

type Emitter = ReturnType<typeof mitt>;

export class WebsocketServer {
  private server?: WebSocket.Server;

  private emitter: Emitter;

  constructor(emitter = mitt()) {
    this.emitter = emitter;
  }

  async init() {
    const port = await getPort({ port: 8080 });
    console.log(`Websocket server running on port ${port}`);
    this.server = new WebSocket.Server({ port });
    this.server.on("message", (data) => {
      parseMessage(data)
        .then((message) => {
          this.emitter.emit("message", message);
        })
        .catch((err) => {
          this.emitter.emit("error", err);
        });
    });
  }

  on(event: "message", listener: (value: WebsocketMessage) => void): void;

  on(event: "error", listener: (value: Error) => void): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: any, listener: (value: any) => void) {
    this.emitter.on(event, listener);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: "message" | "error", listener: (value: any) => void) {
    this.emitter.off(event, listener);
  }

  close() {
    this.server?.close();
  }
}
