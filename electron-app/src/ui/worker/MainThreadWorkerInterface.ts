import PromiseWorker from "promise-worker";
import genericPool, { Pool } from "generic-pool-browser";
import { getRows } from "./parse";
import { Log } from "../lib/parse/types";

export default class MainThreadWorkerInterface {
  private pool: Pool<Worker>;

  private static globalLogWorker: MainThreadWorkerInterface;

  constructor(numCpus: number) {
    this.pool = genericPool.createPool(
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: async () => {
          // TODO: This is unfortunate...
          // ...in dev mode, the worker is served via webpack from /worker/index.js. In prod mode it's served from file:///main_window so the ".." is required
          const nodeEnv = process.env.NODE_ENV;

          console.log(nodeEnv);

          const workerURL =
            nodeEnv === "development"
              ? "worker/index.js"
              : "../worker/index.js";

          return new Worker(workerURL);
        },
        destroy: async (worker: Worker) => {
          await worker.terminate();
        },
      },
      {
        min: 0,
        max: numCpus,
      }
    );
  }

  public static async workerInterface(
    numCpus: number
  ): Promise<MainThreadWorkerInterface> {
    if (MainThreadWorkerInterface.globalLogWorker) {
      return MainThreadWorkerInterface.globalLogWorker;
    }
    const logWorker = new MainThreadWorkerInterface(numCpus);
    MainThreadWorkerInterface.globalLogWorker = logWorker;
    return logWorker;
  }

  public async parseLogs(logs: Log[]): Promise<ReturnType<typeof getRows>> {
    const worker = await this.pool.acquire();
    try {
      const promiseWorker = new PromiseWorker(worker);
      return promiseWorker.postMessage(logs);
    } finally {
      await this.pool.release(worker);
    }
  }
}
