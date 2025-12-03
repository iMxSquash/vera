import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { hyperlinkVariants, type HyperlinkVariants } from './hyperlink.theme';

@Component({
  selector: 'app-hyperlink',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a
      [routerLink]="!isAction() && !this.external() ? href() : null"
      [href]="isAction() ? null : (isExternal() ? href() : null)"
      [class]="linkClasses()"
      [target]="computedTarget()"
      [rel]="computedRel()"
      [style.cursor]="isAction() ? 'pointer' : 'auto'"
      (click)="handleClick($event)"
    >
      <ng-content></ng-content>
    </a>
  `,
})
export class HyperlinkComponent {
  // Inputs
  href = input<string>('');
  variant = input<HyperlinkVariants['variant']>('primary');
  external = input(false);
  target = input<'_self' | '_blank' | '_parent' | '_top'>('_self');
  rel = input('');
  isAction = input(false);

  // Outputs
  action = output<void>();

  // Computed values
  isExternal = computed(() => this.external() && !!this.href());

  computedTarget = computed(() => (this.external() ? '_blank' : this.target()));
  computedRel = computed(() => (this.external() ? 'noopener noreferrer' : this.rel()));

  linkClasses() {
    return hyperlinkVariants({
      variant: this.variant(),
    });
  }

  handleClick(event: Event): void {
    // Si c'est une action, prévenir la navigation par défaut
    if (this.isAction()) {
      event.preventDefault();
      this.action.emit();
    }
  }
}
