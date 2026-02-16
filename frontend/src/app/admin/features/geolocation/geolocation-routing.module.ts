import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZoneManagementComponent } from './components/zone-management/zone-management.component';
import { AlertManagementComponent } from './components/alert-management/alert-management.component';
import { StatisticsComponent } from './components/statistics/statistics.component';

const routes: Routes = [
    { path: '', redirectTo: 'zones', pathMatch: 'full' },
    { path: 'zones', component: ZoneManagementComponent },
    { path: 'alerts', component: AlertManagementComponent },
    { path: 'statistics', component: StatisticsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GeolocationRoutingModule { }
