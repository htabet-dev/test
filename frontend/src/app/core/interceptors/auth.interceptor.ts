import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, switchMap, of, Observable } from 'rxjs';

// Indique si un refresh est en cours pour éviter les appels multiples
let isRefreshing = false;
// File d'attente des requêtes en attente de refresh
let tokenRefreshQueue: Array<(success: boolean) => void> = [];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Clone the request to add withCredentials: true
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Token invalide ou expiré - tentative de refresh
        if (!isRefreshing) {
          isRefreshing = true;
          
          // Tenter de rafraîchir le token
          return authService.refreshToken().pipe(
            switchMap(success => {
              isRefreshing = false;
              
              // Exécuter toutes les requêtes en attente
              tokenRefreshQueue.forEach(callback => callback(success));
              tokenRefreshQueue = [];
              
              if (success) {
                // Réessayer la requête originale avec le nouveau token
                return next(authReq.clone());
              } else {
                // Refresh échoué - déconnexion
                authService.logout().subscribe();
                return throwError(() => new Error('Session expirée'));
              }
            }),
            catchError(err => {
              isRefreshing = false;
              tokenRefreshQueue = [];
              authService.logout().subscribe();
              return throwError(() => err);
            })
          );
        } else {
          // Un refresh est déjà en cours, ajouter à la file d'attente
          return new Observable(subscriber => {
            tokenRefreshQueue.push((success: boolean) => {
              if (success) {
                // Réessayer la requête originale
                next(authReq.clone()).subscribe({
                  next: res => subscriber.next(res),
                  error: err => subscriber.error(err),
                  complete: () => subscriber.complete()
                });
              } else {
                subscriber.error('Session expirée');
              }
            });
          });
        }
      }
      return throwError(() => error);
    })
  );
};
