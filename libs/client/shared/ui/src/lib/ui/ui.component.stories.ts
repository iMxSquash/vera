import type { Meta, StoryObj } from '@storybook/angular';
import { UiComponent } from './ui.component';

const meta: Meta<UiComponent> = {
  component: UiComponent,
  title: 'UI/Components/UiComponent',
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Le titre du composant',
    },
    description: {
      control: 'text',
      description: 'La description du composant',
    },
  },
};
export default meta;
type Story = StoryObj<UiComponent>;

export const Default: Story = {
  args: {
    title: 'Composant UI par défaut',
    description: 'Ceci est un composant réutilisable avec Tailwind CSS',
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Titre personnalisé',
    description:
      'Avec une description personnalisée pour démontrer la flexibilité',
  },
};

export const LongContent: Story = {
  args: {
    title: 'Titre avec contenu long',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  },
};
