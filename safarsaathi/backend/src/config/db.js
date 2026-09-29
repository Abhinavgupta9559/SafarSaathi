/**
 * Database configuration.
 *
 * We use lowdb (a lightweight JSON-file database) so the project runs
 * instantly on any machine with zero external setup (no MongoDB / Postgres
 * server required). The repository pattern in src/models keeps the data
 * access layer isolated, so swapping this for MongoDB/Postgres later only
 * means changing this file + the model files, not the controllers.
 */
const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const dbFile = path.join(__dirname, "..", "..", "database.json");
const adapter = new FileSync(dbFile);
const db = low(adapter);

// Default schema / seed shape
db.defaults({
  users: [],
  journeys: [],
  emergencyContacts: [],
}).write();

module.exports = db;
