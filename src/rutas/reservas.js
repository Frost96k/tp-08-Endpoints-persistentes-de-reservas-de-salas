const express = require("express");

function crearRutasReservas({
  controlador,
  prepararAreaReservas,
  validarReserva,
}) {
  const router = express.Router();

  router.use(prepararAreaReservas);
  router.get("/", controlador.listar);
  router.get("/nueva", controlador.nueva);
  router.get("/:id", controlador.detalle);
  router.post("/", validarReserva, controlador.crear);

  return router;
}

module.exports = crearRutasReservas;
