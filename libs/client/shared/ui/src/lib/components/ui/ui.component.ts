import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.css',
})
export class UiComponent {
  title = input<string>('Composant UI');
  description = input<string>(
    'Ceci est un composant réutilisable avec Tailwind CSS'
  );
}
