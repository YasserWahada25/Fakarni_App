import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, switchMap, shareReplay, of } from 'rxjs';

export interface Zone {
    id: number;
    nomZone: string;
    patientId: string;
    centreLat: number;
    centreLon: number;
    rayon: number;
    type: string;
}

export interface PatientPosition {
    id: number;
    patientId: string;
    latitude: number;
    longitude: number;
    timestamp: string;
}

export interface Alert {
    id: number;
    patientId: string;
    patientName: string;
    type: string;
    timestamp: string;
    status: 'Active' | 'Resolved';
    severity: 'High' | 'Medium' | 'Low';
    distanceHorsZone: number;
}

export interface PatientLocation {
    patientId: number;
    patientName: string;
    currentPosition: { lat: number; lng: number };
    lastUpdate: Date;
    isTracking: boolean;
}

@Injectable({ providedIn: 'root' })
export class GeofencingService {

    private gateway       = 'http://localhost:8090';
    private geofencingApi = `${this.gateway}/api/geofencing`;
    private trackingApi   = `${this.gateway}/api/tracking`;

    // Headers explicites pour éviter les problèmes CORS
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    private patientLocations: PatientLocation[] = [
        { patientId: 1, patientName: 'Ahmed Ben Ali', currentPosition: { lat: 36.8070, lng: 10.1820 }, lastUpdate: new Date(), isTracking: true },
        { patientId: 2, patientName: 'Fatma Zahra',   currentPosition: { lat: 36.8105, lng: 10.1905 }, lastUpdate: new Date(), isTracking: true }
    ];

    constructor(private http: HttpClient) {}

    // ─── ZONES ───────────────────────────────────────────────────

    getZones(): Observable<Zone[]> {
        return this.http.get<Zone[]>(`${this.geofencingApi}/zones`);
    }

    createZone(zone: Partial<Zone>): Observable<Zone> {
        return this.http.post<Zone>(`${this.geofencingApi}/zone`, zone, { headers: this.headers });
    }

    updateZone(id: number, zone: Partial<Zone>): Observable<Zone> {
        return this.http.put<Zone>(`${this.geofencingApi}/zone/${id}`, zone, { headers: this.headers });
    }

    deleteZone(id: number): Observable<void> {
        return this.http.delete<void>(`${this.geofencingApi}/zone/${id}`);
    }

    // ─── ALERTES ─────────────────────────────────────────────────

    getAlerts(): Observable<Alert[]> {
        return this.http.get<Alert[]>(`${this.geofencingApi}/alerts`);
    }

    getAlertsRealtime(): Observable<Alert[]> {
        return interval(5000).pipe(
            switchMap(() => this.getAlerts()),
            shareReplay(1)
        );
    }

    resolveAlert(alertId: number): Observable<Alert> {
        return this.http.put<Alert>(`${this.geofencingApi}/alerts/${alertId}/resolve`, {}, { headers: this.headers });
    }

    // ─── TRACKING réel ────────────────────────────────────────────

    getLastPosition(patientId: string): Observable<PatientPosition> {
        return this.http.get<PatientPosition>(`${this.trackingApi}/last/${patientId}`);
    }

    getAllLastPositions(): Observable<PatientPosition[]> {
        return this.http.get<PatientPosition[]>(`${this.trackingApi}/last`);
    }

    sendPosition(position: { patientId: string; latitude: number; longitude: number }): Observable<PatientPosition> {
        return this.http.post<PatientPosition>(`${this.trackingApi}/add`, position, { headers: this.headers });
    }

    // ─── TRACKING simulé ──────────────────────────────────────────

    getPatientLocations(): Observable<PatientLocation[]> {
        return of(this.patientLocations);
    }
}