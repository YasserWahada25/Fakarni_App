import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Alert } from '../../../../core/models/alert.model';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
    selector: 'app-alert-detail',
    standalone: false,
    templateUrl: './alert-detail.component.html',
    styleUrls: ['./alert-detail.component.scss']
})
export class AlertDetailComponent {
    notes: string = '';

    constructor(
        public dialogRef: MatDialogRef<AlertDetailComponent>,
        @Inject(MAT_DIALOG_DATA) public alert: Alert,
        private alertService: AlertService
    ) {
        this.notes = alert.notes || '';
    }

    markAsResolved(): void {
        this.alertService.updateAlertStatus(this.alert.id, 'resolved', this.notes).subscribe(() => {
            this.dialogRef.close(true);
        });
    }

    markAsIgnored(): void {
        this.alertService.updateAlertStatus(this.alert.id, 'ignored', this.notes).subscribe(() => {
            this.dialogRef.close(true);
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}
