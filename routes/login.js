const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("login", {
        title: "Login"
    });
});

module.exports = router;
router.post("/login", async (req, res) => {

    try {

        const email =
            req.body.email.trim();

        const senha =
            req.body.senha;

        const usuario =
            await User.findOne({
                email
            });

        if (!usuario) {
            return res.status(400).json({
                msg: "Usuário não encontrado"
            });
        }

        const senhaOk =
            await bcrypt.compare(
                senha,
                usuario.senha
            );

        console.log("Senha OK:", senhaOk);

        if (!senhaOk) {
            return res.status(400).json({
                msg: "Senha inválida"
            });
        }

        req.session.usuario = {
            id: usuario._id,
            nome: usuario.nome,
            username: usuario.username,
            email: usuario.email
        };

        req.session.save(() => {

            res.json({
                msg: "Logado com sucesso!",
                usuario:
                    req.session.usuario
            });

        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            erro: err.message
        });

    }

});
module.exports = router;