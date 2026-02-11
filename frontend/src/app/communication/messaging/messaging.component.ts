import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-messaging',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './messaging.component.html',
    styleUrl: './messaging.component.css'
})
export class MessagingComponent {
    activeTab = 'chat'; // 'chat' or 'feed'

    contacts = [
        { name: 'Dr. Smith', status: 'online', avatar: 'fa-user-doctor' },
        { name: 'Nurse Joy', status: 'away', avatar: 'fa-user-nurse' },
        { name: 'Alice (Caregiver)', status: 'offline', avatar: 'fa-user' }
    ];

    messages = [
        { sender: 'Dr. Smith', text: 'Hello, how is the patient doing today?', time: '10:30 AM', self: false },
        { sender: 'Me', text: 'Much better, thank you!', time: '10:32 AM', self: true }
    ];

    posts = [
        { author: 'Nutrition Specialist', title: 'Healthy Eating Tips', content: 'Focus on omega-3 rich foods...', date: '2 hours ago' },
        { author: 'Community Manager', title: 'New Yoga Session', content: 'Join us tomorrow at 10 AM...', date: '5 hours ago' }
    ];
}
