import { PriorityQueueModel } from "./models";

export class MinHeap {
  readonly heap: PriorityQueueModel[] = [];

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }
  
  public showContent(): void {
    console.log("Heap:");
    this.heap.forEach((item, index) => {
      console.log(
        `  [${index}] ID: ${item.pacientName}, password: ${item.password}, Risco: ${item.riskName}, Chegada: ${item.hourOfArrive.toLocaleString()}, MaximoDeEspera: ${new Date(item.maximumWaitingTime).toLocaleString()}`
      );
    });
  }
  
  private remainingTime(item: PriorityQueueModel): number {
    const agora = new Date();
    const decorrido = (agora.getTime() - item.hourOfArrive.getTime()) / 60000;
    return item.maximumWaitingTime - decorrido;
  }

  private compare(a: PriorityQueueModel, b: PriorityQueueModel): number {
    const agora = new Date();
  
    const decorridoA = (agora.getTime() - a.hourOfArrive.getTime()) / 60000;
    const restanteA = a.maximumWaitingTime - decorridoA;
  
    const decorridoB = (agora.getTime() - b.hourOfArrive.getTime()) / 60000;
    const restanteB = b.maximumWaitingTime - decorridoB;
  
    if (restanteA !== restanteB) {
      return restanteA - restanteB;
    }
    if (a.hourOfArrive.getTime() !== b.hourOfArrive.getTime()) {
      return a.hourOfArrive.getTime() - b.hourOfArrive.getTime();
    }

    const as = parseInt(a.password.slice(1));
    const bs = parseInt(b.password.slice(1));
    return as - bs;
  }  

  insert(value: PriorityQueueModel): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  extractMin(): PriorityQueueModel | undefined {
    if (this.isEmpty()) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return min;
  }

  peek(): PriorityQueueModel | undefined {
    return this.heap[0];
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private heapifyUp(index: number): void {
    while (
      index > 0 &&
      this.compare(this.heap[index], this.heap[this.parent(index)]) < 0
    ) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  private heapifyDown(index: number): void {
    let smallest = index;
    const left = this.leftChild(index);
    const right = this.rightChild(index);

    if (
      left < this.heap.length &&
      this.compare(this.heap[left], this.heap[smallest]) < 0
    ) {
      smallest = left;
    }

    if (
      right < this.heap.length &&
      this.compare(this.heap[right], this.heap[smallest]) < 0
    ) {
      smallest = right;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
