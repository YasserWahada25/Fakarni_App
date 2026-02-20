import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';
import { ReportListComponent } from './components/report-list/report-list.component';

const routes: Routes = [
    { path: 'patients', component: PatientListComponent },
    { path: 'patients/:id', component: PatientDetailComponent },
    { path: 'reports', component: ReportListComponent },
    { path: '', redirectTo: 'patients', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MedicalMonitorRoutingModule { }
