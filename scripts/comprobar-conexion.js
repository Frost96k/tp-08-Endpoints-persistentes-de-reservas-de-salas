const {
  conectarBaseDatos,
  cerrarConexionBaseDatos,
} = require("../src/config/base-datos");

async function comprobarConexion() {
  try {
    await conectarBaseDatos();
    console.log("La conexión a MongoDB quedó lista para usar.");
    return 0;
  } catch (error) {
    console.error(`Verificación fallida: ${error.name}.`);
    if (error.name === "ConfigurationError") {
      console.error(error.message);
    }
    return 1;
  } finally {
    await cerrarConexionBaseDatos();
  }
}

comprobarConexion()
  .then((codigoSalida) => {
    process.exitCode = codigoSalida;
  })
  .catch((error) => {
    console.error(`Error inesperado al comprobar la conexión: ${error.name}.`);
    process.exitCode = 1;
  });
