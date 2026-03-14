import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tag } from 'primeng/tag';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { BusService } from '../../../core/services/bus.service';
import { Bus } from '../../../core/models/interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './buses.html',
  imports: [
    ReactiveFormsModule,
    TableModule,
    Dialog,
    Button,
    InputText,
    InputNumber,
    ToggleSwitch,
    Tag,
    ConfirmDialog,
    FloatLabel,
    DatePipe,
  ],
})
export class Buses implements OnInit {
  private busService = inject(BusService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  buses = signal<Bus[]>([]);
  loading = signal(false);
  saving = signal(false);
  showDialog = signal(false);
  isEdit = signal(false);
  selectedBusId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    numeroPlaca: ['', Validators.required],
    nombre: ['', Validators.required],
    capacidad: [15, [Validators.required, Validators.min(1), Validators.max(15)]],
    disponible: [true],
  });

  ngOnInit(): void {
    this.loadBuses();
  }

  loadBuses(): void {
    this.loading.set(true);
    this.busService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.buses.set(res.data.buses);
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los buses' });
        this.loading.set(false);
      },
    });
  }

  openNew(): void {
    this.form.reset({ numeroPlaca: '', nombre: '', capacidad: 15, disponible: true });
    this.form.get('numeroPlaca')!.enable();
    this.isEdit.set(false);
    this.selectedBusId.set(null);
    this.showDialog.set(true);
  }

  editBus(bus: Bus): void {
    this.form.patchValue({
      numeroPlaca: bus.numeroPlaca,
      nombre: bus.nombre,
      capacidad: bus.capacidad,
      disponible: bus.disponible,
    });
    this.form.get('numeroPlaca')!.disable();
    this.isEdit.set(true);
    this.selectedBusId.set(bus._id);
    this.showDialog.set(true);
  }

  saveBus(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const formValue = this.form.getRawValue();

    if (this.isEdit()) {
      const { numeroPlaca, ...updateData } = formValue;
      this.busService.update(this.selectedBusId()!, updateData).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bus actualizado correctamente' });
            this.showDialog.set(false);
            this.loadBuses();
          }
          this.saving.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar el bus' });
          this.saving.set(false);
        },
      });
    } else {
      this.busService.create(formValue).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bus creado correctamente' });
            this.showDialog.set(false);
            this.loadBuses();
          }
          this.saving.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear el bus' });
          this.saving.set(false);
        },
      });
    }
  }

  deleteBus(bus: Bus): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el bus "${bus.nombre}" (${bus.numeroPlaca})?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.busService.remove(bus._id).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Bus eliminado correctamente' });
              this.loadBuses();
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al eliminar el bus' });
          },
        });
      },
    });
  }
}
