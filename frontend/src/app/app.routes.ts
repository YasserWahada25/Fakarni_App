import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout.component';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './auth/sign-in.component';
import { SignUpComponent } from './auth/sign-up.component';

export const routes: Routes = [
    // Default redirect to Login
    { path: '', redirectTo: 'auth/signin', pathMatch: 'full' },

    // Auth Routes (Standalone, No Header/Footer)
    { path: 'auth/signin', component: SignInComponent },
    { path: 'auth/signup', component: SignUpComponent },

    // Main Routes (Wrapped in MainLayout)
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'home', component: HomeComponent },
            {
                path: 'alzheimer_meeting',
                loadChildren: () => import('./alzheimer_meeting/alzheimer-meeting.routes').then(m => m.ALZHEIMER_ROUTES)
            },
            {
                path: 'geofencing',
                loadChildren: () => import('./geofencing/geofencing.routes').then(m => m.GEOFENCING_ROUTES)
            },
            {
                path: 'educational',
                loadChildren: () => import('./educational/educational.routes').then(m => m.EDUCATIONAL_ROUTES)
            },
            {
                path: 'communication',
                loadChildren: () => import('./communication/communication.routes').then(m => m.COMMUNICATION_ROUTES)
            },
            {
                path: 'medical',
                loadChildren: () => import('./medical/medical.routes').then(m => m.MEDICAL_ROUTES)
            }
        ]
    },

    // Admin/Back-Office Routes
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },

    // Fallback
    { path: '**', redirectTo: 'auth/signin' }
];
