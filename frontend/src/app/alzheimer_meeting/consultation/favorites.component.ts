import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlzheimerService, Session } from '../shared/alzheimer.service';

@Component({
    selector: 'app-favorites',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './favorites.component.html',
    styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
    favoriteSessions: Session[] = [];

    constructor(private alzheimerService: AlzheimerService) { }

    ngOnInit(): void {
        this.alzheimerService.getSessions().subscribe(sessions => {
            this.favoriteSessions = sessions.filter(s => s.isFavorite);
        });
    }

    removeFavorite(id: number): void {
        this.alzheimerService.toggleFavorite(id);
    }
}
