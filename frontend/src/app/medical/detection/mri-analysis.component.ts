import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AnalysisResult {
    region: string;
    severity: 'Low' | 'Medium' | 'High';
    confidence: number;
    description: string;
}

@Component({
    selector: 'app-mri-analysis',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mri-analysis.component.html',
    styleUrl: './mri-analysis.component.css'
})
export class MriAnalysisComponent {
    imageUrl = 'assets/mri_scan_brain.svg'; // Placeholder due to generation limit
    zoom = 1;
    panX = 0;
    panY = 0;
    isDragging = false;
    startX = 0;
    startY = 0;

    isAnalyzing = false;
    analysisComplete = false;
    results: AnalysisResult[] = [];

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

    runAIAnalysis() {
        this.isAnalyzing = true;
        this.analysisComplete = false;

        // Simulate API call
        setTimeout(() => {
            this.isAnalyzing = false;
            this.analysisComplete = true;
            this.results = [
                { region: 'Hippocampus', severity: 'Medium', confidence: 92, description: 'Mild atrophy detected compatible with early-stage progression.' },
                { region: 'Temporal Lobe', severity: 'Low', confidence: 88, description: 'Slight reduction in volume observed.' }
            ];
        }, 2500);
    }
}
