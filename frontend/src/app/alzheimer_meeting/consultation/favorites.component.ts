import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AlzheimerService, Session } from '../shared/alzheimer.service';

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

    constructor(
        private alzheimerService: AlzheimerService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.alzheimerService.getFavorites().subscribe(sessions => {
            this.favoriteSessions = sessions;
            this.isLoading = false;
        });
    }

    removeFavorite(session: Session): void {
        this.alzheimerService.toggleFavorite(session.id);
        this.favoriteSessions = this.favoriteSessions.filter(s => s.id !== session.id);
    }

    joinMeeting(session: Session): void {
        this.router.navigate(['/alzheimer_meeting/meeting', session.id]);
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
