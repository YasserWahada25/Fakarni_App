import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, throwError } from 'rxjs';
import { Session } from '../models/session.model';
import { environment } from '../../../../environments/environment';

interface VirtualSessionResponse {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    meetingUrl: string;
    createdBy: string;
    status: string;
    visibility: string;
    createdAt: string;
    updatedAt: string;
    participants: any[];
}

interface CreateSessionRequest {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    meetingUrl?: string;
    createdBy: string;
    status: string;
    visibility: string;
}

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private apiUrl = `${environment.apiUrl}/session`;

    constructor(private http: HttpClient) { }

    getSessions(): Observable<Session[]> {
        return this.http.get<VirtualSessionResponse[]>(`${this.apiUrl}/sessions`).pipe(
            map(data => data.map(s => this.mapToSession(s)))
        );
    }

    getSessionById(id: number): Observable<Session | undefined> {
        return this.http.get<VirtualSessionResponse>(`${this.apiUrl}/sessions/${id}`).pipe(
            map(s => this.mapToSession(s)),
            catchError(() => of(undefined))
        );
    }

    addSession(session: Session): Observable<Session> {
        const request = this.mapToCreateRequest(session);
        return this.http.post<VirtualSessionResponse>(`${this.apiUrl}/sessions`, request).pipe(
            map(s => this.mapToSession(s))
        );
    }

    updateSession(session: Session): Observable<Session> {
        const request = this.mapToCreateRequest(session);
        return this.http.put<VirtualSessionResponse>(`${this.apiUrl}/sessions/${session.id}`, request).pipe(
            map(s => this.mapToSession(s))
        );
    }

    deleteSession(id: number): Observable<boolean> {
        return this.http.delete(`${this.apiUrl}/sessions/${id}`, { observe: 'response' }).pipe(
            map(() => true),
            catchError(err => {
                console.error('Failed to delete session:', err);
                return of(false);
            })
        );
    }

    private mapToSession(s: VirtualSessionResponse): Session {
        const startDate = new Date(s.startTime);
        const endDate = new Date(s.endTime);
        return {
            id: s.id,
            title: s.title,
            date: startDate,
            startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: s.status as Session['status'],
            participantsCount: s.participants?.length || 0,
            description: s.description,
            visibility: s.visibility as Session['visibility'],
            meetingUrl: s.meetingUrl,
            createdBy: s.createdBy,
            createdAt: s.createdAt
        };
    }

    private mapToCreateRequest(session: Session): CreateSessionRequest {
        const dateStr = session.date instanceof Date
            ? session.date.toISOString().split('T')[0]
            : new Date(session.date).toISOString().split('T')[0];

        return {
            title: session.title,
            description: session.description,
            startTime: `${dateStr}T${session.startTime}:00Z`,
            endTime: `${dateStr}T${session.endTime}:00Z`,
            meetingUrl: session.meetingUrl || '',
            createdBy: session.createdBy || 'admin',
            status: session.status || 'SCHEDULED',
            visibility: session.visibility || 'PUBLIC'
        };
    }
}
