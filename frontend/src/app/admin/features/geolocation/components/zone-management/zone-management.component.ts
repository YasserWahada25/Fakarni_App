import { Component, OnInit } from '@angular/core';
// zone-management.component.ts
import { GeofencingService, Zone } from '../../../../../geofencing/shared/geofencing.service';

@Component({
    selector: 'app-zone-management',
    standalone: false,
    templateUrl: './zone-management.component.html',
    styleUrls: ['./zone-management.component.scss']
})
export class ZoneManagementComponent implements OnInit {

    zones: Zone[]         = [];
    filteredZones: Zone[] = [];
    isLoading             = true;
    searchTerm            = '';

    totalZones  = 0;
    safeZones   = 0;
    dangerZones = 0;

    // ✅ GeofencingService au lieu de GeolocationService
    constructor(private geofencingService: GeofencingService) {}

    ngOnInit(): void {
        this.loadZones();
    }

    loadZones(): void {
        this.isLoading = true;
        this.geofencingService.getZones().subscribe({
            next: (zones: Zone[]) => {
                this.zones         = zones;
                this.filteredZones = zones;
                this.totalZones    = zones.length;
                this.safeZones     = zones.filter(z => z.type === 'SAFE').length;
                this.dangerZones   = zones.filter(z => z.type === 'DANGER').length;
                this.isLoading     = false;
            },
            error: (err: Error) => {
                console.error('Failed to load zones', err);
                this.isLoading = false;
            }
        });
    }

    applyFilter(event: Event): void {
        const term      = (event.target as HTMLInputElement).value.toLowerCase().trim();
        this.searchTerm = term;
        this.filteredZones = term
            ? this.zones.filter(z =>
                z.nomZone?.toLowerCase().includes(term) ||
                z.patientId?.toLowerCase().includes(term) ||
                z.type?.toLowerCase().includes(term))
            : [...this.zones];
    }

    formatCoord(val: number): string {
        return Number(val).toFixed(4);
    }
}