import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EducationalActivity, ActivityType } from '../../../../core/models/educational-activity.model';
import { ActivityService } from '../../../../core/services/activity.service';
import { ActivityFormComponent } from '../activity-form/activity-form.component';

@Component({
    selector: 'app-activity-list',
    standalone: false,
    templateUrl: './activity-list.component.html',
    styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
    activities: EducationalActivity[] = [];
    dataSource: MatTableDataSource<EducationalActivity>;
    displayedColumns: string[] = ['name', 'type', 'createdDate', 'status', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private activityService: ActivityService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadActivities();
    }

    loadActivities(): void {
        this.activityService.getActivities().subscribe(activities => {
            this.activities = activities;
            this.dataSource.data = activities;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getActivityTypeLabel(type: ActivityType): string {
        const labels: { [key in ActivityType]: string } = {
            'quiz': 'Quiz',
            'cognitive_game': 'Jeu Cognitif',
            'video': 'Vidéo'
        };
        return labels[type];
    }

    getActivityTypeClass(type: ActivityType): string {
        return type.replace('_', '-');
    }

    openActivityDialog(activity?: EducationalActivity): void {
        const dialogRef = this.dialog.open(ActivityFormComponent, {
            width: '700px',
            data: activity
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadActivities();
                this.snackBar.open(
                    activity ? 'Activité modifiée avec succès' : 'Activité ajoutée avec succès',
                    'Fermer',
                    { duration: 3000 }
                );
            }
        });
    }

    deleteActivity(activity: EducationalActivity): void {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'activité "${activity.name}" ?`)) {
            this.activityService.deleteActivity(activity.id).subscribe(success => {
                if (success) {
                    this.loadActivities();
                    this.snackBar.open('Activité supprimée avec succès', 'Fermer', { duration: 3000 });
                }
            });
        }
    }
}
