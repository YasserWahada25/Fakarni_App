import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-patient-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './patient-profile.component.html',
    styleUrl: './patient-profile.component.css'
})
export class PatientProfileComponent {
    patient = {
        name: 'Ahmed Ben Ali',
        age: 72,
        bloodType: 'A+',
        condition: 'Early-stage Alzheimer',
        lastVisit: '2024-01-15'
    };

    vitals = {
        bp: '120/80',
        heartRate: 72,
        weight: 70,
        temp: 36.6
    };

    history = [
        { date: '2024-01-15', type: 'Consultation', doctor: 'Dr. Sarah K.', diagnosis: 'Stable condition', treatment: 'Continued Memantine' },
        { date: '2023-12-10', type: 'Check-up', doctor: 'Dr. Sarah K.', diagnosis: 'Mild cognitive decline', treatment: 'Cognitive therapy prescribed' },
        { date: '2023-11-05', type: 'Emergency', doctor: 'Dr. John D.', diagnosis: 'Hypertensive episode', treatment: 'Amlodipine 5mg' }
    ];

    // Mock data for charts (Evolution of Cognitive Score)
    chartData = [
        { date: 'Oct', score: 26 },
        { date: 'Nov', score: 25 },
        { date: 'Dec', score: 25 },
        { date: 'Jan', score: 24 }
    ];

    getBarHeight(score: number): string {
        return (score / 30) * 100 + '%'; // MMSE score is out of 30
    }
}
