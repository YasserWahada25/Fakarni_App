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

@Injectable({ providedIn: 'root' })
export class DetectionService {

  private readonly API_URL = 'http://localhost:8058';
  private readonly DOSSIER_URL = 'http://localhost:8059';

  constructor(private http: HttpClient) {}

  // ✅ Appelé depuis mri-analysis.component
  analyserIRM(imageFile: File): Observable<AnalyseIRMResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post<AnalyseIRMResponse>(
      `${this.API_URL}/api/detection/analyser`,
      formData
    );
  }

  // ✅ Appelé depuis follow-up.component
  getDossierByPatientId(patientId: number): Observable<DossierMedicalResponse> {
    return this.http.get<DossierMedicalResponse>(
      `${this.DOSSIER_URL}/api/dossiers/patient/${patientId}`
    );
  }

  // ✅ UPDATE
updateAnalyse(id: number, updates: any): Observable<DossierMedicalResponse> {
  return this.http.put<DossierMedicalResponse>(
    `${this.DOSSIER_URL}/api/dossiers/analyse/update/${id}`,
    updates
  );
}

// ✅ DELETE
deleteAnalyse(id: number): Observable<void> {
  return this.http.delete<void>(
    `${this.DOSSIER_URL}/api/dossiers/analyse/${id}`
  );
}
}