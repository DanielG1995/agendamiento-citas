import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, of, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Appointment } from '../../models/appointment.model';
import { AppointmentsService } from '../../services/appointments.service';

@Component({
  selector: 'app-appointment-scheduler',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './appointment-scheduler.component.html',
  styleUrl: './appointment-scheduler.component.scss'
})
export class AppointmentSchedulerComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private lastResetNonce = 0;

  @Output() appointmentCreated = new EventEmitter<Appointment>();
  @Input() set resetSignal(nonce: number | null) {
    if (!nonce || nonce === this.lastResetNonce) {
      return;
    }
    this.lastResetNonce = nonce;
    this.resetState();
  }

  readonly platePattern = /^[A-Z]{3}-\d{4}$/;
  readonly timeSlots = this.appointmentsService.getAllowedSlots();

  readonly form = this.formBuilder.group({
    plate: ['', [Validators.required, Validators.pattern(this.platePattern)]],
    date: [null as Date | null, [Validators.required]],
    time: ['', [Validators.required]]
  });

  saving = false;
  errorMessage = '';
  successMessage = '';

  readonly dateFilter = (date: Date | null): boolean => {
    if (!date) {
      return false;
    }
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };

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

    this.form.controls.date.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.controls.time.reset('');
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const plate = this.form.controls.plate.value ?? '';
    const date = this.form.controls.date.value;
    const time = this.form.controls.time.value ?? '';

    if (!date) {
      return;
    }

    const dateKey = this.toDateKey(date);
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.appointmentsService
      .createAppointment({ plate, date: dateKey, time })
      .pipe(
        take(1),
        catchError((error: HttpErrorResponse) => {
          const message = this.getErrorMessage(error);
          if (error?.status === 400) {
            this.snackBar.open(message, 'Cerrar', {
              duration: 3500,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['snack-error']
            });
          }
          this.errorMessage =
            message ?? 'No se pudo agendar la cita. Intenta nuevamente.';
          this.saving = false;
          return of(null);
        })
      )
      .subscribe((appointment) => {
        if (!appointment) {
          return;
        }
        this.saving = false;
        this.successMessage = `Cita agendada para ${dateKey} a las ${time}.`;
        this.snackBar.open(this.successMessage, 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snack-success']
        });
        this.appointmentCreated.emit(appointment);
        this.form.reset();
      });
  }

  private resetState(): void {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.errorMessage = '';
    this.successMessage = '';
    this.saving = false;
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  private formatPlate(value: string): string {
    const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    if (raw.length <= 3) {
      return raw;
    }
    return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  }
}
