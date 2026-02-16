import { Routes } from '@angular/router';
import { GeofencingLayoutComponent } from './shared/geofencing-layout.component';

export const GEOFENCING_ROUTES: Routes = [
    {
        path: '',
        component: GeofencingLayoutComponent,
        children: [
            { path: '', redirectTo: 'tracking', pathMatch: 'full' },
            {
                path: 'tracking',
                loadComponent: () => import('./live-tracking/live-tracking.component').then(m => m.LiveTrackingComponent)
            },
            {
                path: 'alerts',
                loadComponent: () => import('./alerts-history/alerts-history.component').then(m => m.AlertsHistoryComponent)
            },
            {
                path: 'supervision',
                loadComponent: () => import('./supervision/supervision-dashboard.component').then(m => m.SupervisionDashboardComponent)
            }
        ]
    }
];
