import { Schema, model } from 'mongoose';
import type { IReservaDocument } from '../types/index.js';

const reservaDetalleSchema = new Schema(
  {
    numeroAsiento: { type: Number, required: true },
  },
  { _id: false }
);

const reservaSchema = new Schema<IReservaDocument>(
  {
    idViaje: { type: Schema.Types.ObjectId, ref: 'Viaje', required: true },
    idPasajero: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    asientosReservados: { type: Number, required: true },
    montoTotal: { type: Number, required: true },
    detalles: [reservaDetalleSchema],
    rutaOrigen: { type: String, required: true },
    rutaDestino: { type: String, required: true },
    fechaSalida: { type: Date, required: true },
    horaSalida: { type: String, required: true },
    busNombre: { type: String, required: true },
    precioUnitario: { type: Number, required: true },
  },
  { timestamps: true }
);

reservaSchema.index({ idViaje: 1 });
reservaSchema.index({ idPasajero: 1 });

export const Reserva = model<IReservaDocument>('Reserva', reservaSchema);
