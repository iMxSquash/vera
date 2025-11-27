import { Route } from '@angular/router';
import { PublicShellComponent } from './shell/public-shell.component';
import { LandingComponent } from './pages/landing/landing.component';
import { FactCheckTesterComponent } from './pages/fact-check-tester/fact-check-tester.component';

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
        component: FactCheckTesterComponent,
      }
    ],
  },
];
