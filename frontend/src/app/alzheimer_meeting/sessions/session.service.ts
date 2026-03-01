import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

type SessionStatus = 'DRAFT' | 'SCHEDULED' | 'CANCELLED' | 'DONE';
type SessionVisibility = 'PUBLIC' | 'PRIVATE';
type SessionType = 'PRIVATE' | 'GROUP';
type MeetingMode = 'ONLINE' | 'IN_PERSON';

export interface PatientSession {
    id?: number;
    title: string;
    description: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    meetingUrl?: string;
    status: SessionStatus;
    visibility: SessionVisibility;
    sessionType?: SessionType;
    meetingMode?: MeetingMode;
    type?: 'online' | 'presential';
    createdBy?: string;
}

interface VirtualSessionResponse {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    meetingUrl?: string;
    createdBy: string;
    status?: string;
    visibility?: string;
    sessionType?: string;
    meetingMode?: string;
}

interface CreateSessionRequest {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    meetingUrl: string;
    createdBy: string;
    status: SessionStatus;
    visibility: SessionVisibility;
    sessionType: SessionType;
    meetingMode: MeetingMode;
}

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private apiUrl = `${environment.apiUrl}/session`;

    constructor(private http: HttpClient) { }

    getSessions(): Observable<PatientSession[]> {
        return this.http.get<VirtualSessionResponse[]>(`${this.apiUrl}/sessions`).pipe(
            map(data => data.map(s => this.mapToPatientSession(s)))
        );
    }

    createSession(session: PatientSession): Observable<PatientSession> {
        const request = this.mapToCreateRequest(session);
        return this.http.post<VirtualSessionResponse>(`${this.apiUrl}/sessions`, request).pipe(
            map(s => this.mapToPatientSession(s))
        );
    }

    private mapToCreateRequest(session: PatientSession): CreateSessionRequest {
        const meetingMode: MeetingMode = session.type === 'online' || session.meetingMode === 'ONLINE'
            ? 'ONLINE'
            : 'IN_PERSON';
        const sessionType: SessionType = session.sessionType
            ?? (session.visibility === 'PUBLIC' ? 'GROUP' : 'PRIVATE');
        const visibility: SessionVisibility = session.visibility
            ?? (sessionType === 'GROUP' ? 'PUBLIC' : 'PRIVATE');

        return {
            title: session.title,
            description: session.description,
            startTime: session.startTime,
            endTime: session.endTime,
            meetingUrl: meetingMode === 'ONLINE' ? (session.meetingUrl?.trim() ?? '') : '',
            createdBy: session.createdBy?.trim() || this.resolveCurrentUserId(),
            status: session.status ?? 'DRAFT',
            visibility,
            sessionType,
            meetingMode
        };
    }

    private mapToPatientSession(s: VirtualSessionResponse): PatientSession {
        const normalizedMeetingMode = (s.meetingMode ?? '').toUpperCase();
        const isOnline = normalizedMeetingMode === 'ONLINE'
            || (!normalizedMeetingMode && !!s.meetingUrl);
        const sessionType: SessionType = (s.sessionType as SessionType)
            || ((s.visibility as SessionVisibility) === 'PUBLIC' ? 'GROUP' : 'PRIVATE');
        const visibility: SessionVisibility = (s.visibility as SessionVisibility)
            || (sessionType === 'GROUP' ? 'PUBLIC' : 'PRIVATE');

        return {
            id: s.id,
            title: s.title,
            description: s.description,
            startTime: s.startTime,
            endTime: s.endTime,
            meetingUrl: s.meetingUrl,
            status: (s.status as SessionStatus) || 'DRAFT',
            visibility,
            sessionType,
            meetingMode: isOnline ? 'ONLINE' : 'IN_PERSON',
            type: isOnline ? 'online' : 'presential',
            createdBy: s.createdBy
        };
    }

    private resolveCurrentUserId(): string {
        if (typeof window === 'undefined') {
            return 'patient';
        }

        const localStorageRef = window.localStorage;
        return localStorageRef.getItem('userId')
            || localStorageRef.getItem('user_id')
            || localStorageRef.getItem('uid')
            || 'patient';
    }
}
