export interface Appointment {
  id?: string;
  plate: string;
  scheduledAt: string;
}

export interface CreateAppointmentRequest {
  plate: string;
  date: string;
  time: string;
}
