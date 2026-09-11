import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, switchMap, shareReplay, of, Subject } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Zone {
    id: number;
    nomZone: string;
    patientId: string;
    soignantId: string;
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
    soignantId: string;
    type: string;
    timestamp: any;
    status: 'Active' | 'Resolved';
    severity: 'High' | 'Medium' | 'Low';
    distanceHorsZone: number;
}

export interface NotificationPreference {
    id?: number;
    soignantId: string;
    emailEnabled: boolean;
    voiceEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class GeofencingService {

    private gateway       = environment.apiUrl || '';
    private geofencingApi = `${this.gateway}/api/geofencing`;
    private trackingApi   = `${this.gateway}/api/tracking`;
    private headers       = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Stream GPS pour la carte live
    private positionSubject = new Subject<{ latitude: number; longitude: number }>();
    positionStream$         = this.positionSubject.asObservable();
    private watchId: number | null = null;

    constructor(private http: HttpClient) {}

    // ─── ZONES ───────────────────────────────────────────────────

    getZones(): Observable<Zone[]> {
        return this.http.get<Zone[]>(`${this.geofencingApi}/zones`);
    }

    getZonesByPatient(patientId: string): Observable<Zone[]> {
        return this.http.get<Zone[]>(`${this.geofencingApi}/zones/patient/${patientId}`);
    }

    getZonesBySoignant(soignantId: string): Observable<Zone[]> {
        return this.http.get<Zone[]>(`${this.geofencingApi}/zones/soignant/${soignantId}`);
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

    getAlertsByPatient(patientId: string): Observable<Alert[]> {
        return this.http.get<Alert[]>(`${this.geofencingApi}/alerts/patient/${patientId}`);
    }

    getAlertsBySoignant(soignantId: string): Observable<Alert[]> {
        return this.http.get<Alert[]>(`${this.geofencingApi}/alerts/soignant/${soignantId}`);
    }

    getAlertsRealtime(patientId?: string, soignantId?: string): Observable<Alert[]> {
        return timer(0, 5000).pipe(
            switchMap(() => {
                if (patientId)  return this.getAlertsByPatient(patientId);
                if (soignantId) return this.getAlertsBySoignant(soignantId);
                return this.getAlerts();
            }),
            shareReplay(1)
        );
    }

    resolveAlert(alertId: number): Observable<Alert> {
        return this.http.put<Alert>(
            `${this.geofencingApi}/alerts/${alertId}/resolve`, {},
            { headers: this.headers }
        );
    }

    // ─── TRACKING ────────────────────────────────────────────────

    getAllLastPositions(): Observable<PatientPosition[]> {
        return this.http.get<PatientPosition[]>(`${this.trackingApi}/last`);
    }

    getLastPosition(patientId: string): Observable<PatientPosition> {
        return this.http.get<PatientPosition>(`${this.trackingApi}/last/${patientId}`);
    }

    sendPosition(patientId: string, latitude: number, longitude: number): Observable<PatientPosition> {
        return this.http.post<PatientPosition>(
            `${this.trackingApi}/add`,
            { patientId, latitude, longitude },
            { headers: this.headers }
        );
    }

    // ─── GPS TEMPS RÉEL ──────────────────────────────────────────

    startTracking(patientId: string): Observable<GeolocationPosition> {
        return new Observable(observer => {
            if (!navigator.geolocation) {
                observer.error('Géolocalisation non supportée.');
                return;
            }

            this.watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    // Diffuser pour la carte
                    this.positionSubject.next({
                        latitude:  pos.coords.latitude,
                        longitude: pos.coords.longitude
                    });
                    // Envoyer au backend
                    this.sendPosition(patientId, pos.coords.latitude, pos.coords.longitude)
                        .subscribe({ error: (e) => console.error('sendPosition error:', e) });

                    observer.next(pos);
                },
                (err) => observer.error(err),
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
            );

            return () => this.stopTracking();
        });
    }

    stopTracking(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    // ─── SOS ─────────────────────────────────────────────────────

    triggerSos(patientId: string, soignantId: string,
               latitude: number, longitude: number): Observable<any> {
        return this.http.post(
            `${this.geofencingApi}/sos/trigger`,
            { patientId, soignantId, latitude, longitude },
            { headers: this.headers }
        );
    }

    // ─── NOTIFICATION PREFERENCES (soignant) ─────────────────────

    getNotificationPreferences(soignantId: string): Observable<NotificationPreference> {
        return this.http.get<NotificationPreference>(
            `${this.geofencingApi}/preferences/${soignantId}`
        ).pipe(
            timeout(5000),
            catchError(() => of({ soignantId, emailEnabled: true, voiceEnabled: false }))
        );
    }

    saveNotificationPreferences(pref: NotificationPreference): Observable<NotificationPreference> {
        return this.http.post<NotificationPreference>(
            `${this.geofencingApi}/preferences`, pref,
            { headers: this.headers }
        ).pipe(
            timeout(5000),
            catchError(() => of(pref))
        );
    }
}