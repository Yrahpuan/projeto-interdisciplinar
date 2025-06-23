"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const Cadastro_1 = require("./Cadastro");
const ControleDePrioridade_1 = require("./ControleDePrioridade");
const utils_1 = require("./utils");
const wrapper_1 = require("./wrapper");
const app = (0, express_1.default)();
const PORT = 3001;
const publicDir = path_1.default.join(__dirname, '../public');
app.use(body_parser_1.default.json());
app.use(express_1.default.static(publicDir));
// Carregar ou iniciar dados
/*let pacientes: ModeloPaciente[] = [];
let triagens: ModeloDeDadosDaTriagem[] = [];*/
//const controle = new ControleDePrioridade();
const cadastro = new Cadastro_1.Cadastro();
const pacientesPath = path_1.default.join('./databases/registroDePacientes.json');
const triagensPath = path_1.default.join('./databases/registroDeTriagens.json');
// Carregar pacientes do arquivo
/*if (fs.existsSync(pacientesPath)) {
  pacientes = JSON.parse(fs.readFileSync(pacientesPath, 'utf-8'));
}*/
// Carregar triagens do arquivo
/*if (fs.existsSync(triagensPath)) {
  triagens = JSON.parse(fs.readFileSync(triagensPath, 'utf-8'));
  /*triagens.forEach((t) => controle.adicionar({
    id: t.id,
    triagensFeitas: []
  }));*/
/*}*/
app.use(body_parser_1.default.json());
app.post('/login', (req, res) => {
    const db = new wrapper_1.DatabaseWrapper('./databases/db.db');
    const { username, password } = req.body;
    const usuario = db.get('SELECT * FROM login WHERE username = ? AND password = ?', username, password);
    if (usuario) {
        let destino = '';
        if (usuario.position === 'administrador') {
            destino = '/menu-administrador.html';
        }
        else if (usuario.position === 'medico') {
            destino = '/fila.html';
        }
        else if (usuario.position === 'medico/triador') {
            destino = '/menu-medicoetriador.html';
        }
        else if (usuario.position === 'recepcionista') {
            destino = '/menu-recepcionista.html';
        }
        else {
            res.status(401).json({ sucesso: false, mensagem: 'função para o cargo não implementada' });
        }
        res.json({ sucesso: true, mensagem: 'Login bem-sucedido', cpf: usuario.cpf, destino });
    }
    else {
        res.status(401).json({ sucesso: false, mensagem: 'Usuário ou senha inválidos' });
    }
});
app.post('/cadastrar-funcionario', (req, res) => {
    const { nome, cpf, data_nasc, username, password, cargo, crm, isTriador } = req.body;
    console.log(req.body);
    const db = new wrapper_1.DatabaseWrapper('./databases/db.db');
    try {
        const repetido = [
            db.get("select * from recepcionista where cpf = ?", [cpf]),
            db.get("select * from medico where cpf = ?", [cpf]),
            db.get("select * from administrador where cpf = ?", [cpf])
        ];
        console.log(repetido);
        let r = false;
        for (const _ of repetido) {
            if (_ !== undefined) {
                r = true;
            }
        }
        let onze = false;
        if (cpf.length === 11) {
            onze = true;
        }
        if (!r && onze) {
            // Inserir na tabela de funcionários
            if (cargo.toLowerCase() === "medico") {
                db.run(`
          INSERT INTO ${cargo} (nome, cpf, data_nasc, crm)
          VALUES (?, ?, ?, ?)
        `, nome, cpf, data_nasc, crm);
                db.run(`
          INSERT INTO login (cpf, username, password, position)
          VALUES (?, ?, ?, ?)
          `, cpf, username, password, cargo);
                if (isTriador) {
                    const medico = db.get("select id from medico where cpf = ?", cpf);
                    db.run("insert into triador (medico_id) values (?)", [medico.id]);
                    db.run(`update login set position = ? where cpf = ?`, ["medico/triador", cpf]);
                }
            }
            else {
                db.run(`
          INSERT INTO ${cargo} (nome, cpf, data_nasc)
          VALUES (?, ?, ?)
        `, nome, cpf, data_nasc);
                // Inserir na tabela de login
                db.run(`
          INSERT INTO login (cpf, username, password, position)
          VALUES (?, ?, ?, ?)
          `, cpf, username, password, cargo);
            }
            res.status(201).json({ message: 'Funcionário cadastrado com sucesso.' });
        }
        else {
            if (r) {
                res.status(500).json(`Já há um funcionário cadastrado com o cpf ${cpf}.`);
            }
            else if (!onze) {
                res.status(500).json(`O cpf ${cpf} não possue digitos o suficiente para ser válido.`);
            }
        }
    }
    catch (error) {
        console.error('Erro ao cadastrar funcionário:', error.message);
        res.status(500).json('Erro ao cadastrar funcionário.');
    }
    db.close();
});
/*
app.put("/modificar-funcionario", (req, res) => {
  const {
    cpfAtual,
    novoNome,
    novoCpf,
    novaDataNasc,
    novoUsername,
    novaSenha,
    novoCargo,
    novoCrm,
    isTriador,
    tusername,
    tpassword
  } = req.body;

  try {
    const db = new DatabaseWrapper('./databases/db.db');
    let funcionarioLogin = db.get("select * from login where cpf = ?", [cpfAtual]);
    let atualCargo = "";
    let funcionario = db.get("SELECT * FROM recepcionista WHERE cpf = ?", [cpfAtual]);

    console.log("1", funcionario, atualCargo);

    if(funcionario) atualCargo = "recepcionista";

    if(!funcionario){
      funcionario = db.get("SELECT * FROM medico WHERE cpf = ?", [cpfAtual]);
      console.log("2", funcionario, atualCargo);
      if(funcionario) atualCargo = "medico";
    }
    if(!funcionario){
      funcionario = db.get("SELECT * FROM administrador WHERE cpf = ?", [cpfAtual]);
      console.log("3",funcionario, atualCargo);
      if(funcionario) atualCargo = "administrador";
    }

    if (!funcionario) {
      res.status(404).json({ message: "Funcionário não encontrado." });
    }

    console.log(funcionarioLogin, funcionario);
    console.log(novoNome, funcionario.nome);
    console.log(atualCargo, funcionarioLogin.position);
    console.log(novaDataNasc, funcionario.data_nasc);
    console.log(novaSenha, funcionarioLogin.password);
    console.log(novoUsername, funcionarioLogin.username);

    // Atualiza apenas os campos enviados (mantém os antigos se em branco)
    const nome = novoNome || funcionario.nome;
    const cpf = novoCpf || funcionario.cpf;
    const dataNasc = novaDataNasc || funcionario.data_nasc;
    const username = novoUsername || funcionarioLogin.username;
    const senha = novaSenha || funcionarioLogin.password;
    const cargo = novoCargo || atualCargo;

    console.log(funcionarioLogin, funcionario);
    console.log(novoNome, funcionario.nome);
    console.log(atualCargo, cargo);
    console.log(novaDataNasc, funcionario.data_nasc);
    console.log(novaSenha, senha);
    console.log(novoUsername, username);

    if(cargo !== atualCargo){
      db.run(`delete from ${atualCargo} where cpf = ?`, [funcionario.cpf]);
      db.run(`insert into ${cargo} (nome, cpf, data_nasc) values(?,?,?)`, [nome, cpf, dataNasc]);
    }else{
      db.run(`update ${atualCargo} set nome = ?, cpf = ?, data_nasc = ?`, [nome, cpf, dataNasc]);
    }

    if(cpf !== funcionario.cpf){
      db.run("delete from login where cpf = ?", [funcionario.cpf]);
      db.run("insert into login(cpf, username, password, position) values(?,?,?,?)", [cpf, username, senha, cargo]);
    }else{
      db.run(`update login set username = ?, password = ?, position = ? where cpf = ?`, [novoUsername, novaSenha, cargo, cpf]);
    }

    db.close();

  } catch (error) {
    console.error("Erro ao modificar funcionário:", error);
    res.status(500).json({ message: "Erro ao modificar funcionário." });
  }

  res.json({ message: "Funcionário modificado com sucesso." });
});
*/
app.put("/modificar-funcionario", (req, res) => {
    const { cpfAtual, novoNome, novoCpf, novaDataNasc, novoUsername, novaSenha, novoCargo, novoCrm, isTriador, } = req.body;
    try {
        const db = new wrapper_1.DatabaseWrapper('./databases/db.db');
        // Busca login e identifica cargo atual
        const funcionarioLogin = db.get("SELECT * FROM login WHERE cpf = ?", [cpfAtual]);
        let atualCargo = funcionarioLogin.position.split("/")[0];
        console.log(atualCargo);
        let funcionario = db.get("SELECT * FROM recepcionista WHERE cpf = ?", [cpfAtual]) ||
            db.get("SELECT * FROM medico WHERE cpf = ?", [cpfAtual]) ||
            db.get("SELECT * FROM administrador WHERE cpf = ?", [cpfAtual]);
        // Se não encontrou o funcionário
        if (!funcionario || !funcionarioLogin) {
            res.status(404).json({ message: "Funcionário não encontrado." });
        }
        const nome = novoNome || funcionario.nome;
        const cpf = novoCpf || funcionario.cpf;
        const dataNasc = novaDataNasc || funcionario.data_nasc;
        const username = novoUsername || funcionarioLogin.username;
        const senha = novaSenha || funcionarioLogin.password;
        const cargo = novoCargo || atualCargo;
        // Atualiza dados se o cargo mudou
        if (cargo !== atualCargo) {
            db.run(`DELETE FROM ${atualCargo} WHERE cpf = ?`, [cpfAtual]);
            if (cargo === "medico") {
                db.run(`INSERT INTO ${cargo} (nome, cpf, data_nasc, crm) VALUES (?, ?, ?, ?)`, [nome, cpf, dataNasc, novoCrm]);
                const medico = db.get("select id from medico where cpf = ?", cpf);
                db.run("insert into triador (medico_id) values (?)", medico.id);
            }
            else {
                db.run(`INSERT INTO ${cargo} (nome, cpf, data_nasc) VALUES (?, ?, ?)`, [nome, cpf, dataNasc]);
            }
        }
        else {
            const alterouDados = nome !== funcionario.nome ||
                cpf !== funcionario.cpf ||
                dataNasc !== funcionario.data_nasc;
            if (alterouDados) {
                if (cargo === "medico") {
                    db.run(`UPDATE ${atualCargo} SET nome = ?, cpf = ?, data_nasc = ? crm = ? WHERE cpf = ?`, [
                        nome,
                        cpf,
                        dataNasc,
                        novoCrm,
                        cpfAtual,
                    ]);
                }
                else {
                    db.run(`UPDATE ${atualCargo} SET nome = ?, cpf = ?, data_nasc = ? WHERE cpf = ?`, [
                        nome,
                        cpf,
                        dataNasc,
                        cpfAtual,
                    ]);
                }
            }
        }
        // Atualiza login se necessário
        const alterouLogin = username !== funcionarioLogin.username ||
            senha !== funcionarioLogin.password ||
            cargo !== funcionarioLogin.position ||
            cpf !== funcionarioLogin.cpf;
        if (alterouLogin) {
            if (cargo === "medico" && isTriador) {
                db.run(`UPDATE login SET cpf = ?, username = ?, password = ?, position = ? WHERE cpf = ?`, [cpf, username, senha, "medico/triador", cpfAtual]);
            }
            else {
                db.run(`UPDATE login SET cpf = ?, username = ?, password = ?, position = ? WHERE cpf = ?`, [cpf, username, senha, cargo, cpfAtual]);
            }
        }
        /*
            // Campos específicos de médico triador
            if (cargo === "medico") {
        
              const medico = db.get(`select * from ${cargo} where cpf = ?`, [cpf]);
              const tlogin = db.run("select * from login where cpf = ? and position = triador", [cpf]);
        
              db.run("insert into triador (medico_id) values (?)",[medico.id]);
        
              if(tlogin){
                db.run("update login set cpf = ?, username = ?, password = ? where cpf = ?", [
                  cpf,
                  tusername || tlogin.tusername,
                  tpassword || tlogin.tpassword,
                  medico.cpf
                ]);
              }else{
                db.run("insert into login (cpf, username, password, position) values (?,?,?,?)",[
                  cpf,
                  tusername || tlogin.tusername,
                  tpassword || tlogin.tpassword,
                  "triador"
                ]);
              }
        
              db.run(`UPDATE medico SET crm = ?, triador = ?, tusername = ?, tpassword = ? WHERE cpf = ?`, [
                novoCrm || funcionario.crm,
                isTriador ? 1 : 0,
                tusername || funcionario.tusername,
                tpassword || funcionario.tpassword,
                cpf
              ]);
            }*/
        db.close();
        res.json({ message: "Funcionário modificado com sucesso." });
    }
    catch (error) {
        console.error("Erro ao modificar funcionário:", error);
        res.status(500).json({ message: "Erro ao modificar funcionário." });
    }
});
app.delete('/excluir-funcionario', (req, res) => {
    const { cpf } = req.body;
    if (!cpf) {
        res.status(400).json({ message: "CPF é obrigatório" });
    }
    try {
        const db = new wrapper_1.DatabaseWrapper('./databases/db.db');
        // Tenta excluir de cada tabela de função
        const tabelas = ['administrador', 'medico', 'recepcionista', "triador"];
        let excluiu = false;
        //for (const tabela of tabelas) {
        const flogin = db.get(`select * from login where cpf = ?`, cpf);
        const position = flogin.position.split("/");
        if (position.length === 2) {
            db.run(`DELETE FROM ${position[1]} WHERE cpf = ?`, [cpf]);
        }
        const resultado = db.run(`DELETE FROM ${position[0]} WHERE cpf = ?`, [cpf]);
        console.log(resultado);
        if (resultado.changes > 0) {
            excluiu = true;
        }
        //}
        // Exclui do login
        db.run(`DELETE FROM login WHERE cpf = ?`, [cpf]);
        if (excluiu) {
            res.status(200).json({ message: "Funcionário excluído com sucesso" });
        }
        else {
            res.status(404).json({ message: "Funcionário não encontrado em nenhuma tabela" });
        }
        db.close();
    }
    catch (error) {
        console.error("Erro ao excluir funcionário:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});
app.post("/pesquisar-funcionarios", (req, res) => {
    const { nome } = req.body;
    if (!nome) {
        res.status(400).json({ message: "Nome é obrigatório." });
    }
    try {
        const db = new wrapper_1.DatabaseWrapper('./databases/db.db'); // ajuste conforme necessário
        const query = `
      SELECT nome, cpf, data_nasc, 'administrador' AS cargo FROM administrador WHERE nome LIKE ?
      UNION
      SELECT nome, cpf, data_nasc, 'medico' AS cargo FROM medico WHERE nome LIKE ?
      UNION
      SELECT nome, cpf, data_nasc, 'recepcionista' AS cargo FROM recepcionista WHERE nome LIKE ?;
    `;
        const funcionarios = db.all(query, [`%${nome}%`, `%${nome}%`, `%${nome}%`]);
        res.json(funcionarios);
        db.close();
    }
    catch (err) {
        console.error("Erro ao buscar funcionários:", err);
        res.status(500).json({ message: "Erro interno ao buscar funcionários." });
    }
});
app.post('/cadastrar-paciente', (req, res) => {
    const { nome, cpf, data_nasc } = req.body;
    if (!nome || !cpf || !data_nasc) {
        res.status(400).send('Dados incompletos');
    }
    try {
        const db = new wrapper_1.DatabaseWrapper("./databases/db.db");
        db.run(`INSERT INTO paciente (nome, cpf, data_nasc) VALUES (?, ?, ?)`, [nome, cpf, data_nasc]);
        res.status(201).send('Paciente cadastrado com sucesso');
        db.close();
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Erro ao cadastrar paciente');
    }
});
app.put('/modificar-paciente', (req, res) => {
    const { cpfAtual, novoNome, novaDataNasc, novoCpf } = req.body;
    /*if (!cpfAtual) {
      res.status(400).send('CPF atual é obrigatório.');
    }*/
    try {
        const db = new wrapper_1.DatabaseWrapper("./databases/db.db");
        const paciente = db.get("select * from paciente where cpf = ?", [cpfAtual]);
        console.log(paciente);
        const updateQuery = `
      UPDATE paciente 
      SET nome = ?, cpf = ?, data_nasc = ? 
      WHERE cpf = ?;
    `;
        const params = [
            novoNome || paciente.nome,
            novoCpf || paciente.cpf,
            novaDataNasc || paciente.data_nasc,
            cpfAtual
        ];
        const result = db.run(updateQuery, params);
        console.log(result);
        if (result.changes === 0) {
            res.status(404).json({ message: 'Paciente não encontrado.' });
        }
        else {
            res.status(200).json({ message: 'Paciente atualizado com sucesso.' });
        }
        db.close();
    }
    catch (error) {
        console.error('Erro ao modificar paciente:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar paciente.' });
    }
});
app.delete('/excluir-paciente', (req, res) => {
    const { cpf } = req.body;
    if (!cpf) {
        res.status(400).json({ message: "CPF é obrigatório" });
    }
    try {
        const db = new wrapper_1.DatabaseWrapper('./databases/db.db');
        db.run(`DELETE FROM paciente WHERE cpf = ?`, [cpf]);
        res.status(200).json({ message: "Funcionário excluído com sucesso" });
        db.close();
    }
    catch (error) {
        console.error("Erro ao excluir paciente:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});
app.post("/pesquisar-paciente", (req, res) => {
    const { nome } = req.body;
    if (!nome) {
        res.status(400).json({ message: "Nome é obrigatório." });
    }
    try {
        const db = new wrapper_1.DatabaseWrapper('./databases/db.db'); // ajuste conforme necessário
        const query = `SELECT nome, cpf, data_nasc FROM paciente WHERE nome LIKE ?`;
        const paciente = db.all(query, [`%${nome}%`]);
        res.json(paciente);
        db.close();
    }
    catch (err) {
        console.error("Erro ao buscar pacientes:", err);
        res.status(500).json({ message: "Erro interno ao buscar pacientes." });
    }
});
app.post('/triagem-marcar', (req, res) => {
    const { cpf } = req.body;
    const db = new wrapper_1.DatabaseWrapper("./databases/db.db");
    if (!cpf) {
        res.status(400).json({ error: "CPF é obrigatório." });
    }
    try {
        // 1. Buscar o paciente pelo CPF
        const paciente = db.get('SELECT id FROM paciente WHERE cpf = ?', cpf);
        console.log(paciente);
        if (!paciente) {
            res.status(404).json({ error: "Paciente não encontrado." });
        }
        // 2. Verificar se o paciente já está na fila
        const jaNaFila = db.get('SELECT id FROM fila_para_triagem WHERE paciente_id = ?', paciente.id);
        if (jaNaFila) {
            res.status(409).json({ error: "Paciente já está na fila de triagem." });
        }
        // 3. Inserir na fila de triagem
        if (paciente && !jaNaFila) {
            db.run('INSERT INTO fila_para_triagem (paciente_id) VALUES (?)', paciente.id);
            res.status(200).json({ message: "Triagem marcada com sucesso." });
        }
        db.close();
    }
    catch (error) {
        console.error("Erro ao marcar triagem:", error);
        res.status(500).json({ error: "Erro interno ao marcar triagem." });
    }
});
app.post('/triagem', (req, res) => {
    try {
        const { cpf, risco, sintomas, descricao } = req.body;
        console.log("cpf", cpf);
        const db = new wrapper_1.DatabaseWrapper("./databases/db.db");
        // 1. Buscar paciente pelo CPF
        const paciente = db.get('SELECT id FROM paciente WHERE cpf = ?', cpf);
        console.log("pacienteId", paciente.id);
        if (!paciente.id) {
            res.status(404).json({ error: 'Paciente não encontrado' });
        }
        const filaParaTriagem = db.all("select paciente_id from fila_para_triagem");
        const filaDePrioridade = db.all("select paciente_id from fila_de_prioridade");
        console.log("fila", filaParaTriagem);
        console.log("fila2", filaDePrioridade);
        let estaNaFilaDaTriagem = false;
        for (const pac of filaParaTriagem) {
            if (pac.paciente_id === paciente.id) {
                estaNaFilaDaTriagem = true;
                break;
            }
        }
        let estaNaFilaDePrioridade = false;
        for (const pac of filaDePrioridade) {
            if (pac.paciente_id === paciente.id) {
                estaNaFilaDePrioridade = true;
                break;
            }
        }
        console.log("decisão", estaNaFilaDaTriagem);
        console.log("decisão2", estaNaFilaDePrioridade);
        if (!estaNaFilaDaTriagem) {
            res.status(404).json({ error: 'Paciente não está na fila para triagem' });
        }
        if (estaNaFilaDePrioridade) {
            res.status(404).json({ error: 'Paciente já está na fila para o atendimento médico' });
        }
        // 2. Buscar ID do risco (classificacao_de_risco) pela string
        const riscoId = db.get('SELECT id FROM classificacao_de_risco WHERE id = ?', parseInt(risco));
        console.log("riscoId", riscoId);
        if (!riscoId) {
            res.status(400).json({ error: 'Risco inválido' });
        }
        const dataAtual = new Date().toISOString();
        if ( /*riscoId && */estaNaFilaDaTriagem && !estaNaFilaDePrioridade) {
            // 3. Inserir dados na tabela de triagem
            db.run(`INSERT INTO triagem (paciente_id, risco_id, sintomas, descricao, data_da_triagem)
         VALUES (?, ?, ?, ?, ?)`, [paciente.id,
                risco,
                sintomas,
                descricao,
                dataAtual]);
            db.run("delete from fila_para_triagem where paciente_id = ?", [paciente.id]);
            const quantSenhas = db.get("select * from senhas where risco_id = ?", [parseInt(risco)]);
            console.log("qs", quantSenhas);
            const riscoNome = db.get('SELECT descricao FROM classificacao_de_risco WHERE id = ?', parseInt(risco));
            if (quantSenhas.contador < 1000) {
                quantSenhas.contador += 1;
            }
            else {
                quantSenhas.contador = 0;
            }
            console.log("qs.contador", quantSenhas.contador);
            const senha = `${riscoNome.descricao[0]}${quantSenhas.contador}`;
            db.run("insert into fila_de_prioridade (paciente_id, senha, risco_id, data_de_chegada) values (?,?,?,?)", [
                paciente.id,
                senha,
                risco,
                dataAtual
            ]);
            db.run("update senhas set contador = ? where risco_id = ?", [quantSenhas.contador, parseInt(risco)]);
            res.status(200).json({ message: "Triagem salva com sucesso." });
        }
        db.close();
    }
    catch (error) {
        console.error('Erro ao registrar triagem:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
app.get('/fila', (req, res) => {
    const db = new wrapper_1.DatabaseWrapper("./databases/db.db");
    const controle = new ControleDePrioridade_1.ControleDePrioridade();
    const filaDoBd = db.all("select * from fila_de_prioridade");
    for (let i = 0; i < filaDoBd.length; i++) {
        const risco = db.get("select * from classificacao_de_risco where id = ?", filaDoBd[i].risco_id);
        const paciente = db.get("select * from paciente where id = ?", filaDoBd[i].paciente_id);
        console.log("modelo da fila", {
            idDoPaciente: paciente.id,
            nomeDoPaciente: paciente.nome,
            senha: filaDoBd[i].senha,
            nomeDoRisco: risco.descricao,
            idDoRisco: risco.id,
            horarioDeChegada: new Date(filaDoBd[i].data_de_chegada),
            horarioMaximoDeEspera: risco.tempo_maximo_de_espera
        });
        console.log("heaps", controle.getHeaps());
        controle.getHeaps()[filaDoBd[i].risco_id - 1].insert({
            idDoPaciente: paciente.id,
            nomeDoPaciente: paciente.nome,
            senha: filaDoBd[i].senha,
            nomeDoRisco: risco.descricao,
            idDoRisco: risco.id,
            horarioDeChegada: new Date(filaDoBd[i].data_de_chegada),
            horarioMaximoDeEspera: risco.tempo_maximo_de_espera
        });
    }
    db.close();
    const filas = [];
    controle.getHeaps().forEach((heap) => {
        heap.heap.forEach((paciente) => {
            filas.push(paciente);
        });
    });
    console.log(filas);
    res.json(filas);
});
app.post("/fila/proximo", (req, res) => {
    try {
        const db = new wrapper_1.DatabaseWrapper("./databases/db.db");
        const controle = new ControleDePrioridade_1.ControleDePrioridade();
        const filaDoBd = db.all("select * from fila_de_prioridade");
        for (let i = 0; i < filaDoBd.length; i++) {
            const risco = db.get("select * from classificacao_de_risco where id = ?", filaDoBd[i].risco_id);
            const paciente = db.get("select * from paciente where id = ?", filaDoBd[i].paciente_id);
            console.log("modelo da fila", {
                idDoPaciente: paciente.id,
                nomeDoPaciente: paciente.nome,
                senha: filaDoBd[i].senha,
                nomeDoRisco: risco.descricao,
                idDoRisco: risco.id,
                horarioDeChegada: new Date(filaDoBd[i].data_de_chegada),
                horarioMaximoDeEspera: risco.tempo_maximo_de_espera
            });
            console.log("heaps", controle.getHeaps());
            controle.getHeaps()[filaDoBd[i].risco_id - 1].insert({
                idDoPaciente: paciente.id,
                nomeDoPaciente: paciente.nome,
                senha: filaDoBd[i].senha,
                nomeDoRisco: risco.descricao,
                idDoRisco: risco.id,
                horarioDeChegada: new Date(filaDoBd[i].data_de_chegada),
                horarioMaximoDeEspera: risco.tempo_maximo_de_espera
            });
        }
        if (controle.temElementos()) {
            const proximo = controle.proximo();
            db.run("delete from fila_de_prioridade where paciente_id = ?", [proximo.idDoPaciente]);
            res.status(200).json(proximo);
        }
        else {
            alert("Não há pacientes na fila");
            res.status(500).json({ error: "Não há pacientes na fila" });
        }
        db.close();
    }
    catch (error) {
        console.error('Erro ao chamar o próximo paciente:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
// Endpoint para cadastrar paciente
app.post('/cadastro', (req, res) => {
    console.log("🆕 Recebendo cadastro:", req.body);
    const { nome, idade, cpf } = req.body;
    const id = cadastro.getDataBase().length + 1;
    let novoPaciente = cadastro.procurarPacientePorCpf(cpf);
    if (novoPaciente === undefined) {
        novoPaciente = cadastro.cadastrarPaciente(id, cpf, nome, idade);
    }
    if (novoPaciente) {
        //cadastro.mandarParaTriagem(novoPaciente); // ✅ ESSENCIAL
        res.json({ id });
    }
    else {
        res.status(400).json({ erro: "Paciente com esse CPF já existe" });
    }
});
app.post('/pesquisa', (req, res) => {
    const { id, cpf } = req.body;
    let pacientePorId = (0, utils_1.procurarPacientePorId)(id);
    if (pacientePorId) {
        if (id === pacientePorId.id) {
            const message = `o id: ${id} é referênte ao cadastro de ${pacientePorId.nome}`;
            res.json({ message });
        }
    }
    let pacientePorCpf = (0, utils_1.procurarPacientePorCpf)(cpf);
    if (pacientePorCpf) {
        if (cpf === pacientePorCpf.cpf) {
            const message = `o cpf: ${cpf} é referênte ao cadastro de ${pacientePorCpf.nome}`;
            res.json({ message });
        }
    }
    if (pacientePorId === undefined && pacientePorCpf === undefined) {
        res.json({ message: "Não há registro de pacientes com esses dados" });
        res.status(400).json({ erro: "não existe paciente cadastrado com esses dados" });
    }
});
/*
// Endpoint para registrar triagem
app.post('/triagem', (req, res) => {
  const { id, risco, sintomas, descricao } = req.body;
  const triagem = new Triagem();
  let nivelDeRisco = NiveisDeRisco.vermelho;
  switch(risco){
    case 1:
      nivelDeRisco = NiveisDeRisco.laranja;
      break;
    case 2:
      nivelDeRisco = NiveisDeRisco.amarelo;
      break;
    case 3:
      nivelDeRisco = NiveisDeRisco.verde;
      break;
    case 4:
      nivelDeRisco = NiveisDeRisco.azul;
      break;
  }
  triagem.registrarTriagem(id, nivelDeRisco, sintomas, descricao);
  triagem.porNaFilaDeEspera(id, nivelDeRisco, controle);
  res.json({ ok: true });
});*/
/*
app.get('/fila', (req, res) => {
  const heaps = controle.getHeaps();

  const filas: ModeloFilaDePrioridade[] = [];

  heaps.forEach(heap => {
    if(!heap.isEmpty()){
      heap.heap.forEach(paciente => {
        filas.push({
          id: paciente.id,
          senha: paciente.senha,
          risco: paciente.risco,
          horarioDeChegada: paciente.horarioDeChegada,
          horarioMaximoDeEspera: paciente.horarioMaximoDeEspera
        });
      });
    }
  });
  console.log(filas);

  res.json(filas);
});
*/
/*
// Endpoint para chamar próximo paciente
app.post('/fila/proximo', (req, res) => {
  const controle = new ControleDePrioridade();
  const proximo = controle.proximo();
  const jsonDB = fs.readFileSync(pacientesPath).toString();
  const pacienteDB: ModeloPaciente[] = JSON.parse(jsonDB);
  console.log(pacienteDB);
  if(proximo){
    pacienteDB.forEach((paciente) => {
      if(paciente.id === proximo.id){
        res.json({id: paciente.id, nome: paciente.nome});
      }
    });
  }
  console.log(proximo);
  //res.json({});
});*/
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
