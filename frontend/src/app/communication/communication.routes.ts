import { Routes } from '@angular/router';
import { CommunicationLayoutComponent } from './shared/communication-layout.component';

export const COMMUNICATION_ROUTES: Routes = [
    {
        path: '',
        component: CommunicationLayoutComponent,
        children: [
            { path: '', redirectTo: 'messaging', pathMatch: 'full' },
            {
                path: 'messaging',
                loadComponent: () => import('./messaging/messaging.component').then(m => m.MessagingComponent)
            },
            {
                path: 'groups',
                loadComponent: () => import('./groups/groups.component').then(m => m.GroupsComponent)
            },
            {
                path: 'admin',
                loadComponent: () => import('./admin/moderation.component').then(m => m.ModerationComponent)
            }
        ]
    }
];
