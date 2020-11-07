import { Database as SqliteDatabase } from "better-sqlite3";
import { compact } from "lodash";
import { getWords, WordEntries } from "../get-words";

type LogFieldList = Array<"rowid" | "source_id" | "timestamp" | "text">;

export type LogRow = {
  rowid: number;
  // eslint-disable-next-line camelcase
  source_id: string;
  timestamp: number;
  text: string;
};

function getFields(opts: { fields?: LogFieldList }) {
  return (opts.fields || ["rowid", "source_id", "timestamp", "text"]).join(",");
}

export function logsApi(
  db: SqliteDatabase,
  onNewEntries: (entries: WordEntries) => void
) {
  function findMany(
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
    const fields = getFields(opts);

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

    return db.prepare(query).all();
  }

  function getMany(
    rowIds: number[],
    opts: {
      fields?: LogFieldList;
    } = {}
  ): Array<LogRow> {
    const rowIdsList = `(${rowIds.join(",")})`;

    const stmt = `SELECT ${getFields(
      opts
    )} FROM logs WHERE ROWID in ${rowIdsList}`;

    return db.prepare(stmt).all();
  }

  function count(
    sourceId: number,
    rowId?: number | null,
    filter?: string | null
  ) {
    let sql = `SELECT COUNT(*) as n FROM logs WHERE ${
      filter ? `text LIKE '%${filter}%' AND` : ""
    } source_id=${sourceId}`;

    if (rowId) {
      sql += ` AND rowid < ${rowId}`;
    }

    return db.prepare(sql).get().n;
  }

  function insert(
    rows: Array<{ sourceId: number; timestamp?: number; text: string }>
  ) {
    const insertLog = db.prepare(
      "INSERT INTO logs (source_id, timestamp, text) VALUES (?,?,?)"
    );

    const rowIds = rows.map(({ sourceId, timestamp, text }) => {
      return insertLog.run(sourceId, timestamp || Date.now(), text)
        .lastInsertRowid as number;
    });

    const entries = getWords(rows);

    onNewEntries(entries);

    return rowIds ? getMany(compact(rowIds)) : [];
  }

  return {
    getMany,
    findMany,
    count,
    insert,
  };
}

export type LogsApi = ReturnType<typeof logsApi>;
