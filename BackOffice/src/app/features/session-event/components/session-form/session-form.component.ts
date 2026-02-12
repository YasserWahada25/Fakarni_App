import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Session } from '../../../../core/models/session.model';
import { SessionService } from '../../../../core/services/session.service';

@Component({
    selector: 'app-session-form',
    standalone: false,
    templateUrl: './session-form.component.html',
    styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent {
    sessionForm: FormGroup;
    isEditMode: boolean = false;

    constructor(
        private fb: FormBuilder,
        private sessionService: SessionService,
        public dialogRef: MatDialogRef<SessionFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Session | null
    ) {
        this.isEditMode = !!data;
        this.sessionForm = this.fb.group({
            title: [data?.title || '', Validators.required],
            date: [data?.date || new Date(), Validators.required],
            startTime: [data?.startTime || '', Validators.required],
            endTime: [data?.endTime || '', Validators.required],
            status: [data?.status || 'scheduled', Validators.required],
            participantsCount: [data?.participantsCount || 0, [Validators.required, Validators.min(0)]],
            description: [data?.description || '']
        });
    }

    onSubmit(): void {
        if (this.sessionForm.valid) {
            const formValue = this.sessionForm.value;
            if (this.isEditMode && this.data) {
                const updatedSession: Session = { ...this.data, ...formValue };
                this.sessionService.updateSession(updatedSession).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                this.sessionService.addSession(formValue).subscribe(() => {
                    this.dialogRef.close(true);
                });
            }
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
