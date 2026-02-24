// server/db/db.js
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db; // singleton

export async function getDb() {
  if (db) return db;

  const dbFile = process.env.DB_FILE || "database.sqlite";
  const dbPath = path.join(__dirname, dbFile);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // SQLite: włącz relacje (FK)
  await db.exec("PRAGMA foreign_keys = ON;");

  // Zainicjalizuj tabele (bezpiecznie – CREATE TABLE IF NOT EXISTS)
  const initSqlPath = path.join(__dirname, "init.sql");
  const initSql = fs.readFileSync(initSqlPath, "utf-8");
  await db.exec(initSql);

  return db;
}