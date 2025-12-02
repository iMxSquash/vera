import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { buttonVariants, type ButtonVariants } from './button.theme';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses()"
      [disabled]="disabled()"
      (click)="click.emit()"
      [type]="type()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  // Inputs
  variant = input<ButtonVariants['variant']>('primary');
  size = input<ButtonVariants['size']>('md');
  disabled = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');

  // Outputs
  click = output<void>();

  buttonClasses() {
    return buttonVariants({
      variant: this.variant(),
      size: this.size(),
    });
  }
}
