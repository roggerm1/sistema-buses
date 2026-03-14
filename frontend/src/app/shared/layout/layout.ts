import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { Button } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Menubar, Button],
  template: `
    <p-menubar [model]="menuItems()">
      <ng-template #start>
        <span class="font-bold text-xl mr-4">SistemaBuses</span>
      </ng-template>
      <ng-template #end>
        <div class="flex items-center gap-3">
          <span class="text-sm">{{ userName() }}</span>
          <p-button label="Cerrar sesión" severity="secondary" [text]="true" size="small" (onClick)="logout()" />
        </div>
      </ng-template>
    </p-menubar>
    <main class="mx-auto max-w-screen-xl px-6 py-6">
      <router-outlet />
    </main>
  `,
})
export class Layout {
  private authService = inject(AuthService);

  readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user ? `${user.nombres} ${user.apellidos}` : '';
  });

  readonly menuItems = computed<MenuItem[]>(() => {
    if (this.authService.isAdmin()) {
      return [
        { label: 'Buses', routerLink: '/admin/buses' },
        { label: 'Rutas', routerLink: '/admin/rutas' },
        { label: 'Viajes', routerLink: '/admin/viajes' },
      ];
    }
    return [
      { label: 'Inicio', routerLink: '/inicio' },
      { label: 'Mis Viajes', routerLink: '/mis-viajes' },
    ];
  });

  logout(): void {
    this.authService.logout();
  }
}
