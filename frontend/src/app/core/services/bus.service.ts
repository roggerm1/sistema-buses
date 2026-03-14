import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Bus } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class BusService {
  private http = inject(HttpClient);

  getAll(): Observable<ApiResponse<{ buses: Bus[] }>> {
    return this.http.get<ApiResponse<{ buses: Bus[] }>>('/api/buses');
  }

  create(data: Partial<Bus>): Observable<ApiResponse<{ bus: Bus }>> {
    return this.http.post<ApiResponse<{ bus: Bus }>>('/api/buses', data);
  }

  update(id: string, data: Partial<Bus>): Observable<ApiResponse<{ bus: Bus }>> {
    return this.http.put<ApiResponse<{ bus: Bus }>>(`/api/buses/${id}`, data);
  }

  remove(id: string): Observable<ApiResponse<{ bus: Bus }>> {
    return this.http.delete<ApiResponse<{ bus: Bus }>>(`/api/buses/${id}`);
  }
}
