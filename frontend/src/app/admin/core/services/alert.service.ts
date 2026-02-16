import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Alert, AlertStatistics, AlertStatus } from '../models/alert.model';
import { AlertSettings, DEFAULT_ALERT_SETTINGS } from '../models/alert-settings.model';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private alerts: Alert[] = [
        {
            id: 1,
            timestamp: new Date('2023-11-15T14:30:00'),
            patientId: 1,
            patientName: 'Ahmed Ben Ali',
            patientPhoto: 'assets/patients/ahmed.jpg',
            type: 'zone_exit',
            zoneId: 1,
            zoneName: 'Domicile - Ahmed Ben Ali',
            status: 'resolved',
            actionsTaken: ['sms', 'email'],
            position: { lat: 36.8100, lng: 10.1850 },
            notes: 'Patient retrouvé au parc. Famille contactée.',
            resolvedAt: new Date('2023-11-15T15:45:00'),
            resolvedBy: 'Admin'
        },
        {
            id: 2,
            timestamp: new Date('2023-11-20T09:15:00'),
            patientId: 2,
            patientName: 'Fatma Zahra',
            type: 'gps_loss',
            status: 'resolved',
            actionsTaken: ['sms', 'push'],
            notes: 'Signal GPS rétabli après 10 minutes.',
            resolvedAt: new Date('2023-11-20T09:25:00'),
            resolvedBy: 'System'
        },
        {
            id: 3,
            timestamp: new Date('2023-12-01T16:20:00'),
            patientId: 1,
            patientName: 'Ahmed Ben Ali',
            type: 'forbidden_entry',
            zoneId: 3,
            zoneName: 'Zone Interdite - Autoroute',
            status: 'new',
            actionsTaken: ['sms', 'email', 'push'],
            position: { lat: 36.8280, lng: 10.1620 }
        },
        {
            id: 4,
            timestamp: new Date('2023-12-05T11:00:00'),
            patientId: 3,
            patientName: 'Mohamed Salah',
            type: 'zone_exit',
            zoneId: 2,
            zoneName: 'Centre de Jour',
            status: 'in_progress',
            actionsTaken: ['email'],
            position: { lat: 36.8210, lng: 10.1680 },
            notes: 'Famille en route pour récupérer le patient.'
        },
        {
            id: 5,
            timestamp: new Date('2023-12-08T13:45:00'),
            patientId: 2,
            patientName: 'Fatma Zahra',
            type: 'low_battery',
            status: 'ignored',
            actionsTaken: ['push'],
            notes: 'Batterie rechargée.'
        }
    ];

    private settings: AlertSettings = { ...DEFAULT_ALERT_SETTINGS };

    constructor() { }

    getAlerts(): Observable<Alert[]> {
        return of(this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    }

    getAlertById(id: number): Observable<Alert | undefined> {
        return of(this.alerts.find(a => a.id === id));
    }

    getAlertsByPatient(patientId: number): Observable<Alert[]> {
        return of(this.alerts.filter(a => a.patientId === patientId));
    }

    getAlertsByStatus(status: AlertStatus): Observable<Alert[]> {
        return of(this.alerts.filter(a => a.status === status));
    }

    updateAlertStatus(id: number, status: AlertStatus, notes?: string): Observable<Alert | undefined> {
        const alert = this.alerts.find(a => a.id === id);
        if (alert) {
            alert.status = status;
            if (notes) alert.notes = notes;
            if (status === 'resolved') {
                alert.resolvedAt = new Date();
                alert.resolvedBy = 'Admin';
            }
            return of(alert);
        }
        return of(undefined);
    }

    getStatistics(): Observable<AlertStatistics> {
        const stats: AlertStatistics = {
            totalAlerts: this.alerts.length,
            resolvedAlerts: this.alerts.filter(a => a.status === 'resolved').length,
            activeAlerts: this.alerts.filter(a => a.status === 'new' || a.status === 'in_progress').length,
            alertsByType: {
                zone_exit: this.alerts.filter(a => a.type === 'zone_exit').length,
                forbidden_entry: this.alerts.filter(a => a.type === 'forbidden_entry').length,
                gps_loss: this.alerts.filter(a => a.type === 'gps_loss').length,
                low_battery: this.alerts.filter(a => a.type === 'low_battery').length
            },
            alertsByDay: this.getAlertsByDay()
        };
        return of(stats);
    }

    private getAlertsByDay(): { date: string; count: number }[] {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = this.alerts.filter(a =>
                a.timestamp.toISOString().split('T')[0] === dateStr
            ).length;
            last7Days.push({ date: dateStr, count });
        }
        return last7Days;
    }

    getSettings(): Observable<AlertSettings> {
        return of(this.settings);
    }

    updateSettings(settings: Partial<AlertSettings>): Observable<AlertSettings> {
        this.settings = { ...this.settings, ...settings };
        return of(this.settings);
    }
}
