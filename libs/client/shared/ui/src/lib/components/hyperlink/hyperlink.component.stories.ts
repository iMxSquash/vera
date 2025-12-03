import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { HyperlinkComponent } from './hyperlink.component';
import { fn } from '@storybook/test';

const meta: Meta<HyperlinkComponent> = {
  component: HyperlinkComponent,
  title: 'Components/Hyperlink',
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
    moduleMetadata({
      imports: [HyperlinkComponent],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    href: {
      control: 'text',
      description: 'URL destination (for routes or external links)',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'muted'],
      description: 'Link style variant',
    },
    external: {
      control: 'boolean',
      description: 'Open in new window (adds target="_blank" and rel="noopener noreferrer")',
    },
    target: {
      control: 'select',
      options: ['_self', '_blank', '_parent', '_top'],
      description: 'Link target behavior',
    },
    rel: {
      control: 'text',
      description: 'Custom rel attribute',
    },
    action: {
      description: 'Emit when clicked (for buttons-like behavior)',
    },
  },
};

export default meta;
type Story = StoryObj<HyperlinkComponent>;

export const PrimaryRoute: Story = {
  args: {
    href: '/',
    variant: 'primary',
    external: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-hyperlink [href]="href" [variant]="variant" [external]="external">
      Primary Route Link
    </app-hyperlink>`,
  }),
};

export const SecondaryRoute: Story = {
  args: {
    href: '/',
    variant: 'secondary',
    external: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-hyperlink [href]="href" [variant]="variant" [external]="external">
      Secondary Route Link
    </app-hyperlink>`,
  }),
};

export const MutedRoute: Story = {
  args: {
    href: '/',
    variant: 'muted',
    external: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-hyperlink [href]="href" [variant]="variant" [external]="external">
      Muted Route Link
    </app-hyperlink>`,
  }),
};

export const ExternalLink: Story = {
  args: {
    href: 'https://example.com',
    variant: 'primary',
    external: true,
  },
  render: (args) => ({
    props: args,
    template: `<app-hyperlink [href]="href" [variant]="variant" [external]="external">
      External Link
    </app-hyperlink>`,
  }),
};

export const ActionButton: Story = {
  args: {
    variant: 'primary',
    isAction: true,
  },
  render: (args) => ({
    props: { ...args, onAction: fn() },
    template: `<app-hyperlink [variant]="variant" [isAction]="isAction" (action)="onAction()">
      Action Link (Click me)
    </app-hyperlink>`,
  }),
};

export const ActionButtonSecondary: Story = {
  args: {
    variant: 'secondary',
    isAction: true,
  },
  render: (args) => ({
    props: { ...args, onAction: fn() },
    template: `<app-hyperlink [variant]="variant" [isAction]="isAction" (action)="onAction()">
      Action Link Secondary
    </app-hyperlink>`,
  }),
};

export const InternalLink: Story = {
  args: {
    href: '/about',
    variant: 'primary',
    external: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-hyperlink [href]="href" [variant]="variant" [external]="external">
      Internal Link
    </app-hyperlink>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4">
        <div>
          <h3 class="text-lg font-semibold mb-2">Primary Route</h3>
          <app-hyperlink href="/" variant="primary">
            Primary Route Link
          </app-hyperlink>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Secondary Route</h3>
          <app-hyperlink href="/" variant="secondary">
            Secondary Route Link
          </app-hyperlink>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Muted Route</h3>
          <app-hyperlink href="/" variant="muted">
            Muted Route Link
          </app-hyperlink>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Primary Action</h3>
          <app-hyperlink variant="primary" [isAction]="true" (action)="console.log('clicked')">
            Primary Action
          </app-hyperlink>
        </div>
      </div>
    `,
  }),
};

export const WithContext: Story = {
  render: () => ({
    template: `
      <div class="prose max-w-2xl">
        <p>
          This is a paragraph with a
          <app-hyperlink href="/" variant="primary">
            primary route link
          </app-hyperlink>
          in the middle of the text.
        </p>
        <p>
          This is a paragraph with a
          <app-hyperlink href="/" variant="secondary">
            secondary route link
          </app-hyperlink>
          in the middle of the text.
        </p>
        <p>
          This is a paragraph with a
          <app-hyperlink href="/" variant="muted">
            muted route link
          </app-hyperlink>
          in the middle of the text.
        </p>
      </div>
    `,
  }),
};

export const LanguageSwitcher: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-0.5 bg-white rounded-md border border-gray-200 p-0.5">
        <app-hyperlink variant="primary" [isAction]="true" (action)="console.log('FR clicked')" class="px-2.5 py-1 rounded font-semibold text-xs">
          FR
        </app-hyperlink>
        <div class="w-px h-4 bg-gray-200"></div>
        <app-hyperlink variant="muted" [isAction]="true" (action)="console.log('EN clicked')" class="px-2.5 py-1 rounded font-semibold text-xs">
          EN
        </app-hyperlink>
      </div>
    `,
  }),
};
