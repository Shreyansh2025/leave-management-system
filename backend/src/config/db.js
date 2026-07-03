const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, '../../database/leave_management.sqlite');
const SCHEMA_FILE = path.join(__dirname, '../models/schema.sql');

let SQL = null;
let db = null;

/**
 * Persist the in-memory sql.js database back to disk.
 * sql.js keeps everything in memory, so every write (INSERT/UPDATE/DELETE)
 * must be flushed to the .sqlite file to survive a server restart.
 */
function persist() {
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

async function initDb() {
  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    db = new SQL.Database();
  }

  const schema = fs.readFileSync(SCHEMA_FILE, 'utf-8');
  db.run(schema);
  persist();

  return db;
}

/** Run an INSERT/UPDATE/DELETE statement. Returns { lastInsertRowid, changes }. */
function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  const lastIdResult = db.exec('SELECT last_insert_rowid() AS id');
  const lastInsertRowid = lastIdResult[0] ? lastIdResult[0].values[0][0] : null;
  persist();
  return { lastInsertRowid };
}

/** Return a single row (or undefined). */
function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : undefined;
  stmt.free();
  return row;
}

/** Return all matching rows. */
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

module.exports = { initDb, run, get, all };
