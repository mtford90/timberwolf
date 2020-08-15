import defaultMenu from "electron-default-menu";
import { app, dialog, Menu, shell } from "electron";
import { Publishers } from "./server/publishers";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function configureMenu(_publishers: Publishers) {
  const menu = defaultMenu(app, shell);

  // menu.splice(1, 0, {
  //   label: "File",
  //   submenu: [
  //     {
  //       label: "Open File...",
  //       accelerator: "CmdOrCtrl+O",
  //       click: () => {
  //         dialog
  //           .showOpenDialog({
  //             properties: ["openFile"],
  //           })
  //           .then((file) => {
  //             const paths = file.filePaths;
  //             publishers.fileOpen.dispatchOpenFile(paths);
  //           });
  //       },
  //     },
  //   ],
  // });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}
