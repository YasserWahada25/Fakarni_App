import { Injectable } from '@angular/core';

export interface StaticTestUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

export const STATIC_TEST_USER: StaticTestUser = {
    id: 1,
    name: 'Utilisateur Test',
    email: 'test@fakarni.com',
    role: 'Utilisateur'
};

@Injectable({
    providedIn: 'root'
})
export class TestUserContextService {

    initialize(): void {
        if (typeof window === 'undefined') {
            return;
        }

        const localStorageRef = window.localStorage;
        localStorageRef.setItem('userId', String(STATIC_TEST_USER.id));
        localStorageRef.setItem('user_id', String(STATIC_TEST_USER.id));
        localStorageRef.setItem('uid', String(STATIC_TEST_USER.id));
        localStorageRef.setItem('userName', STATIC_TEST_USER.name);
        localStorageRef.setItem('userEmail', STATIC_TEST_USER.email);
        localStorageRef.setItem('userRole', STATIC_TEST_USER.role);
    }
}

export function initializeTestUserContextFactory(service: TestUserContextService): () => void {
    return () => service.initialize();
}
