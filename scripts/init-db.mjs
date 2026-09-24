import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDb() {
  // DB connection
  const db = await open({
    filename: path.join(__dirname, '../blog.db'),
    driver: sqlite3.Database
  });

  console.log("Database connected successfully!");

  // Creating the table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      is_published BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Table 'blogs' created successfully!");

  // Create Index
  await db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
  `);
  
  console.log("Index 'idx_blogs_slug' created on 'slug' column!");

  await db.close();
  console.log("Database setup complete!");
}

setupDb().catch(err => {
  console.error("Error setting up database:", err);
});
