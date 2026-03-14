import { Schema, model } from 'mongoose';
import type { IRutaDocument } from '../types/index.js';

const rutaSchema = new Schema<IRutaDocument>(
  {
    origen: { type: String, required: true, trim: true },
    destino: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

rutaSchema.index({ origen: 1, destino: 1 }, { unique: true });

export const Ruta = model<IRutaDocument>('Ruta', rutaSchema);
