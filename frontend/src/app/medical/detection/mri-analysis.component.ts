import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyseIRMResponse, DetectionService } from '../services/detection';

@Component({
  selector: 'app-mri-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mri-analysis.component.html',
  styleUrl: './mri-analysis.component.css'
})
export class MriAnalysisComponent {

  // ── Image viewer ──────────────────────
  imageUrl: string = '';
  selectedFile: File | null = null;
  zoom = 1;
  panX = 0;
  panY = 0;
  isDragging = false;
  startX = 0;
  startY = 0;

  // ── État analyse ──────────────────────
  isAnalyzing = false;
  analysisComplete = false;
  errorMessage = '';

  // ── Résultat depuis API ───────────────
  analyseResult: AnalyseIRMResponse | null = null;

  constructor(private detectionService: DetectionService) {}

  // ══════════════════════════════════════
  //        UPLOAD IMAGE
  // ══════════════════════════════════════
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Prévisualiser l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);

      // Reset état
      this.analysisComplete = false;
      this.analyseResult = null;
      this.errorMessage = '';
    }
  }

  // ══════════════════════════════════════
  //   LANCER ANALYSE IA
  //   ✅ Appelle POST http://localhost:8058/api/detection/analyser
  // ══════════════════════════════════════
  runAIAnalysis(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select an MRI image first.';
      return;
    }

    this.isAnalyzing = true;
    this.analysisComplete = false;
    this.errorMessage = '';

    // ✅ Appel API backend
    this.detectionService.analyserIRM(this.selectedFile).subscribe({
      next: (result) => {
        console.log('✅ Résultat analyse:', result);
        this.analyseResult = result;
        this.isAnalyzing = false;
        this.analysisComplete = true;
      },
      error: (err) => {
        console.error('❌ Erreur analyse:', err);
        this.isAnalyzing = false;
        this.errorMessage = 'Analysis failed. Check that services are running.';
      }
    });
  }

  // ══════════════════════════════════════
  //        NOUVELLE ANALYSE
  // ══════════════════════════════════════
  resetAnalysis(): void {
    this.analysisComplete = false;
    this.analyseResult = null;
    this.selectedFile = null;
    this.imageUrl = '';
    this.errorMessage = '';
  }

  // ══════════════════════════════════════
  //        COULEURS SELON RISQUE
  // ══════════════════════════════════════
  getRiskColor(couleur: string): string {
    const colors: { [key: string]: string } = {
      'GREEN': '#10b981',
      'YELLOW': '#f59e0b',
      'ORANGE': '#f97316',
      'RED': '#ef4444'
    };
    return colors[couleur] || '#6b7280';
  }

  formatPrediction(p: string): string {
    return p?.replace(/_/g, ' ') || '';
  }

  // ══════════════════════════════════════
  //        ZOOM & PAN IMAGE
  // ══════════════════════════════════════
  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.panX;
    this.startY = event.clientY - this.panY;
  }

  drag(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();
    this.panX = event.clientX - this.startX;
    this.panY = event.clientY - this.startY;
  }

  endDrag() {
    this.isDragging = false;
  }

  zoomIn() {
    this.zoom = Math.min(this.zoom + 0.5, 5);
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom - 0.5, 1);
    if (this.zoom === 1) {
      this.panX = 0;
      this.panY = 0;
    }
  }
}