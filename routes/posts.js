const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const Book = require("../models/Book");

const { auth } = require("../middlewares/middleware");

// ========================
// TELA: COMUNIDADE
// ========================
router.get("/comunidade", async (req, res) => {

    if (!req.session.usuario) {
        return res.redirect("/profile");
    }

    try {

        const posts = await Post.find()
            .populate("usuario", "nome username fotoUrl")
            .sort({ createdAt: -1 });

        const livros = await Book.find({
            usuario: req.session.usuario.id
        });

        res.render("comunidade", {
            title: "Comunidade",
            usuario: req.session.usuario,
            posts,
            livros
        });

    } catch (err) {

        console.log(err);

        res.status(500).send(
            "Erro ao carregar comunidade."
        );

    }

});

// ========================
// TELA: CRIAR POST
// ========================
router.get("/novo", async (req, res) => {

    if (!req.session.usuario) {
        return res.redirect("/profile");
    }

    try {

        const livros = await Book.find({
            usuario: req.session.usuario.id
        });

        const livroAtual = livros.find(
            livro => livro.status === "Lendo"
        );

        res.render("novo-post", {
            title: "Criar Post",
            usuario: req.session.usuario,
            livros,
            livroAtual
        });

    } catch (err) {

        console.log(err);

        res.status(500).send(
            "Erro ao carregar tela de criação de post."
        );

    }

});

// ========================
// CRIAR POST
// ========================
router.post("/", auth, async (req, res) => {

    try {

        const {
            livro,
            autor,
            capa,
            texto
        } = req.body;

        if (!texto || !texto.trim()) {
            return res.status(400).json({
                msg: "Escreva algo para publicar."
            });
        }

        const novoPost = new Post({
            usuario: req.usuarioId,
            livro,
            autor,
            capa,
            texto
        });

        await novoPost.save();

        res.status(201).json({
            msg: "Post criado com sucesso!"
        });

    } catch (err) {

        res.status(500).json({
            erro: err.message
        });

    }

});

// ========================
// LISTAR POSTS (API)
// ========================
router.get("/", async (req, res) => {

    try {

        const posts = await Post.find()
            .populate("usuario", "nome username fotoUrl")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (err) {

        res.status(500).json({
            erro: err.message
        });

    }

});

// ========================
// CURTIR POST
// ========================
router.post("/:id/curtir", auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                msg: "Post não encontrado"
            });
        }

        post.curtidas += 1;

        await post.save();

        res.json({
            curtidas: post.curtidas
        });

    } catch (err) {

        res.status(500).json({
            erro: err.message
        });

    }

});

// ========================
// COMENTAR POST
// ========================
router.post("/:id/comentar", auth, async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                msg: "Post não encontrado"
            });
        }

        if (!req.body.texto || !req.body.texto.trim()) {
            return res.status(400).json({
                msg: "Escreva um comentário."
            });
        }

        post.comentarios.push({
            usuario: req.session.usuario.nome,
            texto: req.body.texto
        });

        await post.save();

        res.json({
            msg: "Comentário adicionado!",
            comentarios: post.comentarios
        });

    } catch (err) {

        res.status(500).json({
            erro: err.message
        });

    }

});

module.exports = router;