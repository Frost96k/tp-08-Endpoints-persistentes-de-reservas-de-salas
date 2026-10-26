const express = require("express");

function crearRutasApiReservas({ controlador, validarReserva }) {
  const router = express.Router();

  router.get("/", controlador.listarApi);
  router.get("/:id", controlador.buscarApi);
  router.post("/", validarReserva, controlador.crearApi);

  return router;
}

module.exports = crearRutasApiReservas;
