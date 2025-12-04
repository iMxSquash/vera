
import { Component, inject, ElementRef, AfterViewInit } from '@angular/core';
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


export class LandingComponent implements AfterViewInit {
  private readonly translationService = inject(TranslationService);
  private readonly elementRef = inject(ElementRef);
  
  activeIndex = 0;

  ngAfterViewInit(): void {
    const scrollContainer = this.elementRef.nativeElement.closest('main');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', () => this.updateActiveIndex());
    }
  }

  private updateActiveIndex(): void {
    const scrollContainer = this.elementRef.nativeElement.closest('main') as HTMLElement;
    if (!scrollContainer) return;

    const wrapper = this.elementRef.nativeElement.querySelector('.scroll-wrapper') as HTMLElement;
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    
    const start = wrapperRect.top - containerRect.top + scrollContainer.scrollTop;
    const end = start + wrapper.offsetHeight;
    const scroll = scrollContainer.scrollTop;

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
  }

}
