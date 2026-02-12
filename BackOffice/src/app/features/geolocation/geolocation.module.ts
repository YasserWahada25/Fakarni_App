import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { GeolocationRoutingModule } from './geolocation-routing.module';
import { ZoneManagementComponent } from './components/zone-management/zone-management.component';
import { AlertManagementComponent } from './components/alert-management/alert-management.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ZoneFormComponent } from './components/zone-form/zone-form.component';
import { AlertDetailComponent } from './components/alert-detail/alert-detail.component';

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
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
    declarations: [
        ZoneManagementComponent,
        AlertManagementComponent,
        StatisticsComponent,
        ZoneFormComponent,
        AlertDetailComponent
    ],
    imports: [
        CommonModule,
        GeolocationRoutingModule,
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
        MatListModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatExpansionModule,
        MatBadgeModule
    ]
})
export class GeolocationModule { }
