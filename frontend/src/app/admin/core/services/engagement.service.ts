import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PatientEngagement, EngagementStatistics, ParticipationStatus } from '../models/patient-engagement.model';

@Injectable({
    providedIn: 'root'
})
export class EngagementService {
    private engagements: PatientEngagement[] = [
        {
            id: 1,
            patientId: 1,
            patientName: 'Ahmed Ben Ali',
            activityId: 1,
            activityName: 'Quiz sur la Mémoire',
            participationStatus: 'completed',
            score: 85,
            progressPercentage: 100,
            completedDate: new Date('2024-02-15'),
            timeSpent: 12
        },
        {
            id: 2,
            patientId: 1,
            patientName: 'Ahmed Ben Ali',
            activityId: 2,
            activityName: 'Jeu Cognitif - Mémoire Visuelle',
            participationStatus: 'in_progress',
            progressPercentage: 60,
            timeSpent: 8
        },
        {
            id: 3,
            patientId: 2,
            patientName: 'Fatma Zahra',
            activityId: 1,
            activityName: 'Quiz sur la Mémoire',
            participationStatus: 'completed',
            score: 90,
            progressPercentage: 100,
            completedDate: new Date('2024-02-16'),
            timeSpent: 10
        },
        {
            id: 4,
            patientId: 2,
            patientName: 'Fatma Zahra',
            eventId: 3,
            eventName: 'Session de Jeux Cognitifs',
            participationStatus: 'completed',
            progressPercentage: 100,
            completedDate: new Date('2024-02-28'),
            timeSpent: 60
        },
        {
            id: 5,
            patientId: 3,
            patientName: 'Mohamed Salah',
            activityId: 3,
            activityName: 'Vidéo Éducative - Exercices de Mémoire',
            participationStatus: 'not_started',
            progressPercentage: 0
        }
    ];

    constructor() { }

    getEngagements(): Observable<PatientEngagement[]> {
        return of(this.engagements);
    }

    getEngagementsByPatient(patientId: number): Observable<PatientEngagement[]> {
        return of(this.engagements.filter(e => e.patientId === patientId));
    }

    getEngagementsByActivity(activityId: number): Observable<PatientEngagement[]> {
        return of(this.engagements.filter(e => e.activityId === activityId));
    }

    getEngagementsByEvent(eventId: number): Observable<PatientEngagement[]> {
        return of(this.engagements.filter(e => e.eventId === eventId));
    }

    getStatistics(): Observable<EngagementStatistics> {
        const stats: EngagementStatistics = {
            totalActivities: 5,
            activePatients: 3,
            averageEngagement: 75,
            engagementByType: {
                'quiz': 2,
                'cognitive_game': 1,
                'video': 1
            },
            engagementOverTime: this.getEngagementOverTime(),
            participationDistribution: this.getParticipationDistribution()
        };
        return of(stats);
    }

    private getEngagementOverTime(): { date: string; count: number }[] {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = this.engagements.filter(e =>
                e.completedDate && e.completedDate.toISOString().split('T')[0] === dateStr
            ).length;
            last7Days.push({ date: dateStr, count });
        }
        return last7Days;
    }

    private getParticipationDistribution(): { status: ParticipationStatus; count: number }[] {
        const statuses: ParticipationStatus[] = ['not_started', 'in_progress', 'completed', 'abandoned'];
        return statuses.map(status => ({
            status,
            count: this.engagements.filter(e => e.participationStatus === status).length
        }));
    }

    updateEngagement(id: number, engagement: Partial<PatientEngagement>): Observable<PatientEngagement | undefined> {
        const index = this.engagements.findIndex(e => e.id === id);
        if (index !== -1) {
            this.engagements[index] = { ...this.engagements[index], ...engagement };
            return of(this.engagements[index]);
        }
        return of(undefined);
    }
}
