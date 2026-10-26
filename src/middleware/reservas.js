function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

function crearValidadorReserva({ salasPermitidas, turnosPermitidos, formato }) {
  return function validarReserva(req, res, next) {
    const cuerpo = req.body;
    const cuerpoValido =
      cuerpo !== null && typeof cuerpo === "object" && !Array.isArray(cuerpo);
    const camposTexto = ["estudiante", "email", "sala", "fecha", "turno"];
    const valores = Object.fromEntries(
      camposTexto.map((campo) => [
        campo,
        typeof cuerpo?.[campo] === "string" ? cuerpo[campo].trim() : "",
      ]),
    );
    const personasOriginal = cuerpoValido ? cuerpo.personas : undefined;
    const personasTexto =
      typeof personasOriginal === "string" ? personasOriginal.trim() : "";
    const personas =
      formato === "api"
        ? personasOriginal
        : personasTexto === ""
          ? Number.NaN
          : Number(personasTexto);
    let error = null;

    if (!cuerpoValido) {
      error = "Envía un cuerpo con los datos de la reserva.";
    } else if (
      camposTexto.some(
        (campo) => typeof cuerpo[campo] !== "string" || !valores[campo],
      )
    ) {
      error = "Completa todos los campos para continuar.";
    } else if (!valores.email.includes("@")) {
      error = "Ingresa un email que incluya @.";
    } else if (!salasPermitidas.includes(valores.sala)) {
      error = "Selecciona una sala permitida.";
    } else if (!turnosPermitidos.includes(valores.turno)) {
      error = "Selecciona un turno permitido.";
    } else if (
      (formato === "api" && typeof personasOriginal !== "number") ||
      !Number.isInteger(personas) ||
      personas < 1 ||
      personas > 6
    ) {
      error = "La cantidad debe ser un número entero entre 1 y 6.";
    }

    if (error) {
      if (formato === "api") {
        return res.status(400).json({ error });
      }
      const valoresFormulario = Object.fromEntries(
        camposTexto.map((campo) => [
          campo,
          typeof cuerpo?.[campo] === "string" ? cuerpo[campo] : "",
        ]),
      );
      valoresFormulario.personas =
        typeof personasOriginal === "string" ? personasOriginal : "";
      return res.status(400).render("reservas/nueva", {
        titulo: "Revisa tu reserva | Sala Abierta",
        valores: valoresFormulario,
        error,
        salasPermitidas,
        turnosPermitidos,
      });
    }

    req.reservaValidada = { ...valores, personas };
    return next();
  };
}

module.exports = { crearValidadorReserva, prepararAreaReservas };
