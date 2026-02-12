import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Event } from '../../../../core/models/event.model';
import { EventService } from '../../../../core/services/event.service';

@Component({
    selector: 'app-event-form',
    standalone: false,
    templateUrl: './event-form.component.html',
    styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent {
    eventForm: FormGroup;
    isEditMode: boolean = false;
    reminderOptions: string[] = ['1 hour before', '1 day before', '1 week before'];

    constructor(
        private fb: FormBuilder,
        private eventService: EventService,
        public dialogRef: MatDialogRef<EventFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Event | null
    ) {
        this.isEditMode = !!data;
        this.eventForm = this.fb.group({
            title: [data?.title || '', Validators.required],
            date: [data?.date || new Date(), Validators.required],
            startTime: [data?.startTime || '', Validators.required],
            status: [data?.status || 'upcoming', Validators.required],
            participantsCount: [data?.participantsCount || 0, [Validators.required, Validators.min(0)]],
            description: [data?.description || ''],
            reminders: [data?.reminders || []]
        });
    }

    onSubmit(): void {
        if (this.eventForm.valid) {
            const formValue = this.eventForm.value;
            if (this.isEditMode && this.data) {
                const updatedEvent: Event = { ...this.data, ...formValue };
                this.eventService.updateEvent(updatedEvent).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                this.eventService.addEvent(formValue).subscribe(() => {
                    this.dialogRef.close(true);
                });
            }
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
