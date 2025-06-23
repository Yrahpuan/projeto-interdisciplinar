import { NiveisDeRisco, LimiteDeTempo } from "./informacoesDeRisco";
import { MinHeap } from "./Heap";
import { PriorityQueueModel } from "./models";
import { databaseName } from "./utils";
import { DatabaseWrapper } from "./wrapper";

export class PriorityControl {
  public readonly heaps: MinHeap[] = [];

  constructor() {
    const db = new DatabaseWrapper(databaseName);

    const risk = db.all("select * from classificacao_de_risco");

    for (let r = 0; r <= risk.length; r++) {
      this.heaps[r] = new MinHeap();
    }
  }

  loadQueue(): void{
      const db = new DatabaseWrapper(databaseName);
      
      const dbQueue = db.all("select * from fila_de_prioridade");
      
      for(let i = 0; i < dbQueue.length; i++){
          const risk = db.get("select * from classificacao_de_risco where id = ?", dbQueue[i].risco_id);
          const pacient = db.get("select * from paciente where id = ?", dbQueue[i].paciente_id);
          this.getHeaps()[dbQueue[i].risco_id-1].insert(
              {
                  pacientId: pacient.id as number,
                  pacientName: pacient.nome as string,
                  password: dbQueue[i].senha as string,
                  riskName: risk.descricao as string,
                  riskId: risk.id as number,
                  hourOfArrive: new Date(dbQueue[i].data_de_chegada as string),
                  maximumWaitingTime: risk.tempo_maximo_de_espera as number
              }
          );
      }

      db.close();
    
  }

  callNext(){

      const db = new DatabaseWrapper(databaseName);

      if(this.hasElements()){
          const next = this.next();
          db.run("delete from fila_de_prioridade where paciente_id = ?", [next!.pacientId]);
          db.close();
          return { status: 200, message: next!.pacientName};
      }else{
          db.close();
          return { status: 404, message: "" };
      }
  }

  add(model: PriorityQueueModel): void {
    this.heaps[model.riskId].insert(model);
  }

  next(): PriorityQueueModel | undefined {
    let candidate: PriorityQueueModel | undefined;
    let minimumRemainingTime = Infinity;

    for (const queue of this.heaps) {
      const actual = queue.peek();
      if (actual) {
        const now = new Date();
        const elapsedTime = (now.getTime() - actual.hourOfArrive.getTime()) / 60000;
        const remaining = actual.maximumWaitingTime - elapsedTime;

        if (remaining < minimumRemainingTime) {
          minimumRemainingTime = remaining;
          candidate = actual;
        }
      }
    }

    if (!candidate) return undefined;

    const next = this.heaps[candidate.riskId-1].extractMin();

    return next;
  }

  hasElements(): boolean {
    return this.heaps.some(queue => !queue.isEmpty());
  }

  getHeaps(){
    return this.heaps;
  }
  
}
