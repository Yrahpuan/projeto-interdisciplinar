"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cadastro = void 0;
const utils_1 = require("./utils");
class Cadastro {
    //public readonly pacientesParaTriagem: ModeloPaciente[] = [];
    constructor() {
        //public static readonly pacientsDatabaseFileName = path.resolve(__dirname, "../databases/registroDePacientes.json");
        this.baseDeDados = [];
        this.carregarBaseDeDados();
    }
    getDataBase() {
        return this.baseDeDados;
    }
    cadastrarPaciente(id, cpf, nome, idade) {
        if (this.baseDeDados.some(p => p.cpf === cpf)) {
            console.warn("Não é permitido cadastrar duas pessoas com o mesmo CPF.");
            return;
        }
        const novoPaciente = { id, cpf, nome, idade };
        this.baseDeDados.push(novoPaciente);
        //this.mandarParaTriagem(novoPaciente);
        this.salvarBaseDeDados();
        return novoPaciente;
    }
    procurarPacientePorId(id) {
        return this.baseDeDados.find(p => p.id === id);
    }
    procurarPacientePorCpf(cpf) {
        return this.baseDeDados.find(p => p.cpf.includes(cpf));
    }
    /*mandarParaTriagem(paciente: ModeloPaciente): void {
        //this.pacientesParaTriagem.push(paciente);
        const fila = carregarJSON(Triagem.filaTriagemFileName);
        fila.push(paciente);
        salvarJSON(Triagem.filaTriagemFileName, fila);
    }*/
    salvarBaseDeDados() {
        console.log("🔁 Salvando dados no JSON...");
        (0, utils_1.salvarJSON)(utils_1.pacientesDatabaseFileName, this.baseDeDados);
    }
    carregarBaseDeDados() {
        this.baseDeDados = (0, utils_1.carregarJSON)(utils_1.pacientesDatabaseFileName);
    }
}
exports.Cadastro = Cadastro;
