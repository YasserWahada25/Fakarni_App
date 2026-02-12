import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Session } from '../../../../core/models/session.model';
import { SessionService } from '../../../../core/services/session.service';
import { SessionFormComponent } from '../session-form/session-form.component';

@Component({
    selector: 'app-session-list',
    standalone: false,
    templateUrl: './session-list.component.html',
    styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit {
    sessions: Session[] = [];
    dataSource: MatTableDataSource<Session>;
    displayedColumns: string[] = ['title', 'date', 'startTime', 'status', 'participants', 'actions'];
    selectedDate: Date | null = null;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private sessionService: SessionService,
        private dialog: MatDialog
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadSessions();
    }

    loadSessions() {
        this.sessionService.getSessions().subscribe(data => {
            this.sessions = data;
            this.dataSource.data = data;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
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
        this.selectedDate = date;
        if (date) {
            // Filter sessions by selected date
            const selectedDateString = date.toDateString();
            const filtered = this.sessions.filter(s => new Date(s.date).toDateString() === selectedDateString);
            this.dataSource.data = filtered;
        } else {
            this.dataSource.data = this.sessions;
        }
    }
}
