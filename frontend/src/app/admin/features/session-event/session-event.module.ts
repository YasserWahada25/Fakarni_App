import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SessionEventRoutingModule } from './session-event-routing.module';
import { SessionEventLayoutComponent } from './components/session-event-layout/session-event-layout.component';
import { SessionListComponent } from './components/session-list/session-list.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { SessionFormComponent } from './components/session-form/session-form.component';
import { EventFormComponent } from './components/event-form/event-form.component';

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

@NgModule({
    declarations: [
        SessionEventLayoutComponent,
        SessionListComponent,
        EventListComponent,
        SessionFormComponent,
        EventFormComponent
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
        MatTooltipModule
    ]
})
export class SessionEventModule { }
