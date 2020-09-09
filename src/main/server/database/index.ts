import sqlite, { Database as SqliteDatabase } from "better-sqlite3";
import { compact, uniq, groupBy, flatten, keys } from "lodash";

export class Database {
  private db: SqliteDatabase;

  constructor(path = ":memory:") {
    this.db = sqlite(path);
  }

  init() {
    this.db.exec(
      `
      CREATE TABLE IF NOT EXISTS logs
      (
          path      text NOT NULL,
          timestamp integer NOT NULL,
          text      text NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_path
      ON logs(path);
      
      CREATE INDEX IF NOT EXISTS idx_timestamp
      ON logs(timestamp);
            
      CREATE TABLE IF NOT EXISTS words
      (
        path      text NOT NULL,
        text      text NOT NULL,
        num       integer NOT NULL,
        UNIQUE(path,text)
      );
      
      CREATE INDEX IF NOT EXISTS idx_words_path
      ON words(path);
      
      CREATE INDEX IF NOT EXISTS idx_words_text
      ON words(text);
      
      CREATE INDEX IF NOT EXISTS idx_words_num
      ON words(num);
    `
    );
  }

  private insertWords(path: string, words: string[]) {
    const upsert = this.db.prepare(
      `INSERT INTO words(path, text, num) VALUES(@path,@text,1)
    ON CONFLICT(path,text) DO UPDATE SET num=num+1;`
    );

    words.forEach((word) => upsert.run({ path, text: word }));
  }

  insert(rows: Array<{ path: string; timestamp?: number; text: string }>) {
    const stmt = this.db.prepare(
      "INSERT INTO logs (path, timestamp, text) VALUES (?,?,?)"
    );

    const rowIds = rows.map(({ path, timestamp, text }) => {
      return stmt.run(path, timestamp || Date.now(), text)
        .lastInsertRowid as number;
    });
    const entries = this.getWords(rows);

    entries.forEach(([path, words]) => {
      this.insertWords(path, words);
    });

    return this.getMany(compact(rowIds));
  }

  private getWords(
    rows: Array<{ path: string; timestamp?: number; text: string }>
  ) {
    const grouped = groupBy(
      rows.map((r) => {
        const withoutSymbols = r.text.replace(
          /[-!$%^&*()_+|~=`{}[\]:";'<>?,./]/g,
          " "
        );

        return {
          path: r.path,
          words: [
            ...withoutSymbols.split(/\s/g),
            ...r.text.split(/(?!\(.*)\s(?![^(]*?\))/g),
          ],
        };
      }),
      (r) => r.path
    );

    const entries: [string, string[]][] = [];

    keys(grouped).forEach((path) => {
      const words = compact(flatten(grouped[path].map((g) => g.words)));
      entries.push([path, words]);
    });

    return entries;
  }

  getMany(
    rowIds: number[],
    opts: {
      fields?: Array<"rowid" | "path" | "timestamp" | "text">;
    } = {}
  ): Array<{ rowid: number; path: string; timestamp: number; text: string }> {
    const rowIdsList = `(${rowIds.join(",")})`;

    return this.db
      .prepare(
        `SELECT ${this.getFields(opts)} FROM logs WHERE ROWID in ${rowIdsList}`
      )
      .all();
  }

  lines(
    path: string,
    opts: {
      filter?: string | null;
      beforeRowId?: number | null;
      limit?: number;
      fields?: Array<"rowid" | "path" | "timestamp" | "text">;
    } = {}
  ): Array<{ rowid: number; path: string; timestamp: number; text: string }> {
    const { beforeRowId } = opts;
    const limit = opts.limit || 10;
    const fields = this.getFields(opts);

    const query = `
      SELECT ${fields}
      FROM logs
      WHERE
      ${beforeRowId ? `rowid < ${beforeRowId} AND` : ""}
      ${opts.filter ? `text LIKE '%${opts.filter}%' AND` : ""}
      path = '${path}'
      ORDER BY rowid desc
      LIMIT  ${limit}
    `;

    return this.db.prepare(query).all();
  }

  private getFields(opts: {
    fields?: Array<"rowid" | "path" | "timestamp" | "text">;
  }) {
    return (opts.fields || ["rowid", "path", "timestamp", "text"]).join(",");
  }

  numLines(path: string, rowId?: number | null, filter?: string | null) {
    let sql = `SELECT COUNT(*) as n FROM logs WHERE ${
      filter ? `text LIKE '%${filter}%' AND` : ""
    } path = '${path}'`;
    if (rowId) {
      sql += ` AND rowid < ${rowId}`;
    }
    return this.db.prepare(sql).get().n;
  }

  clear(path: string) {
    this.db.exec(`DELETE FROM logs WHERE path = '${path}'`);
  }

  clearAll() {
    this.db.exec("DELETE FROM logs");
  }

  close() {
    this.db.close();
  }

  suggest(
    path: string,
    prefix: string,
    { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {}
  ) {
    const query = this.db.prepare(
      `SELECT path,text,num FROM words WHERE text LIKE '${prefix}%' AND path = '${path}' ORDER BY num DESC LIMIT ${limit} OFFSET ${offset}`
    );

    const suggestions = query.all().map((r) => r.text);

    if (suggestions[0]?.toLowerCase() === prefix) {
      suggestions.shift();
    }

    return suggestions;
  }
}
