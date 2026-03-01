import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
    JoinStatus,
    ParticipantRole,
    SessionParticipantDTO,
    VideoSessionService
} from './video-session.service';

interface ChatMessage {
    senderId: string;
    senderLabel: string;
    text: string;
    time: string;
    isSelf: boolean;
}

interface MeetingMember {
    userId: string;
    role: ParticipantRole;
    joinStatus: JoinStatus;
    isOnline: boolean;
}

@Component({
    selector: 'app-meeting-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="sidebar-header">
      <h3>{{ getTitle() }}</h3>
      <button class="close-btn" (click)="close.emit()" aria-label="Fermer">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <div class="sidebar-content" [ngSwitch]="activeTab">
      <div *ngSwitchCase="'chat'" class="chat-container">
        <div class="messages-list">
          <div class="message" *ngFor="let msg of messages" [class.self]="msg.isSelf">
            <div class="msg-header">
              <span class="sender">{{ msg.senderLabel }}</span>
              <span class="time">{{ msg.time }}</span>
            </div>
            <div class="msg-body">{{ msg.text }}</div>
          </div>
        </div>

        <div class="chat-input-area">
          <input
            type="text"
            [(ngModel)]="newMessage"
            (keyup.enter)="sendMessage()"
            [disabled]="!roomId"
            placeholder="Type a message..." />
          <button (click)="sendMessage()" [disabled]="!roomId" aria-label="Envoyer">
            <i class="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>

      <div *ngSwitchCase="'participants'" class="participants-pane">
        <ul class="participants-list">
          <li *ngFor="let member of members">
            <div class="member-main">
              <span class="member-name">
                {{ member.userId }}{{ member.userId === currentUser ? ' (You)' : '' }}
              </span>
              <span class="member-role">{{ member.role }}</span>
            </div>
            <div class="member-meta">
              <span class="member-join">{{ member.joinStatus }}</span>
              <span class="status" [class.online]="member.isOnline">
                {{ member.isOnline ? 'Online' : 'Offline' }}
              </span>
            </div>
          </li>
        </ul>

        <div class="add-participant-box">
          <label for="newParticipantId">Ajouter un participant</label>
          <div class="add-row">
            <input
              id="newParticipantId"
              type="text"
              [(ngModel)]="newParticipantId"
              placeholder="userId ex: doctor-2" />
            <select [(ngModel)]="newParticipantRole">
              <option value="PARTICIPANT">Participant</option>
              <option value="ORGANIZER">Organizer</option>
            </select>
            <button
              class="add-btn"
              (click)="addParticipant()"
              [disabled]="!canAddParticipant()">
              {{ isAddingParticipant ? '...' : 'Ajouter' }}
            </button>
          </div>
          <p class="participant-feedback" *ngIf="participantActionMessage">
            {{ participantActionMessage }}
          </p>
        </div>
      </div>

      <div *ngSwitchCase="'agenda'" class="agenda-container">
        <ul class="agenda-list">
          <li class="completed"><i class="fa fa-check-circle"></i> Introduction (5m)</li>
          <li class="active"><i class="fa fa-circle"></i> Cognitive Exercises (15m)</li>
          <li><i class="fa fa-circle-o"></i> Music Therapy (20m)</li>
          <li><i class="fa fa-circle-o"></i> Q&A (10m)</li>
        </ul>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sidebar-header {
      padding: 14px 16px;
      border-bottom: 1px solid #eceff8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
    }

    .sidebar-header h3 {
      margin: 0;
      font-size: 1.05rem;
      text-transform: capitalize;
      color: #2f3450;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      color: #444d6f;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .messages-list {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .message {
      background: #f1f3fa;
      padding: 8px 12px;
      border-radius: 10px;
      max-width: 88%;
      align-self: flex-start;
    }

    .message.self {
      background: #e3f2fd;
      align-self: flex-end;
    }

    .msg-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 4px;
      gap: 10px;
    }

    .msg-body {
      color: #1f2937;
      word-break: break-word;
    }

    .chat-input-area {
      padding: 12px;
      border-top: 1px solid #eceff8;
      display: flex;
      gap: 8px;
      background: #ffffff;
    }

    .chat-input-area input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #d8deea;
      border-radius: 20px;
      outline: none;
    }

    .chat-input-area button {
      background: none;
      border: none;
      color: #2563eb;
      cursor: pointer;
      font-size: 1.15rem;
    }

    .participants-pane {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .participants-list {
      list-style: none;
      padding: 0;
      margin: 0;
      border: 1px solid #e8ecf6;
      border-radius: 10px;
      overflow: hidden;
    }

    .participants-list li {
      padding: 10px 12px;
      border-bottom: 1px solid #edf0f8;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #ffffff;
    }

    .participants-list li:last-child {
      border-bottom: none;
    }

    .member-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .member-name {
      font-weight: 600;
      color: #273049;
      word-break: break-word;
    }

    .member-role {
      font-size: 0.72rem;
      color: #475569;
      padding: 2px 8px;
      border-radius: 999px;
      background: #eef2ff;
    }

    .member-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
      color: #64748b;
    }

    .status {
      padding: 2px 8px;
      border-radius: 999px;
      background: #f1f5f9;
      color: #64748b;
    }

    .status.online {
      background: #dcfce7;
      color: #166534;
    }

    .add-participant-box {
      border: 1px solid #e8ecf6;
      border-radius: 10px;
      padding: 10px;
      background: #fbfcff;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .add-participant-box label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }

    .add-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      align-items: center;
    }

    .add-row input,
    .add-row select {
      border: 1px solid #d8deea;
      border-radius: 8px;
      padding: 7px 10px;
      background: #ffffff;
    }

    .add-btn {
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      background: #4f46e5;
      color: #ffffff;
      cursor: pointer;
      font-weight: 600;
    }

    .add-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .participant-feedback {
      margin: 0;
      font-size: 0.78rem;
      color: #475569;
    }

    .agenda-list {
      list-style: none;
      padding: 14px;
      margin: 0;
    }

    .agenda-list li {
      padding: 10px 0;
      border-bottom: 1px solid #edf0f8;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #475569;
    }

    .agenda-list li.completed {
      color: #15803d;
      text-decoration: line-through;
    }

    .agenda-list li.active {
      color: #1d4ed8;
      font-weight: 700;
    }

    @media (max-width: 640px) {
      .participants-pane {
        padding: 10px;
      }

      .add-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MeetingSidebarComponent implements OnInit, OnChanges, OnDestroy {
    @Input() activeTab: string = 'chat';
    @Input() roomId: string = '';
    @Input() currentUser: string = 'patient';
    @Input() sessionId: number = 0;
    @Output() close = new EventEmitter<void>();

    messages: ChatMessage[] = [];
    members: MeetingMember[] = [];

    newMessage = '';
    newParticipantId = '';
    newParticipantRole: ParticipantRole = 'PARTICIPANT';
    isAddingParticipant = false;
    participantActionMessage = '';

    private onlineUsers = new Set<string>();
    private subscriptions: Subscription[] = [];
    private loadedRoomId = '';
    private loadedSessionId = 0;

    constructor(private readonly videoSessionService: VideoSessionService) { }

    ngOnInit(): void {
        this.subscriptions.push(
            this.videoSessionService.signal$.subscribe(signal => {
                if (signal.type === 'chat') {
                    this.consumeRealtimeChat(signal.payload, signal.fromUserId);
                } else if (signal.type === 'participant-added') {
                    this.consumeParticipantAdded(signal.payload);
                }
            })
        );

        this.subscriptions.push(
            this.videoSessionService.participants$.subscribe(ids => {
                this.onlineUsers = new Set(ids);
                this.syncOnlineFlags();
            })
        );

        this.loadChatHistory();
        this.loadSessionMembers();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['roomId'] && this.roomId) {
            this.loadChatHistory();
        }
        if (changes['sessionId'] && this.sessionId) {
            this.loadSessionMembers();
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
    }

    getTitle(): string {
        return this.activeTab.charAt(0).toUpperCase() + this.activeTab.slice(1);
    }

    sendMessage(): void {
        const text = this.newMessage.trim();
        if (!text || !this.roomId) return;

        this.messages.push({
            senderId: this.currentUser,
            senderLabel: 'You',
            text,
            time: this.formatTime(new Date().toISOString()),
            isSelf: true
        });
        this.videoSessionService.sendChat(this.roomId, this.currentUser, text);
        this.newMessage = '';
    }

    canAddParticipant(): boolean {
        return !!this.roomId
            && !!this.newParticipantId.trim()
            && !this.isAddingParticipant;
    }

    addParticipant(): void {
        const userId = this.newParticipantId.trim();
        if (!userId || !this.roomId) return;

        this.isAddingParticipant = true;
        this.participantActionMessage = '';

        this.videoSessionService.addParticipantToRoom(
            this.roomId,
            this.currentUser,
            userId,
            this.newParticipantRole,
            'CONFIRMED'
        ).subscribe({
            next: participants => {
                this.hydrateMembers(participants);
                this.newParticipantId = '';
                this.newParticipantRole = 'PARTICIPANT';
                this.participantActionMessage = 'Participant ajoute avec succes.';
                this.isAddingParticipant = false;
            },
            error: err => {
                this.participantActionMessage = err?.error?.message ?? 'Ajout impossible.';
                this.isAddingParticipant = false;
            }
        });
    }

    private loadChatHistory(): void {
        if (!this.roomId || !this.currentUser) return;
        if (this.loadedRoomId === this.roomId) return;
        this.loadedRoomId = this.roomId;
        this.videoSessionService.getRoomMessages(this.roomId, this.currentUser).subscribe({
            next: history => {
                this.messages = history.map(msg => ({
                    senderId: msg.fromUserId,
                    senderLabel: msg.fromUserId === this.currentUser ? 'You' : msg.fromUserId,
                    text: msg.text,
                    time: this.formatTime(msg.sentAt),
                    isSelf: msg.fromUserId === this.currentUser
                }));
            },
            error: err => {
                console.warn('Chat history not loaded', err);
            }
        });
    }

    private loadSessionMembers(): void {
        if (!this.sessionId) return;
        if (this.loadedSessionId === this.sessionId) return;
        this.loadedSessionId = this.sessionId;
        this.videoSessionService.getSessionParticipants(this.sessionId).subscribe({
            next: participants => this.hydrateMembers(participants),
            error: err => console.warn('Participants not loaded', err)
        });
    }

    private hydrateMembers(participants: SessionParticipantDTO[]): void {
        this.members = participants.map(p => ({
            userId: p.userId,
            role: p.role,
            joinStatus: p.joinStatus,
            isOnline: this.onlineUsers.has(p.userId)
        }));
    }

    private consumeRealtimeChat(payload: string, senderUserId: string): void {
        let parsed: { text?: string; time?: string; sentAt?: string } = {};
        try {
            parsed = JSON.parse(payload || '{}');
        } catch {
            parsed = {};
        }
        const text = (parsed.text ?? '').trim();
        if (!text) return;

        this.messages.push({
            senderId: senderUserId,
            senderLabel: senderUserId,
            text,
            time: this.formatTime(parsed.sentAt ?? parsed.time ?? new Date().toISOString()),
            isSelf: senderUserId === this.currentUser
        });
    }

    private consumeParticipantAdded(payload: string): void {
        let parsed: { userId?: string; role?: string; joinStatus?: string } = {};
        try {
            parsed = JSON.parse(payload || '{}');
        } catch {
            parsed = {};
        }
        const userId = (parsed.userId ?? '').trim();
        if (!userId) return;

        const existing = this.members.find(m => m.userId === userId);
        const role = (parsed.role as ParticipantRole) || 'PARTICIPANT';
        const joinStatus = (parsed.joinStatus as JoinStatus) || 'CONFIRMED';

        if (existing) {
            existing.role = role;
            existing.joinStatus = joinStatus;
            existing.isOnline = this.onlineUsers.has(existing.userId);
        } else {
            this.members.push({
                userId,
                role,
                joinStatus,
                isOnline: this.onlineUsers.has(userId)
            });
        }
    }

    private syncOnlineFlags(): void {
        this.members = this.members.map(member => ({
            ...member,
            isOnline: this.onlineUsers.has(member.userId)
        }));
    }

    private formatTime(isoOrTime: string): string {
        const asDate = new Date(isoOrTime);
        if (!Number.isNaN(asDate.getTime())) {
            return asDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return isoOrTime;
    }
}
