import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const passcodeGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const isAuthorized = localStorage.getItem('authorized') === 'true';

  if (isAuthorized) {
    return true;
  }

  router.navigate(['/authorize']);
  return false;
};