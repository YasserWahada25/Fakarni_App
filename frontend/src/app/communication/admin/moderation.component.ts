import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-moderation',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './moderation.component.html',
    styleUrl: './moderation.component.css'
})
export class ModerationComponent {
    reportedItems = [
        { user: 'User123', reason: 'Inappropriate language', date: '2026-03-09', status: 'Pending' },
        { user: 'SpamBot', reason: 'Spam links', date: '2026-03-08', status: 'Resolved' }
    ];

    stats = {
        totalMessages: 1540,
        activeGroups: 12,
        reportedContent: 5
    };
}
