import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

// Function to initialize and get the database connection
export async function getDbConnection() {
  if (db) {
    return db; // Agar connection pehle se hai to wahi return karo
  }

  db = await open({
    filename: './blog.db', // Project ke root folder me ye file banegi
    driver: sqlite3.Database, // SQLite3 driver use karega
  });

  return db;
}
