import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { RutaService } from '../../../core/services/ruta.service';

function origenDestinoDistintosValidator(group: AbstractControl): ValidationErrors | null {
  const origen = group.get('origen')?.value?.trim().toLowerCase();
  const destino = group.get('destino')?.value?.trim().toLowerCase();
  return origen && destino && origen === destino ? { origenIgualDestino: true } : null;
}
import { Ruta } from '../../../core/models/interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rutas.html',
  imports: [
    ReactiveFormsModule,
    TableModule,
    Dialog,
    Button,
    InputText,
    ConfirmDialog,
    FloatLabel,
    DatePipe,
  ],
})
export class Rutas implements OnInit {
  private rutaService = inject(RutaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  rutas = signal<Ruta[]>([]);
  loading = signal(false);
  saving = signal(false);
  showDialog = signal(false);
  isEdit = signal(false);
  selectedRutaId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    origen: ['', Validators.required],
    destino: ['', Validators.required],
  }, {
    validators: [origenDestinoDistintosValidator],
  });

  ngOnInit(): void {
    this.loadRutas();
  }

  loadRutas(): void {
    this.loading.set(true);
    this.rutaService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rutas.set(res.data.rutas);
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las rutas' });
        this.loading.set(false);
      },
    });
  }

  openNew(): void {
    this.form.reset({ origen: '', destino: '' });
    this.isEdit.set(false);
    this.selectedRutaId.set(null);
    this.showDialog.set(true);
  }

  editRuta(ruta: Ruta): void {
    this.form.patchValue({
      origen: ruta.origen,
      destino: ruta.destino,
    });
    this.isEdit.set(true);
    this.selectedRutaId.set(ruta._id);
    this.showDialog.set(true);
  }

  saveRuta(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const formValue = this.form.getRawValue();

    if (this.isEdit()) {
      this.rutaService.update(this.selectedRutaId()!, formValue).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ruta actualizada correctamente' });
            this.showDialog.set(false);
            this.loadRutas();
          }
          this.saving.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al actualizar la ruta' });
          this.saving.set(false);
        },
      });
    } else {
      this.rutaService.create(formValue).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ruta creada correctamente' });
            this.showDialog.set(false);
            this.loadRutas();
          }
          this.saving.set(false);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al crear la ruta' });
          this.saving.set(false);
        },
      });
    }
  }

  deleteRuta(ruta: Ruta): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la ruta "${ruta.origen} → ${ruta.destino}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.rutaService.remove(ruta._id).subscribe({
          next: (res) => {
            if (res.success) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ruta eliminada correctamente' });
              this.loadRutas();
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error al eliminar la ruta' });
          },
        });
      },
    });
  }
}
