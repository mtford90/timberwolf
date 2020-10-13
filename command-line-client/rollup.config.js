import typescript from "@rollup/plugin-typescript";
import shebang from "rollup-plugin-add-shebang";

export default {
  input: "src/index.ts",
  output: {
    file: "out/timberwolf",
    format: "cjs",
  },
  plugins: [
    typescript(),
    shebang({
      include: "out/timberwolf",
    }),
  ],
};
