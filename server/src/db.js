import Database from 'better-sqlite3';

export class NumbersDB {
  constructor(filename) {
    this.db = new Database(
        filename,
        {verbose: (msg) => console.log(`[DB] ${msg}`)},
    );
    this.stmt_create = this.db.prepare(
        'CREATE TABLE IF NOT EXISTS numbers (number int)',
    );
    this.stmt_create.run();

    this.stmt_get = this.db.prepare(
        'SELECT * FROM numbers',
    );
    this.stmt_insert = this.db.prepare(
        'INSERT INTO numbers (number) VALUES (?)',
    );
    this.stmt_clear = this.db.prepare(
        'DELETE FROM numbers',
    );
  }

  getNumbers() {
    return this.stmt_get.all();
  }

  insertNumber(number) {
    this.stmt_insert.run(number);
  }

  clearNumbers() {
    this.stmt_clear.run();
  }
}
