module.exports = function (api) {
  api.cache(false);

  return {
    presets: [
      "@babel/env",
      "@babel/preset-react",
      ["@babel/preset-typescript", { allExtensions: true, isTSX: true }],
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-transform-runtime",
      "@babel/plugin-proposal-optional-chaining",
      "babel-plugin-styled-components",
      "@babel/plugin-proposal-nullish-coalescing-operator",
    ],
  };
};
