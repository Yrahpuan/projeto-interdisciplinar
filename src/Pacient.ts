import { PacientModel } from "./models";

export class Paciente {
    constructor(
        protected cpf: string,
        protected name: string,
        protected birthDate: string
    ) {}

    getCpf(): string {
        return this.cpf;
    }

    toJSON(): PacientModel {
        return {
            cpf: this.cpf,
            name: this.name,
            birthDate: this.birthDate
        };
    }

    static fromModel(model: PacientModel): Paciente {
        return new Paciente(model.cpf, model.name, model.birthDate);
    }
}
