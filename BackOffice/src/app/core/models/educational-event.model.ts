export interface EducationalEvent {
    id: number;
    title: string;
    description: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: EventStatus;
    participantsCount: number;
    maxParticipants?: number;
    reminders: ReminderConfig[];
    location?: string;
}

export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface ReminderConfig {
    type: 'email' | 'sms' | 'push';
    timeBefore: number; // in hours
    enabled: boolean;
}
