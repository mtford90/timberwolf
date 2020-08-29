const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const plugins = require("./webpack.plugins");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/index.ts",
  // Put your normal webpack config below here
  module: {
    rules: [
      // Add support for native node modules
      {
        test: /\.node$/,
        use: "node-loader",
      },
      {
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
          loader: "@zeit/webpack-asset-relocator-loader",
          options: {
            outputAssetBase: "native_modules",
          },
        },
      },
      ...require("./webpack.rules"),
      { test: /\.graphql?$/, loader: "webpack-graphql-loader" }
    ],
  },
  plugins: [
    ...plugins,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "sonic.template.cfg"),
          to: path.resolve(__dirname, ".webpack/main", "sonic.template.cfg"),
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
