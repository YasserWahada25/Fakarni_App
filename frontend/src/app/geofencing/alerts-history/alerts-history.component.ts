import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GeofencingService, Alert } from '../shared/geofencing.service';

export interface NotificationSettings {
    smsEnabled:    boolean;
    emailEnabled:  boolean;
    phoneNumber:   string;
    emailAddress:  string;
}

const SETTINGS_KEY = 'geofencing_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
    smsEnabled:   false,
    emailEnabled: false,
    phoneNumber:  '',
    emailAddress: ''
};

@Component({
    selector: 'app-alerts-history',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './alerts-history.component.html',
    styleUrl:    './alerts-history.component.css'
})
export class AlertsHistoryComponent implements OnInit, OnDestroy {

    // ── Alerts ────────────────────────────────────────────────────
    alerts:         Alert[] = [];
    filteredAlerts: Alert[] = [];
    filterType:   string = 'All';
    filterStatus: string = 'All';
    isLoading = true;
    errorMsg  = '';

    // ── Notification Settings ─────────────────────────────────────
    settings: NotificationSettings = { ...DEFAULT_SETTINGS };
    settingsSaved    = false;   // feedback toast
    isSavingSettings = false;

    private sub!: Subscription;

    constructor(private geofencingService: GeofencingService) {}

    // ──────────────────────────────────────────────────────────────
    ngOnInit(): void {
        this.loadSettings();

        // timer(0,5000) dans le service → premier emit immédiat
        this.sub = this.geofencingService.getAlertsRealtime().subscribe({
            next: (data) => {
                this.alerts    = data;
                this.isLoading = false;
                this.errorMsg  = '';
                this.applyFilters();
            },
            error: (err) => {
                this.errorMsg  = 'Failed to load alerts. Check backend connection.';
                this.isLoading = false;
                console.error(err);
            }
        });
    }

    ngOnDestroy(): void { this.sub?.unsubscribe(); }

    // ── Alerts ────────────────────────────────────────────────────
    applyFilters(): void {
        this.filteredAlerts = this.alerts.filter(a => {
            const typeOk   = this.filterType   === 'All' || a.type   === this.filterType;
            const statusOk = this.filterStatus === 'All' || a.status === this.filterStatus;
            return typeOk && statusOk;
        });
    }

    resolveAlert(alert: Alert): void {
        this.geofencingService.resolveAlert(alert.id).subscribe({
            next: (updated) => {
                const idx = this.alerts.findIndex(a => a.id === updated.id);
                if (idx !== -1) this.alerts[idx] = updated;
                this.applyFilters();
            },
            error: (err) => console.error('Error resolving alert:', err)
        });
    }

    // ── Notification Settings — persistées dans localStorage ──────
    private loadSettings(): void {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            this.settings = raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
        } catch {
            this.settings = { ...DEFAULT_SETTINGS };
        }
    }

    onSmsToggle(): void {
        // Vider le numéro si on désactive SMS
        if (!this.settings.smsEnabled) this.settings.phoneNumber = '';
    }

    onEmailToggle(): void {
        // Vider l'email si on désactive Email
        if (!this.settings.emailEnabled) this.settings.emailAddress = '';
    }

    isPhoneValid(): boolean {
        return /^[+]?[\d\s\-().]{7,20}$/.test(this.settings.phoneNumber || '');
    }

    isEmailValid(): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.settings.emailAddress || '');
    }

    isFormValid(): boolean {
        if (this.settings.smsEnabled && !this.isPhoneValid()) return false;
        if (this.settings.emailEnabled && !this.isEmailValid()) return false;
        return true;
    }

    saveSettings(): void {
        if (!this.isFormValid()) return;
        this.isSavingSettings = true;

        // Appel backend — endpoint à adapter selon votre API
        // Exemple: POST /api/geofencing/notifications/settings
        // Si pas encore d'endpoint, on sauvegarde en localStorage
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings', e);
        }

        // TODO: remplacer par this.http.post('/api/geofencing/notifications/settings', this.settings)
        // .subscribe({ next: () => { ... }, error: () => { ... } });

        setTimeout(() => {
            this.isSavingSettings = false;
            this.settingsSaved    = true;
            setTimeout(() => this.settingsSaved = false, 3000);
        }, 600);
    }

    // ── Helpers ───────────────────────────────────────────────────
    formatDate(ts: any): Date {
        if (!ts) return new Date();
        if (Array.isArray(ts)) {
            const [y, m, d, h, min, s] = ts;
            return new Date(y, m - 1, d, h, min, s ?? 0);
        }
        return new Date(ts);
    }

    get recentAlerts(): Alert[] {
        return [...this.alerts]
            .sort((a, b) => this.formatDate(b.timestamp).getTime() - this.formatDate(a.timestamp).getTime())
            .slice(0, 3);
    }

    // Types distincts extraits des alertes réelles du backend
    get alertTypes(): string[] {
        return [...new Set(this.alerts.map(a => a.type).filter(Boolean))].sort();
    }

    get activeCount(): number  { return this.alerts.filter(a => a.status === 'Active').length;   }
    get resolvedCount(): number{ return this.alerts.filter(a => a.status === 'Resolved').length; }
}