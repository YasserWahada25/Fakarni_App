import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionService, PatientSession } from './session.service';

type SessionMode = 'online' | 'presential';
type SessionType = 'PRIVATE' | 'GROUP';

const URL_PATTERN = /^https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[/?#].*)?$/i;

function timeRangeValidator(group: AbstractControl): ValidationErrors | null {
    const startTime = group.get('startTime')?.value;
    const endTime = group.get('endTime')?.value;

    if (!startTime || !endTime) {
        return null;
    }

    return endTime > startTime ? null : { invalidTimeRange: true };
}

@Component({
    selector: 'app-reservation-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatRadioModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    template: `
    <div class="reservation-form-container">
      <header class="form-header">
        <div>
          <h2><mat-icon>event_note</mat-icon> Nouvelle demande de sÃ©ance</h2>
          <p>Envoyez votre demande. Le docteur lâ€™acceptera ou la refusera.</p>
        </div>
        <button mat-icon-button type="button" (click)="onCancel()" aria-label="Fermer le formulaire">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <form [formGroup]="reservationForm" (ngSubmit)="onSubmit()" class="reservation-form">
        <section class="grid two">
          <mat-form-field appearance="outline">
            <mat-label>Titre de la sÃ©ance</mat-label>
            <input matInput formControlName="title" placeholder="Ex: Suivi mÃ©moire hebdomadaire">
            <mat-error *ngIf="hasError('title', 'required')">Le titre est obligatoire.</mat-error>
            <mat-error *ngIf="hasError('title', 'minlength')">Minimum 3 caractÃ¨res.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type de sÃ©ance</mat-label>
            <mat-select formControlName="sessionType">
              <mat-option value="PRIVATE">PrivÃ©e (patient + docteur)</mat-option>
              <mat-option value="GROUP">Groupe</mat-option>
            </mat-select>
          </mat-form-field>
        </section>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            rows="3"
            formControlName="description"
            placeholder="PrÃ©cisez votre besoin ou contexte mÃ©dical..."></textarea>
          <mat-error *ngIf="hasError('description', 'required')">La description est obligatoire.</mat-error>
          <mat-error *ngIf="hasError('description', 'minlength')">Minimum 10 caractÃ¨res.</mat-error>
        </mat-form-field>

        <section class="grid three">
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="hasError('date', 'required')">La date est obligatoire.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>DÃ©but</mat-label>
            <input matInput type="time" formControlName="startTime">
            <mat-error *ngIf="hasError('startTime', 'required')">Heure de dÃ©but requise.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fin</mat-label>
            <input matInput type="time" formControlName="endTime">
            <mat-error *ngIf="hasError('endTime', 'required')">Heure de fin requise.</mat-error>
          </mat-form-field>
        </section>

        <div class="time-range-error" *ngIf="reservationForm.hasError('invalidTimeRange') && submittedOnce">
          <mat-icon>warning</mat-icon>
          <span>Lâ€™heure de fin doit Ãªtre aprÃ¨s lâ€™heure de dÃ©but.</span>
        </div>

        <section class="mode-section">
          <label id="mode-label">Mode de sÃ©ance</label>
          <mat-radio-group aria-labelledby="mode-label" formControlName="mode" class="radio-group">
            <mat-radio-button value="presential">PrÃ©sentielle</mat-radio-button>
            <mat-radio-button value="online">En ligne</mat-radio-button>
          </mat-radio-group>
        </section>

        <mat-form-field appearance="outline" *ngIf="isOnlineMode">
          <mat-label>Lien de rÃ©union</mat-label>
          <input matInput formControlName="meetingUrl" placeholder="https://meet.google.com/...">
          <mat-error *ngIf="hasError('meetingUrl', 'required')">Le lien est obligatoire pour une sÃ©ance en ligne.</mat-error>
          <mat-error *ngIf="hasError('meetingUrl', 'pattern')">Entrez une URL valide (http/https).</mat-error>
        </mat-form-field>

        <div class="auto-visibility">
          <mat-icon>lock</mat-icon>
          <span>VisibilitÃ© appliquÃ©e automatiquement: <strong>{{ visibilityLabel }}</strong></span>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()" [disabled]="isSubmitting">Annuler</button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            class="submit-button"
            [disabled]="reservationForm.invalid || isSubmitting">
            <ng-container *ngIf="!isSubmitting">
              <mat-icon>send</mat-icon>
              Envoyer la demande
            </ng-container>
            <ng-container *ngIf="isSubmitting">
              <mat-progress-spinner [diameter]="18" mode="indeterminate"></mat-progress-spinner>
              Envoi...
            </ng-container>
          </button>
        </div>

        <div class="submit-status error" *ngIf="submitError">
          <mat-icon>error</mat-icon>
          <span>{{ submitError }}</span>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .reservation-form-container {
      padding: 24px;
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 14px 32px rgba(16, 24, 40, 0.12);
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 18px;
    }

    .form-header h2 {
      margin: 0 0 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1f2a44;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .form-header p {
      margin: 0;
      color: #607089;
      font-size: 0.9rem;
    }

    .reservation-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .grid {
      display: grid;
      gap: 14px;
    }

    .grid.two {
      grid-template-columns: 1.2fr 1fr;
    }

    .grid.three {
      grid-template-columns: repeat(3, 1fr);
    }

    .mode-section {
      margin: 4px 0 2px;
    }

    .mode-section label {
      display: inline-block;
      margin-bottom: 8px;
      font-size: 0.86rem;
      font-weight: 600;
      color: #3c4e67;
    }

    .radio-group {
      display: flex;
      gap: 22px;
      padding: 10px 12px;
      background: #f7f9fc;
      border-radius: 10px;
    }

    .auto-visibility {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #eef6ff;
      color: #114678;
      border: 1px solid #d4e8ff;
      border-radius: 10px;
      padding: 9px 12px;
      font-size: 0.84rem;
      margin-top: 2px;
    }

    .time-range-error {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #b42318;
      background: #ffefee;
      border: 1px solid #ffd4d1;
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 0.82rem;
    }

    .time-range-error mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
    }

    .submit-button {
      min-width: 160px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .submit-button mat-progress-spinner {
      --mdc-circular-progress-active-indicator-color: #fff;
    }

    .submit-status {
      margin-top: 4px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.84rem;
    }

    .submit-status.error {
      color: #b42318;
    }

    mat-form-field {
      width: 100%;
    }

    @media (max-width: 900px) {
      .grid.two,
      .grid.three {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReservationFormComponent implements OnInit {
    @Input() selectedDate: Date | null = null;
    @Output() submitted = new EventEmitter<PatientSession>();
    @Output() cancelled = new EventEmitter<void>();

    reservationForm: FormGroup;
    isSubmitting = false;
    submittedOnce = false;
    submitError: string | null = null;
    private readonly plannedStatuses = new Set(['DRAFT', 'SCHEDULED', 'ACCEPTED', 'PLANNED']);

    constructor(private fb: FormBuilder, private sessionService: SessionService) {
        this.reservationForm = this.fb.group(
            {
                title: ['', [Validators.required, Validators.minLength(3)]],
                description: ['', [Validators.required, Validators.minLength(10)]],
                date: [null, Validators.required],
                startTime: ['', Validators.required],
                endTime: ['', Validators.required],
                mode: ['presential', Validators.required],
                sessionType: ['PRIVATE', Validators.required],
                meetingUrl: ['']
            },
            { validators: timeRangeValidator }
        );
    }

    ngOnInit(): void {
        if (this.selectedDate) {
            this.reservationForm.patchValue({ date: this.selectedDate });
        }

        this.reservationForm.get('mode')?.valueChanges.subscribe(mode => {
            const meetingUrlControl = this.reservationForm.get('meetingUrl');
            if (mode === 'online') {
                meetingUrlControl?.setValidators([Validators.required, Validators.pattern(URL_PATTERN)]);
            } else {
                meetingUrlControl?.setValue('');
                meetingUrlControl?.clearValidators();
            }
            meetingUrlControl?.updateValueAndValidity();
        });
    }

    get isOnlineMode(): boolean {
        return this.reservationForm.get('mode')?.value === 'online';
    }

    get visibilityLabel(): string {
        return this.reservationForm.get('sessionType')?.value === 'GROUP'
            ? 'Publique (sÃ©ance de groupe)'
            : 'PrivÃ©e (sÃ©ance individuelle)';
    }

    onSubmit(): void {
        this.submittedOnce = true;
        this.reservationForm.markAllAsTouched();

        if (this.reservationForm.invalid) {
            return;
        }

        this.isSubmitting = true;
        this.submitError = null;

        const formValue = this.reservationForm.value;
        const sessionDate: Date = formValue.date;
        const startTime = this.combineDateAndTime(sessionDate, formValue.startTime);
        const endTime = this.combineDateAndTime(sessionDate, formValue.endTime);
        const sessionType = formValue.sessionType as SessionType;
        const mode = formValue.mode as SessionMode;

        const session: PatientSession = {
            title: formValue.title.trim(),
            description: formValue.description.trim(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            meetingUrl: mode === 'online' ? (formValue.meetingUrl?.trim() || '') : '',
            visibility: sessionType === 'GROUP' ? 'PUBLIC' : 'PRIVATE',
            sessionType,
            status: 'DRAFT',
            type: mode
        };

        this.sessionService.getSessions().subscribe({
            next: existingSessions => {
                const hasConflict = existingSessions.some(existing => {
                    if (!this.isPlannedStatus(existing.status)) {
                        return false;
                    }

                    const existingStart = new Date(existing.startTime);
                    const existingEnd = new Date(existing.endTime);
                    return this.isTimeRangeOverlapping(startTime, endTime, existingStart, existingEnd);
                });

                if (hasConflict) {
                    this.isSubmitting = false;
                    this.submitError = 'Une session existe deja dans cette plage horaire.';
                    if (typeof window !== 'undefined') {
                        window.alert(this.submitError);
                    }
                    return;
                }

                this.sessionService.createSession(session).subscribe({
                    next: createdSession => {
                        this.isSubmitting = false;
                        this.submitted.emit(createdSession);
                        this.reservationForm.reset({
                            title: '',
                            description: '',
                            date: this.selectedDate ?? null,
                            startTime: '',
                            endTime: '',
                            mode: 'presential',
                            sessionType: 'PRIVATE',
                            meetingUrl: ''
                        });
                        this.submittedOnce = false;
                    },
                    error: () => {
                        this.isSubmitting = false;
                        this.submitError = 'Impossible d envoyer la demande pour le moment. Veuillez reessayer.';
                    }
                });
            },
            error: () => {
                this.isSubmitting = false;
                this.submitError = 'Impossible de verifier les sessions existantes. Veuillez reessayer.';
            }
        });
    }

    onCancel(): void {
        this.cancelled.emit();
    }

    private combineDateAndTime(date: Date, time: string): Date {
        const [hours, minutes] = time.split(':').map(Number);
        const value = new Date(date);
        value.setHours(hours, minutes, 0, 0);
        return value;
    }

    private isPlannedStatus(status: PatientSession['status']): boolean {
        return this.plannedStatuses.has((status || '').toUpperCase());
    }

    private isTimeRangeOverlapping(
        startA: Date,
        endA: Date,
        startB: Date,
        endB: Date
    ): boolean {
        return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
    }

    hasError(controlName: string, errorCode: string): boolean {
        const control = this.reservationForm.get(controlName);
        return !!control && control.hasError(errorCode) && (control.touched || control.dirty || this.submittedOnce);
    }
}

