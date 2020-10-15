import { lighten, transparentize } from "polished";

const contrastWhite = "rgb(193,203,210)";

const GREEN = "#388858";

export const darkTheme = {
  colors: {
    blue: "#113aff",
    backgroundColor: "rgb(36,36,36)",
    textColor: contrastWhite,
    borderColor: transparentize(0.8, contrastWhite),
    hover: {
      main: transparentize(0.9, contrastWhite),
      light: lighten(0.1, transparentize(0.9, contrastWhite)),
    },
    inputBackground: transparentize(0.9, contrastWhite),
    ok: {
      main: GREEN,
      light: lighten(0.1, GREEN),
    },
    buttonBackground: {
      main: transparentize(0.9, contrastWhite),
      hover: lighten(0.2, transparentize(0.9, contrastWhite)),
    },
  },
};

export type Theme = typeof darkTheme;

export const lightTheme: Theme = darkTheme; // TODO
