import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationRequest, ReservationRequestsService } from './reservation-requests.service';

type ReservationWithLoading = ReservationRequest & { _loading?: 'accept' | 'reject' };

@Component({
    selector: 'app-reservation-requests',
    standalone: false,
    templateUrl: './reservation-requests.component.html',
    styleUrls: ['./reservation-requests.component.scss']
})
export class ReservationRequestsComponent implements OnInit {
    all: ReservationWithLoading[] = [];
    loading = true;

    get pending(): ReservationWithLoading[] {
        return this.all.filter(r => r.status === 'DRAFT');
    }

    get scheduled(): ReservationWithLoading[] {
        return this.all.filter(r => r.status === 'SCHEDULED');
    }

    get cancelled(): ReservationWithLoading[] {
        return this.all.filter(r => r.status === 'CANCELLED');
    }

    constructor(
        private service: ReservationRequestsService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadAll();
    }

    loadAll(): void {
        this.loading = true;
        this.service.getAllReservations().subscribe({
            next: (res) => {
                this.all = res;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Impossible de charger les réservations.', 'Fermer', { duration: 4000 });
            }
        });
    }

    accept(r: ReservationWithLoading): void {
        r._loading = 'accept';
        this.service.acceptReservation(r.id).subscribe({
            next: (updated) => {
                r.status = updated.status;
                r._loading = undefined;
                this.snackBar.open(`Séance "${r.title}" acceptée.`, 'Fermer', { duration: 3000 });
                this.loadAll();
            },
            error: () => {
                r._loading = undefined;
                this.snackBar.open('Erreur lors de l\'acceptation.', 'Fermer', { duration: 4000 });
            }
        });
    }

    reject(r: ReservationWithLoading): void {
        r._loading = 'reject';
        this.service.rejectReservation(r.id).subscribe({
            next: (updated) => {
                r.status = updated.status;
                r._loading = undefined;
                this.snackBar.open(`Séance "${r.title}" refusée.`, 'Fermer', { duration: 3000 });
                this.loadAll();
            },
            error: () => {
                r._loading = undefined;
                this.snackBar.open('Erreur lors du refus.', 'Fermer', { duration: 4000 });
            }
        });
    }

    getStatusClass(status: string): string {
        const map: Record<string, string> = {
            DRAFT: 'status-draft',
            SCHEDULED: 'status-scheduled',
            CANCELLED: 'status-cancelled',
            DONE: 'status-done'
        };
        return map[status] ?? 'status-draft';
    }

    getStatusIcon(status: string): string {
        const icons: Record<string, string> = {
            DRAFT: 'hourglass_top',
            SCHEDULED: 'check_circle',
            CANCELLED: 'cancel',
            DONE: 'task_alt'
        };
        return icons[status] ?? 'hourglass_top';
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            DRAFT: 'En attente',
            SCHEDULED: 'Acceptée',
            CANCELLED: 'Refusée',
            DONE: 'Terminée'
        };
        return labels[status] ?? status;
    }
}
