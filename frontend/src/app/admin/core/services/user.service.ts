import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';
import { environment } from '../../../../environments/environment';

const API_BASE = environment.apiUrl || '';
const API = API_BASE ? `${API_BASE}/api` : '/api';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) {}

    /** GET /api/users */
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${API}/users`);
    }

    /** GET /api/users/:id */
    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${API}/users/${id}`);
    }

    /** POST /api/users */
    addUser(body: CreateUserRequest): Observable<User> {
        return this.http.post<User>(`${API}/users`, body);
    }

    /** PUT /api/users/:id */
    updateUser(id: string, body: UpdateUserRequest): Observable<User> {
        return this.http.put<User>(`${API}/users/${id}`, body);
    }

    /** DELETE /api/users/:id */
    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${API}/users/${id}`);
    }
}
