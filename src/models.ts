export type PacientModel = {
    cpf: string;
    name: string;
    birthDate: string;
};

export type TriageDataModel = {
    id: number;
    registredTriages: {
        risk: string;
        symptoms: string;
        description: string;
        date: Date;
    }[];
};

export type PriorityQueueModel = {
    pacientId: number,
    pacientName: string;
    password: string;
    riskName: string;
    riskId: number;
    hourOfArrive: Date;
    maximumWaitingTime: number;
};