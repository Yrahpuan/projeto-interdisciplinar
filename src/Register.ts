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
    registerEmployee(name: string, cpf: string, birthDate: string, username: string, password: string, position: string, crm: string, isTriator: number){
        const db = new DatabaseWrapper(databaseName);

        console.log(
            name, cpf, birthDate, username, password, position, crm, isTriator
        );

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

        let hasSix = false;
        if(crm.length === 6){
            hasSix = true;
        }

        if(!repeat && hasEleven){

            if(position.toLowerCase() === "enfermeiro" || position.toLowerCase() === "medico"){
                db.run(`
                INSERT INTO ${position} (nome, cpf, data_nasc, crm)
                VALUES (?, ?, ?, ?)
                `, name, cpf, birthDate, crm);
                db.run(`
                INSERT INTO login (cpf, nome_de_usuario, senha, cargo)
                VALUES (?, ?, ?, ?)
                `, cpf, username, password, position);

                if(isTriator === 1){
                    const nurse = db.get("select id from enfermeiro where cpf = ?", cpf);
                    db.run("insert into triador (enfermeiro_id) values (?)", [nurse.id]);
                    db.run(`update login set cargo = ? where cpf = ?`, ["triador", cpf]);
                }
            }else{

                db.run(`
                INSERT INTO ${position} (nome, cpf, data_nasc)
                VALUES (?, ?, ?)
                `, name, cpf, birthDate);
                db.run(`
                INSERT INTO login (cpf, nome_de_usuario, senha, cargo)
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
            }else if(!hasSix){
                return {status: 500, message: `O crm ${crm} não possue digitos o suficiente para ser válido.`};
            }
        }
    }
    modifyEmployee(actualCpf: string, newName: string, newCpf: string,
        newBirthDate: string, newUsername: string, newPassword: string,
        newPosition: string, newCrm: string, isTriator: number){

        const db = new DatabaseWrapper(databaseName);

        const employeeLogin = db.get("SELECT * FROM login WHERE cpf = ?", [actualCpf]);
        let actualPosition = employeeLogin.cargo === "triador" ? "enfermeiro" : employeeLogin.cargo;
        let employee =
        db.get("SELECT * FROM recepcionista WHERE cpf = ?", [actualCpf]) ||
        db.get("SELECT * FROM medico WHERE cpf = ?", [actualCpf]) ||
        db.get("SELECT * FROM administrador WHERE cpf = ?", [actualCpf]) ||
        db.get("SELECT * FROM enfermeiro WHERE cpf = ?", [actualCpf])

        if (!employee || !employeeLogin) {
            db.close();
            return { status: 404, message: "Funcionário não encontrado." };
        }

            const name = newName !== employee.name && newName !== "" ? newName : employee.nome;
            const cpf = newCpf !== employee.cpf && newCpf !== "" ? newCpf : employee.cpf;
            const birthDate = newBirthDate !== employee.data_nasc && newBirthDate !== "" ? newBirthDate : employee.data_nasc;
            const username = newUsername !== employeeLogin.nome_de_usuario && newUsername !== "" ? newUsername : employeeLogin.nome_de_usuario;
            const password = newPassword !== employeeLogin.senha && newPassword !== "" ? newPassword : employeeLogin.senha;
            let position = newPosition !== actualPosition && newPosition !== "" ? newPosition : actualPosition;
            const crm = newCrm !== employee.crm && newCrm !== "" ? newCrm : employee.crm;

            console.log(isTriator);

            if (position !== actualPosition) {
                if(actualPosition === "enfermeiro"){
                    const nurse = db.get("select id from enfermeiro where cpf = ?", cpf);
                    db.run("delete from triador where enfermeiro_id = ?", nurse.id);
                }
                db.run(`DELETE FROM ${actualPosition} WHERE cpf = ?`, [actualCpf]);
                if(position === "enfermeiro" || position === "medico"){
                    db.run(`INSERT INTO ${position} (nome, cpf, data_nasc, crm) VALUES (?, ?, ?, ?)`, [name, cpf, birthDate, newCrm]);
                    if(isTriator === 1 && position === "enfermeiro"){
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
                
                const changedCrm = crm !== employee.crm && crm !== undefined;

                if (changedCrm) {
                    if(position === "medico" || position === "enfermeiro"){
                    db.run(`UPDATE ${position} SET nome = ?, cpf = ?, data_nasc = ?, crm = ? WHERE cpf = ?`, [
                        name,
                        cpf,
                        birthDate,
                        newCrm,
                        employee.cpf,
                    ]);
                    }
                }else{
                    db.run(`UPDATE ${position} SET nome = ?, cpf = ?, data_nasc = ? WHERE cpf = ?`, [
                        name,
                        cpf,
                        birthDate,
                        employee.cpf,
                    ]);
                }
            }

            position = position === "enfermeiro" && isTriator === 1 ? "triador" : position;

            const changedLogin =
            username !== employeeLogin.nome_de_usuario ||
            password !== employeeLogin.senha ||
            position !== employeeLogin.cargo ||
            cpf !== employeeLogin.cpf;

            console.log(changedLogin);

            if (changedLogin) {
                if(position === "triador"){
                    db.run(
                    `UPDATE login SET cpf = ?, nome_de_usuario = ?, senha = ?, cargo = ? WHERE cpf = ?`,
                    [cpf, username, password, "triador", employee.cpf]
                    );
            }else{
                db.run(
                `UPDATE login SET cpf = ?, nome_de_usuario = ?, senha = ?, cargo = ? WHERE cpf = ?`,
                [cpf, username, password, position, employee.cpf]
                );
                }
            }

            db.close();

            return { status: 200, message: "Dados do funcionário alterados com sucesso." };

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
