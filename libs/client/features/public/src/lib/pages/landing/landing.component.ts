
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadPreviewComponent } from '@vera/client/shared/ui';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports:[
    CommonModule,
    ImageUploadPreviewComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})


export class LandingComponent {

  activeIndex = 0; // rubrique active par défaut (la 1ère)

  @HostListener('window:scroll', [])
onScroll() {
  const wrapper = document.querySelector('.scroll-wrapper') as HTMLElement;
  if (!wrapper) return;

  const start = wrapper.offsetTop;          // position Y du début
  const end = start + wrapper.offsetHeight; // fin de la zone
  const scroll = window.scrollY;

  // On normalise 0 → 1
  let progress = (scroll - start) / (end - start);
  progress = Math.min(Math.max(progress, 0), 1);

  // Seuils personnalisés
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
