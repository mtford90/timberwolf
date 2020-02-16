import { GqlIpcDispatcher } from "../src/common/gql-transport/ipc-dispatcher";

declare global {
  interface Window {
    gql: ReturnType<typeof GqlIpcDispatcher.prototype.bind>;
  }
}
