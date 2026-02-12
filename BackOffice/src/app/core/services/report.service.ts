import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MedicalReport } from '../models/medical-report.model';

@Injectable({
    providedIn: 'root'
})
export class ReportService {

    private reports: MedicalReport[] = [
        {
            id: 1,
            patientId: 1,
            patientName: 'Ahmed Ben Ali',
            date: new Date('2023-10-25'),
            type: 'Analyse Médicale',
            status: 'Terminé',
            content: 'Analyse sanguine complète. Taux de cholestérol légèrement élevé.',
            doctorName: 'Dr. Amine'
        },
        {
            id: 2,
            patientId: 2,
            patientName: 'Fatma Zahra',
            date: new Date('2023-11-02'),
            type: 'Détection Maladie',
            status: 'En attente',
            content: 'Examen neurologique pour évaluation de la progression de la maladie de Parkinson.',
            doctorName: 'Dr. Sarah'
        },
        {
            id: 3,
            patientId: 1,
            patientName: 'Ahmed Ben Ali',
            date: new Date('2023-09-10'),
            type: 'Suivi Cognitif',
            status: 'Critique',
            content: 'Baisse notable des capacités mémorielles observée lors des exercices.',
            doctorName: 'Dr. Amine'
        }
    ];

    constructor() { }

    getReports(): Observable<MedicalReport[]> {
        return of(this.reports);
    }

    getReportsByPatientId(patientId: number): Observable<MedicalReport[]> {
        const patientReports = this.reports.filter(r => r.patientId === patientId);
        return of(patientReports);
    }

    addReport(report: MedicalReport): Observable<MedicalReport> {
        report.id = this.reports.length + 1;
        this.reports.push(report);
        return of(report);
    }

    updateReport(report: MedicalReport): Observable<MedicalReport> {
        const index = this.reports.findIndex(r => r.id === report.id);
        if (index !== -1) {
            this.reports[index] = report;
        }
        return of(report);
    }

    deleteReport(id: number): Observable<boolean> {
        const index = this.reports.findIndex(r => r.id === id);
        if (index !== -1) {
            this.reports.splice(index, 1);
            return of(true);
        }
        return of(false);
    }
}
