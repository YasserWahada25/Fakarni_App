import { Role } from '../../../auth/models/sign-up.model';

/** Utilisateur tel que renvoyé par le backend (GET /api/users, etc.). */
export interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: Role;
    numTel: string | null;
    adresse: string | null;
}

/** Payload création utilisateur (POST /api/users). */
export interface CreateUserRequest {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: Role;
    numTel?: string;
    adresse?: string;
}

/** Payload modification utilisateur (PUT /api/users/:id). */
export interface UpdateUserRequest {
    nom?: string;
    prenom?: string;
    email?: string;
    password?: string;
    role?: Role;
    numTel?: string;
    adresse?: string;
}
