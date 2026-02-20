import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EducationalActivity, ActivityType } from '../../../../core/models/educational-activity.model';
import { ActivityService } from '../../../../core/services/activity.service';

@Component({
    selector: 'app-activity-form',
    standalone: false,
    templateUrl: './activity-form.component.html',
    styleUrls: ['./activity-form.component.scss']
})
export class ActivityFormComponent implements OnInit {
    activityForm: FormGroup;
    isEditMode: boolean = false;
    activityTypes: { value: ActivityType; label: string }[] = [
        { value: 'quiz', label: 'Quiz' },
        { value: 'cognitive_game', label: 'Jeu Cognitif' },
        { value: 'video', label: 'Vidéo' }
    ];

    constructor(
        private fb: FormBuilder,
        private activityService: ActivityService,
        public dialogRef: MatDialogRef<ActivityFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EducationalActivity
    ) {
        this.isEditMode = !!data;
        this.activityForm = this.fb.group({
            name: ['', Validators.required],
            type: ['quiz', Validators.required],
            description: ['', Validators.required],
            status: ['active'],
            videoUrl: [''],
            duration: [null]
        });
    }

    ngOnInit(): void {
        if (this.isEditMode) {
            this.activityForm.patchValue({
                name: this.data.name,
                type: this.data.type,
                description: this.data.description,
                status: this.data.status,
                videoUrl: this.data.content.videoUrl || '',
                duration: this.data.content.duration || null
            });
        }
    }

    onSubmit(): void {
        if (this.activityForm.valid) {
            const formValue = this.activityForm.value;
            const activity: Omit<EducationalActivity, 'id'> = {
                name: formValue.name,
                type: formValue.type,
                description: formValue.description,
                createdDate: this.isEditMode ? this.data.createdDate : new Date(),
                status: formValue.status,
                content: this.buildContent(formValue)
            };

            if (this.isEditMode) {
                this.activityService.updateActivity(this.data.id, activity).subscribe(() => {
                    this.dialogRef.close(true);
                });
            } else {
                this.activityService.createActivity(activity).subscribe(() => {
                    this.dialogRef.close(true);
                });
            }
        }
    }

    private buildContent(formValue: any): any {
        if (formValue.type === 'video') {
            return {
                videoUrl: formValue.videoUrl,
                duration: formValue.duration
            };
        } else if (formValue.type === 'quiz') {
            return { questions: [] };
        } else {
            return { gameConfig: { difficulty: 'medium', instructions: '' } };
        }
    }

    close(): void {
        this.dialogRef.close();
    }
}
