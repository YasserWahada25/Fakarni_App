import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ParticipantRole = 'HOST' | 'ORGANIZER' | 'PARTICIPANT';
export type JoinStatus = 'INVITED' | 'CONFIRMED' | 'ATTENDED';

export interface VideoSessionDTO {
    id: number;
    roomId: string;
    virtualSessionId: number;
    hostUserId: string;
    sessionType: 'PRIVATE' | 'GROUP';
    sessionVisibility: 'PRIVATE' | 'PUBLIC';
    status: 'WAITING' | 'ACTIVE' | 'ENDED';
    maxParticipants: number;
    currentParticipants: number;
    startedAt: string;
    endedAt?: string;
}

export interface SessionParticipantDTO {
    id?: number;
    userId: string;
    role: ParticipantRole;
    joinStatus: JoinStatus;
    joinedAt?: string | null;
    isFavorite?: boolean;
    favorite?: boolean;
    reminderMinutesBefore?: number | null;
}

export interface VideoChatMessageDTO {
    id: number;
    roomId: string;
    fromUserId: string;
    text: string;
    sentAt: string;
}

export interface SignalMessageDTO {
    type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave' | 'chat' | 'participant-added';
    fromUserId: string;
    toUserId?: string;
    roomId: string;
    payload: string;
}

@Injectable({
    providedIn: 'root'
})
export class VideoSessionService {

    private readonly apiUrl = `${environment.apiUrl}/session/sessions/video`;

    private stompClient: Client | null = null;
    private roomSubscription: StompSubscription | null = null;

    private readonly signalSubject = new Subject<SignalMessageDTO>();
    readonly signal$ = this.signalSubject.asObservable();

    private readonly connectedSubject = new BehaviorSubject<boolean>(false);
    readonly connected$ = this.connectedSubject.asObservable();

    private readonly participantsSubject = new BehaviorSubject<string[]>([]);
    readonly participants$ = this.participantsSubject.asObservable();

    private activeRoomId: string | null = null;
    private activeUserId: string | null = null;
    private readonly isBrowser: boolean;

    constructor(
        private readonly http: HttpClient,
        @Inject(PLATFORM_ID) platformId: object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    startVideoSession(virtualSessionId: number, hostUserId: string, maxParticipants?: number): Observable<VideoSessionDTO> {
        return this.http.post<VideoSessionDTO>(`${this.apiUrl}/start`, {
            virtualSessionId,
            hostUserId,
            maxParticipants
        });
    }

    joinVideoSession(roomId: string, userId: string): Observable<VideoSessionDTO> {
        return this.http.post<VideoSessionDTO>(`${this.apiUrl}/join`, { roomId, userId });
    }

    endVideoSession(id: number, userId: string): Observable<VideoSessionDTO> {
        return this.http.post<VideoSessionDTO>(`${this.apiUrl}/${id}/end?userId=${encodeURIComponent(userId)}`, {});
    }

    getVideoSessionByVirtualSession(virtualSessionId: number): Observable<VideoSessionDTO> {
        return this.http.get<VideoSessionDTO>(`${this.apiUrl}/by-virtual-session/${virtualSessionId}`);
    }

    getRoomMessages(roomId: string, userId: string): Observable<VideoChatMessageDTO[]> {
        return this.http.get<VideoChatMessageDTO[]>(
            `${this.apiUrl}/rooms/${encodeURIComponent(roomId)}/messages?userId=${encodeURIComponent(userId)}`
        );
    }

    getSessionParticipants(sessionId: number): Observable<SessionParticipantDTO[]> {
        return this.http.get<SessionParticipantDTO[]>(
            `${environment.apiUrl}/session/sessions/${sessionId}/participants`
        );
    }

    addParticipantToRoom(
        roomId: string,
        requesterUserId: string,
        userId: string,
        role: ParticipantRole = 'PARTICIPANT',
        joinStatus: JoinStatus = 'CONFIRMED'
    ): Observable<SessionParticipantDTO[]> {
        return this.http.post<SessionParticipantDTO[]>(
            `${this.apiUrl}/rooms/${encodeURIComponent(roomId)}/participants`,
            { requesterUserId, userId, role, joinStatus }
        );
    }

    async connectAndSubscribe(roomId: string, currentUser: string): Promise<void> {
        if (!this.isBrowser) return;

        if (this.stompClient?.active || this.stompClient?.connected) {
            this.disconnect(this.activeRoomId ?? roomId, this.activeUserId ?? currentUser);
        }

        this.activeRoomId = roomId;
        this.activeUserId = currentUser;
        this.setParticipants([currentUser]);

        const SockJS = (await import('sockjs-client')).default;

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(environment.wsUrl ?? '/ws'),
            reconnectDelay: 2000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000
        });

        this.stompClient.onConnect = () => {
            this.connectedSubject.next(true);

            this.roomSubscription = this.stompClient!.subscribe(`/topic/room/${roomId}`, (message: Message) => {
                const signal: SignalMessageDTO = JSON.parse(message.body);
                if (signal.fromUserId === currentUser) return;
                if (signal.toUserId && signal.toUserId !== currentUser) return;

                if (signal.type === 'join') {
                    this.addParticipant(signal.fromUserId);
                } else if (signal.type === 'leave') {
                    this.removeParticipant(signal.fromUserId);
                }

                this.signalSubject.next(signal);
            });

            this.sendSignal({
                type: 'join',
                fromUserId: currentUser,
                roomId,
                payload: JSON.stringify({ message: 'Utilisateur rejoint' })
            });
        };

        this.stompClient.onDisconnect = () => {
            this.connectedSubject.next(false);
        };

        this.stompClient.onStompError = frame => {
            console.error('[WebRTC STOMP] Broker error:', frame.headers['message']);
        };

        this.stompClient.activate();
    }

    disconnect(roomId: string, currentUser: string): void {
        if (this.stompClient && this.stompClient.connected) {
            this.sendSignal({
                type: 'leave',
                fromUserId: currentUser,
                roomId,
                payload: JSON.stringify({ message: 'Utilisateur parti' })
            });

            if (this.roomSubscription) {
                this.roomSubscription.unsubscribe();
                this.roomSubscription = null;
            }
            this.stompClient.deactivate();
            this.connectedSubject.next(false);
        }

        this.activeRoomId = null;
        this.activeUserId = null;
        this.setParticipants([]);
    }

    sendSignal(signal: SignalMessageDTO): void {
        if (!this.stompClient || !this.stompClient.connected) {
            console.warn('[WebRTC STOMP] Client non connecte, impossible d\'envoyer le signal.');
            return;
        }

        this.stompClient.publish({
            destination: `/app/signal/${signal.type}`,
            body: JSON.stringify(signal)
        });
    }

    sendChat(roomId: string, fromUserId: string, text: string): void {
        const trimmed = text.trim();
        if (!trimmed) return;

        this.sendSignal({
            type: 'chat',
            fromUserId,
            roomId,
            payload: JSON.stringify({ text: trimmed })
        });
    }

    setParticipants(participants: string[]): void {
        this.participantsSubject.next(Array.from(new Set(participants)));
    }

    addParticipant(userId: string): void {
        const current = this.participantsSubject.value;
        if (!current.includes(userId)) {
            this.participantsSubject.next([...current, userId]);
        }
    }

    removeParticipant(userId: string): void {
        this.participantsSubject.next(this.participantsSubject.value.filter(p => p !== userId));
    }
}
