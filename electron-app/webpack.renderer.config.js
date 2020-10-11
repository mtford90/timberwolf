const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "postcss-loader" }],
});

const nodeEnv = process.env.NODE_ENV;
const isProduction = nodeEnv === "production";

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules: [
      ...rules,
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
    ],
  },
  plugins: [
    ...plugins,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "assets"),
          // TODO: This is unfortunate...
          // ... in dev mode, webpack serves from .webpack/renderer/assets. In prod mode, files must be served from file:///renderer/main_window/assets
          to: path.resolve(
            __dirname,
            isProduction
              ? ".webpack/renderer/main_window"
              : ".webpack/renderer",
            "assets"
          ),
        },
      ],
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(nodeEnv),
    }),
  ],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
