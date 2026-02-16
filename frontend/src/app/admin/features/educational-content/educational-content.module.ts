import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { EducationalContentRoutingModule } from './educational-content-routing.module';
import { ActivityListComponent } from './components/activity-list/activity-list.component';
import { ActivityFormComponent } from './components/activity-form/activity-form.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EngagementTrackingComponent } from './components/engagement-tracking/engagement-tracking.component';
import { EngagementChartsComponent } from './components/engagement-charts/engagement-charts.component';

// Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
    declarations: [
        ActivityListComponent,
        ActivityFormComponent,
        EventListComponent,
        EventFormComponent,
        EngagementTrackingComponent,
        EngagementChartsComponent
    ],
    imports: [
        CommonModule,
        EducationalContentRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatTooltipModule,
        MatTabsModule,
        MatChipsModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatBadgeModule
    ]
})
export class EducationalContentModule { }
