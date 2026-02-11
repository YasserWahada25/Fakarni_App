import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VideoGridComponent } from './video-grid.component';
import { MeetingControlsComponent } from './meeting-controls.component';
import { MeetingSidebarComponent } from './meeting-sidebar.component';
import { AlzheimerService } from '../shared/alzheimer.service';

@Component({
    selector: 'app-virtual-meeting',
    standalone: true,
    imports: [CommonModule, RouterModule, VideoGridComponent, MeetingControlsComponent, MeetingSidebarComponent],
    templateUrl: './virtual-meeting.component.html',
    styleUrl: './virtual-meeting.component.css'
})
export class VirtualMeetingComponent implements OnInit, OnDestroy {
    sessionId: number = 0;
    sessionTitle: string = 'Virtual Meeting';
    isSidebarOpen: boolean = true;
    activeSidebarTab: string = 'chat'; // chat, participants, agenda, docs

    constructor(
        private route: ActivatedRoute,
        private alzheimerService: AlzheimerService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.sessionId = +params['id'];
            this.loadSessionDetails();
        });
    }

    loadSessionDetails(): void {
        // In a real app, fetch from API. ensuring we have a title.
        this.sessionTitle = `Session #${this.sessionId}`;
        this.alzheimerService.getSessions().subscribe(sessions => {
            const session = sessions.find(s => s.id === this.sessionId);
            if (session) {
                this.sessionTitle = session.title;
            }
        });
    }

    ngOnDestroy(): void {
        // Cleanup logic
    }

    toggleSidebar(tab?: string): void {
        if (tab) {
            if (this.activeSidebarTab === tab && this.isSidebarOpen) {
                this.isSidebarOpen = false;
            } else {
                this.activeSidebarTab = tab;
                this.isSidebarOpen = true;
            }
        } else {
            this.isSidebarOpen = !this.isSidebarOpen;
        }
    }

    onLeaveMeeting(): void {
        // Handle leave logic (navigation handled by routerLink in template usually, or here)
        console.log('Leaving meeting...');
    }
}
