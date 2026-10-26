function leerConfiguracionEntorno(entorno = process.env) {
  const port = entorno.PORT === undefined ? 3000 : Number(entorno.PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un número entero entre 1 y 65535.");
  }

  const nodeEnv = entorno.NODE_ENV || "development";

  return {
    port,
    nodeEnv,
    formatoMorgan: nodeEnv === "production" ? "combined" : "dev",
    mongodbUri: entorno.MONGODB_URI,
  };
}

module.exports = { leerConfiguracionEntorno };
