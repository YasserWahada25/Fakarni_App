import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
    providedIn: 'root'
})
export class PatientService {

    private patients: Patient[] = [
        {
            id: 1,
            firstName: 'Ahmed',
            lastName: 'Ben Ali',
            email: 'ahmed.benali@example.com',
            dateOfBirth: new Date('1945-05-15'),
            role: 'Patient Alzheimer',
            lastConsultation: new Date('2023-10-25'),
            metrics: [
                { date: new Date('2023-01-01'), type: 'cognitive', value: 75 },
                { date: new Date('2023-04-01'), type: 'cognitive', value: 72 },
                { date: new Date('2023-07-01'), type: 'cognitive', value: 70 },
                { date: new Date('2023-10-01'), type: 'cognitive', value: 68 }
            ]
        },
        {
            id: 2,
            firstName: 'Fatma',
            lastName: 'Zahra',
            email: 'fatma.zahra@example.com',
            dateOfBirth: new Date('1950-08-20'),
            role: 'Patient Parkinson',
            lastConsultation: new Date('2023-11-02'),
            metrics: [
                { date: new Date('2023-01-01'), type: 'mobility', value: 80 },
                { date: new Date('2023-04-01'), type: 'mobility', value: 78 },
                { date: new Date('2023-07-01'), type: 'mobility', value: 75 },
                { date: new Date('2023-10-01'), type: 'mobility', value: 70 }
            ]
        },
        {
            id: 3,
            firstName: 'Mohamed',
            lastName: 'Salah',
            email: 'mohamed.salah@example.com',
            dateOfBirth: new Date('1948-12-10'),
            role: 'Patient Senior',
            lastConsultation: new Date('2023-10-15')
        }
    ];

    constructor() { }

    getPatients(): Observable<Patient[]> {
        return of(this.patients);
    }

    getPatientById(id: number): Observable<Patient | undefined> {
        const patient = this.patients.find(p => p.id === id);
        return of(patient);
    }
}
