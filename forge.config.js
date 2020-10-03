module.exports = {
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
            // {
            //   js: "./src/ui/worker/index.ts",
            //   name: "worker",
            // },
          ],
        },
      },
    ]
  ],
};
