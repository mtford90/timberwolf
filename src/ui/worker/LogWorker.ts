import PromiseWorker from "promise-worker";
import genericPool, { Pool } from "generic-pool-browser";
import { getRows } from "./parse";

// eslint-disable-next-line @typescript-eslint/no-var-requires

export default class LogWorker {
  private pool: Pool<Worker>;

  private static globalLogWorker: LogWorker;

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

  public static async getLogWorker(numCpus: number): Promise<LogWorker> {
    if (LogWorker.globalLogWorker) {
      return LogWorker.globalLogWorker;
    }
    const logWorker = new LogWorker(numCpus);
    LogWorker.globalLogWorker = logWorker;
    return logWorker;
  }

  public async parseLogs(
    logs: string | string[]
  ): Promise<ReturnType<typeof getRows>> {
    const worker = await this.pool.acquire();
    const promiseWorker = new PromiseWorker(worker);
    const parsedLogs = await promiseWorker.postMessage(logs);
    await this.pool.release(worker);
    return parsedLogs;
  }
}
