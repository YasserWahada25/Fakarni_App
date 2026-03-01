import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WebrtcPeerService {
    private peerConnections = new Map<string, RTCPeerConnection>();
    private localStream: MediaStream | null = null;
    private cameraTrack: MediaStreamTrack | null = null;
    private screenTrack: MediaStreamTrack | null = null;

    // Configuration STUN/TURN servers publique (Google par défaut)
    private config: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    /**
     * Créer la MediaStream (cam et micro)
     */
    async getLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
        if (this.localStream) {
            return this.localStream;
        }
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
            this.cameraTrack = this.localStream.getVideoTracks()[0] ?? null;
            for (const peerConnection of this.peerConnections.values()) {
                this.localStream.getTracks().forEach(track => {
                    const senderExists = peerConnection.getSenders().some(sender => sender.track?.kind === track.kind);
                    if (!senderExists) {
                        peerConnection.addTrack(track, this.localStream!);
                    }
                });
            }
            return this.localStream;
        } catch (err) {
            console.error('Failed to get local stream', err);
            throw err;
        }
    }

    /**
     * Initialise la PeerConnection locale
     */
    createPeerConnection(
        remoteUserId: string,
        onIceCandidate: (event: RTCPeerConnectionIceEvent) => void,
        onTrack: (event: RTCTrackEvent) => void
    ): RTCPeerConnection {
        const existing = this.peerConnections.get(remoteUserId);
        if (existing) return existing;

        const peerConnection = new RTCPeerConnection(this.config);

        // Écouter les candidats ICE et les déléguer au composant (pour les envoyer via STOMP)
        peerConnection.onicecandidate = onIceCandidate;

        // Écouter les pistes distantes (quand l'autre envoie sa cam)
        peerConnection.ontrack = onTrack;

        // Ajouter notre flux local à la connexion
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream!);
            });
        }

        this.peerConnections.set(remoteUserId, peerConnection);
        return peerConnection;
    }

    /**
     * Créer une offre (l'appelant)
     */
    async createOffer(remoteUserId: string): Promise<RTCSessionDescriptionInit> {
        const peerConnection = this.peerConnections.get(remoteUserId);
        if (!peerConnection) throw new Error("PeerConnection not initialized");
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        return offer;
    }

    /**
     * Créer une réponse (l'appelé)
     */
    async createAnswer(remoteUserId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        const peerConnection = this.peerConnections.get(remoteUserId);
        if (!peerConnection) throw new Error("PeerConnection not initialized");
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        return answer;
    }

    /**
     * Mettre en place la réponse sur l'appelant
     */
    async setRemoteDescription(remoteUserId: string, answer: RTCSessionDescriptionInit): Promise<void> {
        const peerConnection = this.peerConnections.get(remoteUserId);
        if (!peerConnection) return;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    /**
     * Ajouter un ICE Candidate distant
     */
    async addIceCandidate(remoteUserId: string, candidate: RTCIceCandidateInit): Promise<void> {
        const peerConnection = this.peerConnections.get(remoteUserId);
        if (!peerConnection || !candidate) return;
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    toggleLocalAudio(): boolean {
        if (!this.localStream) return true;
        const audioTracks = this.localStream.getAudioTracks();
        if (!audioTracks.length) return true;
        const nextEnabled = !audioTracks[0].enabled;
        audioTracks.forEach(track => track.enabled = nextEnabled);
        return !nextEnabled;
    }

    toggleLocalVideo(): boolean {
        if (!this.localStream) return true;
        const videoTracks = this.localStream.getVideoTracks();
        if (!videoTracks.length) return true;
        const nextEnabled = !videoTracks[0].enabled;
        videoTracks.forEach(track => track.enabled = nextEnabled);
        return !nextEnabled;
    }

    async startScreenShare(): Promise<void> {
        if (!this.localStream) {
            await this.getLocalStream();
        }
        if (!this.localStream || this.screenTrack) return;

        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const track = screenStream.getVideoTracks()[0];
        if (!track) return;

        this.screenTrack = track;
        this.replaceLocalVideoTrack(track);

        track.onended = () => {
            this.stopScreenShare();
        };
    }

    stopScreenShare(): void {
        if (!this.screenTrack) return;
        this.screenTrack.stop();
        this.screenTrack = null;
        if (this.cameraTrack) {
            this.replaceLocalVideoTrack(this.cameraTrack);
        }
    }

    private replaceLocalVideoTrack(newTrack: MediaStreamTrack): void {
        if (!this.localStream) return;

        const oldVideoTracks = this.localStream.getVideoTracks();
        oldVideoTracks.forEach(track => {
            this.localStream!.removeTrack(track);
        });
        this.localStream.addTrack(newTrack);

        for (const peerConnection of this.peerConnections.values()) {
            const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
                sender.replaceTrack(newTrack);
            } else {
                peerConnection.addTrack(newTrack, this.localStream);
            }
        }
    }

    closePeerConnection(remoteUserId: string): void {
        const peerConnection = this.peerConnections.get(remoteUserId);
        if (!peerConnection) return;
        peerConnection.close();
        this.peerConnections.delete(remoteUserId);
    }

    /**
     * Fermer le flux
     */
    closeConnection(): void {
        for (const [remoteUserId, peerConnection] of this.peerConnections.entries()) {
            peerConnection.close();
            this.peerConnections.delete(remoteUserId);
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
            this.cameraTrack = null;
            this.screenTrack = null;
        }
    }
}
