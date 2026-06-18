const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const User = require("../models/User");
const Post = require("../models/Post");
const Book = require("../models/Book");


const uploadDir = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    "avatars"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        const extensao =
            path.extname(file.originalname);

        const nomeArquivo =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;

        cb(null, nomeArquivo);

    }

});

const upload = multer({
    storage
});


router.get("/", async (req, res) => {

    try {

        if (!req.session.usuario) {

            return res.render("profile", {
                title: "Perfil",
                usuario: null,
                posts: [],
                livros: [],
                livroAtual: null,
                stats: {
                    posts: 0,
                    livros: 0,
                    curtidas: 0
                }
            });

        }

        const user = await User.findById(
            req.session.usuario.id
        );

        if (!user) {

            req.session.destroy();

            return res.render("profile", {
                title: "Perfil",
                usuario: null,
                posts: [],
                livros: [],
                livroAtual: null,
                stats: {
                    posts: 0,
                    livros: 0,
                    curtidas: 0
                }
            });

        }

        const posts = await Post.find({
            usuario: user._id
        }).sort({
            createdAt: -1
        });

        const livros = await Book.find({
            usuario: user._id
        });

        const livroAtual = livros.find(
            livro => livro.status === "Lendo"
        );

        const stats = {
            posts: posts.length,
            livros: livros.length,
            curtidas: posts.reduce(
                (total, post) =>
                    total + (post.curtidas || 0),
                0
            )
        };

        res.render("profile", {
            title: "Meu Perfil",
            usuario: user,
            posts,
            livros,
            livroAtual,
            stats
        });

    } catch (erro) {

        console.log(erro);

        res.status(500).send(
            "Erro ao carregar perfil"
        );

    }

});


router.get("/:username", async (req, res) => {

    try {

        const user = await User.findOne({
            username: req.params.username
        });

        if (!user) {
            return res.status(404).send(
                "Usuário não encontrado"
            );
        }

        const posts = await Post.find({
            usuario: user._id
        }).sort({
            createdAt: -1
        });

        const livros = await Book.find({
            usuario: user._id
        });

        const livroAtual = livros.find(
            livro => livro.status === "Lendo"
        );

        const stats = {
            posts: posts.length,
            livros: livros.length,
            curtidas: posts.reduce(
                (total, post) =>
                    total + (post.curtidas || 0),
                0
            )
        };

        res.render("profile", {
            title: user.nome,
            usuario: user,
            posts,
            livros,
            livroAtual,
            stats
        });

    } catch (erro) {

        console.log(erro);

        res.status(500).send(
            "Erro ao carregar perfil"
        );

    }

});

router.post("/:id/progresso", async (req, res) => {

    try {

        if (!req.session.usuario) {
            return res.status(401).json({
                msg: "Faça login primeiro."
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

router.post(
    "/avatar",
    upload.single("avatar"),
    async (req, res) => {

        try {

            if (!req.session.usuario) {
                return res.status(401).json({
                    msg: "Faça login primeiro."
                });
            }

            const user =
                await User.findById(
                    req.session.usuario.id
                );

            if (!user) {
                return res.status(404).json({
                    msg: "Usuário não encontrado."
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    msg: "Nenhuma imagem enviada."
                });
            }

            user.fotoUrl =
                `/uploads/avatars/${req.file.filename}`;

            await user.save();

            req.session.usuario.fotoUrl =
                user.fotoUrl;

            res.json({
                msg: "Foto atualizada!",
                fotoUrl: user.fotoUrl
            });

        } catch (erro) {

            console.log(erro);

            res.status(500).json({
                msg: "Erro ao atualizar foto."
            });

        }

    }
);


router.post("/edit", async (req, res) => {

    try {

        if (!req.session.usuario) {
            return res.status(401).json({
                msg: "Faça login primeiro."
            });
        }

        const { nome } = req.body;

        const user =
            await User.findById(
                req.session.usuario.id
            );

        if (!user) {
            return res.status(404).json({
                msg: "Usuário não encontrado."
            });
        }

        user.nome = nome;

        await user.save();

        req.session.usuario.nome = nome;

        res.json({
            msg: "Perfil atualizado!"
        });

    } catch (erro) {

        console.log(erro);

        res.status(500).json({
            msg: "Erro ao atualizar perfil."
        });

    }

});

module.exports = router;