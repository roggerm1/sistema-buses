import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Button],
  template: `
    <div class="flex items-center justify-center" style="min-height: 100vh">
      <p-card [style]="{ width: '400px' }">
        <div class="text-center flex flex-col items-center gap-4">
          <i class="pi pi-lock text-5xl text-muted-color"></i>
          <h2 class="text-2xl font-bold m-0">Acceso Denegado</h2>
          <p class="text-muted-color m-0">No tenés permisos para acceder a esta página.</p>
          <p-button label="Volver al inicio" icon="pi pi-arrow-left" (onClick)="goHome()" />
        </div>
      </p-card>
    </div>
  `,
})
export class AccessDenied {
  private authService = inject(AuthService);

  goHome(): void {
    this.authService.navigateByRole();
  }
}
