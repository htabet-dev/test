import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Clone the request to add withCredentials: true
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Token invalide ou expiré - déconnexion automatique
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
