import { Component, OnInit, Input } from '@angular/core';
import { EngagementStatistics } from '../../../../core/models/patient-engagement.model';

@Component({
    selector: 'app-engagement-charts',
    standalone: false,
    templateUrl: './engagement-charts.component.html',
    styleUrls: ['./engagement-charts.component.scss']
})
export class EngagementChartsComponent implements OnInit {
    @Input() statistics: EngagementStatistics | null = null;

    constructor() { }

    ngOnInit(): void {
    }

    // Helper to get max value for chart scaling
    getEngagementMax(): number {
        if (!this.statistics) return 0;
        return Math.max(...Object.values(this.statistics.engagementByType));
    }
}
