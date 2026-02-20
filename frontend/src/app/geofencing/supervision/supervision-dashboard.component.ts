import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-supervision-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './supervision-dashboard.component.html',
    styleUrl: './supervision-dashboard.component.css'
})
export class SupervisionDashboardComponent implements OnInit {
    stats = {
        activeMonitoring: 12,
        safePatients: 10,
        riskWarnings: 2,
        totalAlerts24h: 5
    };

    zones = [
        { name: 'Home Garden', safetyScore: 95, status: 'Safe' },
        { name: 'Neighborhood Park', safetyScore: 88, status: 'Safe' },
        { name: 'City Center', safetyScore: 45, status: 'Risk' },
        { name: 'River Bank', safetyScore: 30, status: 'Restricted' }
    ];

    // Mock data for charts
    activityData = [
        { hour: '8AM', level: 20 },
        { hour: '10AM', level: 60 },
        { hour: '12PM', level: 40 },
        { hour: '2PM', level: 80 },
        { hour: '4PM', level: 50 },
        { hour: '6PM', level: 30 }
    ];

    constructor() { }

    ngOnInit(): void { }

    exportReport(): void {
        const date = new Date().toISOString().split('T')[0];
        alert(`Generating PDF Report for ${date}...`);
    }
}
