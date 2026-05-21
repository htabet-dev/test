import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, catchError, tap, of, throwError } from 'rxjs';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user?: User;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = 'http://localhost:8000/api';
  
  // BehaviorSubject pour l'état d'authentification (Observable)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  // Observables publics
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.currentUserSubject.asObservable().pipe(
    tap(user => console.log('Auth state changed:', user !== null))
  );
  public isLoading$ = this.isLoadingSubject.asObservable();
  
  // Getter pour accès synchrone si nécessaire
  get currentUserValue(): User | null {
    return this.currentUserSubject.getValue();
  }
  
  get isAuthenticated(): boolean {
    return this.currentUserSubject.getValue() !== null;
  }

  constructor() {
    // Vérifier l'état d'authentification au démarrage
    this.checkAuthStatus();
  }

  /**
   * Vérifie si l'utilisateur est authentifié en appelant /api/me
   * Le cookie HTTP-Only sera automatiquement envoyé par le navigateur
   */
  checkAuthStatus(): Observable<User | null> {
    this.isLoadingSubject.next(true);
    
    return this.http.get<AuthResponse>(`${this.API_URL}/me`, { withCredentials: true }).pipe(
      tap(response => {
        if (response?.user) {
          this.currentUserSubject.next(response.user);
        } else {
          this.currentUserSubject.next(null);
        }
        this.isLoadingSubject.next(false);
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        this.isLoadingSubject.next(false);
        return of(null);
      })
    );
  }

  /**
   * Connexion de l'utilisateur
   * Le token JWT sera stocké dans un cookie HTTP-Only par le backend
   * Retourne un Observable au lieu d'une Promise
   */
  login(email: string, password: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<AuthResponse>(
      `${this.API_URL}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.isLoadingSubject.next(false);
        if (response?.user) {
          this.currentUserSubject.next(response.user);
          this.router.navigate(['/dashboard']);
        }
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(() => error.error?.error || 'Erreur de connexion');
      })
    );
  }

  /**
   * Inscription d'un nouvel utilisateur
   * Retourne un Observable au lieu d'une Promise
   */
  register(userData: { email: string; password: string; firstName: string; lastName: string }): Observable<boolean> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<AuthResponse>(
      `${this.API_URL}/register`,
      userData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.isLoadingSubject.next(false);
        if (response?.message === 'User created successfully') {
          // Rediriger vers la page de connexion après inscription
          this.router.navigate(['/login']);
        }
      }),
      catchError(error => {
        this.isLoadingSubject.next(false);
        return throwError(() => error.error?.errors || error.error?.error || 'Erreur d\'inscription');
      })
    );
  }

  /**
   * Déconnexion de l'utilisateur
   * Nettoie l'état local et invalide le cookie côté serveur
   */
  logout(): Observable<void> {
    return this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        // Même en cas d'erreur, on déconnecte l'utilisateur localement
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
        return of(undefined);
      })
    );
  }

  /**
   * Rafraîchit le token d'accès en utilisant le refresh token
   * Appelé automatiquement quand le token d'accès expire (401)
   */
  refreshToken(): Observable<boolean> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/refresh-token`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Après rafraîchissement, on recharge les infos utilisateur
        this.checkAuthStatus().subscribe();
      }),
      catchError(() => {
        // Si le refresh échoue, on déconnecte
        this.currentUserSubject.next(null);
        return of(false);
      })
    );
  }
}
