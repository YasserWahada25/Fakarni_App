import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GeographicZone, PatientLocation } from '../../../../core/models/geographic-zone.model';
import { GeolocationService } from '../../../../core/services/geolocation.service';
import { PatientService } from '../../../../core/services/patient.service';
import { ZoneFormComponent } from '../zone-form/zone-form.component';

@Component({
    selector: 'app-zone-management',
    standalone: false,
    templateUrl: './zone-management.component.html',
    styleUrls: ['./zone-management.component.scss']
})
export class ZoneManagementComponent implements OnInit, AfterViewInit {
    @ViewChild('map') mapContainer!: ElementRef;

    zones: GeographicZone[] = [];
    patientLocations: PatientLocation[] = [];
    dataSource: MatTableDataSource<PatientLocation>;
    displayedColumns: string[] = ['name', 'zones', 'status', 'lastUpdate', 'actions'];

    map: any;
    isBrowser: boolean;
    searchTerm: string = '';

    constructor(
        private geolocationService: GeolocationService,
        private patientService: PatientService,
        private dialog: MatDialog,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.loadData();
    }

    ngAfterViewInit(): void {
        if (this.isBrowser) {
            setTimeout(() => this.initMap(), 100);
        }
    }

    loadData(): void {
        this.geolocationService.getZones().subscribe(zones => {
            this.zones = zones;
            if (this.map) {
                this.updateMapZones();
            }
        });

        this.geolocationService.getPatientLocations().subscribe(locations => {
            this.patientLocations = locations;
            this.dataSource.data = locations;
            if (this.map) {
                this.updateMapMarkers();
            }
        });
    }

    async initMap(): Promise<void> {
        if (!this.isBrowser || !this.mapContainer) return;

        const L = await import('leaflet');

        this.map = L.map(this.mapContainer.nativeElement).setView([36.8065, 10.1815], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.updateMapZones();
        this.updateMapMarkers();
    }

    async updateMapZones(): Promise<void> {
        if (!this.map || !this.isBrowser) return;

        const L = await import('leaflet');

        this.zones.forEach(zone => {
            const color = this.getZoneColor(zone.type);

            if (zone.coordinates.type === 'circle' && zone.coordinates.center && zone.coordinates.radius) {
                L.circle([zone.coordinates.center.lat, zone.coordinates.center.lng], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.2,
                    radius: zone.coordinates.radius
                }).addTo(this.map).bindPopup(`<b>${zone.name}</b><br>Type: ${zone.type}`);
            } else if (zone.coordinates.type === 'polygon' && zone.coordinates.points) {
                const latlngs = zone.coordinates.points.map(p => [p.lat, p.lng] as [number, number]);
                L.polygon(latlngs, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.2
                }).addTo(this.map).bindPopup(`<b>${zone.name}</b><br>Type: ${zone.type}`);
            }
        });
    }

    async updateMapMarkers(): Promise<void> {
        if (!this.map || !this.isBrowser) return;

        const L = await import('leaflet');

        this.patientLocations.forEach(location => {
            const icon = L.icon({
                iconUrl: 'assets/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
            });

            L.marker([location.currentPosition.lat, location.currentPosition.lng], { icon })
                .addTo(this.map)
                .bindPopup(`<b>${location.patientName}</b><br>Dernière mise à jour: ${new Date(location.lastUpdate).toLocaleString()}`);
        });
    }

    getZoneColor(type: string): string {
        switch (type) {
            case 'authorized': return '#4CAF50';
            case 'danger': return '#FF9800';
            case 'forbidden': return '#F44336';
            default: return '#2196F3';
        }
    }

    getZoneCount(patientId: number): number {
        return this.zones.filter(z => z.patientIds.includes(patientId)).length;
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    openZoneDialog(zone?: GeographicZone): void {
        const dialogRef = this.dialog.open(ZoneFormComponent, {
            width: '600px',
            data: zone
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadData();
            }
        });
    }

    viewPatientZones(patientId: number): void {
        // Filter zones for this patient
        console.log('View zones for patient:', patientId);
    }

    deleteZone(zone: GeographicZone): void {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la zone "${zone.name}" ?`)) {
            this.geolocationService.deleteZone(zone.id).subscribe(() => {
                this.loadData();
            });
        }
    }
}
