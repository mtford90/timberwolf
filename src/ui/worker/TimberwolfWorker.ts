/* eslint-disable */

// Relies upon webpack's worker-loader to instantiate the worker
import TimberwolfWorker from "./index.worker";

export function createWorker(): Worker {
  return new (TimberwolfWorker as any)()
}
