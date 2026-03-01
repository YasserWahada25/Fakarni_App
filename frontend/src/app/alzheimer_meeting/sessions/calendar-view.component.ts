import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionService, PatientSession } from './session.service';
import { ReservationFormComponent } from './reservation-form.component';
import { SessionSummaryComponent } from './session-summary.component';

@Component({
    selector: 'app-calendar-view',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatCardModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        ReservationFormComponent
    ],
    template: `
    <div class="reservation-page">
      <header class="page-header">
        <div>
          <h2>Réservations des séances</h2>
          <p>Créez une demande de séance en ligne ou présentielle. Le docteur validera ensuite votre demande.</p>
        </div>
        <button mat-raised-button color="primary" (click)="openAddForm()">
          <mat-icon>add</mat-icon>
          Réserver une séance
        </button>
      </header>

      <section class="stats-grid">
        <article class="stat-card">
          <span>Total</span>
          <strong>{{ sessions.length }}</strong>
        </article>
        <article class="stat-card pending">
          <span>En attente</span>
          <strong>{{ countByStatus('DRAFT') }}</strong>
        </article>
        <article class="stat-card scheduled">
          <span>Acceptées</span>
          <strong>{{ countByStatus('SCHEDULED') }}</strong>
        </article>
        <article class="stat-card cancelled">
          <span>Refusées</span>
          <strong>{{ countByStatus('CANCELLED') }}</strong>
        </article>
      </section>

      <div class="state-card" *ngIf="loading">
        <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
        <p>Chargement des réservations...</p>
      </div>

      <div class="state-card error" *ngIf="!loading && errorMessage">
        <mat-icon>error</mat-icon>
        <p>{{ errorMessage }}</p>
        <button mat-stroked-button color="primary" (click)="loadSessions()">Réessayer</button>
      </div>

      <div class="calendar-container" *ngIf="!loading && !errorMessage">
        <section class="calendar-panel">
          <div class="calendar-header">
            <div class="month-navigation">
              <button mat-icon-button (click)="previousMonth()" aria-label="Mois précédent">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <h3>{{ currentMonth | date: 'MMMM yyyy' : '' : 'fr-FR' }}</h3>
              <button mat-icon-button (click)="nextMonth()" aria-label="Mois suivant">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
          </div>

          <div class="calendar-grid">
            <div class="weekday" *ngFor="let dayName of weekDays">{{ dayName }}</div>

            <button
              *ngFor="let day of calendarDays"
              class="calendar-day"
              type="button"
              [class.today]="isToday(day)"
              [class.other-month]="!isSameMonth(day)"
              [class.selected]="isSelected(day)"
              [class.has-sessions]="getSessionsForDay(day).length > 0"
              (click)="selectDate(day)">
              <span class="day-number">{{ day | date: 'd' }}</span>

              <div class="session-dots" *ngIf="getSessionsForDay(day).length > 0">
                <span
                  *ngFor="let session of getSessionsForDay(day) | slice:0:3"
                  class="session-dot"
                  [class.online]="session.type === 'online'"
                  [class.presential]="session.type !== 'online'"
                  [matTooltip]="session.title + ' (' + (session.startTime | date:'HH:mm') + ')'">
                </span>
                <span class="more-count" *ngIf="getSessionsForDay(day).length > 3">
                  +{{ getSessionsForDay(day).length - 3 }}
                </span>
              </div>
            </button>
          </div>
        </section>

        <aside class="session-list-side" *ngIf="selectedDate">
          <div class="side-header">
            <h3>Demandes du {{ selectedDate | date: 'dd MMMM yyyy' : '' : 'fr-FR' }}</h3>
            <span class="day-count">{{ getSessionsForDay(selectedDate).length }} séance(s)</span>
          </div>

          <div class="sessions-list" *ngIf="getSessionsForDay(selectedDate).length > 0; else noSessions">
            <mat-card *ngFor="let session of getSessionsForDay(selectedDate)" class="session-card">
              <div class="session-top-row">
                <div class="session-type-icon" [class.online]="session.type === 'online'">
                  <mat-icon>{{ session.type === 'online' ? 'videocam' : 'person_pin_circle' }}</mat-icon>
                </div>
                <div class="session-title-area">
                  <h4>{{ session.title }}</h4>
                  <p>{{ session.startTime | date: 'HH:mm' }} - {{ session.endTime | date: 'HH:mm' }}</p>
                </div>
                <span class="status-chip" [ngClass]="getStatusClass(session.status)">
                  {{ getStatusLabel(session.status) }}
                </span>
              </div>

              <p class="session-desc">{{ session.description }}</p>

              <div class="session-meta">
                <span class="chip" [class.online]="session.type === 'online'">
                  <mat-icon>{{ session.type === 'online' ? 'wifi' : 'location_on' }}</mat-icon>
                  {{ session.type === 'online' ? 'En ligne' : 'Présentielle' }}
                </span>
                <span class="chip">
                  <mat-icon>group</mat-icon>
                  {{ session.sessionType === 'GROUP' ? 'Groupe' : 'Privée' }}
                </span>
              </div>

              <a *ngIf="session.meetingUrl" [href]="session.meetingUrl" target="_blank" class="meeting-link">
                <mat-icon>link</mat-icon>
                Rejoindre le lien de réunion
              </a>
            </mat-card>
          </div>

          <ng-template #noSessions>
            <div class="no-sessions">
              <mat-icon>event_busy</mat-icon>
              <p>Aucune demande prévue pour ce jour.</p>
              <button mat-button color="primary" (click)="openAddForm()">Créer une réservation</button>
            </div>
          </ng-template>
        </aside>
      </div>

      <div class="form-overlay" *ngIf="showForm">
        <div class="overlay-backdrop" (click)="showForm = false"></div>
        <div class="overlay-content">
          <app-reservation-form
            [selectedDate]="selectedDate"
            (submitted)="onFormSubmitted($event)"
            (cancelled)="showForm = false">
          </app-reservation-form>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      padding: 18px;
      font-family: 'Poppins', sans-serif;
    }

    .reservation-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      padding: 18px 20px;
      border-radius: 16px;
      background: linear-gradient(135deg, #f7f9ff 0%, #eef4ff 100%);
      border: 1px solid #e3ebfd;
    }

    .page-header h2 {
      margin: 0 0 4px;
      color: #1f2a44;
      font-size: 1.35rem;
      font-weight: 700;
    }

    .page-header p {
      margin: 0;
      color: #5f6f8a;
      max-width: 720px;
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .stat-card {
      background: #fff;
      border: 1px solid #e8edf5;
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-card span {
      color: #65758e;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .stat-card strong {
      color: #101828;
      font-size: 1.45rem;
      font-weight: 700;
    }

    .stat-card.pending strong { color: #c46c00; }
    .stat-card.scheduled strong { color: #157347; }
    .stat-card.cancelled strong { color: #b42318; }

    .state-card {
      background: #fff;
      border: 1px solid #e5e9f2;
      border-radius: 14px;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #607089;
      min-height: 120px;
    }

    .state-card.error {
      justify-content: flex-start;
    }

    .calendar-container {
      background: #f8fafc;
      border: 1px solid #e5ebf5;
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 28px rgba(16, 24, 40, 0.06);
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 16px;
    }

    .calendar-panel {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e9eef6;
      padding: 14px;
    }

    .calendar-header {
      margin-bottom: 12px;
    }

    .month-navigation {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .month-navigation h3 {
      margin: 0;
      color: #1f2a44;
      text-transform: capitalize;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 7px;
    }

    .weekday {
      text-align: center;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      color: #6d7d96;
      text-transform: uppercase;
      padding: 8px 4px;
    }

    .calendar-day {
      appearance: none;
      border: 1px solid #eef2f8;
      background: #fff;
      border-radius: 10px;
      min-height: 102px;
      padding: 8px;
      text-align: left;
      cursor: pointer;
      transition: all 0.18s ease;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .calendar-day:hover {
      border-color: #cfe0ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(16, 24, 40, 0.08);
    }

    .calendar-day.other-month {
      opacity: 0.48;
    }

    .calendar-day.today .day-number {
      width: 26px;
      height: 26px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #3154d5;
      color: #fff;
    }

    .calendar-day.selected {
      border-color: #7795ff;
      background: #f4f7ff;
      box-shadow: 0 6px 12px rgba(49, 84, 213, 0.16);
    }

    .calendar-day.has-sessions {
      border-color: #dbe5ff;
    }

    .day-number {
      font-size: 1rem;
      font-weight: 600;
      color: #2f3f59;
    }

    .session-dots {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }

    .session-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      display: inline-block;
    }

    .session-dot.online { background: #1f6feb; }
    .session-dot.presential { background: #1e9d67; }

    .more-count {
      font-size: 0.68rem;
      color: #6d7d96;
      font-weight: 600;
    }

    .session-list-side {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e9eef6;
      padding: 14px;
      display: flex;
      flex-direction: column;
      min-height: 420px;
    }

    .side-header {
      margin-bottom: 12px;
    }

    .side-header h3 {
      margin: 0 0 2px;
      color: #1f2a44;
      font-size: 1.02rem;
      font-weight: 700;
    }

    .day-count {
      color: #6d7d96;
      font-size: 0.8rem;
    }

    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .session-card {
      border: 1px solid #ebf0f8;
      border-radius: 12px;
      box-shadow: none !important;
      padding: 12px !important;
    }

    .session-top-row {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .session-type-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #eaf2ff;
      color: #1f6feb;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .session-type-icon.online {
      background: #eaf2ff;
      color: #1f6feb;
    }

    .session-title-area {
      flex: 1;
      min-width: 0;
    }

    .session-title-area h4 {
      margin: 0;
      font-size: 0.95rem;
      color: #1f2a44;
      font-weight: 600;
    }

    .session-title-area p {
      margin: 2px 0 0;
      font-size: 0.8rem;
      color: #667085;
    }

    .status-chip {
      border-radius: 999px;
      padding: 3px 8px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-chip.status-draft {
      background: #fff1dc;
      color: #9a5800;
    }

    .status-chip.status-scheduled {
      background: #e6f7ef;
      color: #186e45;
    }

    .status-chip.status-cancelled {
      background: #ffe9e8;
      color: #9f1f15;
    }

    .status-chip.status-done {
      background: #e8f1ff;
      color: #1d4ed8;
    }

    .session-desc {
      margin: 10px 0;
      color: #44526b;
      font-size: 0.84rem;
      line-height: 1.4;
    }

    .session-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 6px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border-radius: 999px;
      padding: 3px 8px;
      background: #f2f4f7;
      color: #475467;
      font-size: 0.74rem;
      font-weight: 600;
    }

    .chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .chip.online {
      background: #eaf2ff;
      color: #1f6feb;
    }

    .meeting-link {
      margin-top: 2px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #1f6feb;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .meeting-link:hover {
      text-decoration: underline;
    }

    .no-sessions {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #6b7c95;
      gap: 8px;
    }

    .no-sessions mat-icon {
      font-size: 42px;
      width: 42px;
      height: 42px;
      color: #9fb0c8;
    }

    .form-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }

    .overlay-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(9, 14, 27, 0.58);
      backdrop-filter: blur(3px);
    }

    .overlay-content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 700px;
      max-height: calc(100vh - 36px);
      overflow: auto;
    }

    @media (max-width: 1100px) {
      .calendar-container {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 900px) {
      :host {
        padding: 10px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 580px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CalendarViewComponent implements OnInit {
    currentMonth: Date = new Date();
    calendarDays: Date[] = [];
    sessions: PatientSession[] = [];
    weekDays: string[] = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    today: Date = new Date();
    selectedDate: Date = new Date();
    showForm = false;
    loading = true;
    errorMessage: string | null = null;

    private sessionsByDay = new Map<string, PatientSession[]>();

    constructor(
        private sessionService: SessionService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.generateCalendar();
        this.loadSessions();
    }

    loadSessions(): void {
        this.loading = true;
        this.errorMessage = null;

        this.sessionService.getSessions().subscribe({
            next: sessions => {
                this.sessions = sessions.slice().sort((a, b) => {
                    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                });
                this.rebuildSessionsIndex();
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.sessions = [];
                this.sessionsByDay.clear();
                this.errorMessage = 'Impossible de charger les réservations.';
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    generateCalendar(): void {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        this.calendarDays = [];

        for (let i = 0; i < startingDay; i++) {
            this.calendarDays.push(new Date(year, month, -startingDay + 1 + i));
        }

        for (let i = 1; i <= daysInMonth; i++) {
            this.calendarDays.push(new Date(year, month, i));
        }

        const remainingDays = 42 - this.calendarDays.length;
        for (let i = 1; i <= remainingDays; i++) {
            this.calendarDays.push(new Date(year, month + 1, i));
        }
    }

    nextMonth(): void {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
        this.generateCalendar();
    }

    previousMonth(): void {
        this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
        this.generateCalendar();
    }

    isToday(date: Date): boolean {
        return date.getDate() === this.today.getDate()
            && date.getMonth() === this.today.getMonth()
            && date.getFullYear() === this.today.getFullYear();
    }

    isSameMonth(date: Date): boolean {
        return date.getMonth() === this.currentMonth.getMonth()
            && date.getFullYear() === this.currentMonth.getFullYear();
    }

    isSelected(date: Date): boolean {
        return date.getDate() === this.selectedDate.getDate()
            && date.getMonth() === this.selectedDate.getMonth()
            && date.getFullYear() === this.selectedDate.getFullYear();
    }

    selectDate(date: Date): void {
        this.selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (!this.isSameMonth(date)) {
            this.currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            this.generateCalendar();
        }
    }

    getSessionsForDay(date: Date): PatientSession[] {
        const key = this.toDateKey(date);
        return this.sessionsByDay.get(key) ?? [];
    }

    openAddForm(): void {
        this.showForm = true;
    }

    onFormSubmitted(createdSession: PatientSession): void {
        this.showForm = false;
        this.selectedDate = new Date(createdSession.startTime);
        this.loadSessions();
        this.openSummaryDialog(createdSession);
    }

    countByStatus(status: string): number {
        return this.sessions.filter(session => session.status === status).length;
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'SCHEDULED':
                return 'status-scheduled';
            case 'CANCELLED':
                return 'status-cancelled';
            case 'DONE':
                return 'status-done';
            default:
                return 'status-draft';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'SCHEDULED':
                return 'Acceptée';
            case 'CANCELLED':
                return 'Refusée';
            case 'DONE':
                return 'Terminée';
            default:
                return 'En attente';
        }
    }

    private openSummaryDialog(session: PatientSession): void {
        this.dialog.open(SessionSummaryComponent, {
            data: { session },
            width: '420px',
            panelClass: 'session-summary-dialog'
        });
    }

    private rebuildSessionsIndex(): void {
        this.sessionsByDay.clear();
        for (const session of this.sessions) {
            const key = this.toDateKey(new Date(session.startTime));
            const list = this.sessionsByDay.get(key) ?? [];
            list.push(session);
            this.sessionsByDay.set(key, list);
        }

        for (const [key, list] of this.sessionsByDay.entries()) {
            const sorted = list.slice().sort((a, b) => {
                return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            });
            this.sessionsByDay.set(key, sorted);
        }
    }

    private toDateKey(value: Date): string {
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
