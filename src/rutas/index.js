const express = require("express");

function crearRutasAplicacion(controlador) {
  const router = express.Router();

  router.get("/", controlador.inicio);
  router.get("/estado", controlador.estado);

  return router;
}

module.exports = crearRutasAplicacion;
