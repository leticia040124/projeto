const create = (req, res) => {
    const { nome, username, email, senha } = req.body;

    if (!nome || !username || !email || !senha) {
        return res.status(400).send({
            message: "Todos os campos são obrigatórios"
        });
    }

    res.status(201).send({
        message: "Usuário criado com sucesso",
        user: {
            nome,
            username,
            email,
            senha
        }
    });
};

module.exports = {
    create
};


