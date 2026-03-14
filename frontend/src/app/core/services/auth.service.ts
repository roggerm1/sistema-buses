import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User, ApiResponse, LoginResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.tipoUsuario === 'Admin');
  readonly isPasajero = computed(() => this.currentUserSignal()?.tipoUsuario === 'Pasajero');

  private get token(): string | null {
    return localStorage.getItem('token');
  }

  getToken(): string | null {
    return this.token;
  }

  initSession(): Observable<void> | void {
    if (!this.token) return;

    return this.http.get<ApiResponse<{ user: User }>>('/api/auth/me').pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUserSignal.set(res.data.user);
        }
      }),
      catchError(() => {
        localStorage.removeItem('token');
        return of(void 0);
      }),
      map(() => void 0),
    );
  }

  login(correo: string, clave: string): Observable<User> {
    return this.http.post<ApiResponse<LoginResponse>>('/api/auth/login', { correo, clave }).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('token', res.data.token);
          this.currentUserSignal.set(res.data.user);
        }
      }),
      map(res => res.data!.user),
    );
  }

  register(data: { nombres: string; apellidos: string; correo: string; clave: string }): Observable<void> {
    return this.http.post<ApiResponse>('/api/auth/register', data).pipe(
      map(() => void 0),
    );
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}).subscribe();
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem('token');
    this.currentUserSignal.set(null);
  }

  navigateByRole(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/inicio']);
    }
  }
}
