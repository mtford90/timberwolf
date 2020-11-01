import * as WebSocket from "isomorphic-ws";

export interface TimberwolfOptions {
  port: number;
}

export interface AttachOptions {
  id?: string;
  name?: string;
}

type Retained = {
  debug: typeof console.debug;
  warn: typeof console.warn;
  info: typeof console.info;
  log: typeof console.log;
  error: typeof console.error;
};

export class Timberwolf {
  private ws: WebSocket;

  // Buffer any logs that are sent prior to websocket open
  private buffer: string[] = [];

  public open = false;

  private jsConsole: Console;

  private retained?: Retained;

  constructor({ port }: TimberwolfOptions) {
    const wsUrl = `ws://localhost:${port}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = this.handleOpenEvent;
    this.ws.onclose = this.handleCloseEvent;
    this.ws.onmessage = this.handleMessageEvent;
    this.ws.onerror = this.handleErrorEvent;
  }

  log(id: string, text: string, xtra: Record<string, unknown> = {}) {
    const timestamp = Date.now();

    const message = JSON.stringify({
      id,
      text,
      timestamp,
      ...xtra,
    });

    if (this.open) {
      this.ws.send(message);
    } else {
      this.buffer.push(message);
    }
  }

  terminate() {
    this.ws.close();
  }

  attach(options: AttachOptions, jsConsole = console) {
    if (!this.jsConsole) {
      this.jsConsole = jsConsole;

      const { debug, log, info, error, warn } = jsConsole;

      this.retained = {
        debug: debug.bind(jsConsole),
        log: log.bind(jsConsole),
        info: info.bind(jsConsole),
        error: error.bind(jsConsole),
        warn: warn.bind(jsConsole),
      };

      const parsedOptions = this.parseAttachOptions(options);

      // eslint-disable-next-line no-param-reassign
      jsConsole.debug = this.getConsoleOverride("debug", parsedOptions);
      // eslint-disable-next-line no-param-reassign
      jsConsole.log = this.getConsoleOverride("log", parsedOptions);
      // eslint-disable-next-line no-param-reassign
      jsConsole.info = this.getConsoleOverride("info", parsedOptions);
      // eslint-disable-next-line no-param-reassign
      jsConsole.error = this.getConsoleOverride("error", parsedOptions);
      // eslint-disable-next-line no-param-reassign
      jsConsole.warn = this.getConsoleOverride("warn", parsedOptions);
    } else {
      throw new Error("Already attached");
    }
  }

  private getConsoleOverride(
    level: keyof Retained,
    { id, name }: { id: string; name: string }
  ) {
    return (...args: any[]) => {
      const text = args
        .map((a) => {
          if (typeof a === "object") {
            try {
              return JSON.stringify(a);
            } catch {
              if (a.toString) {
                return a.toString();
              }
              return `[${a.constructor?.name || "object Object"}]`;
            }
          }
          if (a.toString) {
            return a.toString();
          }
          return JSON.stringify(a);
        })
        .join(" ");

      this.log(id, text, { name, level, source: "console" });
      this.retained[level]?.(...args);
    };
  }

  private flush() {
    this.buffer.forEach((message) => {
      this.ws.send(message);
    });

    this.buffer = [];
  }

  private parseAttachOptions({
    id,
    name,
  }: AttachOptions): { id: string; name: string } {
    if (name && !id) {
      return {
        name,
        id: name,
      };
    }
    if (id && !name) {
      return {
        id,
        name: id,
      };
    }
    if (id && name) {
      return {
        id,
        name,
      };
    }

    throw new Error(`Must pass at least one of either id or name`);
  }

  private handleOpenEvent = () => {
    this.open = true;
    this.flush();
    this.internalLog("connected");
  };

  private handleCloseEvent = () => {
    this.open = false;
    this.internalLog("disconnected");
  };

  private handleMessageEvent = (data: WebSocket.MessageEvent) => {
    this.internalLog("received message", data);
  };

  private handleErrorEvent = (error: WebSocket.ErrorEvent) => {
    this.internalError(error);
  };

  private get console() {
    return this.jsConsole || console;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private internalError(...args: any[]) {
    const { console } = this;

    const error = (this.retained.error || console.error).bind(console);
    error(...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private internalLog(...args: any[]) {
    const { console } = this;

    const log = (this.retained.log || console.log).bind(console);
    log(...args);
  }
}

/**
 * Override console.log/warn/info/debug/error
 */
export function attach(
  { name, id, port = 8080 }: AttachOptions & { port?: number },
  jsConsole = console
) {
  const tw = new Timberwolf({ port });

  tw.attach({ name, id }, jsConsole);

  return tw;
}
