import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Reserva, SeatStatus } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private http = inject(HttpClient);

  getSeatsForTrip(viajeId: string): Observable<ApiResponse<{ seats: SeatStatus[] }>> {
    return this.http.get<ApiResponse<{ seats: SeatStatus[] }>>(`/api/viajes/${viajeId}/asientos`);
  }

  create(idViaje: string, asientos: { numeroAsiento: number }[]): Observable<ApiResponse<{ reserva: Reserva }>> {
    return this.http.post<ApiResponse<{ reserva: Reserva }>>('/api/reservas', { idViaje, asientos });
  }

  getUserTrips(): Observable<ApiResponse<{ reservas: Reserva[] }>> {
    return this.http.get<ApiResponse<{ reservas: Reserva[] }>>('/api/viajes/mis-viajes');
  }

  cancel(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`/api/reservas/${id}`);
  }
}
