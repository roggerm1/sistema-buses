import type { Request, Response } from 'express';
import * as busService from '../services/bus.service.js';

export async function getAll(_req: Request, res: Response) {
  const buses = await busService.getAll();
  res.json({ success: true, data: { buses } });
}

export async function create(req: Request, res: Response) {
  const bus = await busService.create(req.body);
  res.status(201).json({ success: true, data: { bus } });
}

export async function getById(req: Request, res: Response) {
  const bus = await busService.getById(req.params.id as string);
  res.json({ success: true, data: { bus } });
}

export async function update(req: Request, res: Response) {
  const bus = await busService.update(req.params.id as string, req.body);
  res.json({ success: true, data: { bus } });
}

export async function remove(req: Request, res: Response) {
  const bus = await busService.remove(req.params.id as string);
  res.json({ success: true, data: { bus } });
}
