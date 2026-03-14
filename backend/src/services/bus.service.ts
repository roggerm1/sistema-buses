import { Bus, Viaje } from '../models/index.js';
import { AppError } from '../utils/errors.js';

export async function getAll() {
  return Bus.find().sort({ createdAt: -1 });
}

export async function create(data: {
  numeroPlaca: string;
  nombre: string;
  capacidad: number;
  disponible?: boolean;
}) {
  const asientos = Array.from({ length: data.capacidad }, (_, i) => ({
    numeroAsiento: i + 1,
  }));

  return Bus.create({ ...data, asientos });
}

export async function getById(id: string) {
  const bus = await Bus.findById(id);

  if (!bus) {
    throw new AppError('Bus no encontrado', 404);
  }

  return bus;
}

export async function update(
  id: string,
  data: { nombre?: string; capacidad?: number; disponible?: boolean }
) {
  const bus = await Bus.findById(id);

  if (!bus) {
    throw new AppError('Bus no encontrado', 404);
  }

  const capacidadChanged =
    data.capacidad !== undefined && data.capacidad !== bus.capacidad;

  bus.set(data);

  if (capacidadChanged) {
    bus.asientos = Array.from({ length: data.capacidad! }, (_, i) => ({
      numeroAsiento: i + 1,
    }));
  }

  await bus.save();
  return bus;
}

export async function remove(id: string) {
  const viaje = await Viaje.findOne({ idBus: id });

  if (viaje) {
    throw new AppError('No se puede eliminar: el bus tiene viajes asociados', 400);
  }

  const bus = await Bus.findByIdAndDelete(id);

  if (!bus) {
    throw new AppError('Bus no encontrado', 404);
  }

  return bus;
}
