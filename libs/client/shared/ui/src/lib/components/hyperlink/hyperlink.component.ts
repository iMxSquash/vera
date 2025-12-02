import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { hyperlinkVariants, type HyperlinkVariants } from './hyperlink.theme';

@Component({
  selector: 'app-hyperlink',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a
      [routerLink]="href()"
      [class]="linkClasses()"
      [target]="computedTarget()"
      [rel]="computedRel()"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class HyperlinkComponent {
  // Inputs
  href = input.required<string>();
  variant = input<HyperlinkVariants['variant']>('primary');
  external = input(false);
  target = input<'_self' | '_blank' | '_parent' | '_top'>('_self');
  rel = input('');

  // Computed values
  computedTarget = computed(() => (this.external() ? '_blank' : this.target()));
  computedRel = computed(() => (this.external() ? 'noopener noreferrer' : this.rel()));

  linkClasses() {
    return hyperlinkVariants({
      variant: this.variant(),
    });
  }
}
