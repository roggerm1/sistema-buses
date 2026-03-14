import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tooltip } from 'primeng/tooltip';
import { Reserva } from '../../../core/models/interfaces';
import { ReservaService } from '../../../core/services/reserva.service';

@Component({
  templateUrl: './my-trips.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, Button, Tag, ConfirmDialog, Tooltip, CurrencyPipe, DatePipe],
})
export class MyTrips implements OnInit {
  private reservaService = inject(ReservaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  reservas = signal<Reserva[]>([]);
  loading = signal(false);
  expandedRows: Record<string, boolean> = {};

  ngOnInit(): void {
    this.loadReservas();
  }

  loadReservas(): void {
    this.loading.set(true);
    this.reservaService.getUserTrips().subscribe({
      next: (res) => {
        this.reservas.set(res.data?.reservas ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  canCancel(reserva: Reserva): boolean {
    return new Date(reserva.fechaSalida) > new Date();
  }

  cancelReserva(reserva: Reserva): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de cancelar la reserva ${reserva.rutaOrigen} → ${reserva.rutaDestino}?`,
      header: 'Confirmar cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar reserva',
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.reservaService.cancel(reserva._id).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Reserva cancelada exitosamente' });
              this.loadReservas();
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al cancelar la reserva' });
          },
        });
      },
    });
  }
}
