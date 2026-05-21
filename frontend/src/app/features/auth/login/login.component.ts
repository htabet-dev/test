import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgIf],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Connexion</h1>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              placeholder="votre@email.com"
              [class.error]="email?.invalid && email?.touched"
            />
            <small *ngIf="email?.invalid && email?.touched" class="error-message">
              Email invalide
            </small>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              placeholder="Votre mot de passe"
              [class.error]="password?.invalid && password?.touched"
            />
            <small *ngIf="password?.invalid && password?.touched" class="error-message">
              Mot de passe requis (min 6 caractères)
            </small>
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading"
            class="btn-primary"
          >
            {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>

          <div *ngIf="errorMessage" class="error-message global">
            {{ errorMessage }}
          </div>
        </form>

        <p class="register-link">
          Pas encore de compte ? 
          <a routerLink="/register">S'inscrire</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 5px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .error-message.global {
      margin-top: 1rem;
      text-align: center;
      padding: 0.5rem;
      background: #fdeaea;
      border-radius: 5px;
    }

    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .register-link {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  private destroy$ = new Subject<void>();

  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // S'abonner à l'état de chargement avec Observable
    this.authService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;

    // Utilisation des Observables au lieu des Promises
    this.authService.login(
      this.email?.value,
      this.password?.value
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        // La navigation est gérée dans le service
      },
      error: (error) => {
        this.errorMessage = error;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
