import { GqlIpcDispatcher } from "../src/common/gql-transport/dispatcher";

declare global {
  interface Window {
    gql: ReturnType<typeof GqlIpcDispatcher.prototype.bind>;
  }
}
