import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { FloatLabel } from 'primeng/floatlabel';
import { Button } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const clave = control.get('clave');
  const confirmar = control.get('confirmarClave');

  if (clave && confirmar && clave.value !== confirmar.value) {
    confirmar.setErrors({ ...confirmar.errors, passwordMismatch: true });
    return { passwordMismatch: true };
  }

  if (confirmar?.errors?.['passwordMismatch']) {
    const { passwordMismatch, ...rest } = confirmar.errors;
    confirmar.setErrors(Object.keys(rest).length ? rest : null);
  }

  return null;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Card, InputText, Password, FloatLabel, Button],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.nonNullable.group(
    {
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(6)]],
      confirmarClave: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { nombres, apellidos, correo, clave } = this.form.getRawValue();

    this.authService.register({ nombres, apellidos, correo, clave }).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Registro exitoso',
          detail: 'Tu cuenta fue creada. Redirigiendo al login...',
        });
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Error al registrar',
        });
      },
    });
  }
}
