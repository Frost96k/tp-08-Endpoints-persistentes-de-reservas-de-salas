const path = require("node:path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const { crearControladorReservas } = require("./controladores/reservas");
const {
  crearValidadorReserva,
  prepararAreaReservas,
} = require("./middleware/reservas");
const { crearMiddlewareSolicitudes } = require("./middleware/solicitudes");
const crearRutasAplicacion = require("./rutas");
const crearRutasReservas = require("./rutas/reservas");
const crearRutasApiReservas = require("./rutas/api-reservas");

function crearAplicacion({ servicioReservas, configuracion }) {
  const app = express();
  const controlador = crearControladorReservas(servicioReservas);
  const opcionesValidador = {
    salasPermitidas: controlador.salasPermitidas,
    turnosPermitidos: controlador.turnosPermitidos,
  };
  const validarReservaHtml = crearValidadorReserva({
    ...opcionesValidador,
    formato: "html",
  });
  const validarReservaApi = crearValidadorReserva({
    ...opcionesValidador,
    formato: "api",
  });

  app.set("views", path.join(__dirname, "..", "views"));
  app.set("view engine", "ejs");
  app.use(morgan(configuracion.formatoMorgan));

  const { identificarSolicitud, medirDuracion } = crearMiddlewareSolicitudes();
  app.use(identificarSolicitud);
  app.use(medirDuracion);

  app.use(expressLayouts);
  app.set("layout", "layouts/main");
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    "/api/reservas",
    crearRutasApiReservas({ controlador, validarReserva: validarReservaApi }),
  );
  app.use("/", crearRutasAplicacion(controlador));
  app.use(
    "/reservas",
    crearRutasReservas({
      controlador,
      prepararAreaReservas,
      validarReserva: validarReservaHtml,
    }),
  );

  app.use((req, res) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "La ruta solicitada no existe." });
    }
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada | Sala Abierta",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }
    const esApi = req.path === "/api" || req.path.startsWith("/api/");
    const esErrorDeEntrada =
      error.type === "entity.parse.failed" ||
      error.name === "ValidationError" ||
      error.name === "CastError";

    if (esErrorDeEntrada) {
      if (esApi) {
        return res
          .status(400)
          .json({ error: "La solicitud contiene datos inválidos." });
      }
      return res.status(400).send("La solicitud contiene datos inválidos.");
    }

    console.error(
      `Error interno al atender ${req.method} ${req.path}: ${error.name || "Error"}.`,
    );
    if (esApi) {
      return res.status(500).json({ error: "Ocurrió un error interno." });
    }
    return res.status(500).send("Ocurrió un error interno.");
  });

  return app;
}

module.exports = { crearAplicacion };
