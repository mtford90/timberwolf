/* eslint-disable @typescript-eslint/no-var-requires,global-require */
import { Database as SqliteDatabase } from "better-sqlite3";

export function suggestionsApi(db: SqliteDatabase) {
  function suggest(
    sourceId: number,
    prefix: string,
    { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {}
  ) {
    // TODO: test the secondary order length(text)
    const query = db.prepare(require("./suggest.sql"));

    const suggestions = query
      .all({
        query: `${prefix}%`,
        sourceId,
        limit,
        offset,
      })
      .map((r) => r.text);

    if (suggestions[0]?.toLowerCase() === prefix.toLowerCase()) {
      suggestions.shift();
    }

    return suggestions;
  }

  function insert(sourceId: number, words: string[]) {
    const upsert = db.prepare(require("./insert.sql"));
    words.forEach((word) => upsert.run({ sourceId, text: word }));
  }

  return {
    suggest,
    insert,
  };
}

export type SuggestionsAPI = ReturnType<typeof suggestionsApi>;
