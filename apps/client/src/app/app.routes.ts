import { Route } from '@angular/router';
import { authGuard, guestGuard } from '@vera/client/shared/guards';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('@vera/client/features/public').then((m) => m.routes),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('@vera/client/features/auth').then((m) => m.routes),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('@vera/client/features/admin').then((m) => m.routes),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
