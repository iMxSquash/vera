import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconName, icons } from './icons.dictionnary';
import { input } from '@angular/core';

/** IconComponent is a reusable component that displays an SVG icon. */
@Component({
  selector: 'vera-icon',
  template: `<svg 
    [attr.width]="size()" 
    [attr.height]="size()" 
    [attr.viewBox]="viewBox() || '0 0 24 24'"
    [ngClass]="color"
    [class]="customClass()"
    [innerHTML]="svg"
    style="vertical-align: middle;">
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

  /** The size of the icon in pixels. */
  public size = input(24);

  /** The Tailwind CSS color class to apply to the icon. */
  public color = input('text-current');

  /** Custom classes to apply to the icon. */
  public customClass = input('');

  /** Optional viewBox attribute for the SVG. */
  public viewBox = input<string | undefined>(undefined);


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