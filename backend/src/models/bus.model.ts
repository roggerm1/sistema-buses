import { Schema, model } from 'mongoose';
import type { IBusDocument } from '../types/index.js';

const seatSchema = new Schema(
  {
    numeroAsiento: { type: Number, required: true },
  },
  { _id: false }
);

const busSchema = new Schema<IBusDocument>(
  {
    numeroPlaca: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    nombre: { type: String, required: true, trim: true },
    capacidad: {
      type: Number,
      required: true,
      min: [1, 'La capacidad mínima es 1'],
      max: [15, 'La capacidad máxima es 15'],
    },
    disponible: { type: Boolean, default: true },
    asientos: [seatSchema],
  },
  { timestamps: true }
);

export const Bus = model<IBusDocument>('Bus', busSchema);
