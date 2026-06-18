const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {

    console.log("Tentando conectar...");

    await mongoose.connect(
      "mongodb+srv://lemosozorio05_db_user:EsyXCfR5p51vPTkk@cluster0.uieuamj.mongodb.net/LitFeedDB?retryWrites=true&w=majority",
      {
        serverSelectionTimeoutMS: 5000
      }
    );

    console.log("✅ Banco conectado!");

  } catch (err) {

    console.error("❌ Erro completo:");
    console.error(err);

  }
};

module.exports = connectDatabase;