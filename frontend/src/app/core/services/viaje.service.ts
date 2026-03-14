import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Viaje, ReservaConPasajero } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ViajeService {
  private http = inject(HttpClient);

  getAll(): Observable<ApiResponse<{ viajes: Viaje[] }>> {
    return this.http.get<ApiResponse<{ viajes: Viaje[] }>>('/api/viajes');
  }

  create(data: Partial<Viaje>): Observable<ApiResponse<{ viaje: Viaje }>> {
    return this.http.post<ApiResponse<{ viaje: Viaje }>>('/api/viajes', data);
  }

  update(id: string, data: Partial<Viaje>): Observable<ApiResponse<{ viaje: Viaje }>> {
    return this.http.put<ApiResponse<{ viaje: Viaje }>>(`/api/viajes/${id}`, data);
  }

  remove(id: string): Observable<ApiResponse<{ viaje: Viaje }>> {
    return this.http.delete<ApiResponse<{ viaje: Viaje }>>(`/api/viajes/${id}`);
  }

  search(origen: string, destino: string, fecha: string): Observable<ApiResponse<{ viajes: Viaje[] }>> {
    return this.http.get<ApiResponse<{ viajes: Viaje[] }>>('/api/viajes/buscar', {
      params: { origen, destino, fecha },
    });
  }

  getReservas(viajeId: string): Observable<ApiResponse<{ reservas: ReservaConPasajero[] }>> {
    return this.http.get<ApiResponse<{ reservas: ReservaConPasajero[] }>>(`/api/viajes/${viajeId}/reservas`);
  }
}
