import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatCalendar } from '@angular/material/datepicker';
import { Session } from '../../../../core/models/session.model';
import { SessionService } from '../../../../core/services/session.service';
import { SessionFormComponent } from '../session-form/session-form.component';

@Component({
    selector: 'app-session-list',
    standalone: false,
    templateUrl: './session-list.component.html',
    styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit, AfterViewInit {
    sessions: Session[] = [];
    dataSource: MatTableDataSource<Session>;
    displayedColumns: string[] = ['title', 'date', 'startTime', 'status', 'participants', 'actions'];
    selectedDate: Date | null = null;
    readonly allowAllDates = (_: Date | null): boolean => true;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

    constructor(
        private sessionService: SessionService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadSessions();
    }

    ngAfterViewInit(): void {
        this.syncTableControls();
        this.cdr.detectChanges();
    }

    loadSessions() {
        this.sessionService.getSessions().subscribe(data => {
            this.sessions = data;
            this.applyDateFilter();
            this.syncTableControls();
            this.cdr.detectChanges();
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    openSessionDialog(session?: Session) {
        const dialogRef = this.dialog.open(SessionFormComponent, {
            width: '600px',
            data: session
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadSessions();
            }
        });
    }

    deleteSession(session: Session) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la session "${session.title}" ?`)) {
            this.sessionService.deleteSession(session.id).subscribe(() => {
                this.loadSessions();
            });
        }
    }

    onDateSelected(date: Date | null) {
        const normalizedDate = date ? this.normalizeDate(date) : null;
        if (
            (this.selectedDate === null && normalizedDate === null) ||
            (this.selectedDate !== null &&
                normalizedDate !== null &&
                this.toDateKey(this.selectedDate) === this.toDateKey(normalizedDate))
        ) {
            return;
        }

        this.selectedDate = normalizedDate;
        this.applyDateFilter();
    }

    onCalendarClick(event: MouseEvent): void {
        const clickedDate = this.extractDateFromCalendarClick(event);
        if (!clickedDate) {
            return;
        }

        if (this.selectedDate && this.toDateKey(clickedDate) === this.toDateKey(this.selectedDate)) {
            return;
        }

        this.onDateSelected(clickedDate);
    }

    private applyDateFilter(): void {
        if (!this.selectedDate) {
            this.dataSource.data = this.sessions;
            this.syncTableControls();
            return;
        }

        this.sessionService.getSessionsByDate(this.selectedDate).subscribe({
            next: data => {
                this.dataSource.data = data;
                this.syncTableControls();
                this.cdr.detectChanges();
            },
            error: () => {
                const selectedDateKey = this.toDateKey(this.selectedDate as Date);
                this.dataSource.data = this.sessions.filter(session =>
                    this.toDateKey(session.date) === selectedDateKey
                );
                this.syncTableControls();
                this.cdr.detectChanges();
            }
        });
    }

    private toDateKey(dateValue: Date | string): string {
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private normalizeDate(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    private extractDateFromCalendarClick(event: MouseEvent): Date | null {
        if (!(event.target instanceof HTMLElement) || !this.calendar?.activeDate) {
            return null;
        }

        const clickedCell = event.target.closest('.mat-calendar-body-cell');
        if (!(clickedCell instanceof HTMLElement) || clickedCell.classList.contains('mat-calendar-body-disabled')) {
            return null;
        }

        const dayText = clickedCell.querySelector('.mat-calendar-body-cell-content')?.textContent?.trim();
        const day = Number.parseInt(dayText || '', 10);
        if (!Number.isInteger(day) || day < 1 || day > 31) {
            return null;
        }

        return new Date(
            this.calendar.activeDate.getFullYear(),
            this.calendar.activeDate.getMonth(),
            day
        );
    }

    private syncTableControls(): void {
        if (this.paginator) {
            this.dataSource.paginator = this.paginator;
        }

        if (this.sort) {
            this.dataSource.sort = this.sort;
        }
    }
}
