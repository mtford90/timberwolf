import PromiseWorker from "promise-worker";
import genericPool, { Pool } from "generic-pool-browser";
import { getRows } from "./parse";
import { Line } from "../../graphql-types.generated";

/**
 * Main thread interface to the worker responsible for parsing logs
 */
export default class MainThreadWorkerInterface {
  private pool: Pool<Worker>;

  private static globalLogWorker: MainThreadWorkerInterface;

  constructor(numCpus: number) {
    this.pool = genericPool.createPool(
      {
        create: async () => new Worker("/worker/index.js"),
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

  public async parseLogs(logs: Line[]): Promise<ReturnType<typeof getRows>> {
    const worker = await this.pool.acquire();
    const promiseWorker = new PromiseWorker(worker);
    const parsedLogs = await promiseWorker.postMessage(logs);
    await this.pool.release(worker);
    return parsedLogs;
  }
}
