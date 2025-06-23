import Database, { Database as SQLiteDatabase } from 'better-sqlite3';

export class DatabaseWrapper {
  private db: SQLiteDatabase;

  constructor(private dbPath: string) {
    this.db = new Database(this.dbPath);
  }

  run<T = any>(query: string, ...params: any[]): T | undefined {
    return this.db.prepare(query).run(...params) as T | undefined;
  }

  get<T = any>(query: string, ...params: any[]): T | undefined {
    return this.db.prepare(query).get(...params) as T | undefined;
  }

  all<T = any>(query: string, ...params: any[]): T[] {
    return this.db.prepare(query).all(...params) as T[];
  }

  close(): void {
    this.db.close();
  }
}