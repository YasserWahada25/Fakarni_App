import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-detail-card" *ngIf="session">
      <h3>{{ session.title }}</h3>
      <div class="meta">
        <span class="date">{{ session.date | date:'medium' }}</span>
        <span class="type">{{ session.type }}</span>
      </div>
      <p class="description">{{ session.description || 'Description of the session.' }}</p>
      
      <div class="actions">
        <button class="join-btn" (click)="joinMeeting()">
            <i class="fa fa-video"></i> Join Meeting
        </button>
        <button (click)="onFavorite()" [class.active]="session.isFavorite">
            {{ session.isFavorite ? 'Unfavorite' : 'Favorite' }}
        </button>
        <button (click)="close.emit()" class="close-btn">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .session-detail-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin-top: 20px;
    }
    .meta {
        display: flex;
        gap: 12px;
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 12px;
    }
    .actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        flex-wrap: wrap;
    }
    button {
        padding: 8px 16px;
        border-radius: 6px;
        border: 1px solid #ccc;
        background: #f9f9f9;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    button.active {
        background: #fff3e0;
        color: #ef6c00;
        border-color: #ef6c00;
    }
    .join-btn {
        background: #5c6bc0;
        color: white;
        border: none;
    }
    .join-btn:hover {
        background: #3f51b5;
    }
    .close-btn {
        margin-left: auto;
    }
  `]
})
export class SessionDetailComponent {
  @Input() session: any;
  @Output() close = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();

  constructor(private router: Router) { }

  onFavorite() {
    this.toggleFavorite.emit();
  }

  joinMeeting() {
    // Navigate to the meeting route
    this.router.navigate(['/alzheimer_meeting/meeting', this.session.id]);
  }
}
