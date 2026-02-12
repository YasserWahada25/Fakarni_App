import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Session } from '../models/session.model';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private sessions: Session[] = [
        {
            id: 1,
            title: 'Atelier Mémoire',
            date: new Date(),
            startTime: '10:00',
            endTime: '11:00',
            status: 'scheduled',
            participantsCount: 12,
            description: 'Exercices de stimulation cognitive.'
        },
        {
            id: 2,
            title: 'Séance de Musicothérapie',
            date: new Date(new Date().setDate(new Date().getDate() + 1)),
            startTime: '14:00',
            endTime: '15:30',
            status: 'scheduled',
            participantsCount: 8,
            description: 'Relaxation par la musique.'
        },
        {
            id: 3,
            title: 'Gymnastique Douce',
            date: new Date(new Date().setDate(new Date().getDate() - 1)),
            startTime: '09:00',
            endTime: '10:00',
            status: 'completed',
            participantsCount: 15,
            description: 'Mouvements adaptés pour les seniors.'
        }
    ];

    constructor() { }

    getSessions(): Observable<Session[]> {
        return of(this.sessions);
    }

    getSessionById(id: number): Observable<Session | undefined> {
        const session = this.sessions.find(s => s.id === id);
        return of(session);
    }

    addSession(session: Session): Observable<Session> {
        session.id = this.sessions.length + 1;
        this.sessions.push(session);
        return of(session);
    }

    updateSession(session: Session): Observable<Session> {
        const index = this.sessions.findIndex(s => s.id === session.id);
        if (index !== -1) {
            this.sessions[index] = session;
        }
        return of(session);
    }

    deleteSession(id: number): Observable<boolean> {
        const index = this.sessions.findIndex(s => s.id === id);
        if (index !== -1) {
            this.sessions.splice(index, 1);
            return of(true);
        }
        return of(false);
    }
}
