declare module "xregexp" {
  export interface Match {
    name: string;
    value: string;
    start: number;
    end: number;
  }

  export function matchRecursive(
    str: string,
    leftDelim: string,
    rightDelim: string,
    flags: string,
    options: {
      valueNames: string[];
    }
  ): Match[];
}
