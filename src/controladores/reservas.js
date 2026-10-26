const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];
const mongoose = require("mongoose");

function crearControladorReservas(servicioReservas) {
  return {
    salasPermitidas,
    turnosPermitidos,

    inicio(_req, res) {
      res.render("inicio", { titulo: "Inicio | Sala Abierta" });
    },

    async estado(_req, res) {
      res.json({
        servicio: "activo",
        reservas: await servicioReservas.contar(),
        solicitudId: res.locals.solicitudId,
      });
    },

    async listar(_req, res) {
      res.render("reservas/lista", {
        titulo: "Reservas | Sala Abierta",
        reservas: await servicioReservas.listar(),
      });
    },

    nueva(_req, res) {
      res.render("reservas/nueva", {
        titulo: "Nueva reserva | Sala Abierta",
        valores: {},
        error: null,
        salasPermitidas,
        turnosPermitidos,
      });
    },

    async detalle(req, res) {
      if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        return res.status(404).render("no-encontrado", {
          titulo: "Reserva no encontrada | Sala Abierta",
          mensaje: "No existe una reserva con ese número.",
        });
      }
      const reserva = await servicioReservas.buscarPorId(req.params.id);
      if (!reserva) {
        return res.status(404).render("no-encontrado", {
          titulo: "Reserva no encontrada | Sala Abierta",
          mensaje: "No existe una reserva con ese identificador.",
        });
      }
      return res.render("reservas/detalle", {
        titulo: `Reserva ${reserva.id} | Sala Abierta`,
        reserva,
      });
    },

    async crear(req, res) {
      await servicioReservas.crear(req.reservaValidada);
      return res.redirect("/reservas");
    },

    async listarApi(req, res) {
      if (req.query.sala !== undefined && typeof req.query.sala !== "string") {
        return res
          .status(400)
          .json({ error: "El parámetro sala debe aparecer una sola vez." });
      }
      const criterio =
        req.query.sala === undefined ? {} : { sala: req.query.sala };
      return res.json(await servicioReservas.listar(criterio));
    },

    async buscarApi(req, res) {
      if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        return res
          .status(400)
          .json({ error: "El identificador no es válido." });
      }
      const reserva = await servicioReservas.buscarPorId(req.params.id);
      if (!reserva) {
        return res.status(404).json({ error: "No existe esa reserva." });
      }
      return res.json(reserva);
    },

    async crearApi(req, res) {
      const reserva = await servicioReservas.crear(req.reservaValidada);
      res.location(`/api/reservas/${reserva.id}`);
      return res.status(201).json(reserva);
    },
  };
}

module.exports = { crearControladorReservas };
