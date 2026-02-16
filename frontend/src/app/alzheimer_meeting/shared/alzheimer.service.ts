import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Session {
    id: number;
    title: string;
    date: Date;
    type: string;
    description?: string;
    isFavorite: boolean;
    participants?: string;
    time?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AlzheimerService {
    private sessions: Session[] = [
        { id: 1, title: 'Music Therapy', date: new Date(new Date().setDate(new Date().getDate() + 1)), type: 'Therapy', isFavorite: false, description: 'Relaxing music session.', time: '10:00' },
        { id: 2, title: 'Memory Games', date: new Date(new Date().setDate(new Date().getDate() + 3)), type: 'Cognitive', isFavorite: true, description: 'Brain teasers and puzzles.', time: '14:00' },
        { id: 3, title: 'Yoga for Seniors', date: new Date(new Date().setDate(new Date().getDate() + 5)), type: 'Physical', isFavorite: false, description: 'Gentle stretching exercises.', time: '09:00' },
        { id: 4, title: 'Art Class', date: new Date(new Date().setDate(new Date().getDate() + 7)), type: 'Creative', isFavorite: false, description: 'Painting and drawing.', time: '11:00' }
    ];

    private sessionsSubject = new BehaviorSubject<Session[]>(this.sessions);

    getSessions(): Observable<Session[]> {
        return this.sessionsSubject.asObservable();
    }

    toggleFavorite(id: number): void {
        const session = this.sessions.find(s => s.id === id);
        if (session) {
            session.isFavorite = !session.isFavorite;
            this.sessionsSubject.next([...this.sessions]); // Emit new state
        }
    }

    addSession(session: Session): void {
        this.sessions.push(session);
        this.sessionsSubject.next([...this.sessions]);
    }

    deleteSession(id: number): void {
        this.sessions = this.sessions.filter(s => s.id !== id);
        this.sessionsSubject.next([...this.sessions]);
    }

    updateSession(updatedSession: Session): void {
        const index = this.sessions.findIndex(s => s.id === updatedSession.id);
        if (index !== -1) {
            this.sessions[index] = updatedSession;
            this.sessionsSubject.next([...this.sessions]);
        }
    }
}
