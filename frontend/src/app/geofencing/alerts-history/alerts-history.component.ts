import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GeofencingService, Alert } from '../shared/geofencing.service';

@Component({
    selector: 'app-alerts-history',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './alerts-history.component.html',
    styleUrl: './alerts-history.component.css'
})
export class AlertsHistoryComponent implements OnInit, OnDestroy {
    alerts: Alert[] = [];
    filteredAlerts: Alert[] = [];
    filterType: string = 'All';
    filterStatus: string = 'All';
    isLoading = true;
    errorMsg = '';

    private sub!: Subscription;

    constructor(private geofencingService: GeofencingService) {}

    ngOnInit(): void {
        // Polling temps réel toutes les 5s
        this.sub = this.geofencingService.getAlertsRealtime().subscribe({
            next: (data) => {
                this.alerts = data;
                this.applyFilters();
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMsg = 'Impossible de charger les alertes.';
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe(); // Évite les memory leaks
    }

    applyFilters(): void {
        this.filteredAlerts = this.alerts.filter(alert => {
            const typeMatch = this.filterType === 'All' || alert.type === this.filterType;
            const statusMatch = this.filterStatus === 'All' || alert.status === this.filterStatus;
            return typeMatch && statusMatch;
        });
    }

    resolveAlert(alert: Alert): void {
        this.geofencingService.resolveAlert(alert.id).subscribe({
            next: (updated) => {
                // Mise à jour locale immédiate sans attendre le polling
                const idx = this.alerts.findIndex(a => a.id === updated.id);
                if (idx !== -1) this.alerts[idx] = updated;
                this.applyFilters();
            },
            error: (err) => console.error('Erreur résolution alerte:', err)
        });
    }
}