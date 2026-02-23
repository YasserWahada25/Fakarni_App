import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyseIRMResponse {
  id: number;
  nomFichier: string;
  prediction: string;
  confidence: number;
  niveauRisque: string;
  couleurRisque: string;
  descriptionRisque: string;
  probMildDemented: number;
  probModerateDemented: number;
  probNonDemented: number;
  probVeryMildDemented: number;
  dateAnalyse: string;
  patientId: number;
  // ✅ Nouveaux champs (optionnels car pas toujours présents)
  conseilMedecin?: string;
  notesCliniques?: string;
  dateModification?: string;
}

export interface DossierMedicalResponse {
  id: number;
  patientId: number;
  dateCreation: string;
  dateDerniereMaj: string;
  dernierePrediction: string;
  dernierNiveauRisque: string;
  derniereCouleurRisque: string;
  nombreAnalyses: number;
  analyses: AnalyseIRMResponse[];
}

export interface UpdateDescriptionRequest {
  analyseId: number;
  descriptionRisque?: string;
  conseilMedecin?: string;
  notesCliniques?: string;
}

@Injectable({ providedIn: 'root' })
export class DetectionService {

  private readonly API_URL = 'http://localhost:8058';
  private readonly DOSSIER_URL = 'http://localhost:8059';

  constructor(private http: HttpClient) {}

  // MRI Analysis
  analyserIRM(imageFile: File): Observable<AnalyseIRMResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post<AnalyseIRMResponse>(
      `${this.API_URL}/api/detection/analyser`,
      formData
    );
  }

  // Read dossier
  getDossierByPatientId(patientId: number): Observable<DossierMedicalResponse> {
    return this.http.get<DossierMedicalResponse>(
      `${this.DOSSIER_URL}/api/dossiers/patient/${patientId}`
    );
  }

  // ✅ UPDATE - BON ENDPOINT
  updateAnalyseDescription(request: UpdateDescriptionRequest): Observable<DossierMedicalResponse> {
    console.log('🔵 API UPDATE appelé:', request);
    return this.http.put<DossierMedicalResponse>(
      `${this.DOSSIER_URL}/api/dossiers/analyse/update-description`,
      request
    );
  }

  // ✅ DELETE - BON ENDPOINT
  deleteAnalyse(analyseId: number): Observable<DossierMedicalResponse> {
    console.log('🔵 API DELETE appelé:', analyseId);
    return this.http.delete<DossierMedicalResponse>(
      `${this.DOSSIER_URL}/api/dossiers/analyse/${analyseId}`
    );
  }
}