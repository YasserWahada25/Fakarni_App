export interface GeographicZone {
    id: number;
    name: string;
    type: 'authorized' | 'danger' | 'forbidden';
    coordinates: ZoneCoordinates;
    patientIds: number[];
    isActive: boolean;
    notifyOnExit: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ZoneCoordinates {
    type: 'circle' | 'polygon';
    // For circle
    center?: { lat: number; lng: number };
    radius?: number; // in meters
    // For polygon
    points?: { lat: number; lng: number }[];
}

export interface PatientLocation {
    patientId: number;
    patientName: string;
    currentPosition: { lat: number; lng: number };
    lastUpdate: Date;
    isTracking: boolean;
}
