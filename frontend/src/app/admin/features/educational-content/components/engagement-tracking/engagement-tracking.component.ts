import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PatientEngagement, EngagementStatistics, ParticipationStatus } from '../../../../core/models/patient-engagement.model';
import { EngagementService } from '../../../../core/services/engagement.service';

@Component({
    selector: 'app-engagement-tracking',
    standalone: false,
    templateUrl: './engagement-tracking.component.html',
    styleUrls: ['./engagement-tracking.component.scss']
})
export class EngagementTrackingComponent implements OnInit {
    engagements: PatientEngagement[] = [];
    dataSource: MatTableDataSource<PatientEngagement>;
    displayedColumns: string[] = ['patient', 'activity', 'status', 'score', 'progress'];
    statistics: EngagementStatistics | null = null;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private engagementService: EngagementService) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadEngagements();
        this.loadStatistics();
    }

    loadEngagements(): void {
        this.engagementService.getEngagements().subscribe(engagements => {
            this.engagements = engagements;
            this.dataSource.data = engagements;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    loadStatistics(): void {
        this.engagementService.getStatistics().subscribe(stats => {
            this.statistics = stats;
        });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getStatusLabel(status: ParticipationStatus): string {
        const labels: { [key in ParticipationStatus]: string } = {
            'not_started': 'Non commencé',
            'in_progress': 'En cours',
            'completed': 'Terminé',
            'abandoned': 'Abandonné'
        };
        return labels[status];
    }

    getStatusClass(status: ParticipationStatus): string {
        return status.replace('_', '-');
    }
}
