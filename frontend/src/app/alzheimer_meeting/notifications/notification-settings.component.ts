import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NotificationPreference {
    id: string;
    label: string;
    enabled: boolean;
    frequency?: string;
    type: 'toggle' | 'select' | 'slider';
}

@Component({
    selector: 'app-notification-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './notification-settings.component.html',
    styleUrl: './notification-settings.component.css'
})
export class NotificationSettingsComponent {
    preferences: NotificationPreference[] = [
        { id: 'session_reminder', label: 'Session Reminders', enabled: true, type: 'toggle' },
        { id: 'reminder_time', label: 'Remind me before', enabled: true, frequency: '15', type: 'select' },
        { id: 'daily_summary', label: 'Daily Activity Summary', enabled: false, type: 'toggle' },
        { id: 'sound_alert', label: 'Play Sound on Reminder', enabled: true, type: 'toggle' }
    ];

    reminderOptions = [
        { value: '5', label: '5 minutes' },
        { value: '15', label: '15 minutes' },
        { value: '30', label: '30 minutes' },
        { value: '60', label: '1 hour' }
    ];

    saveSettings() {
        // Simulate saving
        console.log('Settings saved:', this.preferences);
        alert('Preferences saved successfully!');
    }
}
