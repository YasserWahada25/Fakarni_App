export interface Event {
    id: number;
    title: string;
    date: Date;
    startTime: string;
    status: 'upcoming' | 'past' | 'cancelled';
    participantsCount: number;
    description?: string;
    reminders?: string[]; // e.g., ['1 day before', '1 hour before']
}
