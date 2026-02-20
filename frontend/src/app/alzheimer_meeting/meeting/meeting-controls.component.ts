import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-meeting-controls',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="controls-bar">
      <div class="left-controls">
        <span class="time">10:45 AM | Session #123</span>
      </div>

      <div class="center-controls">
        <button class="control-btn" [class.active]="!isMuted" [class.danger]="isMuted" (click)="toggleMute()">
          <i class="fa" [class.fa-microphone]="!isMuted" [class.fa-microphone-slash]="isMuted"></i>
        </button>
        <button class="control-btn" [class.active]="!isVideoOff" [class.danger]="isVideoOff" (click)="toggleVideo()">
          <i class="fa" [class.fa-video]="!isVideoOff" [class.fa-video-slash]="isVideoOff"></i>
        </button>
        <button class="control-btn" (click)="shareScreen()">
          <i class="fa fa-desktop"></i>
        </button>
        <button class="control-btn danger leave-btn" routerLink="/alzheimer_meeting/consultation">
          <i class="fa fa-phone-slash"></i>
        </button>
      </div>

      <div class="right-controls">
        <button class="control-btn text-btn" (click)="toggleTab('participants')">
          <i class="fa fa-users"></i>
          <span class="badge">4</span>
        </button>
        <button class="control-btn text-btn" (click)="toggleTab('chat')">
          <i class="fa fa-comment-alt"></i>
        </button>
        <button class="control-btn text-btn" (click)="toggleTab('agenda')">
            <i class="fa fa-list"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .controls-bar {
      height: 80px;
      background: #1a1a1a;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      border-top: 1px solid #333;
    }

    .center-controls {
      display: flex;
      gap: 16px;
    }

    .control-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: #333;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .control-btn:hover {
      background: #444;
    }
    
    .control-btn.active {
        background: #333; /* Default state for active mic/cam */
    }

    .control-btn.danger {
      background: #e74c3c;
    }
    
    .control-btn.leave-btn {
        width: 64px;
        border-radius: 30px;
    }

    .text-btn {
        background: transparent;
        width: auto;
        padding: 0 12px;
        border-radius: 8px;
        gap: 8px;
    }
    
    .text-btn:hover {
        background: rgba(255,255,255,0.1);
    }
    
    .badge {
        background: #333;
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 10px;
    }

    .time {
        font-size: 0.9rem;
        color: #ccc;
    }

    @media (max-width: 600px) {
        .time { display: none; }
        .controls-bar { padding: 0 12px; }
        .control-btn { width: 40px; height: 40px; font-size: 1rem; }
    }
  `]
})
export class MeetingControlsComponent {
  @Output() toggleSidebar = new EventEmitter<string>();
  @Output() leave = new EventEmitter<void>();

  isMuted = false;
  isVideoOff = false;

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
  }

  shareScreen() {
    alert('Screen sharing started...');
  }

  toggleTab(tab: string) {
    this.toggleSidebar.emit(tab);
  }
}
