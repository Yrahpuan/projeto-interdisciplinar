"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseWrapper = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class DatabaseWrapper {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = new better_sqlite3_1.default(this.dbPath);
    }
    run(query, ...params) {
        return this.db.prepare(query).run(...params);
    }
    get(query, ...params) {
        return this.db.prepare(query).get(...params);
    }
    all(query, ...params) {
        return this.db.prepare(query).all(...params);
    }
    close() {
        this.db.close();
    }
}
exports.DatabaseWrapper = DatabaseWrapper;
