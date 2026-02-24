import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Zone, PatientLocation } from '../models/geographic-zone.model';

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {
    // CORRECTION : On s'arrête à "geofencing"
    private apiUrl = 'http://localhost:8090/api/geofencing';

    // Données simulées pour la localisation (à remplacer par une API plus tard)
    private patientLocations: PatientLocation[] = [
        {
            patientId: 1,
            patientName: 'Ahmed Ben Ali',
            currentPosition: { lat: 36.8070, lng: 10.1820 },
            lastUpdate: new Date(),
            isTracking: true
        },
        {
            patientId: 2,
            patientName: 'Fatma Zahra',
            currentPosition: { lat: 36.8105, lng: 10.1905 },
            lastUpdate: new Date(),
            isTracking: true
        }
    ];

    constructor(private http: HttpClient) { }

    // --- Appels API Backend ---
    getZones(): Observable<any[]> {
        // Résultat : http://localhost:8090/api/geofencing/zones
        return this.http.get<any[]>(`${this.apiUrl}/zones`);
    }

    createZone(zone: any): Observable<any> {
        // Résultat : http://localhost:8090/api/geofencing/zone
        return this.http.post<any>(`${this.apiUrl}/zone`, zone);
    }

    updateZone(id: number, zone: any): Observable<any> {
        // Résultat : http://localhost:8090/api/geofencing/zone/1
        return this.http.put<any>(`${this.apiUrl}/zone/${id}`, zone);
    }

    deleteZone(id: number): Observable<void> {
        // Résultat : http://localhost:8090/api/geofencing/zone/1
        return this.http.delete<void>(`${this.apiUrl}/zone/${id}`);
    }

    // --- Données Locales (Tracking) ---
    getPatientLocations(): Observable<PatientLocation[]> {
        return of(this.patientLocations);
    }
}