import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Event as AppEvent } from '../../../../core/models/event.model';
import { EventService } from '../../../../core/services/event.service';
import { EventFormComponent } from '../event-form/event-form.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-event-list',
    standalone: false,
    templateUrl: './event-list.component.html',
    styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit, AfterViewInit {
    events: AppEvent[] = [];
    dataSource: MatTableDataSource<AppEvent>;
    displayedColumns: string[] = ['title', 'date', 'startTime', 'status', 'participants', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('participationChart') participationChart!: ElementRef;

    isBrowser: boolean;

    constructor(
        private eventService: EventService,
        private dialog: MatDialog,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.dataSource = new MatTableDataSource();
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        this.loadEvents();
    }

    ngAfterViewInit() {
    }

    loadEvents() {
        this.eventService.getEvents().subscribe(data => {
            this.events = data;
            this.dataSource.data = data;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    openEventDialog(event?: AppEvent) {
        const dialogRef = this.dialog.open(EventFormComponent, {
            width: '600px',
            data: event
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadEvents();
            }
        });
    }

    deleteEvent(event: AppEvent) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`)) {
            this.eventService.deleteEvent(event.id).subscribe(() => {
                this.loadEvents();
            });
        }
    }
}
