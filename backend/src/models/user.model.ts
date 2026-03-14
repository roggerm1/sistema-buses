import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUserDocument } from '../types/index.js';

const userSchema = new Schema<IUserDocument>(
  {
    nombres: { type: String, required: true, trim: true },
    apellidos: { type: String, required: true, trim: true },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    clave: { type: String, required: true },
    tipoUsuario: {
      type: String,
      enum: ['Admin', 'Pasajero'],
      default: 'Pasajero',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('clave')) return;
  this.clave = await bcrypt.hash(this.clave, 10);
});

export const User = model<IUserDocument>('User', userSchema);
