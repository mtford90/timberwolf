import getPort from "get-port";
import mitt from "mitt";

import * as WebSocket from "ws";
import { observable, runInAction } from "mobx";
import { parseMessage, BaseWebsocketMessage } from "./validation";

type Emitter = ReturnType<typeof mitt>;

export class WebsocketServer {
  @observable
  public port?: number;

  private server?: WebSocket.Server;

  private emitter: Emitter;

  constructor(emitter = mitt()) {
    this.emitter = emitter;
  }

  async init() {
    const port = await getPort({ port: 8080 });
    runInAction(() => {
      this.port = port;
    });
    console.log(`Websocket server running on port ${port}`);
    this.server = new WebSocket.Server({ port });

    this.server.on("error", (err) => {
      // TODO: Improve error handling
      console.error(err);
    });
    this.server.on("connection", (ws) => {
      ws.on("message", (data) => {
        const message = Buffer.from(data).toString("utf8");
        console.log(`received websocket message`, message);
        parseMessage(message)
          .then((parsedMessage) => {
            this.emitter.emit("message", parsedMessage);
            ws.send(JSON.stringify({ ok: true }));
          })
          .catch((err) => {
            this.emitter.emit("error", err);
            ws.send(
              JSON.stringify({
                detail: err.message,
                error: "Invalid message",
                ok: false,
              })
            );
          });
      });
    });
  }

  on(event: "message", listener: (value: BaseWebsocketMessage) => void): void;

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
