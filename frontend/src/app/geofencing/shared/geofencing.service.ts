import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Zone {
    id: number;
    name: string;
    status: 'Safe' | 'Risk' | 'Restricted';
    coordinates: string; // Formatting for mock display
}

export interface PatientLocation {
    id: number;
    name: string;
    status: 'Safe' | 'Warning' | 'Critical';
    lastUpdate: Date;
    currentZoneId: number;
    coordinates: { lat: number, lng: number };
}

export interface Alert {
    id: number;
    patientId: number;
    patientName: string;
    type: 'Zone Exit' | 'Abnormal Movement' | 'Low Battery';
    timestamp: Date;
    status: 'Active' | 'Resolved';
    severity: 'High' | 'Medium' | 'Low';
}

@Injectable({
    providedIn: 'root'
})
export class GeofencingService {
    // Mock Data
    private zones: Zone[] = [
        { id: 1, name: 'Home Garden', status: 'Safe', coordinates: '34.0522° N, 118.2437° W' },
        { id: 2, name: 'Neighborhood Park', status: 'Safe', coordinates: '34.0530° N, 118.2420° W' },
        { id: 3, name: 'Busy Road Intersection', status: 'Restricted', coordinates: '34.0545° N, 118.2410° W' }
    ];

    private patients: PatientLocation[] = [
        { id: 101, name: 'Alice Smith', status: 'Safe', lastUpdate: new Date(), currentZoneId: 1, coordinates: { lat: 34.0522, lng: -118.2437 } },
        { id: 102, name: 'Bob Jones', status: 'Warning', lastUpdate: new Date(), currentZoneId: 0, coordinates: { lat: 34.0540, lng: -118.2425 } }
    ];

    private alerts: Alert[] = [
        { id: 501, patientId: 102, patientName: 'Bob Jones', type: 'Zone Exit', timestamp: new Date(), status: 'Active', severity: 'High' },
        { id: 502, patientId: 101, patientName: 'Alice Smith', type: 'Low Battery', timestamp: new Date(Date.now() - 3600000), status: 'Resolved', severity: 'Low' }
    ];

    getZones(): Observable<Zone[]> {
        return of(this.zones);
    }

    getPatients(): Observable<PatientLocation[]> {
        return of(this.patients);
    }

    getAlerts(): Observable<Alert[]> {
        return of(this.alerts);
    }

    resolveAlert(alertId: number): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = 'Resolved';
        }
    }
}
