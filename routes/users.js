const express = require("express");
const router = express.Router();

const User = require("../models/User");


router.post("/:id/seguir", async (req, res) => {

  try {

    if (!req.session.usuario) {

      return res.status(401).json({
        msg: "Faça login para seguir usuários."
      });

    }

    const meuId =
      req.session.usuario.id;

    const outroId =
      req.params.id;

    if (meuId === outroId) {

      return res.status(400).json({
        msg: "Você não pode seguir a si mesmo."
      });

    }

    const eu =
      await User.findById(meuId);

    const outro =
      await User.findById(outroId);

    if (!eu || !outro) {

      return res.status(404).json({
        msg: "Usuário não encontrado."
      });

    }

    if (eu.seguindo.includes(outroId)) {

      return res.status(400).json({
        msg: "Você já segue esse usuário."
      });

    }

    eu.seguindo.push(outroId);
    outro.seguidores.push(meuId);

    await eu.save();
    await outro.save();

    res.json({
      msg: "Agora você está seguindo este usuário!"
    });

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      msg: "Erro ao seguir usuário."
    });

  }

});

module.exports = router;