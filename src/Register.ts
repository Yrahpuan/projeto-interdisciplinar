import { databaseName } from "./utils";
import { PacientModel } from "./models";
import { DatabaseWrapper } from "./wrapper";

export class Register {

    constructor() {}

    registerPacient(name: string, cpf: string, birthDate: string): PacientModel | undefined {
        const db = new DatabaseWrapper(databaseName);

        db.run(`INSERT INTO paciente (nome, cpf, data_nasc) VALUES (?, ?, ?)`, [name, cpf, birthDate]);

        db.close();
        return {name, cpf, birthDate};
    }
    modifyPacient(actualCpf: string, newName: string, newBirthDate: string, newCpf: string){
        const db = new DatabaseWrapper(databaseName);

        const pacient = db.get("select * from paciente where cpf = ?", [actualCpf]);

        const updateQuery = `
            UPDATE paciente 
            SET nome = ?, cpf = ?, data_nasc = ? 
            WHERE cpf = ?;
        `;
    
        const params = [
            newName || pacient.nome,
            newCpf || pacient.cpf,
            newBirthDate || pacient.data_nasc,
            actualCpf
        ];

        const result = db.run(updateQuery, params);

        const modifiedPacient = db.get("select * from paciente where cpf = ?", [actualCpf]);

        db.close();

        return {modifiedPacient, result};
    }
    deletePacient(cpf: string){
        const db = new DatabaseWrapper(databaseName);

        const result = db.run(`DELETE FROM paciente WHERE cpf = ?`, [cpf]);

        db.close();

        return result;
    }
    searchPacient(name: string){
        const db = new DatabaseWrapper(databaseName);

        const query = `SELECT nome, cpf, data_nasc FROM paciente WHERE nome LIKE ?`;

        const pacients = db.all(query, [`%${name}%`]);

        db.close();

        return pacients;
    }
    registerEmployee(name: string, cpf: string, birthDate: string, username: string, password: string, position: string, crm: string, isTriator: string){
        const db = new DatabaseWrapper(databaseName);

        const repeated = [
            db.get("select * from recepcionista where cpf = ?", [cpf]),
            db.get("select * from medico where cpf = ?", [cpf]),
            db.get("select * from administrador where cpf = ?", [cpf]),
            db.get("select * from enfermeiro where cpf = ?", [cpf])
        ];

        let repeat = false;
    
        for(const r of repeated){
            if(r !== undefined){
                repeat = true;
            }
        }

        let hasEleven = false;
        if(cpf.length === 11){
            hasEleven = true;
        }

        if(!repeat && hasEleven){

            if(position.toLowerCase() === "enfermeiro"){
                db.run(`
                INSERT INTO ${position} (nome, cpf, data_nasc, crm)
                VALUES (?, ?, ?, ?)
                `, name, cpf, birthDate, crm);
                db.run(`
                INSERT INTO login (cpf, username, password, position)
                VALUES (?, ?, ?, ?)
                `, cpf, username, password, position);

                if(isTriator){
                    const nurse = db.get("select id from enfermeiro where cpf = ?", cpf);
                    db.run("insert into triador (enfermeiro_id) values (?)", [nurse.id]);
                    db.run(`update login set position = ? where cpf = ?`, ["triador", cpf]);
                }
            }else{

                db.run(`
                INSERT INTO ${position} (nome, cpf, data_nasc)
                VALUES (?, ?, ?)
                `, name, cpf, birthDate);
                // Inserir na tabela de login
                db.run(`
                INSERT INTO login (cpf, username, password, position)
                VALUES (?, ?, ?, ?)
                `, cpf, username, password, position);
                }
        
            db.close();

            return {status: 201, message: 'Funcionário cadastrado com sucesso.'};

        }else{
            db.close();
            if(repeat){
                return {status: 500, message: `Já há um funcionário cadastrado com o cpf ${cpf}.`};
            }else if(!hasEleven){
                return {status: 500, message: `O cpf ${cpf} não possue digitos o suficiente para ser válido.`};
            }
        }
    }
    modifyEmployee(actualCpf: string, newName: string, newCpf: string,
        newBirthDate: string, newUsername: string, newPassword: string,
        newPosition: string, newCrm: string, isTriator: string){

        const db = new DatabaseWrapper(databaseName);

        const employeeLogin = db.get("SELECT * FROM login WHERE cpf = ?", [actualCpf]);
        let actualPosition = employeeLogin.position.split("/")[0];
        let employee =
        db.get("SELECT * FROM recepcionista WHERE cpf = ?", [actualCpf]) ||
        db.get("SELECT * FROM medico WHERE cpf = ?", [actualCpf]) ||
        db.get("SELECT * FROM administrador WHERE cpf = ?", [actualCpf]) ||
        db.get("SELECT * FROM enfermeiro WHERE cpf = ?", [actualCpf])

        if (!employee || !employeeLogin) {
            db.close();
            return { status: 404, message: "Funcionário não encontrado." };
        }else{

            const name = newName || employee.nome;
            const cpf = newCpf || employee.cpf;
            const birthDate = newBirthDate || employee.data_nasc;
            const username = newUsername || employeeLogin.username;
            const password = newPassword || employeeLogin.password;
            const position = newPosition || actualPosition;
            const crm = newCrm || employee.crm;

            if (position !== actualPosition) {
                db.run(`DELETE FROM ${actualPosition} WHERE cpf = ?`, [actualCpf]);
            if(position === "enfermeiro" || position === "medico"){
                db.run(`INSERT INTO ${position} (nome, cpf, data_nasc, crm) VALUES (?, ?, ?, ?)`, [name, cpf, birthDate, newCrm]);
                if(isTriator && position === "enfermeiro"){
                    const nurse = db.get("select id from enfermeiro where cpf = ?", cpf);
                    db.run("insert into triador (enfermeiro_id) values (?)", nurse.id);
                }
            }else{
                db.run(`INSERT INTO ${position} (nome, cpf, data_nasc) VALUES (?, ?, ?)`, [name, cpf, birthDate]);
            }
            } else {
                const changedData =
                    name !== employee.nome ||
                    cpf !== employee.cpf ||
                    birthDate !== employee.data_nasc;
                
                const changedCrm = crm !== employee.crm;

                if (changedData && changedCrm) {
                    if(position === "medico" || position === "enfermeiro"){
                    db.run(`UPDATE ${actualPosition} SET nome = ?, cpf = ?, data_nasc = ? crm = ? WHERE cpf = ?`, [
                        name,
                        cpf,
                        birthDate,
                        newCrm,
                        actualCpf,
                    ]);
                }else{
                    db.run(`UPDATE ${actualPosition} SET nome = ?, cpf = ?, data_nasc = ? WHERE cpf = ?`, [
                        name,
                        cpf,
                        birthDate,
                        actualCpf,
                    ]);
                    }
                }
            }

            const changedLogin =
            username !== employeeLogin.username ||
            password !== employeeLogin.password ||
            position !== employeeLogin.position ||
            cpf !== employeeLogin.cpf;

            if (changedLogin) {
                if(position === "enfermeiro" && isTriator){
                    db.run(
                    `UPDATE login SET cpf = ?, username = ?, password = ?, position = ? WHERE cpf = ?`,
                    [cpf, username, password, "triador", actualCpf]
                    );
            }else{
                db.run(
                `UPDATE login SET cpf = ?, username = ?, password = ?, position = ? WHERE cpf = ?`,
                [cpf, username, password, position, actualCpf]
                );
                }
            }

            db.close();

            return { status: 200, message: "Dados do funcionário alterados com sucesso." };
    }

    }
    deleteEmployee(cpf: string){
        const db = new DatabaseWrapper(databaseName);

        const tables = ['administrador', 'medico', 'recepcionista', "enfermeiro"];
        let deleted = false;

        for(const table of tables){

            if(table === "enfermeiro"){
                const nurse = db.get("select id from enfermeiro where cpf = ?", [cpf]);
                db.run("delete from triador where enfermeiro_id = ?", nurse.id);
            }

            const result = db.run(`DELETE FROM ${table} WHERE cpf = ?`, [cpf]);
        
            if (result.changes > 0) {
                deleted = true;
            }
        }

        db.run(`DELETE FROM login WHERE cpf = ?`, [cpf]);

        db.close();

        if (deleted) {
            return { status: 200, message: "Funcionário excluído com sucesso" };
        } else {
            return {status: 404, message: "Funcionário não encontrado em nenhuma tabela" };
        }

    }
    searchEmployee(name: string){
        const db = new DatabaseWrapper(databaseName);

        const query = `
            SELECT nome, cpf, data_nasc, 'administrador' AS cargo FROM administrador WHERE nome LIKE ?
            UNION
            SELECT nome, cpf, data_nasc, 'medico' AS cargo FROM medico WHERE nome LIKE ?
            UNION
            SELECT nome, cpf, data_nasc, 'recepcionista' AS cargo FROM recepcionista WHERE nome LIKE ?
            UNION
            SELECT nome, cpf, data_nasc, 'enfermeiro' AS cargo FROM enfermeiro WHERE nome LIKE ?;
        `;

        const employees = db.all(query, [`%${name}%`, `%${name}%`, `%${name}%`, `%${name}%`]);

        db.close();
        
        return employees;

    }
    sendToTriageQueue(cpf: string){
        
        const db = new DatabaseWrapper(databaseName);

        const pacient = db.get<{ id: number }>(
            'SELECT id FROM paciente WHERE cpf = ?',
            cpf
            );

        if (!pacient) {
            db.close();
            return { status: 404, message: "Paciente não encontrado." };
        }

        const alreadyOnQueue = db.get<{ id: number }>(
            'SELECT id FROM fila_para_triagem WHERE paciente_id = ?',
            pacient!.id
        );

        if (alreadyOnQueue) {
            db.close();
            return { status: 409, message: "Paciente já está na fila de triagem." };
        }

        if(pacient && !alreadyOnQueue){
            db.run(
                'INSERT INTO fila_para_triagem (paciente_id) VALUES (?)',
                pacient!.id
            );

            db.close();

            return {status: 200, message: "Triagem marcada com sucesso." };
        }
    }

}
