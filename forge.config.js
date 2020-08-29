const fsx = require("fs-extra");
const path = require("path");
const os = require("os");
const { serialHooks } = require("electron-packager/src/hooks");

function getPlatform() {
  switch (os.platform()) {
    case "aix":
    case "freebsd":
    case "linux":
    case "openbsd":
    case "android":
      return "linux";
    case "darwin":
    case "sunos":
      return "mac";
    case "win32":
      return "win";
    default:
      throw new Error("Unsupported platform");
  }
}

module.exports = {
  packagerConfig: {
    afterCopy: [
      serialHooks([
        async (buildPath) => {
          const binDir = path.resolve(buildPath, "../bin");
          await fsx.mkdirpSync(binDir);
          await fsx.copyFileSync(
            path.resolve(__dirname, "resources", getPlatform(), "sonic"),
            path.resolve(binDir, "sonic")
          );
        },
      ]),
    ],
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/ui/static/index.html",
              js: "./src/ui/index.tsx",
              name: "main_window",
              preload: {
                js: "./src/preload.ts",
              },
            },
            {
              js: "./src/ui/worker/index.ts",
              name: "worker",
            },
          ],
        },
      },
    ]
  ],
};
