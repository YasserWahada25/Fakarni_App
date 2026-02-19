import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-detail-card" *ngIf="session">
      <div class="detail-header">
        <div class="detail-title-row">
          <span class="type-badge" [ngClass]="'badge-' + (session.type?.toLowerCase() || 'general')">
            {{ session.type || 'General' }}
          </span>
          <h3>{{ session.title }}</h3>
        </div>
        <button class="close-btn" (click)="close.emit()" title="Close">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="detail-meta">
        <span class="meta-item">
          <i class="fa-regular fa-calendar"></i> {{ session.date | date:'fullDate' }}
        </span>
        <span class="meta-item" *ngIf="session.time">
          <i class="fa-regular fa-clock"></i> {{ session.time }}
        </span>
        <span class="meta-item" *ngIf="session.participants">
          <i class="fa-solid fa-users"></i> {{ session.participants }} participants
        </span>
      </div>

      <p class="description">{{ session.description || 'No description available.' }}</p>

      <div class="actions">
        <button class="join-btn" (click)="joinMeeting()">
            <i class="fa-solid fa-video"></i> Join Meeting
        </button>
        <button class="fav-action-btn" (click)="onFavorite()"
            [class.is-favorite]="session.isFavorite">
            <i [class]="session.isFavorite ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
            {{ session.isFavorite ? 'Unfavorite' : 'Favorite' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .session-detail-card {
      background: white;
      border: 1px solid #e8e4f0;
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 6px 24px rgba(92, 107, 192, 0.10);
      position: relative;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .detail-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .detail-title-row h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #2c2c54;
    }

    .type-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .badge-therapy { background: #f3e5f5; color: #7b1fa2; }
    .badge-cognitive { background: #e3f2fd; color: #1565c0; }
    .badge-physical { background: #e8f5e9; color: #2e7d32; }
    .badge-creative { background: #fff3e0; color: #e65100; }
    .badge-general { background: #eceff1; color: #455a64; }

    .close-btn {
      background: #f5f3fa;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      color: #888;
      font-size: 1rem;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: #ede7f6;
      color: #5c6bc0;
      transform: scale(1.08);
    }

    .detail-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .meta-item {
      color: #666;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .meta-item i {
      color: #5c6bc0;
      width: 16px;
      text-align: center;
    }

    .description {
      color: #555;
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .join-btn {
      background: linear-gradient(135deg, #5c6bc0, #7c4dff);
      color: white;
      border: none;
      padding: 10px 22px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.25s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .join-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(92, 107, 192, 0.35);
    }

    .fav-action-btn {
      background: #fafafa;
      border: 1.5px solid #e0e0e0;
      padding: 10px 22px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      color: #666;
      transition: all 0.25s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fav-action-btn:hover {
      border-color: #ffc107;
      color: #f59e0b;
      background: #fffbeb;
    }

    .fav-action-btn.is-favorite {
      background: #fffbeb;
      color: #f59e0b;
      border-color: #ffc107;
    }

    .fav-action-btn.is-favorite i {
      color: #ffc107;
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
    this.router.navigate(['/alzheimer_meeting/meeting', this.session.id]);
  }
}
