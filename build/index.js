"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cadastro_1 = require("./Cadastro");
const Triagem_1 = require("./Triagem");
const ControleDePrioridade_1 = require("./ControleDePrioridade");
const informacoesDeRisco_1 = require("./informacoesDeRisco");
const utils_1 = require("./utils");
const cadastro = new Cadastro_1.Cadastro();
const triagem = new Triagem_1.Triagem();
const controle = new ControleDePrioridade_1.ControleDePrioridade();
try {
    // 1. Cadastrar um novo paciente
    const novoPaciente = (0, utils_1.procurarPacientePorId)(1);
    console.log("Paciente cadastrado:", novoPaciente);
    const paciente = (0, utils_1.procurarPacientePorId)(2);
    console.log("paciente", paciente);
    // 2. Enviar para triagem
    //cadastro.mandarParaTriagem(novoPaciente);
    //console.log("Paciente enviado para triagem");
    // 3. Registrar a triagem
    triagem.registrarTriagem(novoPaciente.id, informacoesDeRisco_1.NiveisDeRisco.laranja, "Febre, dor de cabeça", "Paciente relata febre persistente e dor de cabeça intensa.");
    console.log("Triagem registrada");
    triagem.registrarTriagem(novoPaciente.id, informacoesDeRisco_1.NiveisDeRisco.azul, "Febre, dor de cabeça", "Paciente relata febre persistente e dor de cabeça intensa.");
    console.log("Triagem registrada");
    // 4. Inserir na fila de espera correspondente
    triagem.porNaFilaDeEspera(novoPaciente.id, informacoesDeRisco_1.NiveisDeRisco.laranja, controle);
    triagem.porNaFilaDeEspera(paciente.id, informacoesDeRisco_1.NiveisDeRisco.azul, controle);
    console.log("Paciente colocado na fila de espera");
}
catch (erro) {
    console.error("Erro durante o processo:", erro);
}
//console.log(controle.proximo());
// Mostrar o conteúdo atual das filas
controle.mostrarFilas();
for (const heap of controle.heaps) {
    console.log(heap.peek());
}
console.log(controle.proximo());
console.log(controle.proximo());
