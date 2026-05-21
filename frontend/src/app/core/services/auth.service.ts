import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

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
  
  // Signals pour l'état d'authentification
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  
  // Computed signals
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public currentUser = computed(() => this.currentUserSignal());
  public isLoading = computed(() => this.isLoadingSignal());

  constructor() {
    // Vérifier l'état d'authentification au démarrage
    this.checkAuthStatus();
  }

  /**
   * Vérifie si l'utilisateur est authentifié en appelant /api/me
   * Le cookie HTTP-Only sera automatiquement envoyé par le navigateur
   */
  checkAuthStatus(): void {
    this.isLoadingSignal.set(true);
    
    this.http.get<AuthResponse>(`${this.API_URL}/me`, { withCredentials: true })
      .pipe(
        catchError(() => {
          this.currentUserSignal.set(null);
          this.isLoadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response?.user) {
          this.currentUserSignal.set(response.user);
        } else {
          this.currentUserSignal.set(null);
        }
        this.isLoadingSignal.set(false);
      });
  }

  /**
   * Connexion de l'utilisateur
   * Le token JWT sera stocké dans un cookie HTTP-Only par le backend
   */
  login(email: string, password: string): Promise<boolean> {
    this.isLoadingSignal.set(true);
    
    return new Promise((resolve, reject) => {
      this.http.post<AuthResponse>(
        `${this.API_URL}/login`,
        { email, password },
        { withCredentials: true }
      ).pipe(
        tap(() => {
          // Après connexion réussie, vérifier l'état utilisateur
          this.checkAuthStatus();
        }),
        catchError(error => {
          this.isLoadingSignal.set(false);
          reject(error.error?.error || 'Erreur de connexion');
          return of(null);
        })
      ).subscribe(response => {
        this.isLoadingSignal.set(false);
        if (response?.user) {
          this.currentUserSignal.set(response.user);
          this.router.navigate(['/dashboard']);
          resolve(true);
        } else {
          reject('Réponse invalide du serveur');
        }
      });
    });
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<boolean> {
    this.isLoadingSignal.set(true);
    
    return new Promise((resolve, reject) => {
      this.http.post<AuthResponse>(
        `${this.API_URL}/register`,
        userData,
        { withCredentials: true }
      ).pipe(
        catchError(error => {
          this.isLoadingSignal.set(false);
          reject(error.error?.errors || error.error?.error || 'Erreur d\'inscription');
          return of(null);
        })
      ).subscribe(response => {
        this.isLoadingSignal.set(false);
        if (response?.message === 'User created successfully') {
          // Rediriger vers la page de connexion après inscription
          this.router.navigate(['/login']);
          resolve(true);
        } else {
          reject('Erreur lors de l\'inscription');
        }
      });
    });
  }

  /**
   * Déconnexion de l'utilisateur
   * Nettoie l'état local et invalide le cookie côté serveur
   */
  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(null))
      )
      .subscribe(() => {
        this.currentUserSignal.set(null);
        this.router.navigate(['/login']);
      });
  }
}
