import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string };
export type MeResponse = { authenticated: boolean; role: string; email: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'smarthr_token';

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', payload).pipe(
      tap((res) => {
        if (res?.token) localStorage.setItem(this.tokenKey, res.token);
      })
    );
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>('/api/auth/me');
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
