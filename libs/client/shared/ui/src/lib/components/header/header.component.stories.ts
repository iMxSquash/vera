import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './header.component';

const meta: Meta<HeaderComponent> = {
  component: HeaderComponent,
  title: 'Components/Header',
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([]), TranslateService],
    }),
    moduleMetadata({
      imports: [HeaderComponent, TranslateModule.forRoot()],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<HeaderComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-header></app-header>`,
  }),
};

export const WithContent: Story = {
  render: () => ({
    template: `
      <app-header></app-header>
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-4xl font-bold mb-4">Welcome to Vera</h1>
        <p class="text-gray-600 text-lg">
          This is a sample page showing the header component in context.
        </p>
      </main>
    `,
  }),
};
