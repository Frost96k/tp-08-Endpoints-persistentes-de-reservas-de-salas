const { crearAplicacion } = require("./app");
const { leerConfiguracionEntorno } = require("./config/entorno");
const {
  conectarBaseDatos,
  cerrarConexionBaseDatos,
} = require("./config/base-datos");
const { crearServicioReservas } = require("./servicios/reservas");

async function iniciarServidor() {
  const configuracion = leerConfiguracionEntorno(process.env);
  await conectarBaseDatos(configuracion.mongodbUri);

  const servicioReservas = crearServicioReservas();
  const app = crearAplicacion({ servicioReservas, configuracion });
  const servidor = app.listen(configuracion.port);

  await new Promise((resolve, reject) => {
    servidor.once("listening", resolve);
    servidor.once("error", reject);
  });

  console.log(
    `Sala Abierta disponible en http://localhost:${configuracion.port}`,
  );

  let apagado;
  async function cerrarServidor(signal) {
    if (apagado) {
      return apagado;
    }

    apagado = (async () => {
      console.log(`Señal ${signal} recibida; cerrando el servidor.`);
      await new Promise((resolve, reject) => {
        servidor.close((error) => (error ? reject(error) : resolve()));
      });
      await cerrarConexionBaseDatos();
    })();
    return apagado;
  }

  process.on("SIGINT", () => {
    cerrarServidor("SIGINT").catch((error) => {
      console.error(`No se pudo cerrar correctamente: ${error.name}.`);
      process.exitCode = 1;
    });
  });
  process.on("SIGTERM", () => {
    cerrarServidor("SIGTERM").catch((error) => {
      console.error(`No se pudo cerrar correctamente: ${error.name}.`);
      process.exitCode = 1;
    });
  });
}

iniciarServidor().catch(async (error) => {
  console.error(`No se pudo iniciar el servidor: ${error.name}.`);
  if (error.code) {
    console.error(`Código: ${error.code}`);
  }
  try {
    await cerrarConexionBaseDatos();
  } catch (errorCierre) {
    console.error(`No se pudo cerrar MongoDB: ${errorCierre.name}.`);
    process.exitCode = 1;
  }
  process.exitCode = 1;
});
