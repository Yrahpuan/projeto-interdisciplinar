"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimiteDeTempo = exports.LimiteDeSenhas = exports.NiveisDeRisco = void 0;
var NiveisDeRisco;
(function (NiveisDeRisco) {
    NiveisDeRisco[NiveisDeRisco["vermelho"] = 0] = "vermelho";
    NiveisDeRisco[NiveisDeRisco["laranja"] = 1] = "laranja";
    NiveisDeRisco[NiveisDeRisco["amarelo"] = 2] = "amarelo";
    NiveisDeRisco[NiveisDeRisco["verde"] = 3] = "verde";
    NiveisDeRisco[NiveisDeRisco["azul"] = 4] = "azul";
})(NiveisDeRisco || (exports.NiveisDeRisco = NiveisDeRisco = {}));
exports.LimiteDeSenhas = [0, 999, 1999, 2999, 3999];
exports.LimiteDeTempo = [0, 10, 60, 120, 240];
