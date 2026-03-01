import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-meeting-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="controls-bar" role="toolbar" aria-label="Meeting controls">
      <div class="left-controls">
        <span class="time">{{ meetingLabel }}</span>
      </div>

      <div class="center-controls">
        <button
          class="control-btn"
          [class.active]="!isMuted"
          [class.danger]="isMuted"
          (click)="toggleMute.emit()"
          title="Mute / Unmute">
          <i class="fa" [class.fa-microphone]="!isMuted" [class.fa-microphone-slash]="isMuted"></i>
        </button>

        <button
          class="control-btn"
          [class.active]="!isVideoOff"
          [class.danger]="isVideoOff"
          (click)="toggleVideo.emit()"
          title="Camera On / Off">
          <i class="fa" [class.fa-video]="!isVideoOff" [class.fa-video-slash]="isVideoOff"></i>
        </button>

        <button class="control-btn" (click)="shareScreen.emit()" title="Share Screen">
          <i class="fa fa-desktop"></i>
        </button>

        <button class="control-btn danger leave-btn" (click)="leave.emit()" title="Leave Meeting">
          <i class="fa fa-phone-slash"></i>
        </button>
      </div>

      <div class="right-controls">
        <button class="control-btn text-btn" (click)="toggleTab('participants')" title="Participants">
          <i class="fa fa-users"></i>
          <span class="badge">{{ participantsCount }}</span>
        </button>

        <button class="control-btn text-btn" (click)="toggleTab('chat')" title="Chat">
          <i class="fa fa-comment-alt"></i>
        </button>

        <button class="control-btn text-btn agenda-btn" (click)="toggleTab('agenda')" title="Agenda">
          <i class="fa fa-list"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .controls-bar {
      min-height: var(--controls-height, 84px);
      background: rgba(24, 24, 24, 0.96);
      border-top: 1px solid #2f3136;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px));
      backdrop-filter: blur(4px);
    }

    .left-controls {
      flex: 1;
      min-width: 0;
    }

    .time {
      display: block;
      font-size: 0.9rem;
      color: #c7c9d1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .center-controls {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex: 0 0 auto;
    }

    .right-controls {
      flex: 1;
      min-width: 0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .control-btn {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: none;
      background: #33363f;
      color: #ffffff;
      font-size: 1.08rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      position: relative;
      flex-shrink: 0;
    }

    .control-btn:hover {
      background: #424656;
    }

    .control-btn.active {
      background: #33363f;
    }

    .control-btn.danger {
      background: #e74c3c;
    }

    .control-btn.danger:hover {
      background: #d94233;
    }

    .control-btn.leave-btn {
      width: 62px;
      border-radius: 999px;
    }

    .text-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #2f3138;
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #5c6bc0;
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      line-height: 1;
      border: 1px solid #1b1c20;
    }

    @media (max-width: 920px) {
      .left-controls {
        display: none;
      }

      .controls-bar {
        justify-content: space-between;
      }

      .agenda-btn {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .controls-bar {
        gap: 6px;
        padding: 6px 10px calc(8px + env(safe-area-inset-bottom, 0px));
      }

      .center-controls {
        gap: 8px;
      }

      .right-controls {
        gap: 6px;
      }

      .control-btn {
        width: 40px;
        height: 40px;
        font-size: 0.95rem;
      }

      .control-btn.leave-btn {
        width: 56px;
      }

      .text-btn {
        width: 38px;
        height: 38px;
      }

      .badge {
        min-width: 16px;
        height: 16px;
        font-size: 0.62rem;
      }
    }
  `]
})
export class MeetingControlsComponent {
  @Input() isMuted = false;
  @Input() isVideoOff = false;
  @Input() participantsCount = 0;
  @Input() meetingLabel = 'Session en direct';

  @Output() toggleSidebar = new EventEmitter<string>();
  @Output() toggleMute = new EventEmitter<void>();
  @Output() toggleVideo = new EventEmitter<void>();
  @Output() shareScreen = new EventEmitter<void>();
  @Output() leave = new EventEmitter<void>();

  toggleTab(tab: string): void {
    this.toggleSidebar.emit(tab);
  }
}
