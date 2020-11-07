import { compact, flatten, groupBy, keys } from "lodash";

export type WordEntries = [number, string[]][];

export function getWords(
  rows: Array<{ sourceId: number; text: string }>
): WordEntries {
  const grouped = groupBy(
    rows.map((r) => {
      const withoutSymbols = r.text.replace(
        /[-!$%^&*()_+|~=`{}[\]:";'<>?,./]/g,
        " "
      );

      return {
        sourceId: r.sourceId,
        words: [
          ...withoutSymbols.split(/\s/g),
          ...r.text.split(/(?!\(.*)\s(?![^(]*?\))/g),
        ],
      };
    }),
    (r) => r.sourceId
  );

  const entries: WordEntries = [];

  keys(grouped).forEach((source) => {
    const words = compact(flatten(grouped[source].map((g) => g.words)));
    entries.push([parseInt(source, 10), words]);
  });

  return entries;
}
