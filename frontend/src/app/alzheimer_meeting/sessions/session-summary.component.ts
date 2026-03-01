import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PatientSession } from './session.service';

@Component({
    selector: 'app-session-summary',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="summary-container">
      <header class="summary-header">
        <div class="header-icon">
          <mat-icon>pending_actions</mat-icon>
        </div>
        <h2>Demande envoyée</h2>
        <p>Votre réservation est en attente de validation par le docteur.</p>
      </header>

      <section class="summary-body">
        <div class="info-row">
          <mat-icon>title</mat-icon>
          <div>
            <span class="label">Titre</span>
            <span class="value">{{ session.title }}</span>
          </div>
        </div>

        <div class="info-row">
          <mat-icon>description</mat-icon>
          <div>
            <span class="label">Description</span>
            <span class="value">{{ session.description }}</span>
          </div>
        </div>

        <div class="info-row">
          <mat-icon>schedule</mat-icon>
          <div>
            <span class="label">Début</span>
            <span class="value">{{ session.startTime | date: 'dd/MM/yyyy à HH:mm' }}</span>
          </div>
        </div>

        <div class="info-row">
          <mat-icon>schedule</mat-icon>
          <div>
            <span class="label">Fin</span>
            <span class="value">{{ session.endTime | date: 'dd/MM/yyyy à HH:mm' }}</span>
          </div>
        </div>

        <div class="info-row">
          <mat-icon>{{ session.type === 'online' ? 'videocam' : 'location_on' }}</mat-icon>
          <div>
            <span class="label">Mode</span>
            <span class="value">{{ session.type === 'online' ? 'En ligne' : 'Présentielle' }}</span>
          </div>
        </div>

        <div class="info-row">
          <mat-icon>group</mat-icon>
          <div>
            <span class="label">Type</span>
            <span class="value">{{ session.sessionType === 'GROUP' ? 'Groupe' : 'Privée' }}</span>
          </div>
        </div>

        <div class="info-row">
          <mat-icon>lock{{ session.visibility === 'PUBLIC' ? '_open' : '' }}</mat-icon>
          <div>
            <span class="label">Visibilité</span>
            <span class="value">{{ session.visibility === 'PUBLIC' ? 'Publique' : 'Privée' }}</span>
          </div>
        </div>

        <div class="info-row" *ngIf="session.meetingUrl">
          <mat-icon>link</mat-icon>
          <div>
            <span class="label">Lien de réunion</span>
            <a [href]="session.meetingUrl" target="_blank" class="meeting-url">
              Ouvrir le lien
            </a>
          </div>
        </div>
      </section>

      <footer class="summary-actions">
        <button mat-raised-button color="primary" (click)="close()">
          <mat-icon>done</mat-icon>
          Fermer
        </button>
      </footer>
    </div>
  `,
    styles: [`
    .summary-container {
      overflow: hidden;
      border-radius: 14px;
      font-family: 'Poppins', sans-serif;
    }

    .summary-header {
      padding: 22px;
      background: linear-gradient(135deg, #1f6feb, #3154d5);
      color: #fff;
      text-align: center;
    }

    .header-icon {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 auto 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
    }

    .summary-header h2 {
      margin: 0 0 6px;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .summary-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .summary-body {
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .info-row mat-icon {
      color: #3154d5;
      margin-top: 2px;
    }

    .info-row div {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .label {
      color: #6a778d;
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 700;
    }

    .value {
      color: #1f2a44;
      font-size: 0.92rem;
      font-weight: 500;
      line-height: 1.35;
    }

    .meeting-url {
      color: #1f6feb;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .meeting-url:hover {
      text-decoration: underline;
    }

    .summary-actions {
      padding: 0 20px 20px;
      display: flex;
      justify-content: center;
    }
  `]
})
export class SessionSummaryComponent {
    session: PatientSession;

    constructor(
        private dialogRef: MatDialogRef<SessionSummaryComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { session: PatientSession }
    ) {
        this.session = data.session;
    }

    close(): void {
        this.dialogRef.close();
    }
}
