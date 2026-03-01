import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface ReservationRequest {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    meetingUrl?: string;
    createdBy: string;
    status: 'DRAFT' | 'SCHEDULED' | 'CANCELLED' | 'DONE';
    visibility: string;
    meetingMode: 'ONLINE' | 'IN_PERSON';
    sessionType: string;
    createdAt: string;
    updatedAt: string;
    participants: unknown[];
}

@Injectable({ providedIn: 'root' })
export class ReservationRequestsService {
    private apiUrl = `${environment.apiUrl}/session`;

    constructor(private http: HttpClient) { }

    getAllReservations(): Observable<ReservationRequest[]> {
        return this.http.get<ReservationRequest[]>(`${this.apiUrl}/sessions`);
    }

    getPendingReservations(): Observable<ReservationRequest[]> {
        const params = new HttpParams().set('status', 'DRAFT');
        return this.http.get<ReservationRequest[]>(`${this.apiUrl}/sessions`, { params });
    }

    acceptReservation(id: number): Observable<ReservationRequest> {
        const params = new HttpParams().set('accept', 'true');
        return this.http.patch<ReservationRequest>(`${this.apiUrl}/sessions/${id}/response`, null, { params });
    }

    rejectReservation(id: number): Observable<ReservationRequest> {
        const params = new HttpParams().set('accept', 'false');
        return this.http.patch<ReservationRequest>(`${this.apiUrl}/sessions/${id}/response`, null, { params });
    }
}
