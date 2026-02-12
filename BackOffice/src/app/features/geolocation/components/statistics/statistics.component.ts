import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AlertService } from '../../../../core/services/alert.service';
import { StatisticsService, MovementStatistics, RiskZone } from '../../../../core/services/statistics.service';
import { AlertStatistics } from '../../../../core/models/alert.model';

@Component({
    selector: 'app-statistics',
    standalone: false,
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
    alertStats: AlertStatistics | null = null;
    movementStats: MovementStatistics[] = [];
    riskZones: RiskZone[] = [];
    isBrowser: boolean;

    constructor(
        private alertService: AlertService,
        private statisticsService: StatisticsService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        this.loadStatistics();
    }

    loadStatistics(): void {
        this.alertService.getStatistics().subscribe(stats => {
            this.alertStats = stats;
        });

        this.statisticsService.getMovementStatistics().subscribe(stats => {
            this.movementStats = stats;
        });

        this.statisticsService.getRiskZones().subscribe(zones => {
            this.riskZones = zones;
        });
    }

    get resolutionRate(): number {
        if (!this.alertStats || this.alertStats.totalAlerts === 0) return 0;
        return Math.round((this.alertStats.resolvedAlerts / this.alertStats.totalAlerts) * 100);
    }

    get mostProblematicZone(): string {
        return this.riskZones.length > 0 ? this.riskZones[0].zoneName : 'Aucune';
    }
}
