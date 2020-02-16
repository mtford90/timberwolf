import mitt, { Emitter } from "mitt";
import { Subscription } from "rxjs";
import { Database } from "../../database";
import { reverseRead } from "./reverse-read";

export type FileIndexerProgressEvent = {
  path: string;
  bytesRead: number;
  totalBytes: number;
};

export type FileIndexerErrorEvent = { path: string; error: Error };

export type FileIndexerCloseEvent = { path: string };

export type FileIndexerEventPayloads = {
  progress: FileIndexerProgressEvent;
  close: FileIndexerCloseEvent;
  error: FileIndexerErrorEvent;
};

export type FileIndexerEvent = keyof FileIndexerEventPayloads;

export class FileIndexer {
  private database: Database;

  private emitter: Emitter;

  public files: Map<
    string,
    {
      lines: number;
    }
  > = new Map();

  public subscriptions: Map<string, Subscription> = new Map();

  constructor(database: Database) {
    this.database = database;
    this.emitter = mitt();
  }

  on<T extends FileIndexerEvent>(
    name: T,
    fn: (payload: FileIndexerEventPayloads[T]) => void
  ) {
    this.emitter.on<FileIndexerEventPayloads[T]>(name, fn as never);
    return () => this.off(name, fn);
  }

  off<T extends FileIndexerEvent>(
    name: T,
    fn: (payload: FileIndexerEventPayloads[T]) => void
  ) {
    this.emitter.off<FileIndexerEventPayloads[T]>(name, fn as never);
  }

  protected emit<T extends FileIndexerEvent>(
    name: T,
    payload: FileIndexerEventPayloads[T]
  ) {
    this.emitter.emit<FileIndexerEventPayloads[T]>(name, payload);
  }

  index(path: string, encoding: BufferEncoding = "utf8") {
    if (this.subscriptions.has(path)) {
      // no-op - already indexing the file
      return;
    }

    const observable = reverseRead(path, encoding);

    const subscription = observable.subscribe({
      next: (o) => {
        if (o.line === undefined) {
          this.files.set(path, { lines: 0 });
        }
        this.database.insert([{ path, text: o.line || "\n" }]);
        this.emit("progress", {
          totalBytes: o.size,
          path,
          bytesRead: o.bytesRead,
        });
        const fileData = this.files.get(path);
        if (fileData) {
          const newLines = fileData.lines + 1;
          this.files.set(path, {
            ...fileData,
            lines: newLines,
          });
        }
      },
      error: (err) => {
        this.emit("error", { error: err, path });
      },
      complete: () => {
        console.log("complete");
        this.emit("close", { path });
      },
    });

    this.subscriptions.set(path, subscription);
  }

  cancel(path: string) {
    const sub = this.subscriptions.get(path);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(path);
    }
  }
}
