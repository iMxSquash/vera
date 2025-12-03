import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vera-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-start">
      <div class="max-w-2xl flex flex-col gap-2">
        <!-- Skeleton Answer Text -->
        <div class="bg-white border border-gray-200 rounded-2xl px-4 py-3">
          <div class="flex items-center space-x-2">
            <div class="flex space-x-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s;"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s;"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VeraSkeletonComponent {}
