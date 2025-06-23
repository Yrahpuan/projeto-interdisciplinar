"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Triagem = void 0;
const informacoesDeRisco_1 = require("./informacoesDeRisco");
const utils_1 = require("./utils");
class Triagem {
    constructor() {
        //public static readonly filaFileName = path.resolve(__dirname, "../databases/pacientesParaTriagem.json");
        //public static readonly registroTriagemFileName = path.resolve(__dirname, "../databases/registroDeTriagens.json");
        this.filaDaTriagem = [];
        //this.pacientesParaTriagem = pacientesParaTriagem;
        this.carregarFilaDaTriagem();
    }
    carregarFilaDaTriagem() {
        this.filaDaTriagem = (0, utils_1.carregarJSON)(utils_1.filaFileName);
    }
    salvarFilaDaTriagem() {
        (0, utils_1.salvarJSON)(utils_1.filaFileName, this.filaDaTriagem);
    }
    registrarTriagem(id, risco, sintomas, descricao) {
        const registros = (0, utils_1.carregarJSON)(utils_1.registroTriagemFileName);
        const registro = registros.find(t => t.id === id);
        const novaTriagem = {
            risco: informacoesDeRisco_1.NiveisDeRisco[risco],
            sintomas,
            descricao,
            data: new Date()
        };
        if (registro) {
            registro.triagensFeitas.push(novaTriagem);
        }
        else {
            registros.push({ id: id, triagensFeitas: [novaTriagem] });
        }
        (0, utils_1.salvarJSON)(utils_1.registroTriagemFileName, registros);
    }
    porNaFilaDeEspera(idDoPaciente, nomeDoPaciente, risco, controle) {
        const fila = (0, utils_1.carregarJSON)(utils_1.filaFileName);
        const heap = controle.heaps[risco];
        const senha = fila[risco] ? informacoesDeRisco_1.LimiteDeSenhas[risco - 1] + 1 : fila[risco][fila[risco].length - 1].senha + 1;
        /*const senha = heap.isEmpty()
            ? LimiteDeSenhas[risco - 1] + 1
            : heap.peek()!.senha + 1;*/
        const agora = new Date();
        const maximoDeEspera = new Date(agora.getTime() + informacoesDeRisco_1.LimiteDeTempo[risco] * 60 * 1000);
        //console.log(new Date().toLocaleString(), maximoDeEspera.toLocaleString());
        const paraFila = {
            idDoPaciente,
            nomeDoPaciente,
            senha,
            nomeDoRisco: "",
            idDoRisco: risco,
            horarioDeChegada: new Date(),
            horarioMaximoDeEspera: informacoesDeRisco_1.LimiteDeTempo[risco]
        };
        heap.insert(paraFila);
        fila[risco - 1].push(paraFila);
        (0, utils_1.salvarJSON)(utils_1.filaFileName, fila);
    }
}
exports.Triagem = Triagem;
