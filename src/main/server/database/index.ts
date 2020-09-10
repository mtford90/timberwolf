import sqlite, { Database as SqliteDatabase } from "better-sqlite3";
import { compact, groupBy, flatten, keys } from "lodash";

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
          source      text NOT NULL,
          timestamp integer NOT NULL,
          text      text NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_source
      ON logs(source);
      
      CREATE INDEX IF NOT EXISTS idx_timestamp
      ON logs(timestamp);
            
      CREATE TABLE IF NOT EXISTS words
      (
        source      text NOT NULL,
        text      text NOT NULL,
        num       integer NOT NULL,
        UNIQUE(source,text)
      );
      
      CREATE INDEX IF NOT EXISTS idx_words_source
      ON words(source);
      
      CREATE INDEX IF NOT EXISTS idx_words_text
      ON words(text);
      
      CREATE INDEX IF NOT EXISTS idx_words_num
      ON words(num);
    `
    );
  }

  private insertWords(source: string, words: string[]) {
    const upsert = this.db.prepare(
      `INSERT INTO words(source, text, num) VALUES(@source,@text,1)
    ON CONFLICT(source,text) DO UPDATE SET num=num+1;`
    );

    words.forEach((word) => upsert.run({ source, text: word }));
  }

  insert(rows: Array<{ source: string; timestamp?: number; text: string }>) {
    const stmt = this.db.prepare(
      "INSERT INTO logs (source, timestamp, text) VALUES (?,?,?)"
    );

    const rowIds = rows.map(({ source, timestamp, text }) => {
      return stmt.run(source, timestamp || Date.now(), text)
        .lastInsertRowid as number;
    });
    const entries = this.getWords(rows);

    entries.forEach(([source, words]) => {
      this.insertWords(source, words);
    });

    return this.getMany(compact(rowIds));
  }

  private getWords(
    rows: Array<{ source: string; timestamp?: number; text: string }>
  ) {
    const grouped = groupBy(
      rows.map((r) => {
        const withoutSymbols = r.text.replace(
          /[-!$%^&*()_+|~=`{}[\]:";'<>?,./]/g,
          " "
        );

        return {
          source: r.source,
          words: [
            ...withoutSymbols.split(/\s/g),
            ...r.text.split(/(?!\(.*)\s(?![^(]*?\))/g),
          ],
        };
      }),
      (r) => r.source
    );

    const entries: [string, string[]][] = [];

    keys(grouped).forEach((source) => {
      const words = compact(flatten(grouped[source].map((g) => g.words)));
      entries.push([source, words]);
    });

    return entries;
  }

  getMany(
    rowIds: number[],
    opts: {
      fields?: Array<"rowid" | "source" | "timestamp" | "text">;
    } = {}
  ): Array<{ rowid: number; source: string; timestamp: number; text: string }> {
    const rowIdsList = `(${rowIds.join(",")})`;

    return this.db
      .prepare(
        `SELECT ${this.getFields(opts)} FROM logs WHERE ROWID in ${rowIdsList}`
      )
      .all();
  }

  logs(
    source: string,
    opts: {
      filter?: string | null;
      beforeRowId?: number | null;
      limit?: number;
      fields?: Array<"rowid" | "source" | "timestamp" | "text">;
    } = {}
  ): Array<{ rowid: number; source: string; timestamp: number; text: string }> {
    const { beforeRowId } = opts;
    const limit = opts.limit || 10;
    const fields = this.getFields(opts);

    const query = `
      SELECT ${fields}
      FROM logs
      WHERE
      ${beforeRowId ? `rowid < ${beforeRowId} AND` : ""}
      ${opts.filter ? `text LIKE '%${opts.filter}%' AND` : ""}
      source = '${source}'
      ORDER BY rowid desc
      LIMIT  ${limit}
    `;

    return this.db.prepare(query).all();
  }

  private getFields(opts: {
    fields?: Array<"rowid" | "source" | "timestamp" | "text">;
  }) {
    return (opts.fields || ["rowid", "source", "timestamp", "text"]).join(",");
  }

  numLogs(source: string, rowId?: number | null, filter?: string | null) {
    let sql = `SELECT COUNT(*) as n FROM logs WHERE ${
      filter ? `text LIKE '%${filter}%' AND` : ""
    } source = '${source}'`;
    if (rowId) {
      sql += ` AND rowid < ${rowId}`;
    }
    return this.db.prepare(sql).get().n;
  }

  clear(source: string) {
    this.db.exec(`DELETE FROM logs WHERE source = '${source}'`);
  }

  clearAll() {
    this.db.exec("DELETE FROM logs");
  }

  close() {
    this.db.close();
  }

  suggest(
    source: string,
    prefix: string,
    { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {}
  ) {
    const query = this.db.prepare(
      `SELECT source,text,num FROM words WHERE text LIKE '${prefix}%' AND source = '${source}' ORDER BY num DESC LIMIT ${limit} OFFSET ${offset}`
    );

    const suggestions = query.all().map((r) => r.text);

    if (suggestions[0]?.toLowerCase() === prefix.toLowerCase()) {
      suggestions.shift();
    }

    return suggestions;
  }
}
