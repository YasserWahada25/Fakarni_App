import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Session } from '../shared/alzheimer.service';
import { VideoSessionService } from '../meeting/video-session.service';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="session-detail-card" *ngIf="session">
      <button mat-icon-button class="close-btn" (click)="close.emit()" aria-label="Fermer les details">
        <mat-icon>close</mat-icon>
      </button>

      <div class="detail-header">
        <div class="type-badge" [ngClass]="'badge-' + (session.type?.toLowerCase() || 'general')">
          {{ session.type || 'General' }}
        </div>
        <div class="title-block">
          <h3>{{ session.title }}</h3>
          <p>{{ getStatusLabel(session.status) }} - {{ getVisibilityLabel(session.visibility) }}</p>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <mat-icon>calendar_today</mat-icon>
          <div>
            <span class="meta-label">Date</span>
            <span class="meta-value">{{ session.date | date:'fullDate' }}</span>
          </div>
        </div>

        <div class="meta-item">
          <mat-icon>schedule</mat-icon>
          <div>
            <span class="meta-label">Horaire</span>
            <span class="meta-value">{{ getTimeRange(session) }}</span>
          </div>
        </div>

        <div class="meta-item">
          <mat-icon>group</mat-icon>
          <div>
            <span class="meta-label">Participants</span>
            <span class="meta-value">{{ session.participants || '0' }}</span>
          </div>
        </div>

        <div class="meta-item">
          <mat-icon>{{ isOnlineSession(session) ? 'videocam' : 'location_on' }}</mat-icon>
          <div>
            <span class="meta-label">Mode</span>
            <span class="meta-value">{{ getMeetingModeLabel(session) }}</span>
          </div>
        </div>
      </div>

      <p class="description">{{ session.description || 'Aucune description disponible.' }}</p>

      <div class="actions">
        <ng-container *ngIf="isOnlineSession(session); else inPersonInfo">
          <button mat-raised-button color="primary" class="join-btn"
            (click)="joinMeeting()" [disabled]="isJoining">
            <mat-icon>{{ isJoining ? 'hourglass_empty' : 'videocam' }}</mat-icon>
            {{ isJoining ? 'Connexion...' : 'Rejoindre la visio' }}
          </button>

          <!-- Message d'erreur si le join échoue -->
          <div *ngIf="joinError" class="join-error">
            <mat-icon>error_outline</mat-icon>
            {{ joinError }}
          </div>

          <a *ngIf="session.meetingUrl" mat-stroked-button color="primary" class="meeting-link" [href]="session.meetingUrl"
            target="_blank" rel="noopener noreferrer">
            <mat-icon>link</mat-icon>
            Lien externe
          </a>
        </ng-container>

        <ng-template #inPersonInfo>
          <span class="in-person-note">
            <mat-icon>location_on</mat-icon>
            Session presentielle: pas de lien en ligne.
          </span>
        </ng-template>

        <button mat-stroked-button color="accent" class="fav-action-btn" (click)="onFavorite()"
          [class.is-favorite]="session.isFavorite">
          <mat-icon>{{ session.isFavorite ? 'star' : 'star_border' }}</mat-icon>
          {{ session.isFavorite ? 'Retirer favori' : 'Favori' }}
        </button>
      </div>
    </mat-card>
  `,
  styles: [`
    .session-detail-card {
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(92, 107, 192, 0.16);
      border: 1px solid #ebe9f7;
      position: relative;
      padding: 18px;
    }

    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      color: #4f5272;
      background: #f3f4fa;
    }

    .close-btn:hover {
      background: #e8eaf5;
    }

    .detail-header {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 14px;
      padding-right: 40px;
    }

    .type-badge {
      padding: 4px 11px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.45px;
      white-space: nowrap;
    }

    .badge-therapy { background: #f3e5f5; color: #7b1fa2; }
    .badge-cognitive { background: #e3f2fd; color: #1565c0; }
    .badge-physical { background: #e8f5e9; color: #2e7d32; }
    .badge-creative { background: #fff3e0; color: #e65100; }
    .badge-general { background: #eceff1; color: #455a64; }

    .title-block h3 {
      margin: 0;
      color: #24253d;
      font-size: 1.35rem;
      line-height: 1.22;
      font-weight: 700;
    }

    .title-block p {
      margin: 6px 0 0;
      font-size: 0.88rem;
      color: #697095;
      font-weight: 600;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8f9ff;
      border: 1px solid #e7eaf8;
      border-radius: 10px;
      padding: 10px;
    }

    .meta-item mat-icon {
      color: #5c6bc0;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .meta-label {
      display: block;
      font-size: 0.7rem;
      text-transform: uppercase;
      color: #7a80a1;
      font-weight: 700;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
    }

    .meta-value {
      display: block;
      color: #333651;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .description {
      color: #4f536f;
      font-size: 0.95rem;
      line-height: 1.55;
      margin: 0 0 16px;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .join-btn {
      font-weight: 600;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .meeting-link {
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }

    .fav-action-btn {
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }

    .fav-action-btn.is-favorite {
      background: #fffbeb;
      border-color: #ffc107;
      color: #f59e0b;
    }

    .in-person-note {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 10px;
      padding: 8px 11px;
      background: #f3f6fb;
      border: 1px solid #dce3f2;
      color: #465071;
      font-size: 0.82rem;
      font-weight: 600;
    }

    .in-person-note mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #5d678f;
    }

    .join-error {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #d32f2f;
      font-size: 0.82rem;
      font-weight: 600;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 6px 12px;
      width: 100%;
      margin-top: 4px;
    }

    .join-error mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    @media (max-width: 760px) {
      .session-detail-card {
        padding: 14px;
      }

      .title-block h3 {
        font-size: 1.1rem;
      }

      .meta-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SessionDetailComponent {
  @Input() session: Session | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();

  constructor(
    private router: Router,
    private videoService: VideoSessionService
  ) { }

  onFavorite(): void {
    this.toggleFavorite.emit();
  }

  /** Indicateur de chargement pour le bouton Join Meeting */
  isJoining = false;
  joinError: string | null = null;

  joinMeeting(): void {
    if (!this.session || !this.isOnlineSession(this.session)) return;

    this.isJoining = true;
    this.joinError = null;

    const sessionId = this.session.id;
    // Utilise l'utilisateur connecté depuis localStorage, avec session.createdBy comme fallback
    const currentUser = this.resolveCurrentUserId();

    // Étape 1 : vérifier si une room active existe déjà pour cette VirtualSession
    this.videoService.getVideoSessionByVirtualSession(sessionId).subscribe({

      next: (videoSession) => {
        // Room active trouvée → rejoindre directement
        this.videoService.joinVideoSession(videoSession.roomId, currentUser).subscribe({
          next: () => {
            this.navigateToMeeting(sessionId, videoSession.roomId);
          },
          error: (joinErr) => {
            this.isJoining = false;
            if (joinErr.status === 403) {
              this.joinError = "Vous n'êtes pas autorisé à rejoindre cette session.";
            } else if (joinErr.status === 409) {
              this.joinError = "La session est pleine.";
            } else if (joinErr.status === 400) {
              this.joinError = joinErr.error?.message ?? "Impossible de rejoindre cette session.";
            } else {
              this.joinError = "Erreur lors de la connexion à la room.";
            }
          }
        });
      },

      error: (err) => {
        // Erreur 404 = aucune room active → créer la room (seul le créateur/hôte peut le faire)
        if (err.status === 404) {
          this.videoService.startVideoSession(sessionId, currentUser).subscribe({
            next: (newVideoSession) => {
              this.videoService.joinVideoSession(newVideoSession.roomId, currentUser).subscribe({
                next: () => {
                  this.isJoining = false;
                  this.navigateToMeeting(sessionId, newVideoSession.roomId);
                },
                error: (joinErr) => {
                  this.isJoining = false;
                  this.joinError = joinErr.error?.message ?? "Room créée, mais impossible de rejoindre la session.";
                }
              });
            },
            error: (startErr) => {
              this.isJoining = false;
              if (startErr.status === 403) {
                this.joinError = "Seul l'hôte peut démarrer la session. Attendez que l'hôte l'ouvre.";
              } else if (startErr.status === 400) {
                this.joinError = startErr.error?.message ?? "La session n'est pas en mode En ligne ou n'est pas planifiée.";
              } else if (startErr.status === 409) {
                // Race condition : quelqu'un a créé la room entre temps, on réessaie
                this.joinMeeting();
              } else {
                this.joinError = "Erreur lors du démarrage de la session : " + (startErr.error?.message ?? startErr.message ?? 'Erreur inconnue');
              }
            }
          });
        } else {
          this.isJoining = false;
          this.joinError = "Erreur de réseau : impossible de vérifier la session.";
        }
      }
    });
  }

  private resolveCurrentUserId(): string {
    if (typeof window === 'undefined') return this.session?.createdBy ?? 'patient';
    const storage = window.localStorage;
    return storage.getItem('userId')
      || storage.getItem('user_id')
      || storage.getItem('uid')
      || storage.getItem('username')
      || this.session?.createdBy
      || 'patient';
  }

  private navigateToMeeting(sessionId: number, roomId: string): void {
    this.isJoining = false;
    this.router.navigate(['/alzheimer_meeting/meeting', sessionId], {
      queryParams: { roomId }
    });
  }

  getStatusLabel(status?: string): string {
    const normalized = (status ?? '').toUpperCase();
    if (normalized === 'SCHEDULED' || normalized === 'ACCEPTED' || normalized === 'PLANNED') return 'Session planifiee';
    if (normalized === 'DONE') return 'Session terminee';
    return normalized || 'Statut inconnu';
  }

  getVisibilityLabel(visibility?: string): string {
    if ((visibility ?? '').toUpperCase() === 'PUBLIC') return 'Publique';
    if ((visibility ?? '').toUpperCase() === 'PRIVATE') return 'Privee';
    return 'Visibilite inconnue';
  }

  getMeetingModeLabel(session: Session): string {
    return this.isOnlineSession(session) ? 'En ligne' : 'Presentielle';
  }

  isOnlineSession(session: Session): boolean {
    const mode = (session.meetingMode ?? '').toUpperCase();
    if (mode === 'ONLINE') return true;
    if (mode === 'IN_PERSON') return false;
    return !!session.meetingUrl;
  }

  getTimeRange(session: Session): string {
    const start = session.startTime ? new Date(session.startTime) : session.date;
    const end = session.endTime ? new Date(session.endTime) : null;
    const startHour = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const endHour = end ? end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null;
    return endHour ? `${startHour} - ${endHour}` : (session.time || startHour);
  }
}
