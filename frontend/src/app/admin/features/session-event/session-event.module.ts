import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SessionEventRoutingModule } from './session-event-routing.module';
import { SessionEventLayoutComponent } from './components/session-event-layout/session-event-layout.component';
import { SessionListComponent } from './components/session-list/session-list.component';
import { SessionFormComponent } from './components/session-form/session-form.component';
import { ReservationRequestsComponent } from './components/reservation-requests/reservation-requests.component';

// Material Imports
import { MatTabsModule } from '@angular/material/tabs';
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
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
    declarations: [
        SessionEventLayoutComponent,
        SessionListComponent,
        SessionFormComponent,
        ReservationRequestsComponent
    ],
    imports: [
        CommonModule,
        SessionEventRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        MatTabsModule,
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
        MatProgressSpinnerModule,
        MatSnackBarModule
    ]
})
export class SessionEventModule { }
