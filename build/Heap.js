"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinHeap = void 0;
const informacoesDeRisco_1 = require("./informacoesDeRisco");
class MinHeap {
    constructor() {
        this.heap = [];
    }
    parent(index) {
        return Math.floor((index - 1) / 2);
    }
    leftChild(index) {
        return 2 * index + 1;
    }
    rightChild(index) {
        return 2 * index + 2;
    }
    mostrarConteudo() {
        console.log("Heap:");
        this.heap.forEach((item, index) => {
            console.log(`  [${index}] ID: ${item.nomeDoPaciente}, Senha: ${item.senha}, Risco: ${item.nomeDoRisco}, Chegada: ${item.horarioDeChegada.toLocaleString()}, MaximoDeEspera: ${item.horarioMaximoDeEspera.toLocaleString()}`);
        });
    }
    tempoRestante(item) {
        const agora = new Date();
        const decorrido = (agora.getTime() - item.horarioDeChegada.getTime()) / 60000;
        return informacoesDeRisco_1.LimiteDeTempo[item.idDoRisco] - decorrido;
    }
    compare(a, b) {
        const agora = new Date();
        const decorridoA = (agora.getTime() - a.horarioDeChegada.getTime()) / 60000;
        const restanteA = a.horarioMaximoDeEspera - decorridoA;
        const decorridoB = (agora.getTime() - b.horarioDeChegada.getTime()) / 60000;
        const restanteB = b.horarioMaximoDeEspera - decorridoB;
        if (restanteA !== restanteB) {
            return restanteA - restanteB;
        }
        // Desempate: quem chegou antes
        if (a.horarioDeChegada.getTime() !== b.horarioDeChegada.getTime()) {
            return a.horarioDeChegada.getTime() - b.horarioDeChegada.getTime();
        }
        horarioDeChegada: Date;
        // Desempate final: menor número de senha
        const as = parseInt(a.senha.slice(1));
        const bs = parseInt(b.senha.slice(1));
        return as - bs;
    }
    insert(value) {
        this.heap.push(value);
        this.heapifyUp(this.heap.length - 1);
    }
    extractMin() {
        if (this.isEmpty())
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);
        return min;
    }
    peek() {
        return this.heap[0];
    }
    isEmpty() {
        return this.heap.length === 0;
    }
    heapifyUp(index) {
        while (index > 0 &&
            this.compare(this.heap[index], this.heap[this.parent(index)]) < 0) {
            this.swap(index, this.parent(index));
            index = this.parent(index);
        }
    }
    heapifyDown(index) {
        let smallest = index;
        const left = this.leftChild(index);
        const right = this.rightChild(index);
        if (left < this.heap.length &&
            this.compare(this.heap[left], this.heap[smallest]) < 0) {
            smallest = left;
        }
        if (right < this.heap.length &&
            this.compare(this.heap[right], this.heap[smallest]) < 0) {
            smallest = right;
        }
        if (smallest !== index) {
            this.swap(index, smallest);
            this.heapifyDown(smallest);
        }
    }
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
}
exports.MinHeap = MinHeap;
