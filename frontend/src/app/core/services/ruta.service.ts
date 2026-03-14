import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Ruta } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class RutaService {
  private http = inject(HttpClient);

  getAll(): Observable<ApiResponse<{ rutas: Ruta[] }>> {
    return this.http.get<ApiResponse<{ rutas: Ruta[] }>>('/api/rutas');
  }

  create(data: Partial<Ruta>): Observable<ApiResponse<{ ruta: Ruta }>> {
    return this.http.post<ApiResponse<{ ruta: Ruta }>>('/api/rutas', data);
  }

  update(id: string, data: Partial<Ruta>): Observable<ApiResponse<{ ruta: Ruta }>> {
    return this.http.put<ApiResponse<{ ruta: Ruta }>>(`/api/rutas/${id}`, data);
  }

  remove(id: string): Observable<ApiResponse<{ ruta: Ruta }>> {
    return this.http.delete<ApiResponse<{ ruta: Ruta }>>(`/api/rutas/${id}`);
  }
}
