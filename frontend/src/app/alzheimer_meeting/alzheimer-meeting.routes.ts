import { Routes } from '@angular/router';
import { AlzheimerLayoutComponent } from './shared/alzheimer-layout.component';

export const ALZHEIMER_ROUTES: Routes = [
    {
        path: '',
        component: AlzheimerLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'consultation',
                pathMatch: 'full'
            },
            {
                path: 'consultation',
                loadComponent: () => import('./consultation/calendar.component').then(m => m.CalendarComponent)
            },
            {
                path: 'favorites',
                loadComponent: () => import('./consultation/favorites.component').then(m => m.FavoritesComponent)
            },
            {
                path: 'notifications',
                loadComponent: () => import('./notifications/notification-settings.component').then(m => m.NotificationSettingsComponent)
            },
            {
                path: 'reports',
                loadComponent: () => import('./reports/reports-dashboard.component').then(m => m.ReportsDashboardComponent)
            },
            {
                path: 'reservations',
                loadComponent: () => import('./sessions/calendar-view.component').then(m => m.CalendarViewComponent)
            },
            {
                path: 'admin',
                loadComponent: () => import('./admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            }
        ]
    },
    {
        path: 'meeting/:id',
        loadComponent: () => import('./meeting/virtual-meeting.component').then(m => m.VirtualMeetingComponent)
    }
];
