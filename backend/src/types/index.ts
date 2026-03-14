import type { Document, Types } from 'mongoose';

// --- Enums / Literals ---

export type TipoUsuario = 'Admin' | 'Pasajero';

// --- User ---

export interface IUser {
  nombres: string;
  apellidos: string;
  correo: string;
  clave: string;
  tipoUsuario: TipoUsuario;
}

export interface IUserDocument extends IUser, Document {}

// --- Bus ---

export interface ISeat {
  numeroAsiento: number;
}

export interface IBus {
  numeroPlaca: string;
  nombre: string;
  capacidad: number;
  disponible: boolean;
  asientos: ISeat[];
}

export interface IBusDocument extends IBus, Document {}

// --- Ruta ---

export interface IRuta {
  origen: string;
  destino: string;
}

export interface IRutaDocument extends IRuta, Document {}

// --- Viaje ---

export interface IViaje {
  idBus: Types.ObjectId;
  idRuta: Types.ObjectId;
  busNombre: string;
  busPlaca: string;
  rutaOrigen: string;
  rutaDestino: string;
  fechaSalida: Date;
  horaSalida: string;
  fechaLlegada: Date;
  horaLlegada: string;
  precio: number;
  totalAsientos: number;
  asientosReservados: number;
  asientosDisponibles: number;
  completo: boolean;
}

export interface IViajeDocument extends IViaje, Document {}

// --- Reserva ---

export interface IReservaDetalle {
  numeroAsiento: number;
}

export interface IReserva {
  idViaje: Types.ObjectId;
  idPasajero: Types.ObjectId;
  asientosReservados: number;
  montoTotal: number;
  detalles: IReservaDetalle[];
  rutaOrigen: string;
  rutaDestino: string;
  fechaSalida: Date;
  horaSalida: string;
  busNombre: string;
  precioUnitario: number;
}

export interface IReservaDocument extends IReserva, Document {}

// --- Auth DTOs ---

export interface RegisterDTO {
  nombres: string;
  apellidos: string;
  correo: string;
  clave: string;
}

export interface LoginDTO {
  correo: string;
  clave: string;
}

export interface IJwtPayload {
  userId: string;
  correo: string;
  tipoUsuario: TipoUsuario;
}

// --- Express augmentation ---

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}
