import registerPromiseWorker from "promise-worker/register";
import { getRows } from "./parse";

registerPromiseWorker(getRows);

export default {};
