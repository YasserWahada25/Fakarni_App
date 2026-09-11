import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Ne pas envoyer de Bearer sur les routes publiques : un JWT expiré/invalide encore présent
 * dans sessionStorage ferait rejeter la requête (401) avant les règles permitAll côté API.
 */
function shouldSendAuthHeader(req: { url: string; method: string }): boolean {
  const path = req.url.split('?')[0].toLowerCase();
  const m = req.method.toUpperCase();

  if (m === 'POST' && path.endsWith('/api/users')) {
    return false;
  }

  if (
    m === 'POST' &&
    /\/auth\/(login|google|facebook|forgot-password|reset-password)\/?$/i.test(path)
  ) {
    return false;
  }

  return true;
}

function shouldUseCredentials(url: string): boolean {
  const lowered = url.toLowerCase();
  return (
    lowered.startsWith('/api') ||
    lowered.startsWith('/auth') ||
    lowered.startsWith('/session') ||
    lowered.startsWith('/ws') ||
    lowered.includes('fakarni-gateway.azurewebsites.net')
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  const withCredentials = shouldUseCredentials(req.url);

  if (!token || !shouldSendAuthHeader(req)) {
    return next(req.clone({ withCredentials }));
  }

  const clonedReq = req.clone({
    withCredentials,
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedReq);
};
