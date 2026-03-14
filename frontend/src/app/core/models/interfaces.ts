export type TipoUsuario = 'Admin' | 'Pasajero';

export interface User {
  _id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  tipoUsuario: TipoUsuario;
}

export interface Bus {
  _id: string;
  numeroPlaca: string;
  nombre: string;
  capacidad: number;
  disponible: boolean;
  asientos: Seat[];
  createdAt: string;
}

export interface Seat {
  numeroAsiento: number;
}

export interface SeatStatus {
  numeroAsiento: number;
  reservado: boolean;
}

export interface Ruta {
  _id: string;
  origen: string;
  destino: string;
  createdAt: string;
}

export interface Viaje {
  _id: string;
  idBus: string;
  idRuta: string;
  busNombre: string;
  busPlaca: string;
  rutaOrigen: string;
  rutaDestino: string;
  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  horaLlegada: string;
  precio: number;
  totalAsientos: number;
  asientosReservados: number;
  asientosDisponibles: number;
  completo: boolean;
}

export interface Reserva {
  _id: string;
  idViaje: string;
  idPasajero: string;
  asientosReservados: number;
  montoTotal: number;
  detalles: { numeroAsiento: number }[];
  rutaOrigen: string;
  rutaDestino: string;
  fechaSalida: string;
  horaSalida: string;
  busNombre: string;
  precioUnitario: number;
  createdAt: string;
}

export interface ReservaConPasajero {
  _id: string;
  idViaje: string;
  idPasajero: { _id: string; nombres: string; apellidos: string; correo: string };
  asientosReservados: number;
  montoTotal: number;
  detalles: { numeroAsiento: number }[];
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
