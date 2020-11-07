/* eslint-disable @typescript-eslint/no-var-requires,global-require */
import sqlite, { Database as SqliteDatabase } from "better-sqlite3";
import mitt from "mitt";
import { generateName } from "../../../common/id-generation";
import { logsApi, LogsApi } from "./api/logs";
import { suggestionsApi, SuggestionsAPI } from "./api/suggestions";

type Emitter = ReturnType<typeof mitt>;

type DatabaseSource = {
  name: string;
  id: number;
};

export class Database {
  private db: SqliteDatabase;

  private emitter: Emitter;

  public readonly logs: LogsApi;

  public readonly suggestions: SuggestionsAPI;

  constructor(path = ":memory:", emitter = mitt()) {
    this.db = sqlite(path);
    this.emitter = emitter;
    this.logs = logsApi(this.db, (entries) => {
      entries.forEach(([source, words]) => {
        this.suggestions.insert(source, words);
      });
    });
    this.suggestions = suggestionsApi(this.db);
  }

  init() {
    this.db.exec(require("./create.sql"));
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

  clearAll() {
    this.db.exec(require("./clear-all.sql"));
  }

  close() {
    this.db.close();
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
