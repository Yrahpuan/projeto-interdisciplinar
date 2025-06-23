import { databaseName } from "./utils";
import { DatabaseWrapper } from "./wrapper";

const db = new DatabaseWrapper(databaseName);

db.run("delete from recepcionista");
db.run("drop table recepcionista");
db.run("CREATE TABLE recepcionista(id integer not null, nome varchar(100) not null, cpf char(11) not null, data_nasc varchar(100) not null, primary key(id autoincrement))");

db.run("delete from administrador");
db.run("drop table administrador");
db.run("CREATE TABLE administrador( id integer not null, nome varchar(100) not null, cpf char(11) not null, data_nasc varchar(100) not null, primary key(id autoincrement))");

db.run("delete from enfermeiro");
db.run("drop table enfermeiro");
db.run("CREATE TABLE enfermeiro(id integer not null, nome varchar(100) not null, cpf char(11) not null, data_nasc varchar(100) not null, crm varchar(100) not null, primary key(id autoincrement))");

db.run("delete from triador");
db.run("drop table triador");
db.run("CREATE TABLE triador(enfermeiro_id integer not null, foreign key(enfermeiro_id) references enfermeiro(id), primary key(enfermeiro_id))");

db.run("delete from medico");
db.run("drop table medico");
db.run("CREATE TABLE medico(id integer not null, nome varchar(100) not null, cpf varchar(11) not null, data_nasc varchar(100) not null, crm varchar(100) not null, primary key(id autoincrement))");

db.run("delete from paciente");
db.run("drop table paciente");
db.run("CREATE TABLE paciente(id integer not null, cpf char(11) not null, nome varchar(100) not null, data_nasc varchar(100) not null, primary key(id autoincrement))");

db.run("delete from fila_para_triagem");
db.run("drop table fila_para_triagem");
db.run("CREATE TABLE fila_para_triagem(id integer not null, paciente_id integer not null, foreign key(paciente_id) references paciente(id), primary key(id autoincrement))");

db.run("delete from triagem");
db.run("drop table triagem");
db.run("CREATE TABLE triagem(id integer not null, paciente_id integer not null, risco_id integer not null, sintomas varchar(1000), descricao varchar(1000), data_da_triagem varchar(100) not null, foreign key(paciente_id) references paciente(id), foreign key(risco_id) references classificacao_de_risco(id), primary key(id autoincrement))");

db.run("delete from fila_de_prioridade");
db.run("drop table fila_de_prioridade");
db.run("CREATE TABLE fila_de_prioridade(paciente_id integer not null, senha varchar(1000) not null, risco_id integer not null, data_de_chegada varchar(100) not null, foreign key(paciente_id) references paciente(id), foreign key(risco_id) references classificacao_de_risco(id), primary key(paciente_id))");

db.run("delete from fila_de_prioridade");
db.run("drop table fila_de_prioridade");
db.run("CREATE TABLE senhas(risco_id integer not null, contador integer not null, foreign key(risco_id) references classificacao_de_risco(id), primary key (risco_id))");

db.run("delete from login");
db.run("drop table login");
db.run("CREATE TABLE login(cpf char(11) not null, username varchar(100) not null, password varchar(100) not null, position varchar(100) not null, primary key(cpf));");

