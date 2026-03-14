import { Ruta, Viaje } from '../models/index.js';
import { AppError } from '../utils/errors.js';

export async function getAll() {
  return Ruta.find().sort({ createdAt: -1 });
}

export async function create(data: { origen: string; destino: string }) {
  return Ruta.create(data);
}

export async function getById(id: string) {
  const ruta = await Ruta.findById(id);

  if (!ruta) {
    throw new AppError('Ruta no encontrada', 404);
  }

  return ruta;
}

export async function update(
  id: string,
  data: { origen?: string; destino?: string }
) {
  const ruta = await Ruta.findById(id);

  if (!ruta) {
    throw new AppError('Ruta no encontrada', 404);
  }

  ruta.set(data);
  await ruta.save();

  await Viaje.updateMany(
    { idRuta: id },
    { rutaOrigen: ruta.origen, rutaDestino: ruta.destino }
  );

  return ruta;
}

export async function remove(id: string) {
  const viaje = await Viaje.findOne({ idRuta: id });

  if (viaje) {
    throw new AppError('No se puede eliminar: la ruta tiene viajes asociados', 400);
  }

  const ruta = await Ruta.findByIdAndDelete(id);

  if (!ruta) {
    throw new AppError('Ruta no encontrada', 404);
  }

  return ruta;
}
