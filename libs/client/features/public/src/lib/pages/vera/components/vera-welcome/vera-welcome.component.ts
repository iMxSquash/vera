import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export type MediaType = 'photo' | 'video' | 'audio';

@Component({
  selector: 'app-vera-welcome',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './vera-welcome.component.html',
  styleUrl: './vera-welcome.component.css',
})
export class VeraWelcomeComponent {
}
