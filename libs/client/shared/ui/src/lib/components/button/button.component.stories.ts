import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: 'Components/Button',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Button style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type',
    },
    click: {
      description: 'Click event emitter',
    },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    type: 'button',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled" [type]="type">
      Click me
    </app-button>`,
  }),
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">
      Secondary Button
    </app-button>`,
  }),
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">
      Outline Button
    </app-button>`,
  }),
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">
      Ghost Button
    </app-button>`,
  }),
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">
      Small
    </app-button>`,
  }),
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">
      Large Button
    </app-button>`,
  }),
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">
      Disabled Button
    </app-button>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-2">Primary</h3>
          <app-button variant="primary">Primary</app-button>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Secondary</h3>
          <app-button variant="secondary">Secondary</app-button>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Outline</h3>
          <app-button variant="outline">Outline</app-button>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Ghost</h3>
          <app-button variant="ghost">Ghost</app-button>
        </div>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-2">Small</h3>
          <app-button size="sm">Small Button</app-button>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Medium (Default)</h3>
          <app-button size="md">Medium Button</app-button>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Large</h3>
          <app-button size="lg">Large Button</app-button>
        </div>
      </div>
    `,
  }),
};
