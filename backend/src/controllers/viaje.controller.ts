import type { Request, Response } from 'express';
import * as viajeService from '../services/viaje.service.js';
import * as reservaService from '../services/reserva.service.js';

export async function getAll(_req: Request, res: Response) {
  const viajes = await viajeService.getAll();
  res.json({ success: true, data: { viajes } });
}

export async function getById(req: Request, res: Response) {
  const viaje = await viajeService.getById(req.params.id as string);
  res.json({ success: true, data: { viaje } });
}

export async function create(req: Request, res: Response) {
  const viaje = await viajeService.create(req.body);
  res.status(201).json({ success: true, data: { viaje } });
}

export async function update(req: Request, res: Response) {
  const viaje = await viajeService.update(req.params.id as string, req.body);
  res.json({ success: true, data: { viaje } });
}

export async function remove(req: Request, res: Response) {
  const viaje = await viajeService.remove(req.params.id as string);
  res.json({ success: true, data: { viaje } });
}

export async function searchTrips(req: Request, res: Response) {
  const { origen, destino, fecha } = req.query as {
    origen: string;
    destino: string;
    fecha: string;
  };
  const viajes = await viajeService.searchTrips(origen, destino, fecha);
  res.json({ success: true, data: { viajes } });
}

export async function getSeatsForTrip(req: Request, res: Response) {
  const seats = await viajeService.getSeatsForTrip(req.params.id as string);
  res.json({ success: true, data: { seats } });
}

export async function getUserTrips(req: Request, res: Response) {
  const reservas = await viajeService.getUserTrips(req.user!.userId);
  res.json({ success: true, data: { reservas } });
}

export async function getReservasForTrip(req: Request, res: Response) {
  const reservas = await reservaService.getByViaje(req.params.id as string);
  res.json({ success: true, data: { reservas } });
}
