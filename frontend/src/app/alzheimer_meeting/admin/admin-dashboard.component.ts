import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Session {
    id: number;
    title: string;
    date: string; // Using string for date input compatibility
    time: string;
    description: string;
    participants: string;
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
    sessions: Session[] = [
        { id: 1, title: 'Music Therapy', date: '2023-11-20', time: '10:00', description: 'Group music session', participants: 'Group A' },
        { id: 2, title: 'Memory Games', date: '2023-11-22', time: '14:30', description: 'Cognitive exercises', participants: 'Group B' }
    ];

    isEditing = false;
    currentSession: Session = this.getEmptySession();

    getEmptySession(): Session {
        return { id: 0, title: '', date: '', time: '', description: '', participants: '' };
    }

    startCreate() {
        this.currentSession = this.getEmptySession();
        this.isEditing = true;
    }

    editSession(session: Session) {
        this.currentSession = { ...session };
        this.isEditing = true;
    }

    deleteSession(id: number) {
        if (confirm('Are you sure you want to delete this session?')) {
            this.sessions = this.sessions.filter(s => s.id !== id);
        }
    }

    saveSession() {
        if (this.currentSession.id === 0) {
            // Create
            this.currentSession.id = Math.max(...this.sessions.map(s => s.id), 0) + 1;
            this.sessions.push({ ...this.currentSession });
        } else {
            // Update
            const index = this.sessions.findIndex(s => s.id === this.currentSession.id);
            if (index !== -1) {
                this.sessions[index] = { ...this.currentSession };
            }
        }
        this.isEditing = false;
        alert('Session saved successfully!');
    }

    cancelEdit() {
        this.isEditing = false;
    }
}
