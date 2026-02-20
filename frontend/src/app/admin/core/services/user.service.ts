import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private users: User[] = [
        { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', role: 'admin', status: 'active', lastLogin: new Date('2023-10-25T10:00:00') },
        { id: 2, firstName: 'Marie', lastName: 'Curie', email: 'marie.curie@example.com', role: 'doctor', status: 'active', lastLogin: new Date('2023-10-24T14:30:00') },
        { id: 3, firstName: 'Pierre', lastName: 'Martin', email: 'pierre.martin@example.com', role: 'patient', status: 'inactive', lastLogin: new Date('2023-09-15T09:00:00') },
        { id: 4, firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@example.com', role: 'caregiver', status: 'active', lastLogin: new Date('2023-10-26T08:15:00') },
        { id: 5, firstName: 'Luc', lastName: 'Petit', email: 'luc.petit@example.com', role: 'patient', status: 'active', lastLogin: new Date('2023-10-20T11:45:00') },
    ];

    private usersSubject = new BehaviorSubject<User[]>(this.users);
    users$ = this.usersSubject.asObservable();

    constructor() { }

    getUsers(): Observable<User[]> {
        return this.users$;
    }

    getUserById(id: number): Observable<User | undefined> {
        const user = this.users.find(u => u.id === id);
        return of(user);
    }

    addUser(user: Omit<User, 'id' | 'lastLogin'>): Observable<User> {
        const newUser: User = {
            ...user,
            id: this.users.length + 1,
            lastLogin: new Date() // Set current time as last login for new user (or null)
        };
        this.users = [...this.users, newUser];
        this.usersSubject.next(this.users);
        return of(newUser);
    }

    updateUser(updatedUser: User): Observable<User> {
        this.users = this.users.map(u => u.id === updatedUser.id ? updatedUser : u);
        this.usersSubject.next(this.users);
        return of(updatedUser);
    }

    deleteUser(id: number): Observable<boolean> {
        this.users = this.users.filter(u => u.id !== id);
        this.usersSubject.next(this.users);
        return of(true);
    }
}
