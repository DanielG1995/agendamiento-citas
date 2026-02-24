import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { Appointment, CreateAppointmentRequest } from '../models/appointment.model';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  transaction: boolean;
  error: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/appointments`;
  private readonly allowedSlots = this.buildTimeSlots(8, 14, 30);
  private readonly http = inject(HttpClient);

  getByPlate(plate: string): Observable<Appointment[]> {
    const normalized = this.normalizePlate(plate);
    const params = new HttpParams().set('plate', normalized);
    return this.http
      .get<ApiResponse<Appointment[]>>(this.baseUrl, { params })
      .pipe(
        map((response) => this.unwrapResponse(response) ?? []),
        map((items) =>
          items
            .filter((item) => item.plate === normalized)
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
        )
      );
  }

  createAppointment(request: CreateAppointmentRequest): Observable<Appointment> {
    const normalized = this.normalizePlate(request.plate);
    const scheduledAt = this.combineDateTime(request.date, request.time);

    if (!this.isWeekday(request.date)) {
      return throwError(
        () => new Error('Solo se permiten citas de lunes a viernes.')
      );
    }

    if (!this.isSlotAllowed(request.time)) {
      return throwError(
        () =>
          new Error(
            'Horario inválido. Selecciona un intervalo entre 08:00 y 14:00.'
          )
      );
    }

    return this.http
      .post<ApiResponse<Appointment>>(this.baseUrl, {
        plate: normalized,
        scheduledAt
      })
      .pipe(map((response) => this.unwrapResponse(response)));
  }

  getAllowedSlots(): string[] {
    return [...this.allowedSlots];
  }

  private isSlotAllowed(time: string): boolean {
    return this.allowedSlots.includes(time);
  }

  private normalizePlate(plate: string): string {
    return plate.trim().toUpperCase();
  }

  private combineDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  private isWeekday(date: string): boolean {
    const parsed = new Date(`${date}T00:00`);
    const day = parsed.getDay();
    return day >= 1 && day <= 5;
  }

  private buildTimeSlots(startHour: number, endHour: number, stepMinutes: number): string[] {
    const slots: string[] = [];
    for (let hour = startHour; hour <= endHour; hour += 1) {
      for (let minutes = 0; minutes < 60; minutes += stepMinutes) {
        if (hour === endHour && minutes > 0) {
          continue;
        }
        slots.push(`${this.pad(hour)}:${this.pad(minutes)}`);
      }
    }
    return slots;
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private unwrapResponse<T>(response: ApiResponse<T>): T {
    if (!response?.transaction) {
      throw new Error(response?.error || 'Ocurrió un error en el servidor.');
    }
    return response.data;
  }
}
