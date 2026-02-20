import { Routes } from '@angular/router';
import { EducationalLayoutComponent } from './shared/educational-layout.component';

export const EDUCATIONAL_ROUTES: Routes = [
    {
        path: '',
        component: EducationalLayoutComponent,
        children: [
            { path: '', redirectTo: 'activities', pathMatch: 'full' },
            {
                path: 'activities',
                loadComponent: () => import('./activities/activities.component').then(m => m.ActivitiesComponent)
            },
            {
                path: 'events',
                loadComponent: () => import('./events/events.component').then(m => m.EventsComponent)
            },
            {
                path: 'tracking',
                loadComponent: () => import('./tracking/tracking.component').then(m => m.TrackingComponent)
            }
        ]
    }
];
