const {
  conectarBaseDatos,
  cerrarConexionBaseDatos,
} = require("../src/config/base-datos");
const { Reserva } = require("../src/modelos/reserva");

async function listarReservas() {
  try {
    await conectarBaseDatos();
    const reservas = await Reserva.find({}).lean();

    console.log(`Cantidad de reservas: ${reservas.length}`);

    if (reservas.length === 0) {
      console.log("La colección no tiene documentos.");
      return 0;
    }

    reservas.forEach((reserva) => {
      console.log(
        `- _id: ${reserva._id.toString()} | estudiante: ${reserva.estudiante} | email: ${reserva.email} | sala: ${reserva.sala} | fecha: ${reserva.fecha} | turno: ${reserva.turno} | personas: ${reserva.personas}`,
      );
    });

    return 0;
  } catch (error) {
    console.error("No se pudo consultar la colección de reservas.");
    console.error(`Tipo de problema: ${error.name}`);
    console.error(`Código: ${error.code || "N/A"}`);
    return 1;
  } finally {
    await cerrarConexionBaseDatos();
  }
}

listarReservas()
  .then((codigoSalida) => {
    process.exitCode = codigoSalida;
  })
  .catch((error) => {
    console.error(`Error inesperado durante la consulta: ${error.name}.`);
    process.exitCode = 1;
  });
