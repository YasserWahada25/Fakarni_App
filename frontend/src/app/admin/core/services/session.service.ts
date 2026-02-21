import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
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

    getSessionsByDate(date: Date): Observable<Session[]> {
        const normalizedDate = this.normalizeDate(date);
        const from = new Date(
            normalizedDate.getFullYear(),
            normalizedDate.getMonth(),
            normalizedDate.getDate(),
            0,
            0,
            0,
            0
        );
        const to = new Date(
            normalizedDate.getFullYear(),
            normalizedDate.getMonth(),
            normalizedDate.getDate(),
            23,
            59,
            59,
            999
        );

        const params = new HttpParams()
            .set('from', from.toISOString())
            .set('to', to.toISOString());

        return this.http.get<VirtualSessionResponse[]>(`${this.apiUrl}/sessions`, { params }).pipe(
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
        const sessionDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
        );

        return {
            id: s.id,
            title: s.title,
            date: sessionDate,
            startTime: this.formatTime(startDate),
            endTime: this.formatTime(endDate),
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
        const sessionDate = this.normalizeDate(session.date);
        const startTime = this.buildDateTime(sessionDate, session.startTime);
        const endTime = this.buildDateTime(sessionDate, session.endTime);

        return {
            title: session.title,
            description: session.description,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            meetingUrl: session.meetingUrl || '',
            createdBy: session.createdBy || 'admin',
            status: session.status || 'SCHEDULED',
            visibility: session.visibility || 'PUBLIC'
        };
    }

    private normalizeDate(dateValue: Date | string): Date {
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    private buildDateTime(date: Date, time: string): Date {
        const [hourPart = '0', minutePart = '0'] = time.split(':');
        const hours = Number.parseInt(hourPart, 10);
        const minutes = Number.parseInt(minutePart, 10);

        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            Number.isNaN(hours) ? 0 : hours,
            Number.isNaN(minutes) ? 0 : minutes,
            0,
            0
        );
    }

    private formatTime(dateTime: Date): string {
        const hours = dateTime.getHours().toString().padStart(2, '0');
        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}
