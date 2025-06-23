"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente = void 0;
class Paciente {
    constructor(id, cpf, nome, idade) {
        this.id = id;
        this.cpf = cpf;
        this.nome = nome;
        this.idade = idade;
    }
    getId() {
        return this.id;
    }
    getCpf() {
        return this.cpf;
    }
    toJSON() {
        return {
            id: this.id,
            cpf: this.cpf,
            nome: this.nome,
            idade: this.idade
        };
    }
    static fromModel(model) {
        return new Paciente(model.id, model.cpf, model.nome, model.idade);
    }
}
exports.Paciente = Paciente;
