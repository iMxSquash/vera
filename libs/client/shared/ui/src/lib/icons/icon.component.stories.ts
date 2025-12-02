import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { IconComponent } from './icon.component';

const meta: Meta<IconComponent> = {
  component: IconComponent,
  title: 'Components/Icon',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [IconComponent],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Icon name from the dictionary',
    },
    size: {
      control: 'number',
      description: 'Icon size in pixels',
    },
    color: {
      control: 'text',
      description: 'Tailwind CSS color class',
    },
    customClass: {
      control: 'text',
      description: 'Custom CSS classes to apply',
    },
  },
};

export default meta;
type Story = StoryObj<IconComponent>;

export const BurgerMenu: Story = {
  args: {
    name: 'burger-menu',
    size: 24,
    color: 'text-gray-900',
    customClass: '',
  },
  render: (args) => ({
    props: args,
    template: `<vera-icon [name]="name" [size]="size" [color]="color" [customClass]="customClass"></vera-icon>`,
  }),
};

export const Cross: Story = {
  args: {
    name: 'cross',
    size: 24,
    color: 'text-gray-900',
    customClass: '',
  },
  render: (args) => ({
    props: args,
    template: `<vera-icon [name]="name" [size]="size" [color]="color" [customClass]="customClass"></vera-icon>`,
  }),
};

export const Add: Story = {
  args: {
    name: 'add',
    size: 24,
    color: 'text-gray-900',
    customClass: '',
  },
  render: (args) => ({
    props: args,
    template: `<vera-icon [name]="name" [size]="size" [color]="color" [customClass]="customClass"></vera-icon>`,
  }),
};

export const Send: Story = {
  args: {
    name: 'send',
    size: 24,
    color: 'text-gray-900',
    customClass: '',
  },
  render: (args) => ({
    props: args,
    template: `<vera-icon [name]="name" [size]="size" [color]="color" [customClass]="customClass"></vera-icon>`,
  }),
};

export const SearchImg: Story = {
  args: {
    name: 'search-img',
    size: 24,
    color: 'text-gray-900',
    customClass: '',
  },
  render: (args) => ({
    props: args,
    template: `<vera-icon [name]="name" [size]="size" [color]="color" [customClass]="customClass"></vera-icon>`,
  }),
};

export const Mic: Story = {
  args: {
    name: 'mic',
    size: 24,
    color: 'text-gray-900',
    customClass: '',
  },
  render: (args) => ({
    props: args,
    template: `<vera-icon [name]="name" [size]="size" [color]="color" [customClass]="customClass"></vera-icon>`,
  }),
};

export const AllIcons: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-4 gap-8 p-8">
        <div class="flex flex-col items-center gap-2">
          <vera-icon name="burger-menu" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-xs font-medium">burger-menu</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <vera-icon name="cross" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-xs font-medium">cross</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <vera-icon name="add" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-xs font-medium">add</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <vera-icon name="send" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-xs font-medium">send</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <vera-icon name="search-img" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-xs font-medium">search-img</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <vera-icon name="video-player" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-xs font-medium">video-player</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <vera-icon name="mic" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-xs font-medium">mic</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <vera-icon name="conv-chat" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-xs font-medium">conv-chat</span>
        </div>
      </div>
    `,
  }),
};

export const SizesDemo: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-8 p-8">
        <div class="flex items-center gap-4">
          <vera-icon name="burger-menu" [size]="16" color="text-gray-900"></vera-icon>
          <span class="text-sm">16px</span>
        </div>
        <div class="flex items-center gap-4">
          <vera-icon name="burger-menu" [size]="24" color="text-gray-900"></vera-icon>
          <span class="text-sm">24px (default)</span>
        </div>
        <div class="flex items-center gap-4">
          <vera-icon name="burger-menu" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-sm">32px</span>
        </div>
        <div class="flex items-center gap-4">
          <vera-icon name="burger-menu" [size]="48" color="text-gray-900"></vera-icon>
          <span class="text-sm">48px</span>
        </div>
      </div>
    `,
  }),
};

export const ColorsDemo: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-8 p-8">
        <div class="flex items-center gap-4">
          <vera-icon name="burger-menu" [size]="32" color="text-gray-900"></vera-icon>
          <span class="text-sm">Gray 900</span>
        </div>
        <div class="flex items-center gap-4">
          <vera-icon name="burger-menu" [size]="32" color="text-gray-600"></vera-icon>
          <span class="text-sm">Gray 600</span>
        </div>
        <div class="flex items-center gap-4">
          <vera-icon name="burger-menu" [size]="32" color="text-red-600"></vera-icon>
          <span class="text-sm">Red 600</span>
        </div>
        <div class="flex items-center gap-4">
          <vera-icon name="burger-menu" [size]="32" color="text-green-600"></vera-icon>
          <span class="text-sm">Green 600</span>
        </div>
      </div>
    `,
  }),
};
