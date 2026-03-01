import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionDetailComponent } from './session-detail.component';
import { AlzheimerService, Session } from '../shared/alzheimer.service';

type SessionModeFilter = 'ALL' | 'ONLINE' | 'IN_PERSON';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, RouterModule, SessionDetailComponent],
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
    currentMonth: Date = new Date();
    calendarDays: Date[] = [];
    sessions: Session[] = [];
    allPlannedSessions: Session[] = [];
    weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    today: Date = new Date();
    selectedSession: Session | null = null;
    selectedDay: Date | null = null;
    dayPopupSessions: Session[] = [];
    isDayPopupOpen = false;
    selectedModeFilter: SessionModeFilter = 'ALL';

    private sessionsByDay = new Map<string, Session[]>();
    private readonly plannedStatuses = new Set(['SCHEDULED', 'ACCEPTED', 'PLANNED', 'DONE']);

    constructor(
        private alzheimerService: AlzheimerService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.generateCalendar();
        this.alzheimerService.loadSessions();
        this.alzheimerService.getSessions().subscribe(sessions => {
            this.allPlannedSessions = sessions
                .filter(session => this.isPlannedSession(session))
                .slice()
                .sort((a, b) => this.resolveSessionDate(a).getTime() - this.resolveSessionDate(b).getTime());

            this.applySessionFilters();

            if (this.isDayPopupOpen && this.selectedDay) {
                this.dayPopupSessions = this.getSessionsForDay(this.selectedDay);
            }

            if (this.selectedSession) {
                const selected = this.allPlannedSessions.find(s => s.id === this.selectedSession?.id) ?? null;
                this.selectedSession = selected && this.isSessionVisibleByMode(selected) ? selected : null;
            }

            this.cdr.markForCheck();
        });
    }

    get totalPlannedCount(): number {
        return this.allPlannedSessions.length;
    }

    get onlinePlannedCount(): number {
        return this.allPlannedSessions.filter(session => this.resolveSessionMode(session) === 'ONLINE').length;
    }

    get inPersonPlannedCount(): number {
        return this.allPlannedSessions.filter(session => this.resolveSessionMode(session) === 'IN_PERSON').length;
    }

    get currentMonthPlannedCount(): number {
        const month = this.currentMonth.getMonth();
        const year = this.currentMonth.getFullYear();
        return this.allPlannedSessions.filter(session => {
            const date = this.resolveSessionDate(session);
            return date.getMonth() === month && date.getFullYear() === year;
        }).length;
    }

    get modeFilterLabel(): string {
        if (this.selectedModeFilter === 'ONLINE') return 'Mode: En ligne';
        if (this.selectedModeFilter === 'IN_PERSON') return 'Mode: Presentielle';
        return 'Mode: Les deux';
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
            const prevMonthDay = new Date(year, month, -startingDay + 1 + i);
            this.calendarDays.push(prevMonthDay);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            this.calendarDays.push(new Date(year, month, i));
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
        return date.getDate() === this.today.getDate() &&
            date.getMonth() === this.today.getMonth() &&
            date.getFullYear() === this.today.getFullYear();
    }

    getSessionsForDay(date: Date): Session[] {
        const key = this.toDateKey(date);
        return this.sessionsByDay.get(key) ?? [];
    }

    getPreviewSessionsForDay(date: Date): Session[] {
        return this.getSessionsForDay(date).slice(0, 3);
    }

    getHiddenSessionsCount(date: Date): number {
        const count = this.getSessionsForDay(date).length;
        return Math.max(0, count - 3);
    }

    getSessionTypeClass(session: Session): string {
        switch (session.type?.toLowerCase()) {
            case 'therapy': return 'type-therapy';
            case 'cognitive': return 'type-cognitive';
            case 'physical': return 'type-physical';
            case 'creative': return 'type-creative';
            default: return 'type-general';
        }
    }

    toggleFavorite(session: Session): void {
        this.alzheimerService.toggleFavorite(session.id);
    }

    selectSession(session: Session): void {
        this.selectedSession = this.selectedSession?.id === session.id ? null : session;
    }

    closeDetail(): void {
        this.selectedSession = null;
    }

    setModeFilter(filter: SessionModeFilter): void {
        if (this.selectedModeFilter === filter) return;
        this.selectedModeFilter = filter;
        this.applySessionFilters();

        if (this.isDayPopupOpen && this.selectedDay) {
            this.dayPopupSessions = this.getSessionsForDay(this.selectedDay);
        }

        if (this.selectedSession && !this.isSessionVisibleByMode(this.selectedSession)) {
            this.selectedSession = null;
        }
    }

    isModeFilterActive(filter: SessionModeFilter): boolean {
        return this.selectedModeFilter === filter;
    }

    openDaySessionsPopup(day: Date): void {
        if (day.getMonth() !== this.currentMonth.getMonth() || day.getFullYear() !== this.currentMonth.getFullYear()) {
            return;
        }

        this.selectedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        this.dayPopupSessions = this.getSessionsForDay(day);
        this.isDayPopupOpen = true;
    }

    closeDaySessionsPopup(): void {
        this.isDayPopupOpen = false;
        this.selectedDay = null;
        this.dayPopupSessions = [];
    }

    openSessionFromDayPopup(session: Session): void {
        this.selectSession(session);
        this.closeDaySessionsPopup();
    }

    trackBySessionId(_: number, session: Session): number {
        return session.id;
    }

    getStatusLabel(session: Session): string {
        const status = (session.status ?? '').toUpperCase();
        if (status === 'SCHEDULED' || status === 'ACCEPTED' || status === 'PLANNED') return 'Planifiee';
        if (status === 'DONE') return 'Terminee';
        return status || 'Inconnu';
    }

    getStatusClass(session: Session): string {
        const status = (session.status ?? '').toUpperCase();
        if (status === 'SCHEDULED' || status === 'ACCEPTED' || status === 'PLANNED') return 'status-planned';
        if (status === 'DONE') return 'status-done';
        return 'status-default';
    }

    private isPlannedSession(session: Session): boolean {
        const status = (session.status ?? '').toUpperCase();
        return this.plannedStatuses.has(status);
    }

    private applySessionFilters(): void {
        this.sessions = this.allPlannedSessions.filter(session => this.isSessionVisibleByMode(session));
        this.rebuildSessionsByDay();
    }

    private isSessionVisibleByMode(session: Session): boolean {
        if (this.selectedModeFilter === 'ALL') return true;
        return this.resolveSessionMode(session) === this.selectedModeFilter;
    }

    private resolveSessionMode(session: Session): 'ONLINE' | 'IN_PERSON' {
        const mode = (session.meetingMode ?? '').toUpperCase();
        if (mode === 'ONLINE') return 'ONLINE';
        if (mode === 'IN_PERSON') return 'IN_PERSON';
        return session.meetingUrl ? 'ONLINE' : 'IN_PERSON';
    }

    private rebuildSessionsByDay(): void {
        this.sessionsByDay.clear();

        for (const session of this.sessions) {
            const key = this.toDateKey(this.resolveSessionDate(session));
            const list = this.sessionsByDay.get(key) ?? [];
            list.push(session);
            this.sessionsByDay.set(key, list);
        }
    }

    private resolveSessionDate(session: Session): Date {
        if (session.startTime) return new Date(session.startTime);
        return new Date(session.date);
    }

    private toDateKey(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
