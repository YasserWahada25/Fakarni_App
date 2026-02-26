import { Role } from './sign-up.model';

export interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: Role;
    numTel: string;
    adresse: string;
}

export interface UserUpdateRequest {
    nom: string;
    prenom: string;
    email: string;
    role: Role;
    numTel: string;
    adresse: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}