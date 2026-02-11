import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
    sender: string;
    text: string;
    time: string;
    isSelf: boolean;
}

@Component({
    selector: 'app-meeting-sidebar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="sidebar-header">
      <h3>{{ getTitle() }}</h3>
      <button class="close-btn" (click)="close.emit()"><i class="fa fa-times"></i></button>
    </div>

    <div class="sidebar-content" [ngSwitch]="activeTab">
      
      <!-- Chat Tab -->
      <div *ngSwitchCase="'chat'" class="chat-container">
        <div class="messages-list">
          <div class="message" *ngFor="let msg of messages" [class.self]="msg.isSelf">
            <div class="msg-header">
                <span class="sender">{{ msg.sender }}</span>
                <span class="time">{{ msg.time }}</span>
            </div>
            <div class="msg-body">{{ msg.text }}</div>
          </div>
        </div>
        <div class="chat-input-area">
          <input type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Type a message...">
          <button (click)="sendMessage()"><i class="fa fa-paper-plane"></i></button>
        </div>
      </div>

      <!-- Participants Tab -->
      <div *ngSwitchCase="'participants'" class="participants-list">
        <ul>
          <li>You (Host) <span class="status online">Online</span></li>
          <li>Dr. Sarah Smith <span class="status online">Online</span></li>
          <li>John Doe <span class="status online">Online</span></li>
          <li>Jane Doe <span class="status online">Online</span></li>
        </ul>
        <button class="invite-btn"><i class="fa fa-plus"></i> Invite Participant</button>
      </div>

      <!-- Agenda Tab -->
      <div *ngSwitchCase="'agenda'" class="agenda-container">
        <ul class="agenda-list">
            <li class="completed"><i class="fa fa-check-circle"></i> Introduction (5m)</li>
            <li class="active"><i class="fa fa-circle"></i> Cognitive Exercises (15m)</li>
            <li><i class="fa fa-circle-o"></i> Music Therapy (20m)</li>
            <li><i class="fa fa-circle-o"></i> Q&A (10m)</li>
        </ul>
      </div>

      <!-- Docs (Files) Tab -->
      <div *ngSwitchCase="'docs'" class="docs-container">
          <p>Shared Documents</p>
          <!-- ... list of files ... -->
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
      padding: 16px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sidebar-header h3 { margin: 0; font-size: 1.1rem; text-transform: capitalize; }
    .close-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
    
    .sidebar-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
    
    /* Chat Styles */
    .chat-container { flex: 1; display: flex; flex-direction: column; height: 100%; }
    .messages-list { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
    
    .message {
        background: #f1f2f6;
        padding: 8px 12px;
        border-radius: 8px;
        max-width: 85%;
        align-self: flex-start;
    }
    .message.self {
        background: #e3f2fd;
        align-self: flex-end;
    }
    
    .msg-header { display: flex; justify-content: space-between; font-size: 0.75rem; color: #7f8c8d; margin-bottom: 4px; gap: 8px; }
    
    .chat-input-area {
        padding: 16px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 8px;
    }
    .chat-input-area input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 20px;
    }
    .chat-input-area button {
        background: none;
        border: none;
        color: #3498db;
        cursor: pointer;
        font-size: 1.2rem;
    }

    /* Agenda Styles */
    .agenda-list { list-style: none; padding: 16px; margin: 0; }
    .agenda-list li { padding: 12px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; color: #555; }
    .agenda-list li.completed { color: #27ae60; text-decoration: line-through; }
    .agenda-list li.active { color: #2980b9; font-weight: bold; }
    
    /* Participants Styles */
    .participants-list { padding: 16px; }
    .participants-list ul { list-style: none; padding: 0; }
    .participants-list li { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
    .status.online { color: #27ae60; font-size: 0.8rem; }
    .invite-btn { width: 100%; margin-top: 20px; padding: 10px; background: #5c6bc0; color: white; border: none; border-radius: 6px; cursor: pointer; }
  `]
})
export class MeetingSidebarComponent {
    @Input() activeTab: string = 'chat';
    @Output() close = new EventEmitter<void>();

    messages: ChatMessage[] = [
        { sender: 'Dr. Sarah', text: 'Hello everyone!', time: '10:00', isSelf: false },
        { sender: 'You', text: 'Hi Doctor, we are ready.', time: '10:01', isSelf: true }
    ];

    newMessage: string = '';

    getTitle(): string {
        return this.activeTab;
    }

    sendMessage() {
        if (this.newMessage.trim()) {
            this.messages.push({
                sender: 'You',
                text: this.newMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSelf: true
            });
            this.newMessage = '';
        }
    }
}
