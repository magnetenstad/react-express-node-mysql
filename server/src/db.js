import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export { Database };

class Database {
  db;
  
  async init() {
    this.db = await open({
      filename: './data/database.db',
      driver: sqlite3.Database
    });
    await this.initNumbers();
  }
  
  async initNumbers() {
    console.log("[DB] Init");
    await this.db.exec('CREATE TABLE IF NOT EXISTS numbers (number int)');
  }
  
  async getNumbers() {
    console.log("[DB] GET");
    return await this.db.all('SELECT * FROM numbers');
  }
  
  async insertNumber(number) {
    console.log("[DB] INSERT " + number);
    await this.db.exec('INSERT INTO numbers (number) VALUES (' + number + ')');
  }

  async clearNumbers() {
    console.log("[DB] CLEAR");
    await this.db.exec('DELETE FROM numbers');
  }
}
