import { Bus, Ruta, Viaje, Reserva } from '../models/index.js';
import { AppError } from '../utils/errors.js';

function buildDateTime(date: Date | string, time: string): Date {
  const d = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function checkBusScheduleConflict(
  busId: string,
  fechaSalida: Date | string,
  horaSalida: string,
  fechaLlegada: Date | string,
  horaLlegada: string,
  excludeViajeId?: string
): Promise<void> {
  const newStart = buildDateTime(fechaSalida, horaSalida);
  const newEnd = buildDateTime(fechaLlegada, horaLlegada);

  const candidates = await Viaje.find({
    idBus: busId,
    fechaSalida: { $lte: newEnd },
    fechaLlegada: { $gte: newStart },
    ...(excludeViajeId ? { _id: { $ne: excludeViajeId } } : {}),
  });

  for (const c of candidates) {
    const candidateStart = buildDateTime(c.fechaSalida, c.horaSalida);
    const candidateEnd = buildDateTime(c.fechaLlegada, c.horaLlegada);

    if (candidateStart < newEnd && newStart < candidateEnd) {
      const fecha = c.fechaSalida.toISOString().split('T')[0];
      throw new AppError(
        `El bus ya tiene un viaje asignado (${c.rutaOrigen} → ${c.rutaDestino}, salida: ${fecha} ${c.horaSalida}) que se superpone con el horario solicitado`,
        409
      );
    }
  }
}

export async function getAll() {
  return Viaje.find().sort({ fechaSalida: -1 });
}

export async function getById(id: string) {
  const viaje = await Viaje.findById(id);

  if (!viaje) {
    throw new AppError('Viaje no encontrado', 404);
  }

  return viaje;
}

export async function create(data: {
  idBus: string;
  idRuta: string;
  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  horaLlegada: string;
  precio: number;
}) {
  const bus = await Bus.findById(data.idBus);
  if (!bus) {
    throw new AppError('Bus no encontrado', 404);
  }

  if (!bus.disponible) {
    throw new AppError('El bus no está disponible', 400);
  }

  const ruta = await Ruta.findById(data.idRuta);
  if (!ruta) {
    throw new AppError('Ruta no encontrada', 404);
  }

  await checkBusScheduleConflict(
    data.idBus, data.fechaSalida, data.horaSalida,
    data.fechaLlegada, data.horaLlegada
  );

  return Viaje.create({
    ...data,
    busNombre: bus.nombre,
    busPlaca: bus.numeroPlaca,
    rutaOrigen: ruta.origen,
    rutaDestino: ruta.destino,
    totalAsientos: bus.capacidad,
    asientosDisponibles: bus.capacidad,
    asientosReservados: 0,
    completo: false,
  });
}

export async function update(
  id: string,
  data: {
    idBus?: string;
    idRuta?: string;
    fechaSalida?: string;
    horaSalida?: string;
    fechaLlegada?: string;
    horaLlegada?: string;
    precio?: number;
  }
) {
  const viaje = await Viaje.findById(id);

  if (!viaje) {
    throw new AppError('Viaje no encontrado', 404);
  }

  const reserva = await Reserva.findOne({ idViaje: id });
  if (reserva) {
    throw new AppError('No se puede modificar: el viaje tiene reservas asociadas', 400);
  }

  await checkBusScheduleConflict(
    data.idBus || viaje.idBus.toString(),
    data.fechaSalida ?? viaje.fechaSalida,
    data.horaSalida ?? viaje.horaSalida,
    data.fechaLlegada ?? viaje.fechaLlegada,
    data.horaLlegada ?? viaje.horaLlegada,
    id
  );

  if (data.idBus && data.idBus !== viaje.idBus.toString()) {
    const bus = await Bus.findById(data.idBus);
    if (!bus) {
      throw new AppError('Bus no encontrado', 404);
    }
    viaje.busNombre = bus.nombre;
    viaje.busPlaca = bus.numeroPlaca;
    viaje.totalAsientos = bus.capacidad;
    viaje.asientosDisponibles = bus.capacidad;
  }

  if (data.idRuta && data.idRuta !== viaje.idRuta.toString()) {
    const ruta = await Ruta.findById(data.idRuta);
    if (!ruta) {
      throw new AppError('Ruta no encontrada', 404);
    }
    viaje.rutaOrigen = ruta.origen;
    viaje.rutaDestino = ruta.destino;
  }

  viaje.set(data);
  await viaje.save();

  return viaje;
}

export async function remove(id: string) {
  const reserva = await Reserva.findOne({ idViaje: id });

  if (reserva) {
    throw new AppError('No se puede eliminar: el viaje tiene reservas asociadas', 400);
  }

  const viaje = await Viaje.findByIdAndDelete(id);

  if (!viaje) {
    throw new AppError('Viaje no encontrado', 404);
  }

  return viaje;
}

export async function searchTrips(origen: string, destino: string, fecha: string) {
  const startOfDay = new Date(fecha);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(fecha);
  endOfDay.setHours(23, 59, 59, 999);

  return Viaje.find({
    rutaOrigen: origen,
    rutaDestino: destino,
    fechaSalida: { $gte: startOfDay, $lte: endOfDay },
    completo: false,
  }).sort({ horaSalida: 1 });
}

export async function getSeatsForTrip(viajeId: string) {
  const viaje = await Viaje.findById(viajeId);

  if (!viaje) {
    throw new AppError('Viaje no encontrado', 404);
  }

  const bus = await Bus.findById(viaje.idBus);

  if (!bus) {
    throw new AppError('Bus no encontrado', 404);
  }

  const reservas = await Reserva.find({ idViaje: viajeId });
  const asientosReservados = new Set(
    reservas.flatMap((r) => r.detalles.map((d) => d.numeroAsiento))
  );

  const seats = bus.asientos.map((a) => ({
    numeroAsiento: a.numeroAsiento,
    reservado: asientosReservados.has(a.numeroAsiento),
  }));

  return seats;
}

export async function getUserTrips(userId: string) {
  return Reserva.find({ idPasajero: userId }).sort({ createdAt: -1 });
}
