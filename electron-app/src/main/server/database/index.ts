import sqlite, { Database as SqliteDatabase } from "better-sqlite3";
import { compact, groupBy, flatten, keys } from "lodash";
import mitt from "mitt";
import createSql from "./create.sql";
import { generateName } from "../../../common/id-generation";

type LogFieldList = Array<"rowid" | "source_id" | "timestamp" | "text">;
type Emitter = ReturnType<typeof mitt>;

export type LogRow = {
  rowid: number;
  // eslint-disable-next-line camelcase
  source_id: string;
  timestamp: number;
  text: string;
};

type DatabaseSource = {
  name: string;
  id: number;
};

export class Database {
  private db: SqliteDatabase;

  private emitter: Emitter;

  constructor(path = ":memory:", emitter = mitt()) {
    this.db = sqlite(path);
    this.emitter = emitter;
  }

  init() {
    this.db.exec(createSql);
  }

  createSource(preferredName: string) {
    let rowid: number | undefined;

    const getNames = this.db.prepare(`SELECT DISTINCT name FROM sources`);

    this.db.transaction(() => {
      const names = getNames.all().map((r) => r.name);
      const name = generateName(preferredName, names);

      const insert = this.db.prepare(`INSERT INTO sources(name) VALUES(@name)`);

      rowid = insert.run({ name }).lastInsertRowid as number;
    })();

    if (!rowid) {
      throw new Error("Transaction failed");
    }

    this.emit("create:source", rowid);

    return rowid;
  }

  upsertSource(name: string) {
    const upsert = this.db.prepare(
      `INSERT OR IGNORE INTO sources(name) VALUES(@name)`
    );

    return upsert.run({ name }).lastInsertRowid as number;
  }

  updateSource(id: number, name: string) {
    this.db
      .prepare(`UPDATE sources SET name='${name}' WHERE id=@id`)
      .run({ id });

    this.emit("update:source", id);
  }

  getSources(): Array<DatabaseSource> {
    const stmt = this.db.prepare(`SELECT * from sources`);
    return stmt.all().map((r) => ({
      id: r.id,
      name: r.name || null,
    }));
  }

  getSource(id: number): DatabaseSource | null {
    const stmt = this.db.prepare(`SELECT id,name from sources WHERE id=@id`);

    const r = stmt.get({ id });

    if (r) {
      return {
        id: r.id,
        name: r.name,
      };
    }

    return null;
  }

  getSourceByName(name: string): DatabaseSource | null {
    const stmt = this.db.prepare(
      `SELECT id,name from sources WHERE name=@name`
    );

    const r = stmt.get({ name });

    if (r) {
      return {
        id: r.id,
        name: r.name,
      };
    }

    return null;
  }

  /**
   * Always display overidden name on the client. User would not expect the name to change
   */
  renameSource(id: number, name: string) {
    this.db.exec(`UPDATE sources SET name='${name}' WHERE id=${id}`);
    this.emit("update:source", id);
  }

  deleteSource(id: number) {
    this.db.exec(`DELETE FROM sources WHERE id=${id}`);
    this.emit("delete:source", id);
  }

  private insertWords(sourceId: number, words: string[]) {
    const upsert = this.db.prepare(
      `INSERT INTO words(source_id, text, num) VALUES(@sourceId,@text,1)
    ON CONFLICT(source_id,text) DO UPDATE SET num=num+1;`
    );

    words.forEach((word) => upsert.run({ sourceId, text: word }));
  }

  insert(rows: Array<{ sourceId: number; timestamp?: number; text: string }>) {
    const insertLog = this.db.prepare(
      "INSERT INTO logs (source_id, timestamp, text) VALUES (?,?,?)"
    );

    const rowIds = rows.map(({ sourceId, timestamp, text }) => {
      return insertLog.run(sourceId, timestamp || Date.now(), text)
        .lastInsertRowid as number;
    });

    const entries = this.getWords(rows);
    entries.forEach(([source, words]) => {
      this.insertWords(source, words);
    });

    return rowIds ? this.getManyLogs(compact(rowIds)) : [];
  }

  private getWords(
    rows: Array<{ sourceId: number; timestamp?: number; text: string }>
  ) {
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

    const entries: [number, string[]][] = [];

    keys(grouped).forEach((source) => {
      const words = compact(flatten(grouped[source].map((g) => g.words)));
      entries.push([parseInt(source, 10), words]);
    });

    return entries;
  }

  getManyLogs(
    rowIds: number[],
    opts: {
      fields?: LogFieldList;
    } = {}
  ): Array<LogRow> {
    const rowIdsList = `(${rowIds.join(",")})`;

    const stmt = `SELECT ${this.getFields(
      opts
    )} FROM logs WHERE ROWID in ${rowIdsList}`;

    return this.db.prepare(stmt).all();
  }

  getLogs(
    sourceId: number,
    opts: {
      filter?: string | null;
      beforeRowId?: number | null;
      limit?: number;
      fields?: LogFieldList;
    } = {}
  ): Array<LogRow> {
    const { beforeRowId } = opts;
    const limit = opts.limit || 10;
    const fields = this.getFields(opts);

    const query = `
      SELECT ${fields}
      FROM logs
      WHERE
      ${beforeRowId ? `rowid < ${beforeRowId} AND` : ""}
      ${opts.filter ? `text LIKE '%${opts.filter}%' AND` : ""}
      source_id = ${sourceId}
      ORDER BY rowid desc
      LIMIT  ${limit}
    `;

    return this.db.prepare(query).all();
  }

  private getFields(opts: { fields?: LogFieldList }) {
    return (opts.fields || ["rowid", "source_id", "timestamp", "text"]).join(
      ","
    );
  }

  numLogs(sourceId: number, rowId?: number | null, filter?: string | null) {
    let sql = `SELECT COUNT(*) as n FROM logs WHERE ${
      filter ? `text LIKE '%${filter}%' AND` : ""
    } source_id=${sourceId}`;

    if (rowId) {
      sql += ` AND rowid < ${rowId}`;
    }

    return this.db.prepare(sql).get().n;
  }

  clear(sourceId: string) {
    this.db.exec(`DELETE FROM logs WHERE logs.source_id = '${sourceId}'`);
    this.db.exec(`DELETE FROM sources WHERE id='${sourceId}'`);
  }

  clearAll() {
    this.db.exec("DELETE FROM logs");
    this.db.exec("DELETE FROM words");
    this.db.exec("DELETE FROM sources");
  }

  close() {
    this.db.close();
  }

  suggest(
    sourceId: number,
    prefix: string,
    { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {}
  ) {
    const query = this.db.prepare(
      `SELECT source_id,text,num FROM words WHERE text LIKE '${prefix}%' AND source_id = ${sourceId} ORDER BY num DESC, length(text) LIMIT ${limit} OFFSET ${offset}`
    );

    const suggestions = query.all().map((r) => r.text);

    if (suggestions[0]?.toLowerCase() === prefix.toLowerCase()) {
      suggestions.shift();
    }

    return suggestions;
  }

  on(event: "create:source", listener: (id: number) => void): void;

  on(event: "update:source", listener: (id: number) => void): void;

  on(event: "delete:source", listener: (id: number) => void): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: any, listener: (value: any) => void) {
    this.emitter.on(event, listener);
  }

  off(
    event: "create:source" | "delete:source" | "update:source",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (value: any) => void
  ) {
    this.emitter.off(event, listener);
  }

  private emit(event: "create:source", id: number): void;

  private emit(event: "delete:source", id: number): void;

  private emit(event: "update:source", id: number): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(event: any, payload: any) {
    this.emitter.emit(event, payload);
  }
}
