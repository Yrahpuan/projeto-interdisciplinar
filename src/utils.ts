import * as fs from "fs";
import path from "path";

export const pacientesDatabaseFileName = path.resolve(__dirname, "../databases/registroDePacientes.json");
export const filaFileName = path.resolve(__dirname, "../databases/fila.json");
export const registroTriagemFileName = path.resolve(__dirname, "../databases/registroDeTriagens.json");

export const databaseName = "./databases/db.db";

export function carregarJSON(path: string): any[] {
    if (!fs.existsSync(path)) return [];
        return JSON.parse(fs.readFileSync(path, "utf-8"));
}

export function salvarJSON(path: string, data: any): void {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}