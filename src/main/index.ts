import "../common/promises";
import "bluebird-global";

import { app, BrowserWindow } from "electron";
import debug from "electron-debug";
import { values } from "lodash";
import configureServer from "./server";
import { configureMenu } from "./menu";
import { Database } from "./server/database";
import { WebsocketServer } from "./server/websockets";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let MAIN_WINDOW_WEBPACK_ENTRY: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow;

debug();

const database = new Database();

database.init();

const websocketServer = new WebsocketServer();

websocketServer.init().catch((err) => {
  console.error(err);
  process.exit(1);
});

const { publishers } = configureServer({ database, websocketServer });

const createWindow = () => {
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       "Content-Security-Policy": ["default-src 'self'"],
  //       ...details.responseHeaders,
  //     },
  //   });
  // });

  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      // The below parameters ensure the UI process is isolated from main process (node)
      // These parameters are the reason why something like the GraphQL interprocess communication is required in order
      // to selectively expose functionality from the main process
      nodeIntegration: false,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY).catch((err) => {
    // TODO: Exit process
    // app.exit(1);
    console.error(err);
  });

  // Open the DevTools.
  win.webContents.openDevTools();
  configureMenu(publishers);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // TODO: Terminate all new server-side listeners when the app closes (e.g. the publishers, stdin, sqlite)
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  values(publishers).forEach((p) => {
    p.dispose();
  });
  database.close();
  websocketServer.close();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
