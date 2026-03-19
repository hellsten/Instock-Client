import mysql from "mysql2/promise";

const {
  DB_HOST,
  DB_PORT = "3306",
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  DB_NAME,
} = process.env;

const database = DB_DATABASE || DB_NAME;

if (!DB_HOST || !DB_USER || !database || DB_PASSWORD === undefined) {
  throw new Error("Missing DB env vars. Need DB_HOST, DB_USER, DB_PASSWORD, and DB_DATABASE (or DB_NAME).");
}

const db = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT) || 3306,
  user: DB_USER,
  password: DB_PASSWORD,
  database,
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;











