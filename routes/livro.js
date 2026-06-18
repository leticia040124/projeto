const express = require("express");
const router = express.Router();

const Post = require("../models/Post");



router.get("/:id", async (req, res) => {

    try {

        const olid = req.params.id;

        const resposta = await fetch(
            `https://openlibrary.org/works/${olid}.json`
        );

        if (!resposta.ok) {

            return res.status(404).render("livro", {
                title: "Livro não encontrado",
                usuario: req.session.usuario || null,
                livro: null,
                avaliacoes: [],
                mediaNota: 0
            });

        }

        const dados = await resposta.json();

        const titulo = dados.title || "Sem título";

        let autor = "Autor desconhecido";

        if (dados.authors && dados.authors.length > 0) {

            try {

                const authorKey = dados.authors[0].author.key;

                const respostaAutor = await fetch(
                    `https://openlibrary.org${authorKey}.json`
                );

                if (respostaAutor.ok) {

                    const dadosAutor = await respostaAutor.json();
                    autor = dadosAutor.name || autor;

                }

            } catch (erroAutor) {

                console.log("Erro ao buscar autor:", erroAutor.message);

            }

        }

        const capa = dados.covers && dados.covers.length > 0
            ? `https://covers.openlibrary.org/b/id/${dados.covers[0]}-L.jpg`
            : "https://via.placeholder.com/220x320?text=Sem+Capa";

        let sinopse = "Sinopse não disponível.";

        if (dados.description) {

            sinopse = typeof dados.description === "string"
                ? dados.description
                : dados.description.value || sinopse;

        }

        const livro = {
            id: olid,
            titulo,
            autor,
            capa,
            sinopse
        };

        
        const avaliacoes = await Post.find({
            livro: titulo,
            nota: { $ne: null }
        })
            .populate("usuario", "nome username fotoUrl")
            .sort({ createdAt: -1 });

        let mediaNota = 0;

        if (avaliacoes.length > 0) {

            const soma = avaliacoes.reduce(
                (total, post) => total + post.nota,
                0
            );

            mediaNota = Math.round((soma / avaliacoes.length) * 10) / 10;

        }

        res.render("livro", {
            title: titulo,
            usuario: req.session.usuario || null,
            livro,
            avaliacoes,
            mediaNota
        });

    } catch (err) {

        console.log(err);

        res.status(500).send(
            "Erro ao carregar página do livro."
        );

    }

});

module.exports = router;