import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Appointment } from './models/appointment.model';
import { AppointmentHistoryComponent } from './features/appointment-history/appointment-history.component';
import { AppointmentSchedulerComponent } from './features/appointment-scheduler/appointment-scheduler.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatTabsModule,
    AppointmentHistoryComponent,
    AppointmentSchedulerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Sistema de Gestión de Citas';
  selectedIndex = 0;
  historySearch: { plate: string; nonce: number } | null = null;
  schedulerResetNonce = 0;
  private searchNonce = 0;
  private lastTabIndex = 0;

  onAppointmentCreated(appointment: Appointment): void {
    this.searchNonce += 1;
    this.historySearch = { plate: appointment.plate, nonce: this.searchNonce };
    this.selectedIndex = 0;
  }

  onTabChange(index: number): void {
    if (this.lastTabIndex === 1 && index !== 1) {
      this.schedulerResetNonce += 1;
    }
    this.lastTabIndex = index;
  }
}
