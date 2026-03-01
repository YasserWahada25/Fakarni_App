import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AlzheimerService } from './alzheimer.service';

describe('AlzheimerService', () => {
    let service: AlzheimerService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [provideZonelessChangeDetection()]
        });

        service = TestBed.inject(AlzheimerService);
        httpMock = TestBed.inject(HttpTestingController);

        const initialLoad = httpMock.expectOne('/session/sessions');
        initialLoad.flush([
            buildSessionResponse({
                id: 1,
                title: 'Session A',
                isFavorite: false
            })
        ]);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call favorites API and map favorite sessions', async () => {
        const favoritesPromise = firstValueFrom(service.getFavorites());

        const favoritesRequest = httpMock.expectOne('/session/me/favorites');
        favoritesRequest.flush([
            buildSessionResponse({
                id: 1,
                title: 'Session A',
                isFavorite: true
            })
        ]);

        const favorites = await favoritesPromise;

        expect(favorites.length).toBe(1);
        expect(favorites[0].id).toBe(1);
        expect(favorites[0].isFavorite).toBeTrue();
    });

    it('should add favorite via PUT endpoint and update local state', async () => {
        service.toggleFavorite(1);

        const addFavoriteRequest = httpMock.expectOne('/session/sessions/1/participants/me/prefs');
        expect(addFavoriteRequest.request.method).toBe('PATCH');
        expect(addFavoriteRequest.request.body).toEqual({ isFavorite: true });
        addFavoriteRequest.flush(buildSessionResponse({
            id: 1,
            title: 'Session A',
            isFavorite: true
        }));

        const sessions = await firstValueFrom(service.getSessions());
        expect(sessions.find(s => s.id === 1)?.isFavorite).toBeTrue();
    });

    it('should remove favorite via DELETE endpoint and update local state', async () => {
        service.toggleFavorite(1);
        const addFavoriteRequest = httpMock.expectOne('/session/sessions/1/participants/me/prefs');
        expect(addFavoriteRequest.request.method).toBe('PATCH');
        expect(addFavoriteRequest.request.body).toEqual({ isFavorite: true });
        addFavoriteRequest.flush(buildSessionResponse({
            id: 1,
            title: 'Session A',
            isFavorite: true
        }));

        service.toggleFavorite(1);
        const removeFavoriteRequest = httpMock.expectOne('/session/sessions/1/participants/me/prefs');
        expect(removeFavoriteRequest.request.method).toBe('PATCH');
        expect(removeFavoriteRequest.request.body).toEqual({ isFavorite: false });
        removeFavoriteRequest.flush(buildSessionResponse({
            id: 1,
            title: 'Session A',
            isFavorite: false
        }));

        const sessions = await firstValueFrom(service.getSessions());
        expect(sessions.find(s => s.id === 1)?.isFavorite).toBeFalse();
    });
});

function buildSessionResponse(options: { id: number; title: string; isFavorite: boolean }) {
    return {
        id: options.id,
        title: options.title,
        description: 'Description',
        startTime: '2026-02-21T10:00:00Z',
        endTime: '2026-02-21T11:00:00Z',
        meetingUrl: 'https://meet.example.com/session',
        createdBy: 'admin',
        status: 'SCHEDULED',
        visibility: 'PUBLIC',
        createdAt: '2026-02-20T09:00:00Z',
        updatedAt: '2026-02-20T09:00:00Z',
        participants: [
            {
                userId: 'admin',
                isFavorite: options.isFavorite
            }
        ]
    };
}
