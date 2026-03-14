import mongoose, { Types } from 'mongoose';
import { Viaje, Reserva } from '../models/index.js';
import { AppError } from '../utils/errors.js';

export async function create(
  userId: string,
  data: { idViaje: string; asientos: { numeroAsiento: number }[] }
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const viaje = await Viaje.findById(data.idViaje).session(session);
    if (!viaje) {
      throw new AppError('Viaje no encontrado', 404);
    }

    if (viaje.completo) {
      throw new AppError('El viaje está completo, no hay asientos disponibles', 400);
    }

    const seatNumbers = data.asientos.map((a) => a.numeroAsiento);

    const outOfRange = seatNumbers.filter((n) => n < 1 || n > viaje.totalAsientos);
    if (outOfRange.length > 0) {
      throw new AppError(
        `Asientos fuera de rango: ${outOfRange.join(', ')}. Rango válido: 1-${viaje.totalAsientos}`,
        400
      );
    }

    const uniqueSeats = new Set(seatNumbers);
    if (uniqueSeats.size !== seatNumbers.length) {
      throw new AppError('No se pueden reservar asientos duplicados en la misma solicitud', 400);
    }

    if (seatNumbers.length > viaje.asientosDisponibles) {
      throw new AppError(`Solo quedan ${viaje.asientosDisponibles} asientos disponibles`, 400);
    }

    const existingReservas = await Reserva.find({ idViaje: data.idViaje }).session(session);
    const reservedSeats = new Set(
      existingReservas.flatMap((r) => r.detalles.map((d) => d.numeroAsiento))
    );

    const overlap = seatNumbers.filter((n) => reservedSeats.has(n));
    if (overlap.length > 0) {
      throw new AppError(`Los asientos ${overlap.join(', ')} ya están reservados`, 400);
    }

    const montoTotal = viaje.precio * seatNumbers.length;

    // array syntax for session support
    const [reserva] = await Reserva.create(
      [
        {
          idViaje: data.idViaje,
          idPasajero: userId,
          asientosReservados: seatNumbers.length,
          montoTotal,
          detalles: data.asientos,
          rutaOrigen: viaje.rutaOrigen,
          rutaDestino: viaje.rutaDestino,
          fechaSalida: viaje.fechaSalida,
          horaSalida: viaje.horaSalida,
          busNombre: viaje.busNombre,
          precioUnitario: viaje.precio,
        },
      ],
      { session }
    );

    viaje.asientosReservados += seatNumbers.length;
    viaje.asientosDisponibles -= seatNumbers.length;
    viaje.completo = viaje.asientosDisponibles === 0;
    await viaje.save({ session });

    await session.commitTransaction();

    return reserva;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function cancel(reservaId: string, userId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reserva = await Reserva.findById(reservaId).session(session);
    if (!reserva) {
      throw new AppError('Reserva no encontrada', 404);
    }

    if (reserva.idPasajero.toString() !== userId) {
      throw new AppError('No tenés permiso para cancelar esta reserva', 403);
    }

    const now = new Date();
    const salida = new Date(reserva.fechaSalida);
    if (salida <= now) {
      throw new AppError('No se puede cancelar una reserva de un viaje que ya partió', 400);
    }

    const viaje = await Viaje.findById(reserva.idViaje).session(session);
    if (viaje) {
      viaje.asientosReservados -= reserva.asientosReservados;
      viaje.asientosDisponibles += reserva.asientosReservados;
      viaje.completo = false;
      await viaje.save({ session });
    }

    await Reserva.deleteOne({ _id: new Types.ObjectId(reservaId) }).session(session);

    await session.commitTransaction();
    return { message: 'Reserva cancelada exitosamente' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getByViaje(viajeId: string) {
  return Reserva.find({ idViaje: viajeId })
    .populate('idPasajero', 'nombres apellidos correo')
    .sort({ createdAt: -1 });
}
