import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, finalize, of, take } from 'rxjs';
import { Appointment } from '../../models/appointment.model';
import { AppointmentsService } from '../../services/appointments.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './appointment-history.component.html',
  styleUrl: './appointment-history.component.scss'
})
export class AppointmentHistoryComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly platePattern = /^[A-Z]{3}-\d{4}$/;
  private lastSearchNonce = 0;

  @Input() set searchRequest(value: { plate: string; nonce: number } | null) {
    if (!value || value.nonce === this.lastSearchNonce) {
      return;
    }
    this.lastSearchNonce = value.nonce;
    this.form.controls.plate.setValue(value.plate);
    this.onSubmit();
  }

  readonly form = this.formBuilder.group({
    plate: ['', [Validators.required, Validators.pattern(this.platePattern)]]
  });

  appointments: Appointment[] = [];
  displayedColumns: string[] = ['date', 'time'];
  searched = false;
  loading = false;
  errorMessage = '';

  constructor() {
    this.form.controls.plate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (!value) {
          return;
        }
        const formatted = this.formatPlate(value);
        if (value !== formatted) {
          this.form.controls.plate.setValue(formatted, { emitEvent: false });
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const plate = this.form.controls.plate.value ?? '';
    this.loading = true;
    this.errorMessage = '';
    this.searched = true;
    this.appointments = [];

    this.appointmentsService
      .getByPlate(plate)
      .pipe(
        take(1),
        catchError((error: HttpErrorResponse) =>
          this.handleHttpError(
            error,
            [],
            'No se pudo consultar el historial. Intenta nuevamente.'
          )
        ),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((appointments) => {
        this.appointments = appointments;
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const payload: any = error?.error;
    if (!payload) {
      return error?.message ?? 'Ocurrió un error inesperado.';
    }
    if (typeof payload === 'string') {
      return payload;
    }
    if (payload.error) {
      return payload.error;
    }
    if (payload.message) {
      return payload.message;
    }
    if (payload.errors) {
      if (Array.isArray(payload.errors)) {
        return payload.errors.join(' ');
      }
      if (typeof payload.errors === 'object') {
        return Object.values(payload.errors)
          .flat()
          .join(' ');
      }
    }
    return error?.message ?? 'Ocurrió un error inesperado.';
  }

  private handleHttpError<T>(
    error: HttpErrorResponse,
    fallback: T,
    defaultMessage: string
  ) {
    const message = this.getErrorMessage(error) || defaultMessage;
    if (error?.status === HttpStatusCode.BadRequest) {
      this.snackBar.open(message, 'Cerrar', {
        duration: 3500,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snack-error']
      });
    }
    this.errorMessage = message;
    return of(fallback);
  }

  private formatPlate(value: string): string {
    const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    if (raw.length <= 3) {
      return raw;
    }
    return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  }
}
