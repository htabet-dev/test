import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Tableau de bord</h1>
        <div class="user-info">
          @if (authService.currentUser(); as user) {
            <span>Bienvenue, {{ user.firstName }} {{ user.lastName }}</span>
          }
          <button (click)="logout()" class="btn-logout">Déconnexion</button>
        </div>
      </header>

      <main class="dashboard-content">
        <div class="welcome-card">
          <h2>🎉 Authentification réussie !</h2>
          <p>
            Vous êtes maintenant connecté avec des cookies HTTP-Only sécurisés.
            Le token JWT est stocké dans un cookie inaccessible à JavaScript,
            ce qui protège votre application contre les attaques XSS.
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <h3>🔒 Sécurité maximale</h3>
            <p>Cookies HTTP-Only + SameSite=Lax + Secure en production</p>
          </div>
          <div class="feature-card">
            <h3>⚡ Angular Signals</h3>
            <p>Gestion réactive de l'état d'authentification</p>
          </div>
          <div class="feature-card">
            <h3>🛡️ Protection CSRF</h3>
            <p>Attribut SameSite pour limiter les requêtes cross-site</p>
          </div>
          <div class="feature-card">
            <h3>🔄 Auto-déconnexion</h3>
            <p>Gestion automatique des tokens expirés (401)</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #f5f7fa;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info span {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .dashboard-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 2rem;
    }

    .welcome-card h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .welcome-card p {
      color: #666;
      line-height: 1.6;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .feature-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-card h3 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .feature-card p {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
    }
  `]
})
export class DashboardComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}
