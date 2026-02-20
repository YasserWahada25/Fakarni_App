import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Alert, AlertStatus } from '../../../../core/models/alert.model';
import { AlertSettings } from '../../../../core/models/alert-settings.model';
import { AlertService } from '../../../../core/services/alert.service';
import { AlertDetailComponent } from '../alert-detail/alert-detail.component';

@Component({
    selector: 'app-alert-management',
    standalone: false,
    templateUrl: './alert-management.component.html',
    styleUrls: ['./alert-management.component.scss']
})
export class AlertManagementComponent implements OnInit {
    alerts: Alert[] = [];
    dataSource: MatTableDataSource<Alert>;
    displayedColumns: string[] = ['timestamp', 'patient', 'type', 'zone', 'status', 'actions'];
    settings: AlertSettings | null = null;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private alertService: AlertService,
        private dialog: MatDialog
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadAlerts();
        this.loadSettings();
    }

    loadAlerts(): void {
        this.alertService.getAlerts().subscribe(alerts => {
            this.alerts = alerts;
            this.dataSource.data = alerts;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    loadSettings(): void {
        this.alertService.getSettings().subscribe(settings => {
            this.settings = settings;
        });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getAlertTypeLabel(type: string): string {
        const labels: any = {
            'zone_exit': 'Sortie de zone',
            'forbidden_entry': 'Entrée interdite',
            'gps_loss': 'Perte GPS',
            'low_battery': 'Batterie faible'
        };
        return labels[type] || type;
    }

    getStatusClass(status: AlertStatus): string {
        return status.replace('_', '-');
    }

    openAlertDetail(alert: Alert): void {
        const dialogRef = this.dialog.open(AlertDetailComponent, {
            width: '700px',
            data: alert
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadAlerts();
            }
        });
    }

    markAsResolved(alert: Alert): void {
        this.alertService.updateAlertStatus(alert.id, 'resolved').subscribe(() => {
            this.loadAlerts();
        });
    }

    saveSettings(): void {
        if (this.settings) {
            this.alertService.updateSettings(this.settings).subscribe(() => {
                alert('Paramètres sauvegardés avec succès');
            });
        }
    }
}
