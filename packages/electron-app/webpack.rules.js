module.exports = [
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|.webpack)/,
    loaders: [
      {
        loader: "babel-loader",
      },
    ],
  },
];
