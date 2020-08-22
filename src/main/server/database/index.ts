import sqlite, { Database as SqliteDatabase } from "better-sqlite3";
import { compact } from "lodash";

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

    const rowIds = rows.map(({ path, timestamp, text }) => {
      return stmt.run(path, timestamp || Date.now(), text)
        .lastInsertRowid as number;
    });

    return this.getMany(compact(rowIds));
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

    console.log("lines query", query);

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
}
