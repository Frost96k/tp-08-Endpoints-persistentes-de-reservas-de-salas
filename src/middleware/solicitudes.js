function crearMiddlewareSolicitudes() {
  let siguienteSolicitud = 1;

  function identificarSolicitud(req, res, next) {
    const numeroSolicitud = String(siguienteSolicitud).padStart(4, "0");
    res.locals.solicitudId = `BIB-${numeroSolicitud}`;
    siguienteSolicitud += 1;
    next();
  }

  function medirDuracion(req, res, next) {
    const inicio = process.hrtime.bigint();
    res.on("finish", () => {
      const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6;
      console.log(
        `[${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ${res.statusCode} ` +
          `${duracionMs.toFixed(2)} ms`,
      );
    });
    next();
  }

  return { identificarSolicitud, medirDuracion };
}

module.exports = { crearMiddlewareSolicitudes };
