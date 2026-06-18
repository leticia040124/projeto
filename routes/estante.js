const express = require("express");
const router = express.Router();

const Book = require("../models/Book");

router.get("/", async (req, res) => {

    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    const livros = await Book.find({
        usuario: req.session.usuario.id
    });

    res.render("estante", {
        title: "Minha Estante",
        usuario: req.session.usuario,
        livros
    });

});

router.post("/add", async (req, res) => {

    try {

        const {
            titulo,
            autor,
            capa,
            status
        } = req.body;

        const livro = new Book({

            usuario:
                req.session.usuario.id,

            titulo,
            autor,
            capa,
            status

        });

        await livro.save();

        res.json({
            msg: "Livro adicionado!"
        });

    } catch (err) {

        res.status(500).json({
            erro: err.message
        });

    }

    
});


router.post("/:id/progresso", async (req, res) => {

    try {

        if (!req.session.usuario) {
            return res.status(401).json({
                msg: "Você precisa estar logado."
            });
        }

        const { paginaAtual, totalPaginas } = req.body;

        const livro = await Book.findOne({
            _id: req.params.id,
            usuario: req.session.usuario.id
        });

        if (!livro) {
            return res.status(404).json({
                msg: "Livro não encontrado."
            });
        }

        if (paginaAtual !== undefined) {

            const pagina = Number(paginaAtual);

            if (isNaN(pagina) || pagina < 0) {
                return res.status(400).json({
                    msg: "Página atual inválida."
                });
            }

            livro.paginaAtual = pagina;

        }

        if (totalPaginas !== undefined) {

            const total = Number(totalPaginas);

            if (isNaN(total) || total < 0) {
                return res.status(400).json({
                    msg: "Total de páginas inválido."
                });
            }

            livro.totalPaginas = total;

        }

        
        if (
            livro.totalPaginas > 0 &&
            livro.paginaAtual >= livro.totalPaginas
        ) {
            livro.status = "Lido";
        }

        await livro.save();

        res.json({
            msg: "Progresso atualizado!",
            livro
        });

    } catch (err) {

        res.status(500).json({
            erro: err.message
        });

    }

});


router.put("/:id/status", async (req, res) => {

    try {

        if (!req.session.usuario) {
            return res.status(401).json({
                msg: "Você precisa estar logado."
            });
        }

        const { status } = req.body;

        const livro = await Book.findOne({
            _id: req.params.id,
            usuario: req.session.usuario.id
        });

        if (!livro) {
            return res.status(404).json({
                msg: "Livro não encontrado."
            });
        }

        livro.status = status;

        await livro.save();

        res.json({
            msg: "Status atualizado!"
        });

    } catch (err) {

        res.status(500).json({
            erro: err.message
        });

    }

});

router.delete("/:id", async (req, res) => {
  try {

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      msg: "Livro removido!"
    });

  } catch (err) {

    res.status(500).json({
      erro: err.message
    });

  }
});

module.exports = router;
