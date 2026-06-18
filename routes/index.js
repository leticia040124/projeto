var express = require('express');
var router = express.Router();

const Post = require('../models/Post');
const Book = require('../models/Book');
const User = require('../models/User');

router.get('/', async function (req, res) {

  try {

    const usuarioLogado =
      req.session && req.session.usuario
        ? req.session.usuario
        : undefined;

    const posts = await Post.find()
      .populate('usuario', 'nome username fotoUrl')
      .sort({ createdAt: -1 })
      .limit(20);

    let livroAtual = null;
    let sugestoes = [];

  

if (usuarioLogado) {

  livroAtual = await Book.findOne({
    usuario: usuarioLogado.id,
    status: 'Lendo'
  });

  const usuarioCompleto = await User.findById(
    usuarioLogado.id
  );

  sugestoes = await User.find({
    _id: {
      $ne: usuarioLogado.id,
      $nin: usuarioCompleto.seguindo || []
    }
  }).limit(5);

}
    const ultimosLivros = await Book.find()
      .sort({ createdAt: -1 })
      .limit(20);

    const titulosVistos = new Set();
    const livrosEmAlta = [];

    for (const livro of ultimosLivros) {

      if (!titulosVistos.has(livro.titulo)) {
        titulosVistos.add(livro.titulo);
        livrosEmAlta.push(livro);
      }

      if (livrosEmAlta.length >= 8) {
        break;
      }

    }

    res.render('index', {
      title: 'Home',
      usuario: usuarioLogado,
      posts,
      livroAtual,
      livrosEmAlta,
      sugestoes
    });

  } catch (err) {

    console.error(err);

    res.render('index', {
      title: 'Home',
      usuario: undefined,
      posts: [],
      livroAtual: null,
      livrosEmAlta: [],
      sugestoes: []
    });

  }

});

module.exports = router;