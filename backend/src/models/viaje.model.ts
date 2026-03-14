import { Schema, model } from 'mongoose';
import type { IViajeDocument } from '../types/index.js';

const viajeSchema = new Schema<IViajeDocument>(
  {
    idBus: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    idRuta: { type: Schema.Types.ObjectId, ref: 'Ruta', required: true },
    busNombre: { type: String, required: true },
    busPlaca: { type: String, required: true },
    rutaOrigen: { type: String, required: true },
    rutaDestino: { type: String, required: true },
    fechaSalida: { type: Date, required: true },
    horaSalida: { type: String, required: true },
    fechaLlegada: { type: Date, required: true },
    horaLlegada: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    totalAsientos: { type: Number, required: true },
    asientosReservados: { type: Number, default: 0 },
    asientosDisponibles: { type: Number, required: true },
    completo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

viajeSchema.index({ idRuta: 1, fechaSalida: 1, horaSalida: 1 }, { unique: true });
viajeSchema.index({ rutaOrigen: 1, rutaDestino: 1, fechaSalida: 1 });
viajeSchema.index({ idBus: 1, fechaSalida: 1, fechaLlegada: 1 });

export const Viaje = model<IViajeDocument>('Viaje', viajeSchema);
