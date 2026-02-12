import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EducationalEvent } from '../../../../core/models/educational-event.model';
import { EducationalEventService } from '../../../../core/services/educational-event.service';

@Component({
    selector: 'app-event-form',
    standalone: false,
    templateUrl: './event-form.component.html',
    styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
    eventForm: FormGroup;
    isEditMode: boolean = false;

    constructor(
        private fb: FormBuilder,
        private eventService: EducationalEventService,
        public dialogRef: MatDialogRef<EventFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EducationalEvent
    ) {
        this.isEditMode = !!data;
        this.eventForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            date: [new Date(), Validators.required],
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            status: ['scheduled'],
            maxParticipants: [null],
            location: ['']
        });
    }

    ngOnInit(): void {
        if (this.isEditMode) {
            this.eventForm.patchValue({
                title: this.data.title,
                description: this.data.description,
                date: this.data.date,
                startTime: this.data.startTime,
                endTime: this.data.endTime,
                status: this.data.status,
                maxParticipants: this.data.maxParticipants,
                location: this.data.location
            });
        }
    }

    onSubmit(): void {
        if (this.eventForm.valid) {
            const formValue = this.eventForm.value;
            const event: Omit<EducationalEvent, 'id'> = {
                title: formValue.title,
                description: formValue.description,
                date: formValue.date,
                startTime: formValue.startTime,
                endTime: formValue.endTime,
                status: formValue.status,
                participantsCount: this.isEditMode ? this.data.participantsCount : 0,
                maxParticipants: formValue.maxParticipants,
                location: formValue.location,
                reminders: this.isEditMode ? this.data.reminders : []
            };

            if (this.isEditMode) {
                this.eventService.updateEvent(this.data.id, event).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                this.eventService.createEvent(event).subscribe(() => {
                    this.dialogRef.close(true);
                });
            }
        }
    }

    close(): void {
        this.dialogRef.close();
    }
}
