const { Reserva } = require("../modelos/reserva");

function representarReserva(reserva) {
  const documento =
    typeof reserva.toObject === "function" ? reserva.toObject() : reserva;
  return {
    id: documento._id.toString(),
    estudiante: documento.estudiante,
    email: documento.email,
    sala: documento.sala,
    fecha: documento.fecha,
    turno: documento.turno,
    personas: documento.personas,
    estado: documento.estado,
  };
}

function crearServicioReservas() {
  return {
    async listar(criterio = {}) {
      const documentos = await Reserva.find(criterio).lean();
      return documentos.map(representarReserva);
    },
    async buscarPorId(id) {
      const documento = await Reserva.findById(id).lean();
      return documento ? representarReserva(documento) : null;
    },
    async contar() {
      return Reserva.countDocuments({});
    },
    async crear(datos) {
      const camposAdmitidos = {
        estudiante: datos.estudiante,
        email: datos.email,
        sala: datos.sala,
        fecha: datos.fecha,
        turno: datos.turno,
        personas: datos.personas,
      };
      const documento = await Reserva.create(camposAdmitidos);
      return representarReserva(documento);
    },
  };
}

module.exports = { crearServicioReservas };
