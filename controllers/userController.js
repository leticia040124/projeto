const User = require("../models/User");

const dominiosBloqueados = [
    'mailinator.com', '10minutemail.com', 'yopmail.com', 'sharklasers.com', 
    'guerrillamail.com', 'dispostable.com', 'getairmail.com', 'tempmail.com',
    'boun.cr', 'trashmail.com', 'maildrop.cc', 'temp-mail.org'
];

const create = async (req, res) => {
    try {
        const { nome, username, email, senha } = req.body;

        
        if (!nome || !username || !email || !senha) {
            return res.status(400).send({
                msg: "Todos os campos são obrigatórios"
            });
        }

        
        if (senha.length < 6) {
            return res.status(400).send({
                msg: "A senha deve ter no mínimo 6 caracteres"
            });
        }

        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({
                msg: "Por favor, insira um e-mail válido"
            });
        }

        
        const dominioEmail = email.split('@')[1].toLowerCase();
        if (dominiosBloqueados.includes(dominioEmail)) {
            return res.status(400).send({
                msg: "Provedor de e-mail não permitido. Por favor, use um e-mail real (como Gmail, Outlook, etc.)."
            });
        }
        
        const usernameExists = await User.findOne({ username: username });
        if (usernameExists) {
            return res.status(400).send({
                msg: "Este nome de usuário já está em uso"
            });
        }

       
        const emailExists = await User.findOne({ email: email });
        if (emailExists) {
            return res.status(400).send({
                msg: "Este e-mail já está cadastrado"
            });
        }

        
        const newUser = await User.create({
            nome,
            username,
            email,
            senha
        });

        res.status(201).send({
            msg: "Usuário criado com sucesso!",
            user: newUser
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            msg: "Erro interno ao criar usuário"
        });
    }
};

module.exports = {
    create
};