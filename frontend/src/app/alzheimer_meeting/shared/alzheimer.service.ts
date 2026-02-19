import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Session {
    id: number;
    title: string;
    date: Date;
    type: string;
    description?: string;
    isFavorite: boolean;
    participants?: string;
    time?: string;
    startTime?: string;
    endTime?: string;
    meetingUrl?: string;
    status?: string;
    visibility?: string;
}

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

@Injectable({
    providedIn: 'root'
})
export class AlzheimerService {
    private apiUrl = `${environment.apiUrl}/session`;
    private userId = 'current-user';

    private sessionsSubject = new BehaviorSubject<Session[]>([]);

    constructor(private http: HttpClient) {
        this.loadSessions();
    }

    loadSessions(): void {
        this.http.get<VirtualSessionResponse[]>(`${this.apiUrl}/sessions`).pipe(
            map(data => data.map(s => this.mapToSession(s)))
        ).subscribe({
            next: sessions => {
                this.sessionsSubject.next(sessions);
            },
            error: err => {
                console.error('Failed to load sessions:', err.message);
                this.sessionsSubject.next([]);
            }
        });
    }

    private mapToSession(s: VirtualSessionResponse): Session {
        const startDate = new Date(s.startTime);
        return {
            id: s.id,
            title: s.title,
            date: startDate,
            type: this.inferType(s.title, s.description),
            description: s.description,
            isFavorite: s.participants?.some((p: any) => p.userId === this.userId && p.isFavorite) || false,
            time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            startTime: s.startTime,
            endTime: s.endTime,
            meetingUrl: s.meetingUrl,
            status: s.status,
            visibility: s.visibility,
            participants: `${s.participants?.length || 0}`
        };
    }

    private inferType(title: string, description?: string): string {
        const text = `${title} ${description || ''}`.toLowerCase();
        if (text.includes('music') || text.includes('thérap') || text.includes('therap') || text.includes('relaxa')) return 'Therapy';
        if (text.includes('memory') || text.includes('mémoire') || text.includes('cogni') || text.includes('brain') || text.includes('puzzle')) return 'Cognitive';
        if (text.includes('yoga') || text.includes('gym') || text.includes('exerci') || text.includes('stretch') || text.includes('physi')) return 'Physical';
        if (text.includes('art') || text.includes('paint') || text.includes('draw') || text.includes('créat') || text.includes('creat')) return 'Creative';
        return 'General';
    }

    getSessions(): Observable<Session[]> {
        return this.sessionsSubject.asObservable();
    }

    getFavorites(): Observable<Session[]> {
        return this.http.get<VirtualSessionResponse[]>(`${this.apiUrl}/users/${this.userId}/favorites`).pipe(
            map(data => data.map(s => ({ ...this.mapToSession(s), isFavorite: true }))),
            catchError(() => {
                return this.sessionsSubject.pipe(map(sessions => sessions.filter(s => s.isFavorite)));
            })
        );
    }

    toggleFavorite(id: number): void {
        const sessions = this.sessionsSubject.getValue();
        const session = sessions.find(s => s.id === id);
        if (!session) return;

        const newFavState = !session.isFavorite;

        this.http.patch(`${this.apiUrl}/sessions/${id}/participants/${this.userId}/prefs`, {
            isFavorite: newFavState
        }).pipe(
            catchError(err => {
                console.warn('Favorite toggle API failed, updating locally:', err.message);
                return of(null);
            })
        ).subscribe(() => {
            session.isFavorite = newFavState;
            this.sessionsSubject.next([...sessions]);
        });
    }

    addSession(session: Session): void {
        const sessions = this.sessionsSubject.getValue();
        sessions.push(session);
        this.sessionsSubject.next([...sessions]);
    }

    deleteSession(id: number): void {
        const sessions = this.sessionsSubject.getValue().filter(s => s.id !== id);
        this.sessionsSubject.next(sessions);
    }

    updateSession(updatedSession: Session): void {
        const sessions = this.sessionsSubject.getValue();
        const index = sessions.findIndex(s => s.id === updatedSession.id);
        if (index !== -1) {
            sessions[index] = updatedSession;
            this.sessionsSubject.next([...sessions]);
        }
    }
}
