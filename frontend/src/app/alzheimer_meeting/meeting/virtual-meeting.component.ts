import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VideoGridComponent } from './video-grid.component';
import { MeetingControlsComponent } from './meeting-controls.component';
import { MeetingSidebarComponent } from './meeting-sidebar.component';
import { AlzheimerService } from '../shared/alzheimer.service';
import { VideoSessionService } from './video-session.service';
import { WebrtcPeerService } from './webrtc-peer.service';
import { Subscription } from 'rxjs';

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

    // Variables WebRTC
    roomId: string = '';
    currentUser: string = this.resolveCurrentUserId();
    isMuted = false;
    isVideoOff = false;
    participantCount = 0;

    private subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private alzheimerService: AlzheimerService,
        private videoSessionService: VideoSessionService,
        private webrtcService: WebrtcPeerService
    ) { }

    ngOnInit(): void {
        this.subscriptions.push(this.route.params.subscribe(params => {
            this.sessionId = +params['id'];
            this.loadSessionDetails();
        }));

        this.subscriptions.push(this.route.queryParams.subscribe(params => {
            this.roomId = params['roomId'];
            if (this.roomId) {
                // Se connecter au broker STOMP pour la signalisation
                this.videoSessionService.connectAndSubscribe(this.roomId, this.currentUser);
            } else {
                console.error('Aucun roomId fourni ! URL doit contenir ?roomId=UUID');
                this.router.navigate(['/alzheimer_meeting/consultation']);
            }
        }));

        this.subscriptions.push(this.videoSessionService.participants$.subscribe(ids => {
            this.participantCount = ids.length;
        }));
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
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
        if (this.roomId) {
            this.videoSessionService.disconnect(this.roomId, this.currentUser);
        }
    }

    private resolveCurrentUserId(): string {
        if (typeof window === 'undefined') return 'patient';
        const storage = window.localStorage;
        return storage.getItem('userId')
            || storage.getItem('user_id')
            || storage.getItem('uid')
            || storage.getItem('username')
            || 'patient';
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
        if (this.roomId) {
            this.videoSessionService.disconnect(this.roomId, this.currentUser);
        }
        console.log('Leaving meeting...');
        this.router.navigate(['/alzheimer_meeting/consultation']);
    }

    onToggleMute(): void {
        this.isMuted = this.webrtcService.toggleLocalAudio();
    }

    onToggleVideo(): void {
        this.isVideoOff = this.webrtcService.toggleLocalVideo();
    }

    async onShareScreen(): Promise<void> {
        try {
            await this.webrtcService.startScreenShare();
        } catch (err) {
            console.error('Partage d\'écran impossible', err);
        }
    }
}
