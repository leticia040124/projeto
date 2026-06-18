const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    senha: {
        type: String,
        required: true
    },

    fotoUrl: {
        type: String,
        default: ""
    },

   seguidores: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    default: []
},

seguindo: {
    type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    default: []
}
}, {
    timestamps: true
});

module.exports =
    mongoose.models.User ||
    mongoose.model("User", UserSchema);