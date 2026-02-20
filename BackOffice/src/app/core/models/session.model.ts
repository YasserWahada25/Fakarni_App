export interface Session {
    id: number;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    participantsCount: number;
    description?: string;
}
