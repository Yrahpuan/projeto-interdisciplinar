"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registroTriagemFileName = exports.filaFileName = exports.pacientesDatabaseFileName = void 0;
exports.carregarJSON = carregarJSON;
exports.salvarJSON = salvarJSON;
exports.procurarPacientePorId = procurarPacientePorId;
exports.procurarPacientePorCpf = procurarPacientePorCpf;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
exports.pacientesDatabaseFileName = path_1.default.resolve(__dirname, "../databases/registroDePacientes.json");
exports.filaFileName = path_1.default.resolve(__dirname, "../databases/fila.json");
exports.registroTriagemFileName = path_1.default.resolve(__dirname, "../databases/registroDeTriagens.json");
function carregarJSON(path) {
    if (!fs.existsSync(path))
        return [];
    return JSON.parse(fs.readFileSync(path, "utf-8"));
}
function salvarJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}
function procurarPacientePorId(id) {
    const pacientes = carregarJSON(exports.pacientesDatabaseFileName);
    return pacientes.find(p => p.id === id);
}
function procurarPacientePorCpf(cpf) {
    const pacientes = carregarJSON(exports.pacientesDatabaseFileName);
    return pacientes.find(p => p.cpf.includes(cpf));
}
