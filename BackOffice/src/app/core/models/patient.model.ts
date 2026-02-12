export interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: Date;
    role: string; // e.g., 'Patient Alzheimer', 'Patient Parkinson'
    lastConsultation: Date;
    photoUrl?: string;
    metrics?: HealthMetric[];
}

export interface HealthMetric {
    date: Date;
    type: 'cognitive' | 'mobility' | 'memory' | 'other';
    value: number; // Score out of 100 or specific unit
    unit?: string;
}
