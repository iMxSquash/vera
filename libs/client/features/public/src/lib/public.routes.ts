import { Route } from '@angular/router';
import { PublicShellComponent } from './shell/public-shell.component';
import { LandingComponent } from './pages/landing/landing.component';
import { VeraComponent } from './pages/vera/vera.component';

export const routes: Route[] = [
  {
    path: '',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        component: LandingComponent,
      },
      {
        path: 'fact-check-test',
        redirectTo: 'vera',
        pathMatch: 'full',
      },
      {
        path: 'vera',
        component: VeraComponent,
      },
    ],
  },
];
