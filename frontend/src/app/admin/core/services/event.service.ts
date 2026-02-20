import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
    providedIn: 'root'
})
export class EventService {

    private events: Event[] = [
        {
            id: 1,
            title: 'Conférence sur la Nutrition',
            date: new Date(new Date().setDate(new Date().getDate() + 5)),
            startTime: '18:00',
            status: 'upcoming',
            participantsCount: 45,
            description: 'Conseils pour une alimentation saine.',
            reminders: ['1 day before']
        },
        {
            id: 2,
            title: 'Fête de Printemps',
            date: new Date(new Date().setDate(new Date().getDate() - 10)),
            startTime: '13:00',
            status: 'past',
            participantsCount: 120,
            description: 'Célébration annuelle avec les familles.'
        }
    ];

    constructor() { }

    getEvents(): Observable<Event[]> {
        return of(this.events);
    }

    getEventById(id: number): Observable<Event | undefined> {
        const event = this.events.find(e => e.id === id);
        return of(event);
    }

    addEvent(event: Event): Observable<Event> {
        event.id = this.events.length + 1;
        this.events.push(event);
        return of(event);
    }

    updateEvent(event: Event): Observable<Event> {
        const index = this.events.findIndex(e => e.id === event.id);
        if (index !== -1) {
            this.events[index] = event;
        }
        return of(event);
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
