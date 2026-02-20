import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Participant {
    id: number;
    name: string;
    role: string;
    isMuted: boolean;
    isVideoOff: boolean;
    imageUrl?: string; // Placeholder for video feed
}

@Component({
    selector: 'app-video-grid',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="video-grid" [class.single]="participants.length === 1" [class.multi]="participants.length > 1">
      <div class="video-card" *ngFor="let p of participants">
        <div class="video-feed">
             <div class="avatar-placeholder" *ngIf="p.isVideoOff">
                <span>{{ p.name.charAt(0) }}</span>
             </div>
             <!-- Mock Video Content (using a gray background or image for demo) -->
             <div class="live-feed" *ngIf="!p.isVideoOff">
                <!-- If we had real video, <video> tag here -->
                <i class="fa fa-user" style="font-size: 4rem; color: #555;"></i>
             </div>
        </div>
        
        <div class="participant-label">
          <span>{{ p.name }}</span>
          <i class="fa fa-microphone-slash" *ngIf="p.isMuted"></i>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .video-grid {
      flex: 1;
      display: grid;
      padding: 16px;
      gap: 16px;
      overflow-y: auto;
      align-content: center;
      justify-content: center;
    }
    
    .video-grid.single {
        grid-template-columns: 1fr;
    }
    
    .video-grid.multi {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .video-card {
      background: #333;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      aspect-ratio: 16/9;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-height: 100%;
    }

    .participant-label {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .avatar-placeholder {
        width: 100px;
        height: 100px;
        background: #5c6bc0;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2.5rem;
        color: white;
        font-weight: bold;
    }
    
    .live-feed {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #444;
    }
  `]
})
export class VideoGridComponent {
    participants: Participant[] = [
        { id: 1, name: 'You', role: 'Host', isMuted: false, isVideoOff: false },
        { id: 2, name: 'Dr. Sarah Smith', role: 'Doctor', isMuted: false, isVideoOff: false },
        { id: 3, name: 'John Doe', role: 'Caregiver', isMuted: true, isVideoOff: true },
        { id: 4, name: 'Jane Doe', role: 'Patient', isMuted: false, isVideoOff: false }
    ];
}
