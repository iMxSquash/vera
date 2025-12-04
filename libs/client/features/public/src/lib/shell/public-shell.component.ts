import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.css',
})
export class PublicShellComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
