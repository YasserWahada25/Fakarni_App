import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GeographicZone, PatientLocation } from '../models/geographic-zone.model';

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {
    private zones: GeographicZone[] = [
        {
            id: 1,
            name: 'Domicile - Ahmed Ben Ali',
            type: 'authorized',
            coordinates: {
                type: 'circle',
                center: { lat: 36.8065, lng: 10.1815 }, // Tunis
                radius: 500
            },
            patientIds: [1],
            isActive: true,
            notifyOnExit: true,
            createdAt: new Date('2023-01-15'),
            updatedAt: new Date('2023-10-20')
        },
        {
            id: 2,
            name: 'Centre de Jour',
            type: 'authorized',
            coordinates: {
                type: 'circle',
                center: { lat: 36.8190, lng: 10.1658 },
                radius: 300
            },
            patientIds: [1, 2, 3],
            isActive: true,
            notifyOnExit: true,
            createdAt: new Date('2023-02-10'),
            updatedAt: new Date('2023-09-15')
        },
        {
            id: 3,
            name: 'Zone Interdite - Autoroute',
            type: 'forbidden',
            coordinates: {
                type: 'polygon',
                points: [
                    { lat: 36.8300, lng: 10.1500 },
                    { lat: 36.8350, lng: 10.1600 },
                    { lat: 36.8250, lng: 10.1700 },
                    { lat: 36.8200, lng: 10.1600 }
                ]
            },
            patientIds: [1, 2, 3],
            isActive: true,
            notifyOnExit: false,
            createdAt: new Date('2023-03-05'),
            updatedAt: new Date('2023-08-20')
        },
        {
            id: 4,
            name: 'Domicile - Fatma Zahra',
            type: 'authorized',
            coordinates: {
                type: 'circle',
                center: { lat: 36.8100, lng: 10.1900 },
                radius: 400
            },
            patientIds: [2],
            isActive: true,
            notifyOnExit: true,
            createdAt: new Date('2023-04-12'),
            updatedAt: new Date('2023-11-01')
        },
        {
            id: 5,
            name: 'Zone de Danger - Port',
            type: 'danger',
            coordinates: {
                type: 'circle',
                center: { lat: 36.8000, lng: 10.1700 },
                radius: 600
            },
            patientIds: [1, 2, 3],
            isActive: true,
            notifyOnExit: false,
            createdAt: new Date('2023-05-20'),
            updatedAt: new Date('2023-10-10')
        }
    ];

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
        },
        {
            patientId: 3,
            patientName: 'Mohamed Salah',
            currentPosition: { lat: 36.8195, lng: 10.1665 },
            lastUpdate: new Date(),
            isTracking: false
        }
    ];

    constructor() { }

    getZones(): Observable<GeographicZone[]> {
        return of(this.zones);
    }

    getZoneById(id: number): Observable<GeographicZone | undefined> {
        return of(this.zones.find(z => z.id === id));
    }

    getZonesByPatient(patientId: number): Observable<GeographicZone[]> {
        return of(this.zones.filter(z => z.patientIds.includes(patientId)));
    }

    createZone(zone: Omit<GeographicZone, 'id' | 'createdAt' | 'updatedAt'>): Observable<GeographicZone> {
        const newZone: GeographicZone = {
            ...zone,
            id: Math.max(...this.zones.map(z => z.id)) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.zones.push(newZone);
        return of(newZone);
    }

    updateZone(id: number, zone: Partial<GeographicZone>): Observable<GeographicZone | undefined> {
        const index = this.zones.findIndex(z => z.id === id);
        if (index !== -1) {
            this.zones[index] = { ...this.zones[index], ...zone, updatedAt: new Date() };
            return of(this.zones[index]);
        }
        return of(undefined);
    }

    deleteZone(id: number): Observable<boolean> {
        const index = this.zones.findIndex(z => z.id === id);
        if (index !== -1) {
            this.zones.splice(index, 1);
            return of(true);
        }
        return of(false);
    }

    getPatientLocations(): Observable<PatientLocation[]> {
        return of(this.patientLocations);
    }

    getPatientLocation(patientId: number): Observable<PatientLocation | undefined> {
        return of(this.patientLocations.find(p => p.patientId === patientId));
    }
}
