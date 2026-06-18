const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    titulo: {
        type: String,
        required: true
    },

    autor: {
        type: String,
        required: true
    },

    capa: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "Quero Ler",
            "Lendo",
            "Lido"
        ],
        default: "Quero Ler"
    },

    paginaAtual: {
        type: Number,
        default: 0
    },

    totalPaginas: {
        type: Number,
        default: 0
    },

    favorito: {
        type: Boolean,
        default: false
    },

    avaliacao: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports =
    mongoose.models.Book ||
    mongoose.model("Book", BookSchema);