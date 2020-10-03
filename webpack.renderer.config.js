const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
    test: /\.css$/,
    use: [{loader: "style-loader"}, {loader: "postcss-loader"}],
});

module.exports = {
    // Put your normal webpack config below here
    module: {
        rules: [
            ...rules,
            {
                test: /\.worker\.ts$/,
                use: {
                    loader: 'worker-loader', options: {
                        // TODO: Ideally the worker would not be inlined as a BLOB,
                        // ...however there is an issue I can't figure out with regards to the final folder structure
                        // ...of the generated webpack files (get a 404 on the worker js in prod mode)
                        inline: 'no-fallback'
                    }
                },
            }
        ],
    },
    plugins: [
        ...plugins,
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "assets"),
                    to: path.resolve(__dirname, ".webpack/renderer", "assets"),
                },
            ],
        }),
    ],
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    },
};
