import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeofencingService, PatientLocation, Zone } from '../shared/geofencing.service';

@Component({
    selector: 'app-live-tracking',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './live-tracking.component.html',
    styleUrl: './live-tracking.component.css'
})
export class LiveTrackingComponent implements OnInit {
    patients: PatientLocation[] = [];
    zones: Zone[] = [];
    selectedPatient: PatientLocation | null = null;

    // Simulation of map scaling
    mapWidth = 800;
    mapHeight = 500;

    constructor(private geofencingService: GeofencingService) { }

    ngOnInit(): void {
        this.geofencingService.getPatients().subscribe(data => this.patients = data);
        this.geofencingService.getZones().subscribe(data => this.zones = data);
    }

    selectPatient(patient: PatientLocation): void {
        this.selectedPatient = patient;
    }

    // Mock function to translate lat/long to X/Y for the demo map
    getMapPosition(lat: number, lng: number): { x: number, y: number } {
        // Base coordinates (approx center of "map")
        const baseLat = 34.0530;
        const baseLng = -118.2425;
        const scale = 100000; // Arbitrary scale factor for demo

        const y = this.mapHeight / 2 - (lat - baseLat) * scale;
        const x = this.mapWidth / 2 + (lng - baseLng) * scale;

        return { x, y };
    }
}
