import path from "path";
import { app } from "electron";

export function getExecutablePath() {
  return `${path.dirname(app.getPath("exe"))}/Timberwolf`;
}
