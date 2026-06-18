const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    livro: {
        type: String,
        default: ""
    },

    autor: {
        type: String,
        default: ""
    },

    capa: {
        type: String,
        default: ""
    },

    texto: {
        type: String,
        required: true
    },

    nota: {
        type: Number,
        min: 0,
        max: 5,
        default: null
    },

    curtidas: {
        type: Number,
        default: 0
    },

    comentarios: [
        {
            usuario: String,
            texto: String,
            criadoEm: {
                type: Date,
                default: Date.now
            }
        }
    ]

}, {
    timestamps: true
});

module.exports =
    mongoose.models.Post ||
    mongoose.model("Post", PostSchema);