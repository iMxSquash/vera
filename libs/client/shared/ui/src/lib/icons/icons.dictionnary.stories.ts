import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';
import { icons } from './icons.dictionnary';

export default {
  title: 'Shared/Icons',
  component: IconComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, IconComponent],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<IconComponent>;

type Story = StoryObj<IconComponent>;

export const IconsGallery: Story = {
  render: () => {
    return {
      template: `
        <div class="p-4">
          <h1 class="text-2xl font-bold mb-4">Dictionnaire d'icônes</h1>
          <p class="mb-4">Cliquez sur une carte pour copier le code du composant.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            @for (icon of icons | keyvalue; track icon) {
              <div class="border rounded-lg p-4 flex flex-col items-center hover:bg-gray-50 cursor-pointer transition-colors"
                  (click)="copyToClipboard(icon.key)">
                  <div class="flex items-center justify-center h-20">
                    <vera-icon [name]="icon.key" [size]="32"></vera-icon>
                  </div>
                  <div class="text-center mt-2">
                    <p class="font-mono text-sm break-all">{{ icon.key }}</p>
                  </div>
                  <div class="mt-2 opacity-0 group-hover:opacity-100 text-xs text-gray-500">
                    Cliquer pour copier
                  </div>
              </div>
            }
          </div>
        </div>
      `,
      props: {
        icons,
        copyToClipboard: (iconName: string) => {
          const componentText = `<vera-icon name="${iconName}" size="24"></vera-icon>`;
          navigator.clipboard.writeText(componentText)
            .then(() => {
              // Success notification
              const notification = document.createElement('div');
              notification.textContent = 'Code copié !';
              notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
              document.body.appendChild(notification);
              setTimeout(() => {
                notification.remove();
              }, 2000);
            })
            .catch(err => {
              console.error('Erreur lors de la copie:', err);
            });
        }
      }
    };
  }
};

export const IndividualIcons: Story = {
  render: () => {
    return {
      template: `
        <div class="p-4">
          <h1 class="text-2xl font-bold mb-4">Liste des icônes individuelles</h1>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @for (icon of icons | keyvalue; track icon) {
              <div class="border rounded p-4">
                <div class="flex items-center">
                  <div class="mr-4">
                    <vera-icon [name]="icon.key" [size]="24"></vera-icon>
                  </div>
                  <div>
                    <h3 class="font-semibold">{{ icon.key }}</h3>
                    <code class="text-xs bg-gray-100 px-1 py-0.5 rounded">
                      &lt;vera-icon name="{{ icon.key }}" size="24"&gt;&lt;/vera-icon&gt;
                    </code>
                    <button 
                      class="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      (click)="copyToClipboard(icon.key)">
                      Copier le code
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      `,
      props: {
        icons,
        copyToClipboard: (iconName: string) => {
          const componentText = `<vera-icon name="${iconName}" size="24"></vera-icon>`;
          navigator.clipboard.writeText(componentText)
            .then(() => {
              alert(`Code de l'icône "${iconName}" copié !`);
            })
            .catch(err => {
              console.error('Erreur lors de la copie:', err);
            });
        }
      }
    };
  }
};

export const IconsWithSizes: Story = {
  render: () => {
    return {
      template: `
        <div class="p-4">
          <h1 class="text-2xl font-bold mb-4">Icônes avec différentes tailles</h1>
          <div class="grid grid-cols-1 gap-4">
            @for (icon of selectedIcons; track icon) {
              <div class="border rounded p-4">
                <h3 class="font-semibold mb-2">{{ icon }}</h3>
                <div class="flex items-center space-x-4">
                  @for (size of sizes; track size) {
                    <div class="flex flex-col items-center">
                      <vera-icon [name]="icon" [size]="size"></vera-icon>
                      <span class="text-xs mt-1">{{ size }}px</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      `,
      props: {
        sizes: [16, 24, 32, 48, 64],
        selectedIcons: ['user', 'search', 'calendar', 'heart', 'check'],
        icons
      }
    };
  }
};
