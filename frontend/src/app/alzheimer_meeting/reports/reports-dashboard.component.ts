import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Report {
    id: number;
    date: Date;
    title: string;
    type: string;
    status: 'Published' | 'Pending';
}

interface Transcription {
    id: number;
    date: Date;
    sessionTitle: string;
    duration: string;
}

@Component({
    selector: 'app-reports-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './reports-dashboard.component.html',
    styleUrl: './reports-dashboard.component.css'
})
export class ReportsDashboardComponent {
    reports: Report[] = [
        { id: 101, date: new Date('2023-10-25'), title: 'Monthly Progress Report', type: 'Monthly', status: 'Published' },
        { id: 102, date: new Date('2023-11-01'), title: 'Cognitive Assessment', type: 'Assessment', status: 'Published' },
        { id: 103, date: new Date('2023-11-15'), title: 'Therapy Session Summary', type: 'Session', status: 'Pending' }
    ];

    transcriptions: Transcription[] = [
        { id: 201, date: new Date('2023-11-10'), sessionTitle: 'Music Therapy', duration: '45 mins' },
        { id: 202, date: new Date('2023-11-12'), sessionTitle: 'Doctor Consultation', duration: '20 mins' }
    ];

    downloadReport(report: Report) {
        console.log(`Downloading report: ${report.title}`);
        alert(`Downloading ${report.title}.pdf...`);
    }

    viewTranscription(transcription: Transcription) {
        console.log(`Viewing transcription for: ${transcription.sessionTitle}`);
        alert(`Opening transcription for ${transcription.sessionTitle}...`);
    }
}
