import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AlzheimerService, Session } from '../shared/alzheimer.service';
import { VideoSessionService } from '../meeting/video-session.service';

@Component({
    selector: 'app-favorites',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './favorites.component.html',
    styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
    favoriteSessions: Session[] = [];
    isLoading = true;
    joiningSessionId: number | null = null;
    joinErrors: Record<number, string> = {};

    constructor(
        private alzheimerService: AlzheimerService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private videoService: VideoSessionService
    ) { }

    ngOnInit(): void {
        this.alzheimerService.getFavorites().subscribe(sessions => {
            this.favoriteSessions = sessions;
            this.isLoading = false;
            this.cdr.markForCheck();
        });
    }

    removeFavorite(session: Session): void {
        this.alzheimerService.toggleFavorite(session.id);
        this.favoriteSessions = this.favoriteSessions.filter(s => s.id !== session.id);
    }

    joinMeeting(session: Session): void {
        const sessionId = session.id;
        if (!this.isOnlineSession(session)) {
            this.joinErrors[sessionId] = 'Cette session est présentielle.';
            return;
        }
        const currentUser = this.resolveCurrentUserId(session);
        this.joiningSessionId = sessionId;
        this.joinErrors[sessionId] = '';

        this.videoService.getVideoSessionByVirtualSession(sessionId).subscribe({
            next: (videoSession) => {
                this.videoService.joinVideoSession(videoSession.roomId, currentUser).subscribe({
                    next: () => {
                        this.joiningSessionId = null;
                        this.router.navigate(['/alzheimer_meeting/meeting', sessionId], {
                            queryParams: { roomId: videoSession.roomId }
                        });
                    },
                    error: (joinErr) => {
                        this.joiningSessionId = null;
                        if (joinErr.status === 403) {
                            this.joinErrors[sessionId] = "Vous n'êtes pas autorisé à rejoindre cette session.";
                        } else if (joinErr.status === 409) {
                            this.joinErrors[sessionId] = "La session est pleine.";
                        } else {
                            this.joinErrors[sessionId] = joinErr.error?.message ?? 'Impossible de rejoindre la room.';
                        }
                    }
                });
            },
            error: (err) => {
                if (err.status === 404) {
                    this.videoService.startVideoSession(sessionId, currentUser).subscribe({
                        next: (newVideoSession) => {
                            this.videoService.joinVideoSession(newVideoSession.roomId, currentUser).subscribe({
                                next: () => {
                                    this.joiningSessionId = null;
                                    this.router.navigate(['/alzheimer_meeting/meeting', sessionId], {
                                        queryParams: { roomId: newVideoSession.roomId }
                                    });
                                },
                                error: (joinErr) => {
                                    this.joiningSessionId = null;
                                    this.joinErrors[sessionId] = joinErr.error?.message ?? 'Room créée mais join impossible.';
                                }
                            });
                        },
                        error: (startErr) => {
                            this.joiningSessionId = null;
                            if (startErr.status === 403) {
                                this.joinErrors[sessionId] = "Seul l'hôte peut démarrer la session.";
                            } else if (startErr.status === 400) {
                                this.joinErrors[sessionId] = startErr.error?.message ?? "Session non planifiée ou non en ligne.";
                            } else {
                                this.joinErrors[sessionId] = startErr.error?.message ?? 'Impossible de démarrer la session.';
                            }
                        }
                    });
                } else {
                    this.joiningSessionId = null;
                    this.joinErrors[sessionId] = 'Erreur réseau.';
                }
            }
        });
    }

    private resolveCurrentUserId(session: Session): string {
        if (typeof window === 'undefined') return session.createdBy ?? 'patient';
        const storage = window.localStorage;
        return storage.getItem('userId')
            || storage.getItem('user_id')
            || storage.getItem('uid')
            || storage.getItem('username')
            || session.createdBy
            || 'patient';
    }

    private isOnlineSession(session: Session): boolean {
        const mode = (session.meetingMode ?? '').toUpperCase();
        if (mode === 'ONLINE') return true;
        if (mode === 'IN_PERSON') return false;
        return !!session.meetingUrl;
    }

    getTypeClass(type: string): string {
        switch (type?.toLowerCase()) {
            case 'therapy': return 'badge-therapy';
            case 'cognitive': return 'badge-cognitive';
            case 'physical': return 'badge-physical';
            case 'creative': return 'badge-creative';
            default: return 'badge-general';
        }
    }
}
