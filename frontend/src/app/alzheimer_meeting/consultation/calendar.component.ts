import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionDetailComponent } from './session-detail.component';
import { AlzheimerService, Session } from '../shared/alzheimer.service';

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
    weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    constructor(private alzheimerService: AlzheimerService) { }

    ngOnInit(): void {
        this.generateCalendar();
        this.alzheimerService.getSessions().subscribe(sessions => {
            this.sessions = sessions;
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

        // Previous month's padding
        for (let i = 0; i < startingDay; i++) {
            // Correct date calculation for previous month days
            const prevMonthDay = new Date(year, month, -startingDay + 1 + i);
            this.calendarDays.push(prevMonthDay);
        }

        // Current month's days
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

    getSessionsForDay(date: Date): Session[] {
        return this.sessions.filter(s =>
            s.date.getDate() === date.getDate() &&
            s.date.getMonth() === date.getMonth() &&
            s.date.getFullYear() === date.getFullYear()
        );
    }

    toggleFavorite(session: Session): void {
        this.alzheimerService.toggleFavorite(session.id);
    }

    selectedSession: Session | null = null;

    selectSession(session: Session): void {
        this.selectedSession = session;
    }

    closeDetail(): void {
        this.selectedSession = null;
    }
}
