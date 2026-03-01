export interface Session {
    id: number;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'DRAFT' | 'SCHEDULED' | 'CANCELLED' | 'DONE';
    participantsCount: number;
    description?: string;
    visibility?: 'PRIVATE' | 'PUBLIC';
    sessionType?: 'PRIVATE' | 'GROUP';
    meetingMode?: 'ONLINE' | 'IN_PERSON';
    meetingUrl?: string;
    createdBy?: string;
    createdAt?: string;
}
