/**
 * Enum des rôles utilisateur (aligné sur le backend).
 */
export enum Role {
    PATIENT_PROFILE = 'PATIENT_PROFILE',
    DOCTOR_PROFILE = 'DOCTOR_PROFILE',
    CARE_OWNER = 'CARE_OWNER',
    ADMIN = 'ADMIN',
}

/**
 * Options pour la liste déroulante (valeur backend + libellé affiché).
 */
export const ROLE_OPTIONS: { value: Role; label: string }[] = [
    { value: Role.PATIENT_PROFILE, label: 'Patient' },
    { value: Role.DOCTOR_PROFILE, label: 'Médecin' },
    { value: Role.CARE_OWNER, label: 'Aidant / Proche' },
    { value: Role.ADMIN, label: 'Administrateur' },
];

/**
 * Payload d'inscription envoyé au backend.
 */
export interface SignUpRequest {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: Role;
    numTel: string;
    adresse: string;
}
