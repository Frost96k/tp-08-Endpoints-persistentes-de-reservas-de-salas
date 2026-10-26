const dns = require("node:dns");
const mongoose = require("mongoose");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

function validarUriMongo(uri) {
  if (!uri) {
    const error = new Error("Falta la variable de entorno MONGODB_URI.");
    error.name = "ConfigurationError";
    error.code = "MONGODB_URI_MISSING";
    throw error;
  }

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    const error = new Error(
      "MONGODB_URI debe empezar con 'mongodb://' o 'mongodb+srv://'.",
    );
    error.name = "ConfigurationError";
    error.code = "MONGODB_URI_INVALID";
    throw error;
  }
}

function mensajeSeguro(error) {
  return error.message.replace(
    /mongodb(?:\+srv)?:\/\/[^\s"'`]*/gi,
    "[URI ocultada]",
  );
}

async function conectarBaseDatos(uri = process.env.MONGODB_URI) {
  validarUriMongo(uri);

  try {
    await mongoose.connect(uri);
    console.log("Conexión a MongoDB establecida correctamente.");
    return mongoose.connection;
  } catch (error) {
    console.error("Falló la conexión a MongoDB.");
    console.error(`Nombre del error: ${error.name}`);
    console.error(`Código DNS/driver: ${error.code || "N/A"}`);
    console.error(`Operación de resolución: ${error.operation || "N/A"}`);
    console.error(`Mensaje: ${mensajeSeguro(error)}`);
    throw error;
  }
}

async function cerrarConexionBaseDatos() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { conectarBaseDatos, cerrarConexionBaseDatos };
