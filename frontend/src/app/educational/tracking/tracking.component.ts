import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-tracking',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tracking.component.html',
    styleUrl: './tracking.component.css'
})
export class TrackingComponent {
    progress = {
        completedActivities: 12,
        totalTime: '5h 30m',
        averageScore: 82
    };
}
