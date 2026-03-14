import type { ErrorRequestHandler } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
}

export const errorHandler: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
  // Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ success: false, message: messages.join('. ') });
    return;
  }

  // MongoDB duplicate key (code 11000)
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'campo';
    res.status(400).json({ success: false, message: `El valor de '${field}' ya está registrado` });
    return;
  }

  // Mongoose CastError (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    res.status(400).json({ success: false, message: `Valor inválido para '${err.path}'` });
    return;
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expirado, inicie sesión nuevamente' });
    return;
  }

  // JWT invalid
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Token inválido' });
    return;
  }

  // Custom error with statusCode
  if (err.statusCode) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Generic error
  console.error('Error no manejado:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
};
