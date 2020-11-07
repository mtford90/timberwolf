/* eslint-disable @typescript-eslint/no-var-requires,global-require */
import sqlite, { Database as SqliteDatabase } from "better-sqlite3";
import mitt from "mitt";
import { logsApi, LogsApi } from "./api/logs";
import { suggestionsApi, SuggestionsAPI } from "./api/suggestions";
import { SourcesAPI, sourcesApi } from "./api/sources";

type Emitter = ReturnType<typeof mitt>;

export class Database {
  private db: SqliteDatabase;

  private emitter: Emitter;

  public readonly logs: LogsApi;

  public readonly suggestions: SuggestionsAPI;

  public readonly sources: SourcesAPI;

  constructor(path = ":memory:", emitter = mitt()) {
    this.db = sqlite(path);
    this.emitter = emitter;
    this.logs = logsApi(this.db, (entries) => {
      entries.forEach(([source, words]) => {
        this.suggestions.insert(source, words);
      });
    });
    this.suggestions = suggestionsApi(this.db);
    this.sources = sourcesApi(this.db, {
      onUpdate: (id) => this.emit("update:source", id),
      onCreate: (id) => this.emit("create:source", id),
      onDelete: (id) => this.emit("delete:source", id),
    });
  }

  init() {
    this.db.exec(require("./create.sql"));
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
