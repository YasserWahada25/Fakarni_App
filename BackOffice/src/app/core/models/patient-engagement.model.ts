export interface PatientEngagement {
    id: number;
    patientId: number;
    patientName: string;
    activityId?: number;
    activityName?: string;
    eventId?: number;
    eventName?: string;
    participationStatus: ParticipationStatus;
    score?: number;
    progressPercentage?: number;
    completedDate?: Date;
    timeSpent?: number; // in minutes
}

export type ParticipationStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

export interface EngagementStatistics {
    totalActivities: number;
    activePatients: number;
    averageEngagement: number; // percentage
    engagementByType: { [key: string]: number };
    engagementOverTime: { date: string; count: number }[];
    participationDistribution: { status: ParticipationStatus; count: number }[];
}
