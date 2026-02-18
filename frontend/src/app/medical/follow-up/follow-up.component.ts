import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AnalyseIRMResponse, DetectionService, DossierMedicalResponse } from '../services/detection';

// ── Extension locale de AnalyseIRMResponse ────────────────────────────────────
// Ces champs n'existent PAS dans le backend (pas dans AnalyseIRMResponse).
// On les gère côté frontend uniquement.
export interface AnalyseIRMExtended extends AnalyseIRMResponse {
  conseilMedecin?:   string;   // conseil du médecin — frontend only
  notesCliniques?:   string;   // notes cliniques    — frontend only
  dateModification?: string;   // date de la dernière modif frontend
}

// ── DossierMedicalExtended pour utiliser AnalyseIRMExtended ──────────────────
export interface DossierMedicalExtended extends Omit<DossierMedicalResponse, 'analyses'> {
  analyses: AnalyseIRMExtended[];
}

@Component({
  selector: 'app-follow-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './follow-up.component.html',
  styleUrl: './follow-up.component.css'
})
export class FollowUpComponent implements OnInit {

  activeTab: 'overview' | 'dossier' | 'stats' = 'overview';

  // ── Dossier — on utilise notre type étendu ────────────────────────────────
  dossier: DossierMedicalExtended | null = null;
  isLoading = false;
  errorMessage = '';
  readonly patientId = 1;

  // ── Modal édition ─────────────────────────────────────────────────────────
  editingAnalyse: AnalyseIRMExtended | null = null;
  editForm = { descriptionRisque: '', conseilMedecin: '', notesCliniques: '' };

  constructor(private detectionService: DetectionService) {}

  ngOnInit(): void { this.loadDossier(); }

  // ─────────────────────────────────────────────────────────────────────────
  //  CHARGEMENT
  // ─────────────────────────────────────────────────────────────────────────
  loadDossier(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.detectionService.getDossierByPatientId(this.patientId).subscribe({
      next: (data: DossierMedicalResponse) => {
        // Cast vers DossierMedicalExtended — les champs optionnels sont undefined par défaut
        const extended: DossierMedicalExtended = {
          ...data,
          analyses: data.analyses.map((a: AnalyseIRMResponse): AnalyseIRMExtended => ({
            ...a,
            conseilMedecin:   undefined,
            notesCliniques:   undefined,
            dateModification: undefined
          }))
        };
        // Trier du plus récent au plus ancien
        extended.analyses.sort(
          (a, b) => new Date(b.dateAnalyse).getTime() - new Date(a.dateAnalyse).getTime()
        );
        this.dossier = extended;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.status === 404
          ? 'No medical record found. Run an MRI analysis first.'
          : `Error ${err.status} — Check service :8059`;
        console.error('[FollowUp]', err);
      }
    });
  }

  refreshDossier(): void { this.loadDossier(); }

  // ─────────────────────────────────────────────────────────────────────────
  //  EDIT — stocké localement dans le tableau (pas d'appel API)
  // ─────────────────────────────────────────────────────────────────────────
  openEditModal(analyse: AnalyseIRMExtended): void {
    this.editingAnalyse = analyse;
    this.editForm = {
      descriptionRisque: analyse.descriptionRisque ?? '',
      conseilMedecin:    analyse.conseilMedecin    ?? '',
      notesCliniques:    analyse.notesCliniques    ?? ''
    };
  }

  closeEditModal(): void { this.editingAnalyse = null; }

  saveEdit(): void {
    if (!this.editingAnalyse || !this.dossier) return;

    // Mise à jour directement dans le tableau local (frontend only)
    const target = this.dossier.analyses.find(a => a.id === this.editingAnalyse!.id);
    if (target) {
      target.descriptionRisque = this.editForm.descriptionRisque;
      target.conseilMedecin    = this.editForm.conseilMedecin;
      target.notesCliniques    = this.editForm.notesCliniques;
      target.dateModification  = new Date().toISOString();
    }
    this.closeEditModal();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  DELETE — supprime localement
  // ─────────────────────────────────────────────────────────────────────────
  deleteAnalyse(id: number, nomFichier: string): void {
    if (!confirm(`Delete analysis "${nomFichier}"?`)) return;
    if (!this.dossier) return;

    this.dossier = {
      ...this.dossier,
      analyses: this.dossier.analyses.filter(a => a.id !== id),
      nombreAnalyses: this.dossier.nombreAnalyses - 1
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  STATISTIQUES
  // ─────────────────────────────────────────────────────────────────────────
  predictionToScore(prediction: string): number {
    const map: Record<string, number> = {
      'Non_Demented': 28, 'Very_Mild_Demented': 24,
      'Mild_Demented': 19, 'Moderate_Demented': 12
    };
    return map[prediction] ?? 20;
  }

  get mmseHistory(): { date: string; score: number; color: string }[] {
    if (!this.dossier?.analyses?.length) return [];
    return [...this.dossier.analyses]
      .reverse().slice(-6)
      .map(a => ({
        date:  this.shortDate(a.dateAnalyse),
        score: this.predictionToScore(a.prediction),
        color: this.getStageColor(a.prediction)
      }));
  }

  getBarHeight(score: number): string { return (score / 30 * 100) + '%'; }

  get cognitiveStatus(): string {
    if (!this.dossier || this.dossier.analyses.length < 2) return 'Insufficient data';
    const stages = ['Non_Demented', 'Very_Mild_Demented', 'Mild_Demented', 'Moderate_Demented'];
    const latest = stages.indexOf(this.dossier.analyses[0].prediction);
    const prev   = stages.indexOf(this.dossier.analyses[1].prediction);
    if (latest > prev) return 'Declining';
    if (latest < prev) return 'Improving';
    return 'Stable';
  }

  get cognitiveStatusColor(): string {
    const map: Record<string, string> = {
      Declining: '#ef4444', Improving: '#10b981', Stable: '#f59e0b'
    };
    return map[this.cognitiveStatus] ?? '#6b7280';
  }

  get stageDistribution(): { label: string; count: number; pct: number; color: string }[] {
    if (!this.dossier?.analyses?.length) return [];
    const total = this.dossier.analyses.length;
    return [
      { key: 'Non_Demented',       label: 'Non Demented', color: '#10b981' },
      { key: 'Very_Mild_Demented', label: 'Very Mild',    color: '#f59e0b' },
      { key: 'Mild_Demented',      label: 'Mild',         color: '#f97316' },
      { key: 'Moderate_Demented',  label: 'Moderate',     color: '#ef4444' }
    ].map(s => ({
      ...s,
      count: this.dossier!.analyses.filter(a => a.prediction === s.key).length,
      pct:   0
    })).map(s => ({ ...s, pct: Math.round((s.count / total) * 100) }))
      .filter(s => s.count > 0);
  }

  getTrend(i: number): string {
    if (!this.dossier || i >= this.dossier.analyses.length - 1) return '';
    const stages = ['Non_Demented', 'Very_Mild_Demented', 'Mild_Demented', 'Moderate_Demented'];
    const curr = stages.indexOf(this.dossier.analyses[i].prediction);
    const prev = stages.indexOf(this.dossier.analyses[i + 1].prediction);
    if (curr > prev) return '⚠️ progression';
    if (curr < prev) return '✅ improvement';
    return '✅ stable';
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  getRiskColor(couleur: string): string {
    const c: Record<string, string> = {
      GREEN: '#10b981', YELLOW: '#f59e0b', ORANGE: '#f97316', RED: '#ef4444'
    };
    return c[couleur] ?? '#6b7280';
  }

  getStageColor(prediction: string): string {
    const c: Record<string, string> = {
      Non_Demented: '#10b981', Very_Mild_Demented: '#f59e0b',
      Mild_Demented: '#f97316', Moderate_Demented: '#ef4444'
    };
    return c[prediction] ?? '#6b7280';
  }

  formatPrediction(p: string): string { return p?.replace(/_/g, ' ') ?? ''; }

  shortDate(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  formatDateTime(d: string): string {
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}