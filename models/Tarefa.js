const mongoose = require("mongoose")

const tarefaSchema = new mongoose.Schema({

    titulo: {
        type: String,
        required: true,
        trim: true
    },

    descricao: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["pendente", "em_progresso", "concluida"],
        default: "pendente"
    },

    prioridade: {
        type: String,
        enum: ["baixa", "media", "alta"],
        default: "media"
    },

    categoria: {
        type: String,
        default: ""
    },

    dataVencimento: {
        type: Date
    },

    dataCriacao: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("Tarefa", tarefaSchema)