export interface MedicalReport {
    id: number;
    patientId: number;
    patientName: string; // Denormalized for easier display
    date: Date;
    type: 'Analyse Médicale' | 'Détection Maladie' | 'Suivi Cognitif' | 'Autre';
    status: 'En attente' | 'Terminé' | 'Critique';
    content: string;
    attachments?: string[]; // URLs of attached files
    doctorName?: string;
}
