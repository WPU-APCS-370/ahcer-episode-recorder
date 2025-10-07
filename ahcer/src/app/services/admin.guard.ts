import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UsersService } from '../services/users.service';
import { take, map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UsersService);

  return userService.userId$.pipe(
    take(1),
    map(uid => {
      const local = localStorage.getItem('user');
      const user = local ? JSON.parse(local) : null;


      if (!uid) {
        return router.createUrlTree(['/login']);
      }

      if (user?.isAdmin) {
        return true;
      }

      return router.createUrlTree(['/']);
    })
  );
};
