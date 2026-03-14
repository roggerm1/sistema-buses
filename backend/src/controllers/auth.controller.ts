import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

export async function register(req: Request, res: Response) {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, data: { user } });
}

export async function login(req: Request, res: Response) {
  const { token, user } = await authService.login(req.body);

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, data: { token, user } });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Sesión cerrada' });
}

export async function getMe(req: Request, res: Response) {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.json({ success: true, data: { user } });
}

export async function updateRole(req: Request, res: Response) {
  const user = await authService.updateRole(req.params.id as string, req.body.tipoUsuario, req.user!.userId);
  res.json({ success: true, data: { user } });
}
