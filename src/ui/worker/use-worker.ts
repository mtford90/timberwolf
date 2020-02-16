import { useCallback, useEffect, useState } from "react";
import LogWorker from "./LogWorker";
import { useNumCpus } from "../use-num-cpus";

type UseWorkerState = {
  worker: LogWorker | null;
  loading: boolean;
  error: unknown;
};

export function useWorker() {
  const [state, setState] = useState<UseWorkerState>({
    worker: null,
    loading: true,
    error: null,
  });

  const updateState = useCallback(
    (upd: Partial<UseWorkerState>) => setState((s) => ({ ...s, ...upd })),
    []
  );

  const numCpus = useNumCpus();

  useEffect(() => {
    if (numCpus !== null) {
      LogWorker.getLogWorker(numCpus)
        .then((worker) => {
          updateState({ loading: false, worker });
        })
        .catch((error) => {
          updateState({ loading: false, error });
          console.error(error);
        });
    }
  }, [numCpus]);

  return {
    worker: state.worker,
    loading: state.loading,
    error: state.error,
  };
}
