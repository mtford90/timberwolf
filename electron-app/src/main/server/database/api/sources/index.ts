import { Database } from "better-sqlite3";
import { generateName } from "../../../../../common/id-generation";

type DatabaseSource = {
  name: string;
  id: number;
};

export function sourcesApi(
  db: Database,
  events: {
    onUpdate: (id: number) => void;
    onDelete: (id: number) => void;
    onCreate: (id: number) => void;
  }
) {
  /**
   * Always display overidden name on the client. User would not expect the name to change
   */
  function rename(id: number, name: string) {
    db.exec(`UPDATE sources SET name='${name}' WHERE id=${id}`);
    events.onUpdate(id);
  }

  function remove(id: number) {
    db.exec(`DELETE FROM sources WHERE id=${id}`);
    events.onDelete(id);
  }

  function create(preferredName: string) {
    let rowid: number | undefined;

    const getNames = db.prepare(`SELECT DISTINCT name FROM sources`);

    db.transaction(() => {
      const names = getNames.all().map((r) => r.name);
      const name = generateName(preferredName, names);

      const insert = db.prepare(`INSERT INTO sources(name) VALUES(@name)`);

      rowid = insert.run({ name }).lastInsertRowid as number;
    })();

    if (!rowid) {
      throw new Error("Transaction failed");
    }

    events.onCreate(rowid);

    return rowid;
  }

  function upsert(name: string) {
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO sources(name) VALUES(@name)`
    );

    return stmt.run({ name }).lastInsertRowid as number;
  }

  function update(id: number, name: string) {
    db.prepare(`UPDATE sources SET name='${name}' WHERE id=@id`).run({ id });

    events.onUpdate(id);
  }

  function all(): Array<DatabaseSource> {
    const stmt = db.prepare(`SELECT * from sources`);
    return stmt.all().map((r) => ({
      id: r.id,
      name: r.name || null,
    }));
  }

  function get(id: number): DatabaseSource | null {
    const stmt = db.prepare(`SELECT id,name from sources WHERE id=@id`);

    const r = stmt.get({ id });

    if (r) {
      return {
        id: r.id,
        name: r.name,
      };
    }

    return null;
  }

  function getByName(name: string): DatabaseSource | null {
    const stmt = db.prepare(`SELECT id,name from sources WHERE name=@name`);

    const r = stmt.get({ name });

    if (r) {
      return {
        id: r.id,
        name: r.name,
      };
    }

    return null;
  }

  return {
    rename,
    delete: remove,
    create,
    upsert,
    update,
    all,
    get,
    getByName,
  };
}

export type SourcesAPI = ReturnType<typeof sourcesApi>;
