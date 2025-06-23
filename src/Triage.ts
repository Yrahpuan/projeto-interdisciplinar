import { databaseName } from "./utils";
import { DatabaseWrapper } from "./wrapper";

export class Triage {

    constructor() {}

    registerTriage(cpf: string, risk: string, symptoms: string, description: string) {
        
        const db = new DatabaseWrapper(databaseName);
        
        const pacient = db.get<{ id: number }>(
            'SELECT id FROM paciente WHERE cpf = ?',
          cpf
        );
        
        if (!pacient!.id) {
          return {status: 404, message: 'Paciente não encontrado' };
        }
        
        const triageQueue = db.all("select paciente_id from fila_para_triagem");
        
        const priorityQueue = db.all("select paciente_id from fila_de_prioridade");

        console.log("pacient", pacient);

        console.log("tq: ", triageQueue);
        console.log("pq: ", priorityQueue);
        
        let isOnTriageQueue = false;
        
        for(const pac of triageQueue){
          if(pac.paciente_id === pacient!.id){
            isOnTriageQueue = true;
            break;
          }
        }
        
        let isOnPriorityQueue = false;
        
        for(const pac of priorityQueue){
          if(pac.paciente_id === pacient!.id){
            isOnPriorityQueue = true;
            break;
            }
        }

        if(!isOnTriageQueue){
            return { status: 404, message: 'Paciente não está na fila para triagem' };
        }
        
        if(isOnPriorityQueue){
            return { status: 404, message: 'Paciente já está na fila para o atendimento médico' };
        }
        
        const riskId = db.get<{ id: number }>(
            'SELECT id FROM classificacao_de_risco WHERE id = ?',
            parseInt(risk)
        );
        
        if (!riskId) {
            return { status: 400, message: 'Risco inválido' };
        }
        
        const actualDate = new Date().toISOString();
        
        if(isOnTriageQueue && !isOnPriorityQueue){
            db.run(
                `INSERT INTO triagem (paciente_id, risco_id, sintomas, descricao, data_da_triagem)
                 VALUES (?, ?, ?, ?, ?)`,
                [pacient!.id,
                risk,
                symptoms,
                description,
                actualDate]
            );
        
            db.run("delete from fila_para_triagem where paciente_id = ?", [pacient!.id]);
        
            const countPasswords = db.get("select * from senhas where risco_id = ?", [parseInt(risk)]);
                
            const riskName = db.get<{ descricao: string }>(
              'SELECT descricao FROM classificacao_de_risco WHERE id = ?',
              parseInt(risk)
            );
        
            if(countPasswords.contador < 1000){
                countPasswords.contador += 1;
            }else{
                countPasswords.contador = 0;
            }

            const password = `${riskName!.descricao[0]}${countPasswords.contador}`;
            db.run("insert into fila_de_prioridade (paciente_id, senha, risco_id, data_de_chegada) values (?,?,?,?)", [
                pacient!.id,
                password,
                risk,
                actualDate
            ]);
        
            db.run("update senhas set contador = ? where risco_id = ?", [countPasswords.contador, parseInt(risk)]);
        
            return { status: 200, message: "Triagem salva com sucesso." };

            }
        
            db.close();
    }
}
