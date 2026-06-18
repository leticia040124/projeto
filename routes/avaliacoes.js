const express = require("express");
const router = express.Router();

const Book = require("../models/Book");
const Post = require("../models/Post");

const { auth } = require("../middlewares/middleware");

// ========================
// TELA: AVALIAÇÕES
// ========================
router.get("/", async (req, res) => {

    if (!req.session.usuario) {
        return res.redirect("/profile");
    }

    try {

        const livros = await Book.find({
            usuario: req.session.usuario.id,
            status: "Lido"
        });

        const posts = await Post.find({
            usuario: req.session.usuario.id,
            nota: { $ne: null }
        }).sort({ createdAt: -1 });

        // Livros que ainda não foram avaliados (sem post com nota para o mesmo título)
        const livrosAvaliadosTitulos = posts.map(post => post.livro);

        const livrosParaAvaliar = livros.filter(
            livro => !livrosAvaliadosTitulos.includes(livro.titulo)
        );

        res.render("avaliacoes", {
            title: "Avaliações",
            usuario: req.session.usuario,
            livrosParaAvaliar,
            avaliacoes: posts
        });

    } catch (err) {

        console.log(err);

        res.status(500).send(
            "Erro ao carregar avaliações."
        );

    }

});

// ========================
// CRIAR AVALIAÇÃO
// ========================
router.post("/", auth, async (req, res) => {

    try {

        const {
            livro,
            autor,
            capa,
            texto,
            nota
        } = req.body;

        if (!texto || !texto.trim()) {
            return res.status(400).json({
                msg: "Escreva sua resenha."
            });
        }

        const notaNumero = Number(nota);

        if (isNaN(notaNumero) || notaNumero < 1 || notaNumero > 5) {
            return res.status(400).json({
                msg: "Selecione uma nota de 1 a 5."
            });
        }

        const novoPost = new Post({
            usuario: req.usuarioId,
            livro,
            autor,
            capa,
            texto,
            nota: notaNumero
        });

        await novoPost.save();

        // Atualiza a nota no livro da estante também
        await Book.findOneAndUpdate(
            {
                usuario: req.usuarioId,
                titulo: livro
            },
            {
                avaliacao: notaNumero
            }
        );

        res.status(201).json({
            msg: "Avaliação publicada!"
        });

    } catch (err) {

        res.status(500).json({
            erro: err.message
        });

    }

});

module.exports = router;