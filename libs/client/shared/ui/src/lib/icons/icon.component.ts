import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconName, icons } from './icons.dictionnary';
import { input } from '@angular/core';

/** IconComponent is a reusable component that displays an SVG icon. */
@Component({
  selector: 'vera-icon',
  template: `<svg 
    [attr.width]="size()" 
    [attr.height]="height() || size()" 
    [attr.viewBox]="computedViewBox()"
    [attr.preserveAspectRatio]="'xMidYMid meet'"
    [ngClass]="color"
    [class]="customClass()"
    [innerHTML]="svg"
    style="vertical-align: middle; display: block;">
  </svg>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class IconComponent {
  /** The DomSanitizer service for sanitizing SVG content. */
  #sanitizer = inject(DomSanitizer);

  /** The name of the icon to be displayed. */
  public name = input.required<IconName>();

  /** The size of the icon in pixels (width). */
  public size = input(24);

  /** The height of the icon in pixels (optional, defaults to size). */
  public height = input<number | undefined>(undefined);

  /** The Tailwind CSS color class to apply to the icon. */
  public color = input('text-current');

  /** Custom classes to apply to the icon. */
  public customClass = input('');

  /** Optional viewBox attribute for the SVG. */
  public viewBox = input<string | undefined>(undefined);

  /** Computed viewBox that adapts to size and height */
  public computedViewBox = computed(() => {
    // Si un viewBox custom est fourni, l'utiliser
    if (this.viewBox()) {
      return this.viewBox();
    }
    // Sinon, créer un viewBox par défaut basé sur les dimensions
    const w = this.size();
    const h = this.height() || this.size();
    return `0 0 ${w} ${h}`;
  });

  /**
   * Returns the sanitized SVG HTML that is safe to use with innerHTML
   * 
   * @returns SafeHtml - The sanitized SVG string
   */
  public get svg(): SafeHtml {
    const svgContent = icons[this.name()] || '';
    return this.#sanitizer.bypassSecurityTrustHtml(svgContent);
  }
}