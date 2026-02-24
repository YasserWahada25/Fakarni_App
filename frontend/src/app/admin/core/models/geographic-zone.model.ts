export interface Zone {
    id?: number; // Optionnel car généré par la base de données
    patientId: string;
    nomZone: string;
    centreLat: number;
    centreLon: number;
    rayon: number;
}

export interface PatientLocation {
    patientId: number;
    patientName: string;
    currentPosition: { lat: number; lng: number };
    lastUpdate: Date;
    isTracking: boolean;
}
