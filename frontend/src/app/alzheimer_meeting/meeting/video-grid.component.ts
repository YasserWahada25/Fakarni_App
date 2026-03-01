import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MediaStreamDirective } from './media-stream.directive';
import { SignalMessageDTO, VideoSessionService } from './video-session.service';
import { WebrtcPeerService } from './webrtc-peer.service';

interface Participant {
  id: string;
  name: string;
  role: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isLocal: boolean;
  stream?: MediaStream;
}

@Component({
  selector: 'app-video-grid',
  standalone: true,
  imports: [CommonModule, MediaStreamDirective],
  template: `
    <div class="video-grid" [class.single]="participants.length === 1" [class.multi]="participants.length > 1">
      <div class="video-card" *ngFor="let p of participants">
        <div class="video-feed">
          <div class="avatar-placeholder" *ngIf="p.isVideoOff || !p.stream">
            <span>{{ p.name.charAt(0) }}</span>
          </div>

          <div class="live-feed" *ngIf="!p.isVideoOff && p.stream">
            <video
              [appMediaStream]="p.stream ?? null"
              autoplay
              playsinline
              [muted]="p.isLocal">
            </video>
          </div>
        </div>

        <div class="participant-label">
          <span>{{ p.name }} {{ p.isLocal ? '(You)' : '' }}</span>
          <i class="fa fa-microphone-slash" *ngIf="p.isMuted"></i>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-grid {
      flex: 1;
      min-height: 0;
      display: grid;
      padding: 14px;
      gap: 14px;
      overflow-y: auto;
      align-content: center;
      justify-content: center;
    }

    .video-grid.single {
      grid-template-columns: minmax(260px, 1fr);
    }

    .video-grid.multi {
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .video-card {
      background: #303134;
      border-radius: 14px;
      overflow: hidden;
      position: relative;
      aspect-ratio: 16 / 9;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      min-height: 180px;
    }

    .video-feed {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #111111;
    }

    .participant-label {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.62);
      color: #ffffff;
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      z-index: 2;
      max-width: calc(100% - 20px);
    }

    .avatar-placeholder {
      width: 100px;
      height: 100px;
      background: #5c6bc0;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 2.4rem;
      color: #ffffff;
      font-weight: 700;
      user-select: none;
    }

    .live-feed {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #111111;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      background: #000000;
    }

    @media (max-width: 768px) {
      .video-grid {
        padding: 10px;
        gap: 10px;
      }

      .video-grid.multi {
        grid-template-columns: 1fr;
      }

      .video-card {
        min-height: 150px;
      }

      .avatar-placeholder {
        width: 74px;
        height: 74px;
        font-size: 1.8rem;
      }

      .participant-label {
        font-size: 0.78rem;
      }
    }
  `]
})
export class VideoGridComponent implements OnInit, OnDestroy {
  @Input() roomId!: string;
  @Input() currentUserId!: string;

  participants: Participant[] = [];
  private signalSub?: Subscription;
  private localMediaAttempted = false;

  constructor(
    private readonly videoSessionService: VideoSessionService,
    private readonly webrtcService: WebrtcPeerService
  ) { }

  async ngOnInit(): Promise<void> {
    this.addParticipant({
      id: this.currentUserId,
      name: this.currentUserId,
      role: 'User',
      isMuted: false,
      isVideoOff: true,
      isLocal: true
    });

    this.signalSub = this.videoSessionService.signal$.subscribe(signal => {
      void this.handleSignal(signal);
    });

    await this.initializeLocalMedia();
  }

  ngOnDestroy(): void {
    if (this.signalSub) {
      this.signalSub.unsubscribe();
    }
    this.webrtcService.closeConnection();
  }

  private async initializeLocalMedia(): Promise<void> {
    if (this.localMediaAttempted) return;
    this.localMediaAttempted = true;

    try {
      const stream = await this.webrtcService.getLocalStream(true, true);
      const localParticipant = this.getParticipant(this.currentUserId);
      if (localParticipant) {
        localParticipant.stream = stream;
        localParticipant.isVideoOff = !stream.getVideoTracks().some(track => track.enabled);
        localParticipant.isMuted = !stream.getAudioTracks().some(track => track.enabled);
        this.refreshParticipants();
      }
    } catch (err) {
      console.error('Erreur acces media local', err);
      const localParticipant = this.getParticipant(this.currentUserId);
      if (localParticipant) {
        localParticipant.isVideoOff = true;
        this.refreshParticipants();
      }
    }
  }

  private async handleSignal(signal: SignalMessageDTO): Promise<void> {
    if (signal.toUserId && signal.toUserId !== this.currentUserId) return;

    if (signal.type === 'join') {
      this.addParticipant({
        id: signal.fromUserId,
        name: signal.fromUserId,
        role: 'Participant',
        isMuted: false,
        isVideoOff: true,
        isLocal: false
      });

      this.ensurePeerConnection(signal.fromUserId);
      const offer = await this.webrtcService.createOffer(signal.fromUserId);
      this.videoSessionService.sendSignal({
        type: 'offer',
        fromUserId: this.currentUserId,
        toUserId: signal.fromUserId,
        roomId: this.roomId,
        payload: JSON.stringify(offer)
      });
      return;
    }

    if (signal.type === 'offer') {
      const offer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
      this.ensurePeerConnection(signal.fromUserId);
      const answer = await this.webrtcService.createAnswer(signal.fromUserId, offer);
      this.addParticipantIfNotExists(signal.fromUserId);
      this.videoSessionService.sendSignal({
        type: 'answer',
        fromUserId: this.currentUserId,
        toUserId: signal.fromUserId,
        roomId: this.roomId,
        payload: JSON.stringify(answer)
      });
      return;
    }

    if (signal.type === 'answer') {
      const answer = JSON.parse(signal.payload) as RTCSessionDescriptionInit;
      await this.webrtcService.setRemoteDescription(signal.fromUserId, answer);
      return;
    }

    if (signal.type === 'ice-candidate') {
      const candidate = JSON.parse(signal.payload) as RTCIceCandidateInit;
      await this.webrtcService.addIceCandidate(signal.fromUserId, candidate);
      return;
    }

    if (signal.type === 'leave') {
      this.removeParticipant(signal.fromUserId);
      this.webrtcService.closePeerConnection(signal.fromUserId);
    }
  }

  private onIceCandidate(remoteUserId: string, event: RTCPeerConnectionIceEvent): void {
    if (!event.candidate) return;
    this.videoSessionService.sendSignal({
      type: 'ice-candidate',
      fromUserId: this.currentUserId,
      toUserId: remoteUserId,
      roomId: this.roomId,
      payload: JSON.stringify(event.candidate)
    });
  }

  private onTrack(remoteUserId: string, event: RTCTrackEvent): void {
    const remoteParticipant = this.participants.find(p => p.id === remoteUserId);
    if (remoteParticipant && event.streams && event.streams[0]) {
      remoteParticipant.stream = event.streams[0];
      remoteParticipant.isVideoOff = false;
      this.refreshParticipants();
    }
  }

  private ensurePeerConnection(remoteUserId: string): void {
    this.webrtcService.createPeerConnection(
      remoteUserId,
      event => this.onIceCandidate(remoteUserId, event),
      event => this.onTrack(remoteUserId, event)
    );
  }

  private addParticipant(participant: Participant): void {
    if (this.getParticipant(participant.id)) return;
    this.participants.push(participant);
    this.refreshParticipants();
  }

  private addParticipantIfNotExists(id: string): void {
    if (this.getParticipant(id)) return;
    this.participants.push({
      id,
      name: id,
      role: 'Participant',
      isLocal: false,
      isMuted: false,
      isVideoOff: true
    });
    this.refreshParticipants();
  }

  private removeParticipant(id: string): void {
    this.participants = this.participants.filter(p => p.id !== id);
    this.refreshParticipants();
  }

  private getParticipant(id: string): Participant | undefined {
    return this.participants.find(participant => participant.id === id);
  }

  private refreshParticipants(): void {
    this.participants = [...this.participants];
    this.videoSessionService.setParticipants(this.participants.map(p => p.id));
  }
}
