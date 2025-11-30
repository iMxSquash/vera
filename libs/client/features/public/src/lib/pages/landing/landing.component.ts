import { Component } from '@angular/core';
import { ImageUploadPreviewComponent } from '@vera/client/shared/ui';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ImageUploadPreviewComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {}
