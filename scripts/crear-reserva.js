const {
  conectarBaseDatos,
  cerrarConexionBaseDatos,
} = require("../src/config/base-datos");
const { Reserva } = require("../src/modelos/reserva");

async function crearReserva() {
  try {
    await conectarBaseDatos();

    const reserva = {
      estudiante: "Ana Salas",
      email: "ana.salas@example.com",
      sala: "Sala Norte",
      fecha: "2026-11-12",
      turno: "Mañana",
      personas: 3,
    };

    const resultado = await Reserva.create(reserva);
    console.log("Reserva creada con _id:", resultado._id.toString());
    return 0;
  } catch (error) {
    console.error("La reserva no pudo crearse.");
    console.error(`Tipo de problema: ${error.name}`);

    if (error.errors) {
      const campos = Object.keys(error.errors).join(", ");
      console.error(`Campos a revisar: ${campos}`);
    }

    if (error.code) {
      console.error(`Código: ${error.code}`);
    }

    if (error.name === "ConfigurationError") {
      console.error(error.message);
    }

    return 1;
  } finally {
    await cerrarConexionBaseDatos();
  }
}

crearReserva()
  .then((codigoSalida) => {
    process.exitCode = codigoSalida;
  })
  .catch((error) => {
    console.error(`Error inesperado durante la creación: ${error.name}.`);
    process.exitCode = 1;
  });
