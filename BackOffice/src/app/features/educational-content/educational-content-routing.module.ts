import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityListComponent } from './components/activity-list/activity-list.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { EngagementTrackingComponent } from './components/engagement-tracking/engagement-tracking.component';

const routes: Routes = [
    { path: '', redirectTo: 'activities', pathMatch: 'full' },
    { path: 'activities', component: ActivityListComponent },
    { path: 'events', component: EventListComponent },
    { path: 'engagement', component: EngagementTrackingComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EducationalContentRoutingModule { }
