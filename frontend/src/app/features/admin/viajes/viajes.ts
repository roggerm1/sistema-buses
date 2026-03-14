import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Tag } from 'primeng/tag';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { Tooltip } from 'primeng/tooltip';
import { formatDateLocal } from '../../../core/utils/date.utils';
import { ViajeService } from '../../../core/services/viaje.service';
import { BusService } from '../../../core/services/bus.service';
import { RutaService } from '../../../core/services/ruta.service';
import { Bus, Ruta, Viaje, ReservaConPasajero } from '../../../core/models/interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './viajes.html',
  imports: [
    ReactiveFormsModule,
    TableModule,
    Dialog,
    Button,
    InputText,
    InputNumber,
    Select,
    DatePicker,
    Tag,
    ConfirmDialog,
    FloatLabel,
    Tooltip,
    CurrencyPipe,
    DatePipe,
  ],
})
export class Viajes implements OnInit {
  private viajeService = inject(ViajeService);
  private busService = inject(BusService);
  private rutaService = inject(RutaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  viajes = signal<Viaje[]>([]);
  buses = signal<Bus[]>([]);
  rutas = signal<Ruta[]>([]);
  loading = signal(false);
  saving = signal(false);
  showDialog = signal(false);
  isEdit = signal(false);
  selectedViajeId = signal<string | null>(null);
  today = new Date();

  // Reservas dialog
  showReservasDialog = signal(false);
  reservasViaje = signal<ReservaConPasajero[]>([]);
  reservasLoading = signal(false);
  reservasViajeLabel = signal('');

  rutaOptions = computed(() => this.rutas().map(r => ({
    ...r,
    displayLabel: `${r.origen} → ${r.destino}`,
  })));

  selectedBusCapacidad = computed(() => {
    const busId = this.form.get('idBus')?.value;
    const bus = this.buses().find(b => b._id === busId);
    return bus?.capacidad ?? null;
  });

  form = this.fb.group({
    idBus: ['', Validators.required],
    idRuta: ['', Validators.required],
    fechaSalida: [null as Date | null, Validators.required],
    horaSalida: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    fechaLlegada: [null as Date | null, Validators.required],
    horaLlegada: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    precio: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadViajes();
    this.loadBuses();
    this.loadRutas();

    this.form.get('fechaSalida')!.valueChanges.subscribe(fecha => {
      const llegada = this.form.get('fechaLlegada')!.value;
      if (fecha && llegada && llegada < fecha) {
        this.form.get('fechaLlegada')!.reset();
      }
    });
  }

  loadViajes(): void {
    this.loading.set(true);
    this.viajeService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.viajes.set(res.data.viajes);
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los viajes' });
        this.loading.set(false);
      },
    });
  }

  loadBuses(): void {
    this.busService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.buses.set(res.data.buses);
        }
      },
    });
  }

  loadRutas(): void {
    this.rutaService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rutas.set(res.data.rutas);
        }
      },
    });
  }

  openNew(): void {
    this.form.reset({ idBus: '', idRuta: '', fechaSalida: null, horaSalida: '', fechaLlegada: null, horaLlegada: '', precio: 0 });
    this.isEdit.set(false);
    this.selectedViajeId.set(null);
    this.showDialog.set(true);
  }

  editViaje(viaje: Viaje): void {
    this.form.patchValue({
      idBus: viaje.idBus,
      idRuta: viaje.idRuta,
      fechaSalida: new Date(viaje.fechaSalida),
      horaSalida: viaje.horaSalida,
      fechaLlegada: new Date(viaje.fechaLlegada),
      horaLlegada: viaje.horaLlegada,
      precio: viaje.precio,
    }, { emitEvent: false });
    this.isEdit.set(true);
    this.selectedViajeId.set(viaje._id);
    this.showDialog.set(true);
  }

  saveViaje(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const raw = this.form.getRawValue();

    const payload: Record<string, unknown> = {
      idBus: raw.idBus,
      idRuta: raw.idRuta,
      fechaSalida: raw.fechaSalida instanceof Date ? formatDateLocal(raw.fechaSalida) : raw.fechaSalida,
      horaSalida: raw.horaSalida,
      fechaLlegada: raw.fechaLlegada instanceof Date ? formatDateLocal(raw.fechaLlegada) : raw.fechaLlegada,
      horaLlegada: raw.horaLlegada,
      precio: raw.precio,
    };

    if (this.isEdit()) {
      this.viajeService.update(this.selectedViajeId()!, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Viaje actualizado correctamente' });
            this.showDialog.set(false);
            this.loadViajes();
          }
          this.saving.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar el viaje' });
          this.saving.set(false);
        },
      });
    } else {
      this.viajeService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Viaje creado correctamente' });
            this.showDialog.set(false);
            this.loadViajes();
          }
          this.saving.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear el viaje' });
          this.saving.set(false);
        },
      });
    }
  }

  deleteViaje(viaje: Viaje): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el viaje "${viaje.busNombre} - ${viaje.rutaOrigen} → ${viaje.rutaDestino}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.viajeService.remove(viaje._id).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Viaje eliminado correctamente' });
              this.loadViajes();
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al eliminar el viaje' });
          },
        });
      },
    });
  }

  viewReservas(viaje: Viaje): void {
    this.reservasViajeLabel.set(`${viaje.rutaOrigen} → ${viaje.rutaDestino} (${viaje.busNombre})`);
    this.reservasLoading.set(true);
    this.reservasViaje.set([]);
    this.showReservasDialog.set(true);

    this.viajeService.getReservas(viaje._id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.reservasViaje.set(res.data.reservas);
        }
        this.reservasLoading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las reservas' });
        this.reservasLoading.set(false);
      },
    });
  }

  canModify(viaje: Viaje): boolean {
    return viaje.asientosReservados === 0;
  }
}
