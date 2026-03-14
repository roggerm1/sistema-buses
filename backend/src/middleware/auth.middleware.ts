import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';
import type { IJwtPayload, TipoUsuario } from '../types/index.js';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: 'Acceso no autorizado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as IJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: TipoUsuario[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Acceso no autorizado' });
      return;
    }

    if (!roles.includes(req.user.tipoUsuario)) {
      res.status(403).json({ success: false, message: 'No tiene permisos para esta acción' });
      return;
    }

    next();
  };
}
