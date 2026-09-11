import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Alert, AlertStatistics } from '../models/alert.model';
import { AlertSettings, DEFAULT_ALERT_SETTINGS } from '../models/alert-settings.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlertService {

    private gateway       = environment.apiUrl || '';
    private geofencingApi = `${this.gateway}/api/geofencing`;
    private headers       = new HttpHeaders({ 'Content-Type': 'application/json' });
    private readonly SETTINGS_KEY = 'backoffice_alert_settings';

    constructor(private http: HttpClient) {}

    getAlerts(): Observable<Alert[]> {
        return this.http.get<Alert[]>(`${this.geofencingApi}/alerts`);
    }

    updateAlertStatus(id: number, status: string, notes?: string): Observable<Alert> {
        return this.http.put<Alert>(
            `${this.geofencingApi}/alerts/${id}/resolve`,
            { status, notes },
            { headers: this.headers }
        );
    }

    // ← Calculé depuis les alertes réelles
    getStatistics(): Observable<AlertStatistics> {
        return this.getAlerts().pipe(
            map(alerts => {
                const byType: { [key: string]: number } = {};
                alerts.forEach(a => {
                    byType[a.type] = (byType[a.type] || 0) + 1;
                });

                // Grouper par jour
                const byDayMap: { [date: string]: number } = {};
                alerts.forEach(a => {
                    const d = this.formatDate(a.timestamp);
                    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    byDayMap[key] = (byDayMap[key] || 0) + 1;
                });

                const alertsByDay = Object.entries(byDayMap)
                    .map(([date, count]) => ({ date, count }))
                    .sort((a, b) => a.date.localeCompare(b.date));

                return {
                    totalAlerts:    alerts.length,
                    activeAlerts:   alerts.filter(a => a.status === 'Active').length,
                    resolvedAlerts: alerts.filter(a => a.status === 'Resolved').length,
                    alertsByType:   byType,
                    alertsByDay
                };
            })
        );
    }

    getSettings(): Observable<AlertSettings> {
        try {
            const raw = localStorage.getItem(this.SETTINGS_KEY);
            return of(raw
                ? { ...DEFAULT_ALERT_SETTINGS, ...JSON.parse(raw) }
                : { ...DEFAULT_ALERT_SETTINGS }
            );
        } catch {
            return of({ ...DEFAULT_ALERT_SETTINGS });
        }
    }

    updateSettings(settings: AlertSettings): Observable<AlertSettings> {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
        return of(settings);
    }

    // Helper partagé
    private formatDate(ts: any): Date {
        if (!ts) return new Date();
        if (Array.isArray(ts)) {
            const [y, m, d, h, min, s] = ts;
            return new Date(y, m - 1, d, h, min, s ?? 0);
        }
        return new Date(ts);
    }
}
