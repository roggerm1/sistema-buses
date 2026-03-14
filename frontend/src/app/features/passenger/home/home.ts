import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { Dialog } from 'primeng/dialog';
import { formatDateLocal } from '../../../core/utils/date.utils';
import { ViajeService } from '../../../core/services/viaje.service';
import { RutaService } from '../../../core/services/ruta.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { Ruta, Viaje, SeatStatus } from '../../../core/models/interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  imports: [
    ReactiveFormsModule,
    TableModule,
    Button,
    Select,
    DatePicker,
    FloatLabel,
    Dialog,
    CurrencyPipe,
  ],
  styles: [`
    .seat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 0.5fr 1fr 1fr;
      gap: 0.5rem;
      max-width: 320px;
      margin: 0 auto;
    }
    .seat {
      aspect-ratio: 1;
      border: 2px solid var(--p-green-500);
      border-radius: 8px;
      background: transparent;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.15s;
    }
    .seat:hover:not(:disabled) { background: var(--p-green-100); }
    .seat.selected { background: var(--p-green-500); color: white; }
    .seat.reserved {
      border-color: var(--p-red-300);
      background: var(--p-red-50);
      color: var(--p-red-300);
      cursor: not-allowed;
    }
    .aisle { pointer-events: none; }
    .legend { display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; }
    .legend-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; }
    .seat-dot {
      width: 14px; height: 14px; border-radius: 4px; display: inline-block;
    }
    .seat-dot.available { border: 2px solid var(--p-green-500); }
    .seat-dot.selected { background: var(--p-green-500); }
    .seat-dot.reserved { background: var(--p-red-50); border: 2px solid var(--p-red-300); }
  `],
})
export class Home implements OnInit {
  private viajeService = inject(ViajeService);
  private rutaService = inject(RutaService);
  private reservaService = inject(ReservaService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  // Search
  rutas = signal<Ruta[]>([]);
  resultados = signal<Viaje[]>([]);
  loading = signal(false);
  searched = signal(false);
  selectedOrigen = signal('');
  today = new Date();

  origenes = computed(() => [...new Set(this.rutas().map(r => r.origen))]);

  destinosFiltrados = computed(() => {
    const origen = this.selectedOrigen();
    if (!origen) return [];
    return [...new Set(this.rutas().filter(r => r.origen === origen).map(r => r.destino))];
  });

  form = this.fb.group({
    origen: ['', Validators.required],
    destino: ['', Validators.required],
    fechaSalida: [null as Date | null, Validators.required],
  });

  // Seat selection
  seatDialogVisible = signal(false);
  selectedViaje = signal<Viaje | null>(null);
  seats = signal<SeatStatus[]>([]);
  selectedSeats = signal<Set<number>>(new Set());
  reserving = signal(false);

  totalPrice = computed(() => this.selectedSeats().size * (this.selectedViaje()?.precio ?? 0));

  ngOnInit(): void {
    this.loadRutas();

    this.form.get('origen')!.valueChanges.subscribe((val) => {
      this.selectedOrigen.set(val ?? '');
      this.form.get('destino')!.reset();
    });
  }

  loadRutas(): void {
    this.rutaService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rutas.set(res.data.rutas);
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las rutas' });
      },
    });
  }

  search(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.searched.set(true);
    const { origen, destino, fechaSalida } = this.form.getRawValue();
    const fecha = fechaSalida instanceof Date ? formatDateLocal(fechaSalida) : String(fechaSalida);

    this.viajeService.search(origen!, destino!, fecha).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.resultados.set(res.data.viajes);
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al buscar viajes' });
        this.loading.set(false);
      },
    });
  }

  openSeatDialog(viaje: Viaje): void {
    this.selectedViaje.set(viaje);
    this.selectedSeats.set(new Set());
    this.seats.set([]);
    this.seatDialogVisible.set(true);

    this.reservaService.getSeatsForTrip(viaje._id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.seats.set(res.data.seats);
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los asientos' });
        this.seatDialogVisible.set(false);
      },
    });
  }

  toggleSeat(seatNumber: number): void {
    const current = new Set(this.selectedSeats());
    if (current.has(seatNumber)) {
      current.delete(seatNumber);
    } else {
      current.add(seatNumber);
    }
    this.selectedSeats.set(current);
  }

  confirmReservation(): void {
    const viaje = this.selectedViaje();
    const seats = this.selectedSeats();
    if (!viaje || seats.size === 0) return;

    this.reserving.set(true);
    const asientos = [...seats].map(n => ({ numeroAsiento: n }));

    this.reservaService.create(viaje._id, asientos).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Reserva exitosa', detail: `Se reservaron ${seats.size} asiento(s)` });
          this.seatDialogVisible.set(false);
          this.search();
        }
        this.reserving.set(false);
      },
      error: (err) => {
        const message = err.error?.message ?? 'Error al crear la reserva';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        this.reserving.set(false);
      },
    });
  }
}
