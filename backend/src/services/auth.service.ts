import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { env } from '../config/index.js';
import type { RegisterDTO, LoginDTO, TipoUsuario } from '../types/index.js';
import { AppError } from '../utils/errors.js';

function stripClave<T extends { clave?: unknown }>(obj: T): Omit<T, 'clave'> {
  const { clave, ...rest } = obj;
  return rest;
}

export async function register(data: RegisterDTO) {
  const user = await User.create(data);
  return stripClave(user.toObject());
}

export async function login(data: LoginDTO) {
  const user = await User.findOne({ correo: data.correo });

  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const isMatch = await bcrypt.compare(data.clave, user.clave);

  if (!isMatch) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const token = jwt.sign(
    { userId: user._id, correo: user.correo, tipoUsuario: user.tipoUsuario },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  return { token, user: stripClave(user.toObject()) };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId).select('-clave');

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return user;
}

export async function updateRole(targetUserId: string, tipoUsuario: TipoUsuario, requestingUserId: string) {
  if (targetUserId === requestingUserId) {
    throw new AppError('No podés cambiar tu propio rol', 400);
  }

  const user = await User.findById(targetUserId).select('-clave');

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  user.tipoUsuario = tipoUsuario;
  await user.save();
  return user;
}
