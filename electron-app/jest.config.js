const fsx = require("fs-extra");

const coverageExlcusions = ["src/ui/static"];

module.exports = {
  collectCoverage: false,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/index.tsx",
    "!src/**/*.(spec|test).{ts,tsx}",
    ...coverageExlcusions.map((s) => {
      const blah = fsx.statSync(s);
      if (blah.isDirectory()) {
        return `!${s}/**/*.{ts,tsx}`;
      }
      return `!${s}`;
    }),
  ],
  coverageReporters: ["text", "html"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "sql"],
  setupFiles: ["./tests/setup.ts"],
  testMatch: [
    "**/tests/**/?(*.)+(spec|test).[jt]s?(x)",
    "**/src/**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  setupFilesAfterEnv: ["./tests/setupTestFrameworkScriptFile.ts"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
  },
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
    "^.+\\.sql$": "<rootDir>/tests/fileLoader.js",
    "^.+\\.graphql": "<rootDir>/tests/graphqlLoader.js",
  },
};
