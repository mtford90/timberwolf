import sqlite, { Database as SqliteDatabase } from "better-sqlite3";

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
    `
    );
  }

  insert(rows: Array<{ path: string; timestamp?: number; text: string }>) {
    const stmt = this.db.prepare(
      "INSERT INTO logs (path, timestamp, text) VALUES (?,?,?)"
    );
    rows.forEach(({ path, timestamp, text }) => {
      stmt.run(path, timestamp || Date.now(), text);
    });
  }

  lines(
    path: string,
    text: string,
    opts: {
      offset?: number;
      limit?: number;
      fields?: Array<"rowid" | "path" | "timestamp" | "text">;
    } = {}
  ): Promise<
    Array<{ rowid: string; path: string; timestamp: number; text: string }>
  > {
    const offset = opts.offset || 0;
    const limit = opts.limit || 10;
    const fields = opts.fields || ["rowid", "path", "timestamp", "text"];

    const query = `
      SELECT ${fields.join(",")}
      FROM logs
      WHERE text LIKE '%${text}%'
      AND path = '${path}'
      ORDER BY rowid asc
      LIMIT  ${limit}
      OFFSET ${offset};
    `;

    return this.db.prepare(query).all() as any;
  }

  numLines(path: string) {
    return this.db
      .prepare(`SELECT COUNT(*) as n FROM logs WHERE path = '${path}'`)
      .get().n;
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
}
