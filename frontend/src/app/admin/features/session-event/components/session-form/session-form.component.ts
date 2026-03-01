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
    isSubmitting = false;
    formError: string | null = null;
    private readonly plannedStatuses = new Set(['DRAFT', 'SCHEDULED', 'ACCEPTED', 'PLANNED']);

    statusOptions = [
        { value: 'SCHEDULED', label: 'Prévu' },
        { value: 'DRAFT', label: 'Brouillon' },
        { value: 'DONE', label: 'Terminé' },
        { value: 'CANCELLED', label: 'Annulé' }
    ];

    visibilityOptions = [
        { value: 'PUBLIC', label: 'Public' },
        { value: 'PRIVATE', label: 'Privee' }
    ];

    sessionTypeOptions = [
        { value: 'GROUP', label: 'Groupe' },
        { value: 'PRIVATE', label: 'Privee' }
    ];

    meetingModeOptions = [
        { value: 'ONLINE', label: 'En ligne' },
        { value: 'IN_PERSON', label: 'En presentiel' }
    ];

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
            status: [data?.status || 'SCHEDULED', Validators.required],
            visibility: [data?.visibility || 'PUBLIC', Validators.required],
            sessionType: [data?.sessionType || 'GROUP', Validators.required],
            meetingMode: [data?.meetingMode || 'ONLINE', Validators.required],
            meetingUrl: [data?.meetingUrl || ''],
            participantsCount: [data?.participantsCount || 0, [Validators.required, Validators.min(0)]],
            description: [data?.description || '']
        });
    }

    onSubmit(): void {
        this.sessionForm.markAllAsTouched();
        if (this.sessionForm.invalid) {
            return;
        }

        this.isSubmitting = true;
        this.formError = null;

        const formValue = this.sessionForm.value;
        const selectedDate = new Date(formValue.date);
        const requestedStart = this.combineDateAndTime(selectedDate, formValue.startTime);
        const requestedEnd = this.combineDateAndTime(selectedDate, formValue.endTime);

        if (requestedEnd.getTime() <= requestedStart.getTime()) {
            this.isSubmitting = false;
            this.formError = 'L heure de fin doit etre apres l heure de debut.';
            return;
        }

        const session: Session = {
            ...formValue,
            id: this.data?.id || 0,
            createdBy: this.data?.createdBy || 'admin'
        };

        this.sessionService.getSessionsByDate(new Date(formValue.date)).subscribe({
            next: sessionsOnDate => {
                const hasConflict = sessionsOnDate.some(existing => {
                    if (existing.id === session.id || !this.isPlannedStatus(existing.status)) {
                        return false;
                    }

                    const existingDate = existing.date instanceof Date ? existing.date : new Date(existing.date);
                    const existingStart = this.combineDateAndTime(existingDate, existing.startTime);
                    const existingEnd = this.combineDateAndTime(existingDate, existing.endTime);

                    return this.isTimeRangeOverlapping(requestedStart, requestedEnd, existingStart, existingEnd);
                });

                if (hasConflict) {
                    this.isSubmitting = false;
                    this.formError = 'Une session existe deja dans cette plage horaire.';
                    if (typeof window !== 'undefined') {
                        window.alert(this.formError);
                    }
                    return;
                }

                const request$ = this.isEditMode && this.data
                    ? this.sessionService.updateSession(session)
                    : this.sessionService.addSession(session);

                request$.subscribe({
                    next: () => {
                        this.isSubmitting = false;
                        this.dialogRef.close(true);
                    },
                    error: () => {
                        this.isSubmitting = false;
                        this.formError = 'Impossible de sauvegarder la session. Veuillez reessayer.';
                    }
                });
            },
            error: () => {
                this.isSubmitting = false;
                this.formError = 'Impossible de verifier les sessions existantes pour cette date.';
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    private isPlannedStatus(status: Session['status']): boolean {
        return this.plannedStatuses.has((status || '').toUpperCase());
    }

    private combineDateAndTime(date: Date, time: string): Date {
        const [hourPart = '0', minutePart = '0'] = (time || '').split(':');
        const hours = Number.parseInt(hourPart, 10);
        const minutes = Number.parseInt(minutePart, 10);

        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            Number.isNaN(hours) ? 0 : hours,
            Number.isNaN(minutes) ? 0 : minutes,
            0,
            0
        );
    }

    private isTimeRangeOverlapping(
        startA: Date,
        endA: Date,
        startB: Date,
        endB: Date
    ): boolean {
        return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
    }
}

