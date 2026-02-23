import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyseIRMResponse, DetectionService } from '../services/detection';

@Component({
  selector: 'app-mri-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mri-analysis.component.html',
  styleUrl: './mri-analysis.component.css'
})
export class MriAnalysisComponent implements OnDestroy {

  // ── Patient ─────────────────────────────────────────
  patientName   = '';
  patientId     = '';
  patientAge: number | null = null;
  patientGender = '';

  // ── Viewer / Image ──────────────────────────────────
  imageUrl       = '';
  selectedFile: File | null = null;
  zoom  = 1; panX = 0; panY = 0;
  isDragging = false; startX = 0; startY = 0;
  rotationDeg = 0;
  flipH       = false;

  // ── Image Confirmation ──────────────────────────────
  imageConfirmed: boolean | null = null;   // null=en attente, true=confirmé, false=rejeté
  showRejectionModal = false;

  // ── Image Quality ───────────────────────────────────
  imageQuality: { score:number; grayscale:number; contrast:string; label:string; color:string } | null = null;

  // ── Comparaison avant/après ─────────────────────────
  compareMode  = false;
  compareFile: File | null = null;
  compareUrl   = '';
  sliderX      = 50;       // position en %
  isSliding    = false;

  // ── Analysis state ──────────────────────────────────
  isAnalyzing      = false;
  analysisComplete = false;
  errorMessage     = '';
  procStep         = 0;
  private procInterval: any;

  // ── Result ──────────────────────────────────────────
  analyseResult: AnalyseIRMResponse | null = null;

  // ── Risk scores ─────────────────────────────────────
  ageRiskPct       = 0;
  aiRiskPct        = 0;
  globalRiskPct    = 0;
  globalRiskColor  = '#9b8fef';
  globalRiskMessage = '';

  // ── Stage track ─────────────────────────────────────
  stages = [
    { label:'Normal',     icon:'fa-solid fa-shield-heart',           color:'#6ee7b7' },
    { label:'Très léger', icon:'fa-solid fa-magnifying-glass-chart', color:'#a78bfa' },
    { label:'Léger',      icon:'fa-solid fa-triangle-exclamation',   color:'#c084fc' },
    { label:'Modéré',     icon:'fa-solid fa-circle-exclamation',     color:'#f87171' }
  ];

  // ── Questionnaire ────────────────────────────────────
  showQuestionnaire = false;
  questionnaire = {
    symptoms:    {} as Record<string,boolean>,
    antecedents: {} as Record<string,boolean>,
    duration: ''
  };
  questionnaireScore = 0;
  qScoreColor   = '#9b8fef';
  qScoreLabel   = '';
  qScoreMessage = '';

  symptomsList = [
    { key:'memoire',     label:'Troubles de la mémoire',       icon:'fa-solid fa-brain'               },
    { key:'confusion',   label:'Confusion / désorientation',   icon:'fa-solid fa-arrows-spin'         },
    { key:'langage',     label:'Difficultés de langage',       icon:'fa-solid fa-comment-slash'       },
    { key:'comportement',label:'Changements comportementaux',  icon:'fa-solid fa-person-burst'        },
    { key:'depression',  label:'Dépression / anxiété',         icon:'fa-solid fa-face-sad-tear'       },
    { key:'autonomie',   label:'Perte d\'autonomie (AVQ)',     icon:'fa-solid fa-wheelchair'          }
  ];

  antecedentsList = [
    { key:'familiaux',   label:'ATCD familiaux Alzheimer',     icon:'fa-solid fa-dna'                 },
    { key:'avc',         label:'AVC ou AIT',                   icon:'fa-solid fa-bolt'                },
    { key:'hta',         label:'Hypertension artérielle',      icon:'fa-solid fa-heart-pulse'         },
    { key:'diabete',     label:'Diabète de type 2',            icon:'fa-solid fa-droplet'             },
    { key:'depression2', label:'Dépression chronique',         icon:'fa-solid fa-cloud-rain'          },
    { key:'tc',          label:'Traumatisme crânien',          icon:'fa-solid fa-head-side-cough'     }
  ];

  durationOptions = [
    { value:'aucun',    label:'Aucun symptôme' },
    { value:'lt6',      label:'Moins de 6 mois' },
    { value:'6_12',     label:'6 à 12 mois' },
    { value:'gt12',     label:'Plus de 12 mois' },
    { value:'gt2ans',   label:'Plus de 2 ans' }
  ];

  constructor(private detectionService: DetectionService) {}
  ngOnDestroy() { this.clearProc(); }

  // ══════════════════════════════════════════════════
  //  QUESTIONNAIRE
  // ══════════════════════════════════════════════════
  toggleQuestionnaire() { this.showQuestionnaire = !this.showQuestionnaire; }

  computeQuestionnaireScore(): void {
    let score = 0;
    // Symptômes : 1 pt chacun, max 6
    this.symptomsList.forEach(s => { if (this.questionnaire.symptoms[s.key]) score++; });
    // Antécédents : 0.5 pt chacun, max 3
    this.antecedentsList.forEach(a => { if (this.questionnaire.antecedents[a.key]) score += 0.5; });
    // Durée : 0 / 0.5 / 1 / 1.5 / 2 pts
    const durMap: Record<string,number> = { aucun:0, lt6:0.5, '6_12':1, gt12:1.5, gt2ans:2 };
    score += durMap[this.questionnaire.duration] || 0;

    this.questionnaireScore = Math.min(10, Math.round(score * 10) / 10);
    this.questionnaireScore = parseFloat(this.questionnaireScore.toFixed(1));

    if (this.questionnaireScore <= 2) {
      this.qScoreColor   = '#10b981';
      this.qScoreLabel   = 'Profil rassurant';
      this.qScoreMessage = 'Peu de signes cliniques. L\'analyse IRM permettra de confirmer.';
    } else if (this.questionnaireScore <= 4) {
      this.qScoreColor   = '#a78bfa';
      this.qScoreLabel   = 'Vigilance modérée';
      this.qScoreMessage = 'Quelques indicateurs à surveiller. Un suivi neurologique est conseillé.';
    } else if (this.questionnaireScore <= 7) {
      this.qScoreColor   = '#c084fc';
      this.qScoreLabel   = 'Profil préoccupant';
      this.qScoreMessage = 'Plusieurs facteurs de risque présents. Consultation spécialisée recommandée.';
    } else {
      this.qScoreColor   = '#f87171';
      this.qScoreLabel   = 'Profil critique';
      this.qScoreMessage = 'Cumul élevé de symptômes et antécédents. Prise en charge urgente recommandée.';
    }
  }

  // ══════════════════════════════════════════════════
  //  IMAGE UPLOAD & CONFIRMATION
  // ══════════════════════════════════════════════════
  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;

    this.selectedFile    = input.files[0];
    this.imageConfirmed  = null;   // reset → demande de confirmation
    this.imageQuality    = null;
    this.analysisComplete = false;
    this.analyseResult   = null;
    this.errorMessage    = '';
    this.rotationDeg     = 0;
    this.flipH           = false;
    this.showRejectionModal = false;

    const reader = new FileReader();
    reader.onload = (ev) => {
      this.imageUrl = ev.target?.result as string;
      // Analyse qualité locale après chargement
      this.analyzeImageQuality(this.imageUrl);
    };
    reader.readAsDataURL(this.selectedFile);
  }

  confirmImage(): void  { this.imageConfirmed = true; }

  rejectImage(): void {
    this.imageConfirmed    = null;
    this.showRejectionModal = true;
  }

  closeRejectionModal(): void {
    this.showRejectionModal = false;
    // Si l'image n'est pas encore confirmée, on efface
    if (this.imageConfirmed !== true) {
      this.imageUrl    = '';
      this.selectedFile = null;
      this.imageQuality = null;
    }
  }

  // ══════════════════════════════════════════════════
  //  ANALYSE DE QUALITÉ D'IMAGE (canvas local)
  //  Mesure : % pixels en niveaux de gris + écart-type
  // ══════════════════════════════════════════════════
  private analyzeImageQuality(dataUrl: string): void {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 100;  // échantillon 100×100
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let grayCount = 0;
      let totalLum  = 0;
      const lums: number[] = [];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        const lum = 0.299*r + 0.587*g + 0.114*b;
        totalLum += lum;
        lums.push(lum);
        // Considéré "gris" si R≈G≈B (delta max 20)
        const delta = Math.max(r,g,b) - Math.min(r,g,b);
        if (delta < 20) grayCount++;
      }

      const pixelCount  = lums.length;
      const grayscalePct = Math.round((grayCount / pixelCount) * 100);
      const avgLum      = totalLum / pixelCount;

      // Écart-type = indicateur de contraste
      const variance    = lums.reduce((acc, l) => acc + Math.pow(l - avgLum, 2), 0) / pixelCount;
      const stdDev      = Math.round(Math.sqrt(variance));

      // Score : 60% niveaux de gris + 40% contraste normalisé
      const contrastScore = Math.min(100, stdDev * 1.5);
      const qualityScore  = Math.round(grayscalePct * 0.6 + contrastScore * 0.4);

      let label: string; let color: string;
      if (qualityScore >= 70)      { label = 'Excellente'; color = '#10b981'; }
      else if (qualityScore >= 50) { label = 'Bonne';      color = '#a78bfa'; }
      else if (qualityScore >= 30) { label = 'Moyenne';    color = '#f59e0b'; }
      else                          { label = 'Faible';     color = '#f87171'; }

      let contrastLabel: string;
      if (stdDev >= 60)      contrastLabel = 'Élevé';
      else if (stdDev >= 35) contrastLabel = 'Modéré';
      else                   contrastLabel = 'Faible';

      this.imageQuality = {
        score: qualityScore,
        grayscale: grayscalePct,
        contrast: contrastLabel,
        label,
        color
      };
    };
    img.src = dataUrl;
  }

  // ══════════════════════════════════════════════════
  //  TRANSFORMATIONS IMAGE
  // ══════════════════════════════════════════════════
  rotateLeft()      { this.rotationDeg = (this.rotationDeg - 90 + 360) % 360; }
  rotateRight()     { this.rotationDeg = (this.rotationDeg + 90) % 360; }
  flipHorizontal()  { this.flipH = !this.flipH; }
  resetTransform()  { this.rotationDeg = 0; this.flipH = false; this.zoom = 1; this.panX = 0; this.panY = 0; }

  getImgTransform(): string {
    const t = `translate(${this.panX}px,${this.panY}px) scale(${this.zoom}) rotate(${this.rotationDeg}deg)`;
    return this.flipH ? t + ' scaleX(-1)' : t;
  }

  // ══════════════════════════════════════════════════
  //  COMPARAISON AVANT / APRÈS
  // ══════════════════════════════════════════════════
  onCompareFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    this.compareFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => { this.compareUrl = ev.target?.result as string; };
    reader.readAsDataURL(this.compareFile);
  }

  onSliderMove(e: MouseEvent): void {
    if (!this.isSliding) return;
    const el = (e.currentTarget as HTMLElement);
    const rect = el.getBoundingClientRect();
    const pct  = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    this.sliderX = Math.round(pct);
  }

  // ══════════════════════════════════════════════════
  //  ANALYSE IA
  // ══════════════════════════════════════════════════
  runAIAnalysis(): void {
    if (!this.selectedFile || !this.imageConfirmed) {
      this.errorMessage = !this.imageConfirmed
        ? 'Confirmez d\'abord que l\'image est une IRM valide.'
        : 'Veuillez sélectionner une image IRM.';
      return;
    }
    this.isAnalyzing      = true;
    this.analysisComplete = false;
    this.errorMessage     = '';
    this.procStep         = 0;
    this.startProcAnim();

    this.detectionService.analyserIRM(this.selectedFile).subscribe({
      next: (result) => {
        this.clearProc(); this.procStep = 5;
        this.aiRiskPct = this.stageToAiRisk(result.prediction);
        setTimeout(() => {
          this.analyseResult   = result;
          this.isAnalyzing     = false;
          this.analysisComplete = true;
          this.computeGlobalRisk();
        }, 500);
      },
      error: () => {
        this.clearProc();
        this.isAnalyzing = false;
        this.errorMessage = 'Analyse échouée. Vérifiez que le service backend est actif.';
      }
    });
  }

  private startProcAnim(): void {
    this.procInterval = setInterval(() => { if (this.procStep < 4) this.procStep++; }, 850);
  }
  private clearProc(): void {
    if (this.procInterval) { clearInterval(this.procInterval); this.procInterval = null; }
  }

  resetAnalysis(): void {
    this.analysisComplete = false; this.analyseResult = null;
    this.selectedFile     = null;  this.imageUrl      = '';
    this.imageConfirmed   = null;  this.imageQuality  = null;
    this.compareUrl       = '';    this.compareFile   = null;
    this.compareMode      = false; this.sliderX       = 50;
    this.errorMessage     = '';    this.procStep      = 0;
    this.aiRiskPct        = 0;     this.rotationDeg   = 0;
    this.flipH            = false;
    this.computeGlobalRisk();
  }

  // ══════════════════════════════════════════════════
  //  SCORES DE RISQUE
  // ══════════════════════════════════════════════════
  onAgeChange(): void {
    const age = this.patientAge || 0;
    if (age <= 0) { this.ageRiskPct = 0; this.computeGlobalRisk(); return; }
    if      (age < 60) this.ageRiskPct = 2;
    else if (age < 65) this.ageRiskPct = 5;
    else if (age < 70) this.ageRiskPct = 8;
    else if (age < 75) this.ageRiskPct = 13;
    else if (age < 80) this.ageRiskPct = 20;
    else if (age < 85) this.ageRiskPct = 32;
    else if (age < 90) this.ageRiskPct = 45;
    else               this.ageRiskPct = 60;
    this.computeGlobalRisk();
  }

  private stageToAiRisk(p: string): number {
    return { Non_Demented:5, Very_Mild_Demented:35, Mild_Demented:65, Moderate_Demented:90 }[p] || 0;
  }

  private computeGlobalRisk(): void {
    this.globalRiskPct = this.analysisComplete
      ? Math.round(this.aiRiskPct * 0.60 + this.ageRiskPct * 0.40)
      : this.ageRiskPct;

    if (this.globalRiskPct <= 15) {
      this.globalRiskColor   = '#6ee7b7';
      this.globalRiskMessage = 'Risque global faible. Un suivi annuel standard est suffisant.';
    } else if (this.globalRiskPct <= 35) {
      this.globalRiskColor   = '#a78bfa';
      this.globalRiskMessage = 'Risque modéré. Une surveillance neurologique rapprochée est recommandée.';
    } else if (this.globalRiskPct <= 60) {
      this.globalRiskColor   = '#c084fc';
      this.globalRiskMessage = 'Risque élevé. Consultation spécialisée et bilan complémentaire nécessaires.';
    } else {
      this.globalRiskColor   = '#f87171';
      this.globalRiskMessage = 'Risque très élevé. Prise en charge médicale urgente requise.';
    }
  }

  // ══════════════════════════════════════════════════
  //  EXPORT PDF
  // ══════════════════════════════════════════════════
  exportPDF(): void {
    if (!this.analyseResult) return;
    const r = this.analyseResult;
    const probs = this.getProbabilities(r);
    const recs  = this.getRecommendations(r.prediction);
    const steps = this.getTreatmentSteps(r.prediction);

    const html = `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"><title>Rapport IRM — ${this.patientName || 'Anonyme'}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
body{font-family:'Nunito',sans-serif;color:#1e1b4b;background:#fff;margin:0;padding:32px;}
.ph{display:flex;justify-content:space-between;border-bottom:2px solid #ede9fe;padding-bottom:16px;margin-bottom:24px;}
.logo{font-size:1.4rem;font-weight:900;color:#7c3aed;} .logo span{color:#c084fc;}
.meta{text-align:right;font-size:0.78rem;color:#6b7280;}
h2{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:20px 0 8px;border-bottom:1px solid #f3f4f6;padding-bottom:6px;}
.db{background:#f5f3ff;border-left:5px solid #7c3aed;border-radius:8px;padding:14px 16px;margin-bottom:20px;}
.dn{font-size:1.2rem;font-weight:800;color:#4c1d95;} .dd{font-size:0.85rem;color:#6d28d9;margin-top:4px;}
.rr{display:flex;gap:14px;margin-bottom:20px;}
.rb{flex:1;background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:12px;text-align:center;}
.rv{font-size:1.5rem;font-weight:800;color:#7c3aed;} .rl{font-size:0.68rem;color:#9ca3af;text-transform:uppercase;}
.qb{background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:0.82rem;}
.pr{display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:0.82rem;}
.pb{flex:1;height:7px;background:#f3f4f6;border-radius:99px;overflow:hidden;}
.pf{height:100%;border-radius:99px;}
.ri{padding:10px 12px;background:#faf5ff;border-radius:7px;margin-bottom:8px;border-left:3px solid #a78bfa;}
.rt{font-weight:700;font-size:0.82rem;color:#4c1d95;margin-bottom:3px;} .rd{font-size:0.75rem;color:#6b7280;}
.si{display:flex;gap:10px;margin-bottom:10px;font-size:0.82rem;}
.sd{width:16px;height:16px;border-radius:50%;flex-shrink:0;margin-top:2px;}
.dis{background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px;font-size:0.73rem;color:#92400e;margin-top:24px;}
</style></head><body>
<div class="ph">
  <div><div class="logo">NeuroScan <span>AI</span></div><div style="font-size:0.68rem;color:#9ca3af;margin-top:4px;">EfficientNetB3 · v3.2.0</div></div>
  <div class="meta">
    <div style="font-weight:700;color:#4c1d95;font-size:1rem;">${this.patientName||'Patient anonyme'}${this.patientAge?' · '+this.patientAge+' ans':''}${this.patientGender?' · '+(this.patientGender==='F'?'Féminin':this.patientGender==='M'?'Masculin':'Autre'):''}</div>
    <div>${this.patientId?'ID : '+this.patientId+' · ':''}${this.formatDate()}</div>
  </div>
</div>
${this.questionnaireScore>0?`<div class="qb"><strong style="color:#7c3aed;">Score clinique pré-analyse : ${this.questionnaireScore}/10 — ${this.qScoreLabel}</strong><br>${this.qScoreMessage}</div>`:''}
<h2>Diagnostic IA</h2>
<div class="db">
  <div class="dn">${this.formatPrediction(r.prediction)}</div>
  <div class="dd">${this.getStageDescription(r.prediction)}</div>
  <div style="margin-top:8px;font-size:0.8rem;color:#7c3aed;">Niveau : <strong>${r.niveauRisque}</strong> · Confiance : <strong>${r.confidence.toFixed(1)}%</strong></div>
</div>
<div class="rr">
  <div class="rb"><div class="rv">${this.globalRiskPct}</div><div class="rl">Score global /100</div></div>
  <div class="rb"><div class="rv">${this.aiRiskPct}%</div><div class="rl">Risque IA</div></div>
  <div class="rb"><div class="rv">${this.ageRiskPct}%</div><div class="rl">Risque épidémio.</div></div>
</div>
<h2>Interprétation clinique</h2>
<p style="font-size:0.85rem;color:#374151;line-height:1.7;margin:0 0 20px;">${this.getClinicalInterpretation(r.prediction,r.confidence)}</p>
<h2>Distribution des probabilités</h2>
${probs.map(p=>`<div class="pr"><span style="min-width:165px;color:#374151;">${p.label}</span><div class="pb"><div class="pf" style="width:${p.value}%;background:${p.color}"></div></div><span style="min-width:52px;text-align:right;font-weight:700;color:${p.color};">${p.value.toFixed(2)}%</span></div>`).join('')}
<h2>Suivi recommandé</h2>
${steps.map(s=>`<div class="si"><div class="sd" style="background:${s.status==='done'?'#6ee7b7':s.status==='current'?'#a78bfa':'#e5e7eb'}"></div><div><strong style="color:#4c1d95;">${s.title}</strong><br><span style="color:#6b7280;">${s.detail}</span> <em style="color:#9ca3af;">(${s.timing})</em></div></div>`).join('')}
<h2>Recommandations cliniques</h2>
${recs.map(rec=>`<div class="ri"><div class="rt">${rec.title} <span style="font-weight:400;font-size:0.72rem;color:#9ca3af;">[${rec.urgencyLabel}]</span></div><div class="rd">${rec.detail}</div></div>`).join('')}
<div class="dis">⚠️ Ce rapport est généré par une IA à titre indicatif uniquement et ne remplace en aucun cas un diagnostic médical posé par un professionnel de santé qualifié.</div>
</body></html>`;

    const w = window.open('','_blank','width=820,height=900');
    if (!w) return;
    w.document.write(html); w.document.close(); w.focus();
    setTimeout(() => w.print(), 800);
  }

  // ══════════════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════════════
  getRiskColor(c: string): string {
    return { GREEN:'#10b981', YELLOW:'#a78bfa', ORANGE:'#c084fc', RED:'#f87171' }[c] || '#9b8fef';
  }
  getStageCssClass(p: string): string {
    return { Non_Demented:'s-normal',Very_Mild_Demented:'s-vigilance',Mild_Demented:'s-concern',Moderate_Demented:'s-critical' }[p]||'';
  }
  getStageNumber(p: string): number {
    return { Non_Demented:1,Very_Mild_Demented:2,Mild_Demented:3,Moderate_Demented:4 }[p]||0;
  }
  getStageIcon(p: string): string {
    return { Non_Demented:'fa-solid fa-shield-heart',Very_Mild_Demented:'fa-solid fa-magnifying-glass-chart',Mild_Demented:'fa-solid fa-triangle-exclamation',Moderate_Demented:'fa-solid fa-circle-exclamation' }[p]||'fa-solid fa-brain';
  }
  getStageDescription(p: string): string {
    return { Non_Demented:'Aucun déclin cognitif significatif détecté',Very_Mild_Demented:'Modifications précoces subtiles, surveillance recommandée',Mild_Demented:'Déclin cognitif léger nécessitant un suivi clinique',Moderate_Demented:'Démence modérée — orientation spécialisée urgente' }[p]||'';
  }
  getClinicalInterpretation(p: string, conf: number): string {
    const lvl = conf>=90?'haute fiabilité diagnostique':conf>=75?'fiabilité modérée':'indication préliminaire';
    return { Non_Demented:`L'analyse ne révèle aucun signe de déclin cognitif (${lvl}). Les patterns corticaux sont cohérents avec une morphologie normale pour l'âge. Un suivi annuel est conseillé.`,Very_Mild_Demented:`L'analyse identifie des modifications subtiles compatibles avec un déclin très léger (${lvl}). Une intervention précoce et un suivi longitudinal sont fortement recommandés.`,Mild_Demented:`Les résultats sont compatibles avec une démence légère (${lvl}). Des patterns d'atrophie corticale suggèrent une neurodégénérescence progressive. Une évaluation complète est recommandée rapidement.`,Moderate_Demented:`L'imagerie présente des marqueurs significatifs de démence modérée (${lvl}). Des modifications structurelles importantes sont visibles. Une orientation urgente vers une équipe spécialisée est indiquée.` }[p]||'Analyse terminée. Consultez un spécialiste.';
  }
  getConfidenceNote(conf: number): string {
    if (conf>=90) return 'Résultat haute confiance — fortement fiable pour une revue clinique.';
    if (conf>=75) return 'Confiance modérée — à corroborer avec une évaluation clinique.';
    return 'Confiance faible — imagerie complémentaire recommandée.';
  }
  getFusionInterpretation(): string {
    const g = this.globalRiskPct;
    if (g<=15) return 'Score combiné faible. La concordance entre le profil d\'âge et le résultat IA est rassurante.';
    if (g<=35) return 'Score modéré. L\'interaction entre l\'âge et le résultat IA justifie un suivi renforcé.';
    if (g<=60) return 'Score préoccupant. La convergence du risque épidémiologique et de l\'IA recommande une prise en charge rapide.';
    return 'Score critique. La concordance entre l\'âge et le stade IA nécessite une intervention médicale immédiate.';
  }
  getProbabilities(r: AnalyseIRMResponse) {
    return [
      { key:'Non_Demented',       label:'Non dément',               stage:'I',   value:r.probNonDemented,       color:'#10b981' },
      { key:'Very_Mild_Demented', label:'Très légèrement dément',   stage:'II',  value:r.probVeryMildDemented,  color:'#a78bfa' },
      { key:'Mild_Demented',      label:'Légèrement dément',        stage:'III', value:r.probMildDemented,       color:'#c084fc' },
      { key:'Moderate_Demented',  label:'Modérément dément',        stage:'IV',  value:r.probModerateDemented,   color:'#f87171' }
    ];
  }
  getTreatmentSteps(p: string): {title:string;detail:string;timing:string;status:'done'|'current'|'upcoming'}[] {
    const n = this.getStageNumber(p);
    return [
      { title:'Analyse IRM initiale',       detail:'Imagerie cérébrale et rapport IA.',             timing:'Aujourd\'hui', status:'done' },
      { title:'Consultation neurologique',  detail:'Premier bilan spécialisé.',                     timing:'< 4 sem.',     status:n>=2?'current':'upcoming' },
      { title:'Bilan neuropsychologique',   detail:'Tests cognitifs MMSE, MoCA.',                   timing:'1–2 mois',     status:n>=3?'current':'upcoming' },
      { title:'Plan thérapeutique',         detail:'Traitement médicamenteux et plan de soins.',    timing:'2–3 mois',     status:n>=4?'current':'upcoming' },
      { title:'IRM de contrôle',            detail:'Suivi évolutif et réévaluation du stade.',      timing:n<=1?'12 mois':n<=2?'6 mois':'3 mois', status:'upcoming' }
    ];
  }
  getRecommendations(p: string): {icon:string;title:string;detail:string;urgency:string;urgencyLabel:string}[] {
    const map: Record<string,any[]> = {
      Non_Demented:[
        {icon:'fa-solid fa-calendar-check',title:'Suivi annuel',detail:'Bilan cognitif de routine dans 12 mois.',urgency:'routine',urgencyLabel:'Routine'},
        {icon:'fa-solid fa-heart-pulse',title:'Hygiène de vie',detail:'Activité physique régulière et stimulation cognitive.',urgency:'routine',urgencyLabel:'Routine'}
      ],
      Very_Mild_Demented:[
        {icon:'fa-solid fa-calendar-clock',title:'Réévaluation 6 mois',detail:'IRM et tests neuropsychologiques dans 6 mois.',urgency:'scheduled',urgencyLabel:'Planifié'},
        {icon:'fa-solid fa-brain',title:'Bilan cognitif',detail:'Batterie MMSE et MoCA validée.',urgency:'scheduled',urgencyLabel:'Planifié'},
        {icon:'fa-solid fa-person-walking',title:'Programme préventif',detail:'Stimulation cognitive et activité physique structurée.',urgency:'routine',urgencyLabel:'Routine'}
      ],
      Mild_Demented:[
        {icon:'fa-solid fa-user-doctor',title:'Neurologie urgente',detail:'Consultation spécialisée sous 4 semaines.',urgency:'urgent',urgencyLabel:'Urgent'},
        {icon:'fa-solid fa-pills',title:'Traitement médical',detail:'Évaluation des inhibiteurs de cholinestérase.',urgency:'urgent',urgencyLabel:'Urgent'},
        {icon:'fa-solid fa-house-medical',title:'Plan de soins',detail:'Soutien familial et coordination des aidants.',urgency:'scheduled',urgencyLabel:'Planifié'}
      ],
      Moderate_Demented:[
        {icon:'fa-solid fa-hospital',title:'Évaluation immédiate',detail:'Consultation neurologique urgente 1–2 semaines.',urgency:'critical',urgencyLabel:'Critique'},
        {icon:'fa-solid fa-shield-halved',title:'Évaluation sécurité',detail:'Autonomie, AVQ et besoins de supervision.',urgency:'critical',urgencyLabel:'Critique'},
        {icon:'fa-solid fa-people-roof',title:'Équipe pluridisciplinaire',detail:'Neurologue, gériatre, travailleur social, aidants.',urgency:'urgent',urgencyLabel:'Urgent'}
      ]
    };
    return map[p]||[];
  }
  formatPrediction(p: string): string {
    return { Non_Demented:'Non dément',Very_Mild_Demented:'Très légèrement dément',Mild_Demented:'Légèrement dément',Moderate_Demented:'Modérément dément' }[p]||p?.replace(/_/g,' ')||'';
  }
  formatDate(): string {
    return new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  }

  // ── Drag/Zoom ──────────────────────────────────────
  startDrag(e:MouseEvent){this.isDragging=true;this.startX=e.clientX-this.panX;this.startY=e.clientY-this.panY;}
  drag(e:MouseEvent){if(!this.isDragging)return;e.preventDefault();this.panX=e.clientX-this.startX;this.panY=e.clientY-this.startY;}
  endDrag(){this.isDragging=false;}
  zoomIn(){this.zoom=Math.min(this.zoom+0.5,5);}
  zoomOut(){this.zoom=Math.max(this.zoom-0.5,1);if(this.zoom===1){this.panX=0;this.panY=0;}}
}