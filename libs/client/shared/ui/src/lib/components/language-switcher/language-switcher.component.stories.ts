import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const meta: Meta<LanguageSwitcherComponent> = {
  component: LanguageSwitcherComponent,
  title: 'Components/LanguageSwitcher',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [LanguageSwitcherComponent, TranslateModule.forRoot()],
      providers: [TranslateService],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<LanguageSwitcherComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-language-switcher></app-language-switcher>`,
  }),
};

export const InContext: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4 p-4 border-b border-gray-200">
        <span class="text-sm font-medium text-gray-700">Language:</span>
        <app-language-switcher></app-language-switcher>
      </div>
    `,
  }),
};
