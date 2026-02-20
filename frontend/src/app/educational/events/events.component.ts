import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './events.component.html',
    styleUrl: './events.component.css'
})
export class EventsComponent {
    events = [
        { title: 'Art Therapy Session', date: '2026-03-10', time: '10:00 AM', location: 'Common Room' },
        { title: 'Music History', date: '2026-03-12', time: '02:00 PM', location: 'Hall A' }
    ];

    newEvent: any = { title: '', date: '', time: '' };

    addEvent() {
        alert('Mock: Event "' + this.newEvent.title + '" added!');
    }
}
