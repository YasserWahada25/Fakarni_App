import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MovementStatistics {
    patientId: number;
    patientName: string;
    movementCount: number;
    averageDistance: number; // in km
    mostVisitedZone: string;
}

export interface RiskZone {
    zoneId: number;
    zoneName: string;
    alertCount: number;
    affectedPatients: number;
    resolutionRate: number; // percentage
}

@Injectable({
    providedIn: 'root'
})
export class StatisticsService {
    private movementStats: MovementStatistics[] = [
        {
            patientId: 1,
            patientName: 'Ahmed Ben Ali',
            movementCount: 45,
            averageDistance: 2.3,
            mostVisitedZone: 'Centre de Jour'
        },
        {
            patientId: 2,
            patientName: 'Fatma Zahra',
            movementCount: 32,
            averageDistance: 1.8,
            mostVisitedZone: 'Domicile'
        },
        {
            patientId: 3,
            patientName: 'Mohamed Salah',
            movementCount: 28,
            averageDistance: 1.5,
            mostVisitedZone: 'Centre de Jour'
        }
    ];

    private riskZones: RiskZone[] = [
        {
            zoneId: 3,
            zoneName: 'Zone Interdite - Autoroute',
            alertCount: 12,
            affectedPatients: 2,
            resolutionRate: 75
        },
        {
            zoneId: 5,
            zoneName: 'Zone de Danger - Port',
            alertCount: 8,
            affectedPatients: 3,
            resolutionRate: 87.5
        },
        {
            zoneId: 1,
            zoneName: 'Domicile - Ahmed Ben Ali',
            alertCount: 5,
            affectedPatients: 1,
            resolutionRate: 100
        }
    ];

    constructor() { }

    getMovementStatistics(): Observable<MovementStatistics[]> {
        return of(this.movementStats);
    }

    getRiskZones(): Observable<RiskZone[]> {
        return of(this.riskZones.sort((a, b) => b.alertCount - a.alertCount));
    }

    getMovementsByPatient(patientId: number): Observable<MovementStatistics | undefined> {
        return of(this.movementStats.find(s => s.patientId === patientId));
    }
}
