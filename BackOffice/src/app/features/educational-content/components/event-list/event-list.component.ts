import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EducationalEvent, EventStatus } from '../../../../core/models/educational-event.model';
import { EducationalEventService } from '../../../../core/services/educational-event.service';
import { EventFormComponent } from '../event-form/event-form.component';

@Component({
    selector: 'app-event-list',
    standalone: false,
    templateUrl: './event-list.component.html',
    styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
    events: EducationalEvent[] = [];
    dataSource: MatTableDataSource<EducationalEvent>;
    displayedColumns: string[] = ['title', 'date', 'time', 'status', 'participants', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private eventService: EducationalEventService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadEvents();
    }

    loadEvents(): void {
        this.eventService.getEvents().subscribe(events => {
            this.events = events;
            this.dataSource.data = events;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getStatusLabel(status: EventStatus): string {
        const labels: { [key in EventStatus]: string } = {
            'scheduled': 'Programmé',
            'ongoing': 'En cours',
            'completed': 'Terminé',
            'cancelled': 'Annulé'
        };
        return labels[status];
    }

    openEventDialog(event?: EducationalEvent): void {
        const dialogRef = this.dialog.open(EventFormComponent, {
            width: '700px',
            data: event
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadEvents();
                this.snackBar.open(
                    event ? 'Événement modifié avec succès' : 'Événement ajouté avec succès',
                    'Fermer',
                    { duration: 3000 }
                );
            }
        });
    }

    deleteEvent(event: EducationalEvent): void {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`)) {
            this.eventService.deleteEvent(event.id).subscribe(success => {
                if (success) {
                    this.loadEvents();
                    this.snackBar.open('Événement supprimé avec succès', 'Fermer', { duration: 3000 });
                }
            });
        }
    }
}
