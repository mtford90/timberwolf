module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  extends: [
    "airbnb",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/react",
    "prettier/@typescript-eslint",
  ],
  plugins: [
    "react",
    "import",
    "prettier",
    "promise",
    "@typescript-eslint",
    "jest",
    "react-hooks",
  ],
  globals: {
    __DEV__: true,
    fetch: true,
  },
  rules: {
    "prettier/prettier": ["error"],
    "sort-imports": "off",
    "import/order": "warn",
    "max-classes-per-file": "warn",
    "no-plusplus": "off",
    "import/prefer-default-export": "off",
    "class-methods-use-this": "off",
    "no-console": "off",
    // Doesn't work with typescript, it seems
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    // Doesn't work with the services layout
    "import/no-extraneous-dependencies": "off",
    // Doesn't work with typescript, it seems
    "import/no-unresolved": "off",
    // I like underscores
    "no-underscore-dangle": "off",

    // TypeScript
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-object-literal-type-assertion": "off",
    "@typescript-eslint/prefer-interface": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // React
    "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
    "react/prop-types": ["off", {}],
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",

    // Jest
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",

    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".ts", ".jsx", ".tsx", ".json"],
      },
    },
    "import/extensions": [".ts", ".mjs", ".jsx", ".tsx"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
  env: {
    "jest/globals": true,
    browser: true,
  },
  ignorePatterns: ["*.generated.*", "__generated__", "*.d.ts"],
  overrides: [
    {
      files: ["**/tests/**/*.ts", "*.test.tsx", "*.test.ts"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
    {
      files: ["webpack.*.js", "*.config.js", "./electron-app/tests/**/*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "global-require": "off",
      },
    },
  ],
};
