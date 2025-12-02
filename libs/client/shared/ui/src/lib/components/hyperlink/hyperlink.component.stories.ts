import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { HyperlinkComponent } from './hyperlink.component';

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
      description: 'URL destination',
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
  },
};

export default meta;
type Story = StoryObj<HyperlinkComponent>;

export const Primary: Story = {
  args: {
    href: '/',
    variant: 'primary',
    external: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-hyperlink [href]="href" [variant]="variant" [external]="external">
      Primary Link
    </app-hyperlink>`,
  }),
};

export const Secondary: Story = {
  args: {
    href: '/',
    variant: 'secondary',
    external: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-hyperlink [href]="href" [variant]="variant" [external]="external">
      Secondary Link
    </app-hyperlink>`,
  }),
};

export const Muted: Story = {
  args: {
    href: '/',
    variant: 'muted',
    external: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-hyperlink [href]="href" [variant]="variant" [external]="external">
      Muted Link
    </app-hyperlink>`,
  }),
};

export const External: Story = {
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
          <h3 class="text-lg font-semibold mb-2">Primary</h3>
          <app-hyperlink href="/" variant="primary">
            Primary Link
          </app-hyperlink>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Secondary</h3>
          <app-hyperlink href="/" variant="secondary">
            Secondary Link
          </app-hyperlink>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Muted</h3>
          <app-hyperlink href="/" variant="muted">
            Muted Link
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
            primary link
          </app-hyperlink>
          in the middle of the text.
        </p>
        <p>
          This is a paragraph with a
          <app-hyperlink href="/" variant="secondary">
            secondary link
          </app-hyperlink>
          in the middle of the text.
        </p>
        <p>
          This is a paragraph with a
          <app-hyperlink href="/" variant="muted">
            muted link
          </app-hyperlink>
          in the middle of the text.
        </p>
      </div>
    `,
  }),
};
