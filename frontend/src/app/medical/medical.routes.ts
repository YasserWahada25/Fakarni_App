import { Routes } from '@angular/router';
import { MedicalLayoutComponent } from './shared/medical-layout.component';

export const MEDICAL_ROUTES: Routes = [
    {
        path: '',
        component: MedicalLayoutComponent,
        children: [
            { path: '', redirectTo: 'records', pathMatch: 'full' },
            {
                path: 'detection',
                loadComponent: () => import('./detection/mri-analysis.component').then(m => m.MriAnalysisComponent)
            },
            {
                path: 'records',
                loadComponent: () => import('./records/patient-profile.component').then(m => m.PatientProfileComponent)
            },
            {
                path: 'follow-up',
                loadComponent: () => import('./follow-up/follow-up.component').then(m => m.FollowUpComponent)
            }
        ]
    }
];
