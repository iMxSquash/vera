import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '@vera/client/shared/ui';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [RouterModule, HeaderComponent],
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.css',
})
export class PublicShellComponent {}
