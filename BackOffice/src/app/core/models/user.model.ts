export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'patient' | 'doctor' | 'caregiver' | 'admin';
    status: 'active' | 'inactive';
    lastLogin: Date;
    medicalInfo?: string;
}
