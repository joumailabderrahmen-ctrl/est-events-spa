import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'est_jwt';
  private readonly USER_KEY  = 'est_user';
  private url = `${environment.apiUrl}/auth`;

  private currentUser$ = new BehaviorSubject<User | null>(this.storedUser());
  user$ = this.currentUser$.asObservable();

  constructor(private http: HttpClient) {}

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, { name, email, password })
      .pipe(tap(r => this.store(r)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, { email, password })
      .pipe(tap(r => this.store(r)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get currentUser(): User | null {
    return this.currentUser$.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  private store(r: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, r.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(r.user));
    this.currentUser$.next(r.user);
  }

  private storedUser(): User | null {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'); }
    catch { return null; }
  }
}
