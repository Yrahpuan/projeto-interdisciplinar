import { DatabaseWrapper } from "./wrapper";

const db = new DatabaseWrapper("./databases/db.db");

/*
db.run("delete from medico where nome = 'mayara'");
db.run("delete from recepcionista where nome = 'mayara'");
db.run("delete from administrador where nome = 'mayara'");
db.run("delete from login where username = 'mayara'");
*/

/*db.run("delete from medico where cpf = '22222222222'");
db.run("delete from login where cpf = '22222222222'");
db.run("delete from medico");
db.run("delete from triador");
/*


const a = [db.all("select * from medico"),
      db.all("select * from recepcionista"),
      db.all("select * from administrador"),
      db.all("select * from login")
    ];

console.log(a);*/

//db.run("delete from fila_de_prioridade");
//db.run("delete from triagem");
/*db.run("delete from login");
db.run("delete from triador");
db.run("delete from medico");
db.run("delete from recepcionista");
db.run("delete from administrador");

/*db.run("delete from paciente where id = 1");
console.log(db.all("select * from paciente"));*/

/*db.run("drop table triagem");

db.run("create table fila_para_triagem(id integer not null, paciente_id integer not null, foreign key(paciente_id) references paciente(id), primary key(id autoincrement));");
//db.run("create table classificacao_de_risco(id integer not null, descricao varchar(100) not null);");
db.run("create table triagem(id integer not null, paciente_id integer not null, risco_id integer not null, sintomas varchar(1000), descricao varchar(1000), data_da_triagem varchar(100), foreign key(paciente_id) references paciente(id), foreign key(risco_id) references classificacao_de_risco(id), primary key(id autoincrement));");
console.log(db.all("select * from triagem"));*/
//db.run("delete from fila_para_triagem");
/*console.log(db.all("select f.id, p.nome from fila_para_triagem f, paciente p where f.paciente_id = p.id"));*/
//db.run("alter table medico add column crm varchar(100)");
//db.run("drop table triador");
//db.run("create table triador(medico_id integer not null, primary key(medico_id))");
/*
db.run("drop table enfermeiro");
db.run("create table enfermeiro(id integer not null, nome varchar(100) not null, cpf char(11) not null, data_nasc varchar(100) not null, crm varchar(100) not null, primary key(id autoincrement));");

db.run("delete from triador");
db.run("drop table triador");
db.run("create table triador(enfermeiro_id integer not null, foreign key(enfermeiro_id) references enfermeiro(id), primary key(enfermeiro_id))")
*/
console.log(db.all("select * from enfermeiro"));
console.log(db.all("select * from medico"));
console.log(db.all("select * from triador"));
console.log(db.all("select * from administrador"));
console.log(db.all("select * from login"));
//console.log(db.get("select * from triador where medico_id = 1"));
console.log(db.all("select * from fila_para_triagem"));
console.log(db.all("select * from triagem"));
console.log(db.all("select * from classificacao_de_risco"));
//db.run("update senhas set contador = 0");
console.log(db.all("select * from senhas"));
console.log(db.all("select * from fila_de_prioridade"));

const b = "ab";

console.log(b.split("/"));

db.close();