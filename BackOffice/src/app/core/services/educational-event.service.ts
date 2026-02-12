import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EducationalEvent, EventStatus } from '../models/educational-event.model';

@Injectable({
    providedIn: 'root'
})
export class EducationalEventService {
    private events: EducationalEvent[] = [
        {
            id: 1,
            title: 'Webinaire sur la Mémoire',
            description: 'Session interactive sur les techniques de mémorisation',
            date: new Date('2024-03-15'),
            startTime: '14:00',
            endTime: '15:30',
            status: 'scheduled',
            participantsCount: 12,
            maxParticipants: 20,
            reminders: [
                { type: 'email', timeBefore: 24, enabled: true },
                { type: 'sms', timeBefore: 2, enabled: true }
            ],
            location: 'Salle de conférence'
        },
        {
            id: 2,
            title: 'Atelier de Stimulation Cognitive',
            description: 'Exercices pratiques pour maintenir les capacités cognitives',
            date: new Date('2024-03-20'),
            startTime: '10:00',
            endTime: '11:30',
            status: 'scheduled',
            participantsCount: 8,
            maxParticipants: 15,
            reminders: [
                { type: 'email', timeBefore: 48, enabled: true }
            ],
            location: 'Salle d\'activités'
        },
        {
            id: 3,
            title: 'Session de Jeux Cognitifs',
            description: 'Jeux de mémoire et de logique en groupe',
            date: new Date('2024-02-28'),
            startTime: '15:00',
            endTime: '16:00',
            status: 'completed',
            participantsCount: 15,
            maxParticipants: 15,
            reminders: [],
            location: 'Salle polyvalente'
        },
        {
            id: 4,
            title: 'Conférence sur l\'Alzheimer',
            description: 'Présentation sur les dernières recherches',
            date: new Date('2024-04-10'),
            startTime: '09:00',
            endTime: '12:00',
            status: 'scheduled',
            participantsCount: 25,
            maxParticipants: 50,
            reminders: [
                { type: 'email', timeBefore: 72, enabled: true },
                { type: 'sms', timeBefore: 24, enabled: true },
                { type: 'push', timeBefore: 2, enabled: true }
            ],
            location: 'Auditorium'
        }
    ];

    constructor() { }

    getEvents(): Observable<EducationalEvent[]> {
        return of(this.events.sort((a, b) => b.date.getTime() - a.date.getTime()));
    }

    getEventById(id: number): Observable<EducationalEvent | undefined> {
        return of(this.events.find(e => e.id === id));
    }

    getEventsByStatus(status: EventStatus): Observable<EducationalEvent[]> {
        return of(this.events.filter(e => e.status === status));
    }

    getUpcomingEvents(): Observable<EducationalEvent[]> {
        const now = new Date();
        return of(this.events.filter(e => e.date >= now && e.status === 'scheduled'));
    }

    createEvent(event: Omit<EducationalEvent, 'id'>): Observable<EducationalEvent> {
        const newEvent: EducationalEvent = {
            ...event,
            id: Math.max(...this.events.map(e => e.id)) + 1
        };
        this.events.push(newEvent);
        return of(newEvent);
    }

    updateEvent(id: number, event: Partial<EducationalEvent>): Observable<EducationalEvent | undefined> {
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
            this.events[index] = { ...this.events[index], ...event };
            return of(this.events[index]);
        }
        return of(undefined);
    }

    deleteEvent(id: number): Observable<boolean> {
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
            this.events.splice(index, 1);
            return of(true);
        }
        return of(false);
    }
}
