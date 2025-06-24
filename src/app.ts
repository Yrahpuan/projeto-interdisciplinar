import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { Register } from './Register';
import { Triage } from './Triage';
import { PriorityControl } from './PriorityControl';
import { PriorityQueueModel } from './models';
import { databaseName } from './utils';
import { DatabaseWrapper } from './wrapper';

const app = express();
const PORT = 3001;
const publicDir = path.join(__dirname, '../public');

app.use(bodyParser.json());
app.use(express.static(publicDir));

app.use(bodyParser.json());

app.post('/login', (req, res) => {

  const db = new DatabaseWrapper(databaseName);

  const { username, password } = req.body;

  const user = db.get<{ cpf: string, nome_de_usuario: string, senha: string, cargo: string }>(
    'SELECT * FROM login WHERE nome_de_usuario = ? AND senha = ?',
    username,
    password
  );

  if (user) {
    let destiny = '';
    if (user.cargo === 'administrador') {
      destiny = '/menu-administrador.html';
    } else if (user.cargo === 'medico') {
      destiny = '/fila.html';
    }else if (user.cargo === 'triador') {
      destiny = '/triagem.html';
    } else if (user.cargo === 'recepcionista') {
      destiny = '/menu-recepcionista.html';
    }else{
      res.status(401).json({ success: false, message: 'função para o cargo não implementada' });
    }
    res.json({ success: true, message: 'Login bem-sucedido', cpf: user.cpf, destino: destiny });
  } else {
    res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
  }
});

app.post('/cadastrar-funcionario', (req, res) => {
  const { nome, cpf, data_nasc, username, password, cargo, crm, isTriador } = req.body;

  console.log(req.body)

  try {

    const result = new Register().registerEmployee(nome, cpf, data_nasc, username, password, cargo, crm, isTriador);

    res.status(result!.status).json({ message: result!.message });

  } catch (error: any) {
    console.error('Erro ao cadastrar funcionário:', error.message);
    res.status(500).json('Erro ao cadastrar funcionário.');
  }
});

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
  } = req.body;

  try {
    
    const result = new Register().modifyEmployee(cpfAtual, novoNome, novoCpf, novaDataNasc,
    novoUsername, novaSenha, novoCargo, novoCrm, isTriador);

    res.status(result.status).json({ message: result.message });

  } catch (error) {
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
  
    const result = new Register().deleteEmployee(cpf);

    res.status(result.status).json({message: result.message});

  } catch (error) {
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
    
    const employees = new Register().searchEmployee(nome);

    res.json(employees);

  } catch (err) {
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

    new Register().registerPacient(nome, cpf, data_nasc);
    
    res.status(201).send('Paciente cadastrado com success');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao cadastrar paciente');
  }
});

app.put('/modificar-paciente', (req, res) => {
  const { cpfAtual, novoNome, novaDataNasc, novoCpf } = req.body;

  try {

    const { modifiedPacient, result } = new Register().modifyPacient(cpfAtual, novoNome, novaDataNasc, novoCpf);
    console.log(result);

    if (result.changes === 0) {
      res.status(404).json({ message:'Paciente não encontrado.'});
    }else{
      res.status(200).json({ message:'Paciente atualizado com success.'});
    }

  } catch (error) {
    console.error('Erro ao modificar paciente:', error);
    res.status(500).json({ message:'Erro interno ao atualizar paciente.'});
  }
});

app.delete('/excluir-paciente', (req, res) => {
  const { cpf } = req.body;

  if (!cpf) {
    res.status(400).json({ message: "CPF é obrigatório" });
  }

  try {

    const result = new Register().deletePacient(cpf);

    if(result.changes === 1){

      res.status(200).json({ message: "Paciente excluído com success" });
    
    }else{
      res.status(404).json({ message: "Paciente não encontrado" });
    }

  } catch (error) {
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

    const pacientes = new Register().searchPacient(nome);
    if(pacientes){
      res.json(pacientes);
    }else{
      res.json({message: `Não há pacientes com o nome informado: ${nome}`});
    }

  } catch (err) {
    console.error("Erro ao buscar pacientes:", err);
    res.status(500).json({ message: "Erro interno ao buscar pacientes." });
  }
});

app.post('/triagem-marcar', (req, res) => {
  const { cpf } = req.body;

  if (!cpf) {
      res.status(400).json({ error: "CPF é obrigatório." });
  }

  try {

    const result = new Register().sendToTriageQueue(cpf);

    res.status(result!.status).json(result!.message);

  } catch (error) {
    console.error("Erro ao marcar triagem:", error);
    res.status(500).json({ error: "Erro interno ao marcar triagem." });
  }
});

app.post('/triagem', (req, res) => {

  const { cpf, risco, sintomas, descricao } = req.body;

  try {
      const result = new Triage().registerTriage(cpf, risco, sintomas, descricao);

      console.log("res", result);

      res.status(result!.status).json(result!.message);

  } catch (error) {
    console.error('Erro ao registrar triagem:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.get('/fila', (req, res) => {

  const control = new PriorityControl();

  control.loadQueue();

  const queue: PriorityQueueModel[] = [];

  control.getHeaps().forEach((heap) => {
    heap.heap.forEach((pacient) => {
      queue.push(pacient);
    })
  });

  res.json(queue);
});

app.post("/fila/proximo", (req, res) => {

  try{

      const control = new PriorityControl();

      control.loadQueue();

      const result = control.callNext();

      res.status(result.status).json(result.message);
  
  } catch (error) {
    console.error('Erro ao chamar o próximo paciente:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
