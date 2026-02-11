import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeofencingService, Alert } from '../shared/geofencing.service';

@Component({
    selector: 'app-alerts-history',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './alerts-history.component.html',
    styleUrl: './alerts-history.component.css'
})
export class AlertsHistoryComponent implements OnInit {
    alerts: Alert[] = [];
    filteredAlerts: Alert[] = [];
    filterType: string = 'All';
    filterStatus: string = 'All';

    // Notification Settings
    settings = {
        smsEnabled: true,
        emailEnabled: false,
        pushEnabled: true,
        emergencyContact: '+1 555-0123'
    };

    constructor(private geofencingService: GeofencingService) { }

    ngOnInit(): void {
        this.geofencingService.getAlerts().subscribe(data => {
            this.alerts = data;
            this.applyFilters();
        });
    }

    applyFilters(): void {
        this.filteredAlerts = this.alerts.filter(alert => {
            const typeMatch = this.filterType === 'All' || alert.type === this.filterType;
            const statusMatch = this.filterStatus === 'All' || alert.status === this.filterStatus;
            return typeMatch && statusMatch;
        });
    }

    resolveAlert(alert: Alert): void {
        this.geofencingService.resolveAlert(alert.id);
        // Refresh local data mock hack
        alert.status = 'Resolved';
        this.applyFilters();
    }

    saveSettings(): void {
        alert('Notification settings saved!');
    }
}
