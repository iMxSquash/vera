
import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadPreviewComponent } from '@vera/client/shared/ui';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports:[
    CommonModule,
    ImageUploadPreviewComponent,
    TranslateModule
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})


export class LandingComponent {
  private readonly translationService = inject(TranslationService);
  
  activeIndex = 0;

  @HostListener('window:scroll', [])
onScroll() {
  const wrapper = document.querySelector('.scroll-wrapper') as HTMLElement;
  if (!wrapper) return;

  const start = wrapper.offsetTop;
  const end = start + wrapper.offsetHeight;
  const scroll = window.scrollY;

  let progress = (scroll - start) / (end - start);
  progress = Math.min(Math.max(progress, 0), 1);

  if (progress < 0.20) {
    this.activeIndex = 0;
  } else if (progress < 0.40) {
    this.activeIndex = 1;
  } else if (progress < 0.60) {
    this.activeIndex = 2;
  } else {
    this.activeIndex = 3;
  }

  console.log("progress =", progress, "active =", this.activeIndex);
}

}
