import { transparentize } from "polished";

const contrastWhite = "rgb(193,203,210)";

export const darkTheme = {
  colors: {
    blue: "#113aff",
    backgroundColor: "rgb(36,36,36)",
    textColor: contrastWhite,
    borderColor: transparentize(0.8, contrastWhite),
    transparentHover: transparentize(0.9, contrastWhite),
    inputBackground: transparentize(0.9, contrastWhite),
  },
};

export type Theme = typeof darkTheme;

export const lightTheme: Theme = darkTheme; // TODO
