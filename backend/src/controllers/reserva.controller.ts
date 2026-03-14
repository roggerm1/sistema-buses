import type { Request, Response } from 'express';
import * as reservaService from '../services/reserva.service.js';

export async function create(req: Request, res: Response) {
  const reserva = await reservaService.create(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: { reserva } });
}

export async function cancel(req: Request, res: Response) {
  const result = await reservaService.cancel(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: result });
}
