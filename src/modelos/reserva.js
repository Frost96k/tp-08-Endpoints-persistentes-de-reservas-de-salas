const mongoose = require("mongoose");

const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

const reservaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator(value) {
          return value.trim().length > 0 && value === value.trim();
        },
        message:
          "El nombre del estudiante es obligatorio y no debe tener espacios al inicio o al final.",
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /@/,
    },
    sala: {
      type: String,
      required: true,
      enum: salasPermitidas,
    },
    fecha: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator(value) {
          return value.trim().length > 0;
        },
        message: "La fecha es obligatoria.",
      },
    },
    turno: {
      type: String,
      required: true,
      enum: turnosPermitidos,
    },
    personas: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message: "Las personas deben ser un número entero entre 1 y 6.",
      },
    },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada"],
      default: "pendiente",
    },
  },
  {
    collection: "reservas",
    versionKey: false,
  },
);

const Reserva = mongoose.model("Reserva", reservaSchema, "reservas");

module.exports = { Reserva, salasPermitidas, turnosPermitidos };
