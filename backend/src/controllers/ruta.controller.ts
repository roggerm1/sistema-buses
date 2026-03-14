import type { Request, Response } from 'express';
import * as rutaService from '../services/ruta.service.js';

export async function getAll(_req: Request, res: Response) {
  const rutas = await rutaService.getAll();
  res.json({ success: true, data: { rutas } });
}

export async function create(req: Request, res: Response) {
  const ruta = await rutaService.create(req.body);
  res.status(201).json({ success: true, data: { ruta } });
}

export async function getById(req: Request, res: Response) {
  const ruta = await rutaService.getById(req.params.id as string);
  res.json({ success: true, data: { ruta } });
}

export async function update(req: Request, res: Response) {
  const ruta = await rutaService.update(req.params.id as string, req.body);
  res.json({ success: true, data: { ruta } });
}

export async function remove(req: Request, res: Response) {
  const ruta = await rutaService.remove(req.params.id as string);
  res.json({ success: true, data: { ruta } });
}
