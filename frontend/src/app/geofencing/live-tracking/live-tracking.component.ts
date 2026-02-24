import { Component, OnInit, OnDestroy, AfterViewInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, switchMap, forkJoin, of, catchError } from 'rxjs';
import { GeofencingService, Zone, Alert, PatientPosition } from '../shared/geofencing.service';

@Component({
    selector: 'app-live-tracking',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './live-tracking.component.html',
    styleUrl: './live-tracking.component.css'
})
export class LiveTrackingComponent implements AfterViewInit, OnDestroy {

    zones: Zone[]                       = [];
    activeAlerts: Alert[]               = [];
    patientPositions: PatientPosition[] = [];
    isLoading = true;

    private map: any;
    private L: any;
    private mapReady = false;
    private zoneCircles: Map<number, any>    = new Map();
    private patientMarkers: Map<string, any> = new Map();
    private tempMarker: any = null;
    private pollSub!: Subscription;

    showModal       = false;
    isEditMode      = false;
    editingZoneId: number | null = null;
    pickingLocation = false;
    formError       = '';
    isSaving        = false;
    errors: { [key: string]: string } = {};

    zoneForm: Partial<Zone> = {
        nomZone: '', patientId: '',
        centreLat: null as any, centreLon: null as any,
        rayon: 200, type: 'SAFE'
    };

    constructor(
        private geofencingService: GeofencingService,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    async ngAfterViewInit(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) return;

        this.L = await import('leaflet');
        this.initMap();
        this.mapReady = true;

        // Charger tout immédiatement après la carte
        this.loadAll();

        // Poll toutes les 5s — chaque requête est indépendante avec catchError
        this.pollSub = interval(5000).pipe(
            switchMap(() => forkJoin({
                zones:     this.geofencingService.getZones().pipe(catchError(() => of(this.zones))),
                positions: this.geofencingService.getAllLastPositions().pipe(catchError(() => of(this.patientPositions))),
                alerts:    this.geofencingService.getAlerts().pipe(catchError(() => of([] as Alert[])))
            }))
        ).subscribe(({ zones, positions, alerts }) => {
            this.zones            = zones;
            this.patientPositions = positions;
            this.activeAlerts     = alerts.filter(a => a.status === 'Active');
            this.redrawZones();
            this.refreshAllMarkers();
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy(): void {
        this.pollSub?.unsubscribe();
        this.map?.remove();
    }

    // ──────────────────────────────────────────────────────────────
    //  Chargement initial — chaque requête indépendante
    // ──────────────────────────────────────────────────────────────
    private loadAll(): void {
        this.isLoading = true;
        forkJoin({
            zones:     this.geofencingService.getZones().pipe(catchError(() => of([] as Zone[]))),
            positions: this.geofencingService.getAllLastPositions().pipe(catchError(() => of([] as PatientPosition[]))),
            alerts:    this.geofencingService.getAlerts().pipe(catchError(() => of([] as Alert[])))
        }).subscribe(({ zones, positions, alerts }) => {
            this.zones            = zones;
            this.patientPositions = positions;
            this.activeAlerts     = alerts.filter(a => a.status === 'Active');
            this.isLoading        = false;
            this.redrawZones();
            this.refreshAllMarkers();
            this.cdr.detectChanges(); // forcer la détection de changements
        });
    }

    // ──────────────────────────────────────────────────────────────
    //  Map
    // ──────────────────────────────────────────────────────────────
    private initMap(): void {
        const L = this.L;
        this.map = L.map('map').setView([36.8065, 10.1815], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.map.on('click', (e: any) => {
            if (!this.pickingLocation) return;
            this.zoneForm.centreLat = parseFloat(e.latlng.lat.toFixed(6));
            this.zoneForm.centreLon = parseFloat(e.latlng.lng.toFixed(6));
            if (this.tempMarker) this.tempMarker.remove();
            this.tempMarker = L.marker([e.latlng.lat, e.latlng.lng])
                .bindPopup('✅ Center selected').addTo(this.map).openPopup();
            this.pickingLocation = false;
            this.showModal = true;
            this.cdr.detectChanges();
        });
    }

    private redrawZones(): void {
        if (!this.mapReady) return;
        this.zoneCircles.forEach(c => c.remove());
        this.zoneCircles.clear();
        this.zones.forEach(z => this.addZoneToMap(z));
    }

    private addZoneToMap(zone: Zone): void {
        if (!this.L || !this.map) return;
        const isDanger = zone.type === 'DANGER';
        const color    = isDanger ? '#e53935' : '#1565C0';
        const circle   = this.L.circle([zone.centreLat, zone.centreLon], {
            radius: zone.rayon, color, fillColor: color,
            fillOpacity: 0.12, weight: 2.5,
            dashArray: isDanger ? '7,5' : undefined
        }).bindPopup(`
            <div style="min-width:160px;font-family:sans-serif">
                <b style="color:${color}">📍 ${zone.nomZone}</b><br>
                <small>Patient: <b>${zone.patientId}</b></small><br>
                <small>Radius: <b>${zone.rayon}m</b> — ${zone.type}</small>
            </div>`).addTo(this.map);
        this.zoneCircles.set(zone.id, circle);
    }

    centerMapOnZone(zone: Zone): void {
        if (!this.map) return;
        this.map.setView([zone.centreLat, zone.centreLon], 16, { animate: true });
        this.zoneCircles.get(zone.id)?.openPopup();
    }

    // ──────────────────────────────────────────────────────────────
    //  Patient markers
    // ──────────────────────────────────────────────────────────────
    private refreshAllMarkers(): void {
        if (!this.L || !this.map) return;

        this.patientPositions.forEach(pos => {
            const zone = this.zones.find(z => z.patientId === pos.patientId);
            let ok = true;
            if (zone) {
                const d = this.haversine(pos.latitude, pos.longitude, zone.centreLat, zone.centreLon);
                ok = zone.type === 'SAFE' ? d <= zone.rayon : d > zone.rayon;
            }
            const icon  = ok ? this.buildGreenIcon(pos.patientId) : this.buildRedIcon(pos.patientId);
            const popup = ok ? this.buildSafePopup(pos, zone)     : this.buildAlertPopup(pos, zone);
            const ll    = [pos.latitude, pos.longitude];

            if (this.patientMarkers.has(pos.patientId)) {
                const m = this.patientMarkers.get(pos.patientId);
                m.setLatLng(ll); m.setIcon(icon); m.setPopupContent(popup);
            } else {
                this.patientMarkers.set(pos.patientId,
                    this.L.marker(ll, { icon }).bindPopup(popup).addTo(this.map));
            }
        });

        this.patientMarkers.forEach((_: any, id: string) => {
            if (!this.patientPositions.some(p => p.patientId === id)) {
                this.patientMarkers.get(id)?.remove();
                this.patientMarkers.delete(id);
            }
        });
    }

    private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000;
        const f1 = lat1 * Math.PI / 180, f2 = lat2 * Math.PI / 180;
        const df = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180;
        const a  = Math.sin(df/2)**2 + Math.cos(f1)*Math.cos(f2)*Math.sin(dl/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    parseDate(ts: any): Date {
        if (!ts) return new Date();
        if (Array.isArray(ts)) { const [y,m,d,h,min,s] = ts; return new Date(y, m-1, d, h, min, s??0); }
        return new Date(ts);
    }

    private buildGreenIcon(label: string): any {
        return this.L.divIcon({ className: '',
            html: `<div style="position:relative;width:24px;height:24px">
              <div style="position:absolute;inset:0;background:rgba(56,142,60,.25);border-radius:50%;animation:safeRipple 2.5s ease-out infinite"></div>
              <div style="position:absolute;inset:5px;background:#388e3c;border-radius:50%;border:2.5px solid white"></div>
              <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#388e3c;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:5px;white-space:nowrap">🟢 ${label}</div>
            </div>`, iconSize:[24,24], iconAnchor:[12,12] });
    }

    private buildRedIcon(label: string): any {
        return this.L.divIcon({ className: '',
            html: `<div style="position:relative;width:24px;height:24px">
              <div style="position:absolute;inset:0;background:rgba(229,57,53,.3);border-radius:50%;animation:alertRipple 1.2s ease-out infinite"></div>
              <div style="position:absolute;inset:5px;background:#e53935;border-radius:50%;border:2.5px solid white"></div>
              <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#e53935;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:5px;white-space:nowrap">🔴 ${label}</div>
            </div>`, iconSize:[24,24], iconAnchor:[12,12] });
    }

    private buildSafePopup(pos: PatientPosition, zone?: Zone): string {
        return `<div style="font-family:sans-serif;min-width:170px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="font-size:16px">✅</span>
            <b style="color:#388e3c">${pos.patientId}</b>
          </div>
          <div style="background:#f1f8e9;border-radius:6px;padding:6px 10px;margin-bottom:5px">
            <b style="color:#388e3c">${zone?.type==='DANGER' ? 'Outside danger zone ✓' : 'Inside safe zone ✓'}</b>
          </div>
          ${zone ? `<small style="color:#78909c">Zone: <b>${zone.nomZone}</b></small><br>` : ''}
          <small style="color:#b0bec5">📍 ${pos.latitude.toFixed(5)}, ${pos.longitude.toFixed(5)}<br>
          🕒 ${this.parseDate(pos.timestamp).toLocaleTimeString('en-US')}</small></div>`;
    }

    private buildAlertPopup(pos: PatientPosition, zone?: Zone): string {
        const d = zone ? Math.round(this.haversine(pos.latitude,pos.longitude,zone.centreLat,zone.centreLon)) : 0;
        const msg = zone?.type==='DANGER' ? `Inside DANGER zone (${d}m from center)` : `Outside safe zone (${d}m from center)`;
        return `<div style="font-family:sans-serif;min-width:170px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="font-size:16px">🚨</span>
            <b style="color:#e53935">${pos.patientId}</b>
          </div>
          <div style="background:#fff3f3;border-radius:6px;padding:6px 10px;margin-bottom:5px">
            <b style="color:#e53935">${msg}</b>
          </div>
          ${zone ? `<small style="color:#78909c">Zone: <b>${zone.nomZone}</b></small><br>` : ''}
          <small style="color:#b0bec5">📍 ${pos.latitude.toFixed(5)}, ${pos.longitude.toFixed(5)}<br>
          🕒 ${this.parseDate(pos.timestamp).toLocaleTimeString('en-US')}</small></div>`;
    }

    // ──────────────────────────────────────────────────────────────
    //  CRUD
    // ──────────────────────────────────────────────────────────────
    openAddModal(): void {
        this.isEditMode = false; this.editingZoneId = null;
        this.formError = ''; this.errors = {};
        // Tous les champs vides / null sauf rayon et type
        this.zoneForm = { nomZone: '', patientId: '', centreLat: null as any, centreLon: null as any, rayon: 200, type: 'SAFE' };
        this.showModal = true;
    }

    openEditModal(zone: Zone): void {
        this.isEditMode = true; this.editingZoneId = zone.id;
        this.formError = ''; this.errors = {};
        this.zoneForm = { ...zone };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false; this.pickingLocation = false;
        if (this.tempMarker) { this.tempMarker.remove(); this.tempMarker = null; }
    }

    startPickLocation(): void { this.showModal = false; this.pickingLocation = true; }

    private validate(): boolean {
        this.errors = {};
        if (!this.zoneForm.nomZone?.trim())
            this.errors['nomZone'] = 'Zone name is required.';
        if (!this.zoneForm.patientId?.trim())
            this.errors['patientId'] = 'Patient ID is required.';
        else if (!/^[A-Z0-9_-]+$/i.test(this.zoneForm.patientId))
            this.errors['patientId'] = 'Invalid ID (e.g. PATIENT_001). Letters, digits, _ and - only.';
        if (this.zoneForm.centreLat == null || isNaN(this.zoneForm.centreLat) || this.zoneForm.centreLat < -90 || this.zoneForm.centreLat > 90)
            this.errors['centreLat'] = 'Latitude must be between -90 and 90.';
        if (this.zoneForm.centreLon == null || isNaN(this.zoneForm.centreLon) || this.zoneForm.centreLon < -180 || this.zoneForm.centreLon > 180)
            this.errors['centreLon'] = 'Longitude must be between -180 and 180.';
        if (!this.zoneForm.rayon || this.zoneForm.rayon < 10 || this.zoneForm.rayon > 10000)
            this.errors['rayon'] = 'Radius must be between 10m and 10,000m.';
        return Object.keys(this.errors).length === 0;
    }

    saveZone(): void {
        if (!this.validate()) return;
        this.isSaving = true; this.formError = '';

        const obs = this.isEditMode && this.editingZoneId !== null
            ? this.geofencingService.updateZone(this.editingZoneId, this.zoneForm)
            : this.geofencingService.createZone(this.zoneForm);

        obs.subscribe({
            next: (saved: Zone) => {
                if (this.isEditMode) {
                    const idx = this.zones.findIndex(z => z.id === saved.id);
                    if (idx > -1) this.zones[idx] = saved;
                    else this.zones.push(saved);
                    this.zoneCircles.get(saved.id)?.remove();
                    this.zoneCircles.delete(saved.id);
                } else {
                    this.zones = [...this.zones, saved];
                }
                this.addZoneToMap(saved);
                this.refreshAllMarkers();
                this.isSaving = false;
                this.closeModal();          // ferme immédiatement
                this.cdr.detectChanges();   // met à jour la liste immédiatement
            },
            error: (err: any) => {
                this.formError = `Error: ${err?.error?.message ?? err?.message ?? 'Check backend logs.'}`;
                this.isSaving = false;
            }
        });
    }

    deleteZone(zone: Zone): void {
        if (!confirm(`Delete zone "${zone.nomZone}"?`)) return;
        this.geofencingService.deleteZone(zone.id).subscribe({
            next: () => {
                this.zones = this.zones.filter(z => z.id !== zone.id);
                this.zoneCircles.get(zone.id)?.remove();
                this.zoneCircles.delete(zone.id);
                this.refreshAllMarkers();
                this.cdr.detectChanges();
            },
            error: () => alert('Error deleting zone.')
        });
    }

    resolveAlert(alert: Alert): void {
        this.geofencingService.resolveAlert(alert.id).subscribe(() => {
            this.activeAlerts = this.activeAlerts.filter(a => a.id !== alert.id);
            this.cdr.detectChanges();
        });
    }
}