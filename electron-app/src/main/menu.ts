import defaultMenu from "electron-default-menu";
import { app, Menu, shell } from "electron";
import { Publishers } from "./server/publishers";

export function configureMenu(publishers: Publishers) {
  const menu = defaultMenu(app, shell);

  menu.splice(1, 0, {
    label: "File",
    submenu: [
      {
        label: "New Tab",
        accelerator: "CmdOrCtrl+T",
        click: () => {
          publishers.systemEvents.sendNewTabEvent();
        },
      },
      {
        label: "New Window",
        accelerator: "CmdOrCtrl+N",
        click: () => {
          publishers.systemEvents.sendNewWindowEvent();
        },
      },
      { type: "separator" },
      {
        label: "Close Tab",
        accelerator: "CmdOrCtrl+W",
        click: () => {
          publishers.systemEvents.sendCloseTabEvent();
        },
      },
      // {
      //   label: "Open File...",
      //   accelerator: "CmdOrCtrl+O",
      //   click: () => {
      //     dialog
      //       .showOpenDialog({
      //         properties: ["openFile"],
      //       })
      //       .then((file) => {
      //         const paths = file.filePaths;
      //         publishers.fileOpen.dispatchOpenFile(paths);
      //       });
      //   },
      // },
    ],
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}
