"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControleDePrioridade = void 0;
const informacoesDeRisco_1 = require("./informacoesDeRisco");
const Heap_1 = require("./Heap");
class ControleDePrioridade {
    constructor() {
        this.heaps = [];
        for (let risco = 0; risco <= 4; risco++) {
            this.heaps[risco] = new Heap_1.MinHeap();
        }
        /*const filas = carregarJSON(filaFileName);
        for(const fila of filas){
          for(let i = 0; i < fila.length - 1; i++){
            this.heaps[i].insert({
              id: fila.id,
              senha: fila.senha,
              risco: fila.risco,
              horarioDeChegada: fila.horarioDeChegada,
              horarioMaximoDeEspera: fila.horarioMaximoDeEspera
            });
          }
        }*/
    }
    adicionar(modelo) {
        this.heaps[modelo.idDoRisco].insert(modelo);
    }
    proximo() {
        //const filas = carregarJSON(filaFileName);
        let candidato;
        let menorTempoRestante = Infinity;
        for (const fila of this.heaps) {
            const atual = fila.peek();
            if (atual) {
                const agora = new Date();
                const tempoDecorrido = (agora.getTime() - atual.horarioDeChegada.getTime()) / 60000;
                const restante = atual.horarioMaximoDeEspera - tempoDecorrido;
                if (restante < menorTempoRestante) {
                    menorTempoRestante = restante;
                    candidato = atual;
                }
            }
        }
        if (!candidato)
            return undefined;
        const proximo = this.heaps[candidato.idDoRisco - 1].extractMin();
        //filas[candidato.idDoRisco - 1].shift();
        //salvarJSON(filaFileName, filas);
        return proximo;
    }
    temElementos() {
        return this.heaps.some(fila => !fila.isEmpty());
    }
    mostrarFilas() {
        console.log("\n=== FILAS DE PRIORIDADE POR RISCO ===");
        Object.entries(this.heaps).forEach(([risco, heap]) => {
            console.log(`\nFila ${informacoesDeRisco_1.NiveisDeRisco[parseInt(risco)]}:`);
            heap.mostrarConteudo();
        });
    }
    getHeaps() {
        return this.heaps;
    }
}
exports.ControleDePrioridade = ControleDePrioridade;
