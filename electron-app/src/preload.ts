import "./common/promises";

import { contextBridge, ipcRenderer } from "electron";
import { GqlIpcDispatcher } from "./common/gql-transport/dispatcher";

const gqlDispatcher = new GqlIpcDispatcher(ipcRenderer);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("gql", gqlDispatcher.bind());

window.addEventListener("beforeunload", () => {
  gqlDispatcher.dispose();
});
