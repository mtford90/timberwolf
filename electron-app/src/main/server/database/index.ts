import sqlite, { Database as SqliteDatabase } from "better-sqlite3";
import { compact, groupBy, flatten, keys, uniq } from "lodash";
import createSql from "./create.sql";

type LogFieldList = Array<"rowid" | "source_id" | "timestamp" | "text">;

export type LogRow = {
  rowid: number;
  // eslint-disable-next-line camelcase
  source_id: string;
  timestamp: number;
  text: string;
};

export class Database {
  private db: SqliteDatabase;

  constructor(path = ":memory:") {
    this.db = sqlite(path);
  }

  init() {
    this.db.exec(createSql);
  }

  upsertSource(id: string, name?: string) {
    if (name) {
      const upsert = this.db.prepare(
        `INSERT INTO sources(id, name) VALUES(@id,@name)
                ON CONFLICT(id) DO UPDATE SET name=@name`
      );

      upsert.run({ id, name });
    } else {
      const upsert = this.db.prepare(
        `INSERT OR IGNORE INTO sources(id) VALUES(@id)`
      );

      upsert.run({ id });
    }
  }

  getSources(): Array<{ id: string; name: string | null }> {
    const stmt = this.db.prepare(`SELECT * from sources`);
    return stmt.all().map((r) => ({
      id: r.id,
      name: r.override_name || r.name || null,
    }));
  }

  getSource(id: string): { id: string; name: string | null } | null {
    const stmt = this.db.prepare(`SELECT * from sources WHERE id=@id`);

    const r = stmt.get({ id });

    if (r) {
      return {
        id: r.id,
        name: r.override_name || r.name || null,
      };
    }

    return null;
  }

  /**
   * Always display overidden name on the client. User would not expect the name to change
   */
  overrideSourceName(id: string, name: string) {
    this.db.exec(`UPDATE sources SET override_name='${name}' WHERE id='${id}'`);
  }

  deleteSource(id: string) {
    this.db.exec(`DELETE FROM sources WHERE id='${id}'`);
  }

  private insertWords(sourceId: string, words: string[]) {
    const upsert = this.db.prepare(
      `INSERT INTO words(source_id, text, num) VALUES(@sourceId,@text,1)
    ON CONFLICT(source_id,text) DO UPDATE SET num=num+1;`
    );

    words.forEach((word) => upsert.run({ sourceId, text: word }));
  }

  insert(rows: Array<{ sourceId: string; timestamp?: number; text: string }>) {
    const sources = uniq(rows.map((r) => r.sourceId));

    // TODO.PERF Bulk upsert?
    sources.forEach((s) => {
      this.upsertSource(s);
    });

    const stmt = this.db.prepare(
      "INSERT INTO logs (source_id, timestamp, text) VALUES (?,?,?)"
    );

    const rowIds = rows.map(({ sourceId, timestamp, text }) => {
      return stmt.run(sourceId, timestamp || Date.now(), text)
        .lastInsertRowid as number;
    });

    const entries = this.getWords(rows);

    entries.forEach(([source, words]) => {
      this.insertWords(source, words);
    });

    return this.getManyLogs(compact(rowIds));
  }

  private getWords(
    rows: Array<{ sourceId: string; timestamp?: number; text: string }>
  ) {
    const grouped = groupBy(
      rows.map((r) => {
        const withoutSymbols = r.text.replace(
          /[-!$%^&*()_+|~=`{}[\]:";'<>?,./]/g,
          " "
        );

        return {
          source: r.sourceId,
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
    sourceId: string,
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
      source_id = '${sourceId}'
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

  numLogs(source: string, rowId?: number | null, filter?: string | null) {
    let sql = `SELECT COUNT(*) as n FROM logs WHERE ${
      filter ? `text LIKE '%${filter}%' AND` : ""
    } source_id = '${source}'`;
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
    sourceId: string,
    prefix: string,
    { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {}
  ) {
    const query = this.db.prepare(
      `SELECT source_id,text,num FROM words WHERE text LIKE '${prefix}%' AND source_id = '${sourceId}' ORDER BY num DESC LIMIT ${limit} OFFSET ${offset}`
    );

    const suggestions = query.all().map((r) => r.text);

    if (suggestions[0]?.toLowerCase() === prefix.toLowerCase()) {
      suggestions.shift();
    }

    return suggestions;
  }
}
