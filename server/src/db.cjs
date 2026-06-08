const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function createDb(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const SQL = await initSqlJs({
    locateFile: (file) => require.resolve(`sql.js/dist/${file}`)
  });

  const db = fs.existsSync(dbPath)
    ? new SQL.Database(fs.readFileSync(dbPath))
    : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      licenseKey TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      status TEXT NOT NULL,
      source TEXT NOT NULL,
      stripeSessionId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activations (
      id TEXT PRIMARY KEY,
      licenseId TEXT NOT NULL,
      deviceId TEXT NOT NULL,
      email TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      lastSeenAt TEXT NOT NULL,
      UNIQUE(licenseId, deviceId)
    );
  `);

  function save() {
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
  }

  function all(sql, params = []) {
    const statement = db.prepare(sql);
    statement.bind(params);
    const rows = [];
    while (statement.step()) rows.push(statement.getAsObject());
    statement.free();
    return rows;
  }

  function get(sql, params = []) {
    return all(sql, params)[0] || null;
  }

  function run(sql, params = []) {
    db.run(sql, params);
    save();
  }

  return { db, all, get, run, save };
}

module.exports = { createDb };
