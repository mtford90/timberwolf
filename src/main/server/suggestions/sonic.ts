import { Search, Ingest } from "sonic-channel";
import getPort from "get-port";
import fs from "mz/fs";
import { app } from "electron";
import path from "path";

import { ChildProcessWithoutNullStreams, spawn } from "mz/child_process";

export class Sonic {
  private _searchChannel?: Search;

  private _ingestChannel?: Ingest;

  private templateConfigPath: string;

  private sonicPath: string;

  private appData: string;

  private port: number | null = null;

  private process: ChildProcessWithoutNullStreams | null = null;

  constructor(
    templateConfigPath?: string,
    sonicPath?: string,
    appData?: string
  ) {
    this.templateConfigPath =
      templateConfigPath || path.resolve(__dirname, "sonic.template.cfg");

    this.sonicPath = sonicPath || app.getAppPath();

    this.appData = appData || app.getPath("appData");
  }

  private get ingestChannel() {
    if (!this._ingestChannel) {
      throw new Error("Sonic not initialised");
    }
    return this._ingestChannel;
  }

  private get searchChannel() {
    if (!this._searchChannel) {
      throw new Error("Sonic not initialised");
    }
    return this._searchChannel;
  }

  async run() {
    if (!this.process) {
      const preferredPort = 1491;
      const port = await getPort({ host: "::1", port: preferredPort });
      this.port = port;

      const config = (await fs.readFile(path.resolve(this.templateConfigPath)))
        .toString()
        .replace(`inet = "[::1]:1491"`, `inet = "[::1]:${port}"`)
        .replace("./data/store", path.resolve(this.appData, "data/store"));

      await fs.writeFile(this.configPath, config);

      const cmd = this.sonicPath;
      const args = ["-c", this.configPath];
      // listening on tcp://[::1]:1491

      const process = spawn(cmd, args);
      this.process = process;

      await new Promise((resolve, reject) => {
        let clean = () => {};

        const stdoutListener = (data: Buffer) => {
          const message = data.toString();
          const hasInitialised = message.indexOf(`tcp://[::1]:${port}`) > -1;
          if (hasInitialised) {
            clean();
            resolve();
          }
        };

        const exitListener = (
          code: number | null,
          signal: NodeJS.Signals | null
        ) => {
          clean();
          reject(new Error(`${signal}: ${code}`));
        };

        clean = () => {
          process.stdout.off("data", stdoutListener);
          process.off("exit", exitListener);
        };

        process.stdout.on("data", stdoutListener);
        process.on("exit", exitListener);
      });
      this.initProcessListeners();
      await this.initChannels(port);
    }
  }

  private initProcessListeners() {
    this.process?.stdout.on("data", this.onStdout);
    this.process?.stderr.on("data", this.onStdErr);
    this.process?.on("error", this.onError);
    this.process?.on("exit", this.onExit);
  }

  private disconnectProcessListeners() {
    this.process?.stdout.off("data", this.onStdout);
    this.process?.stderr.off("data", this.onStdErr);
    this.process?.off("error", this.onError);
    this.process?.off("exit", this.onExit);
  }

  async terminate() {
    await this.disconnectChannels();
    await this.disconnectProcessListeners();
    this.process?.kill();
    this.process = null;
  }

  private onStdout = (data: any) => {
    console.log(data.toString());
  };

  private onStdErr = (data: any) => {
    console.warn(data.toString());
  };

  private onError = (err: Error) => {
    // TODO: Crash app
    console.error(err);
  };

  private onExit = (code: number | null, signal: NodeJS.Signals | null) => {
    // TODO: Crash app
    console.log("exit", code, signal);
  };

  private get configPath() {
    return path.resolve(this.appData, "sonic.cfg");
  }

  private async initChannels(port: number): Promise<void> {
    const configWithDefaults = {
      host: "::1",
      port,
      auth: "SecretPassword",
    };

    this._searchChannel = new Search(configWithDefaults);
    this._ingestChannel = new Ingest(configWithDefaults);

    await Promise.all([
      new Promise((resolve, reject) => {
        if (!this._searchChannel) {
          reject(new Error("Search channel must be intialised"));
          return;
        }

        this._searchChannel.connect({
          connected() {
            resolve();
          },
          error(error) {
            reject(error);
          },
        });
      }),
      new Promise((resolve, reject) => {
        if (!this._ingestChannel) {
          reject(new Error("Ingest channel must be initialised"));
          return;
        }

        this._ingestChannel.connect({
          connected() {
            resolve();
          },
          error(error) {
            reject(error);
          },
        });
      }),
    ]);
  }

  private async disconnectChannels(): Promise<void> {
    await Promise.all([
      this._ingestChannel?.close(),
      this._searchChannel?.close(),
    ]);
  }

  store(tabId: string, logId: string, text: string): Promise<void> {
    return this.ingestChannel.push("logs", tabId, logId, text);
  }

  clearAll(): Promise<number> {
    return this.ingestChannel.flushc("logs");
  }

  clearTab(tabId: string): Promise<number> {
    return this.ingestChannel.flushb("logs", tabId);
  }

  query(
    tabId: string,
    terms: string,
    opts: { limit?: number; offset?: number } = {}
  ): Promise<string[]> {
    return this.searchChannel.query("logs", tabId, terms, opts);
  }

  suggest(tabId: string, word: string): Promise<string[]> {
    return this.searchChannel.suggest("logs", tabId, word);
  }
}
