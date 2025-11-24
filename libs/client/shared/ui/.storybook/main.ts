import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../**/*.stories.@(js|jsx|ts|tsx|mdx)' ],
  addons: ['@storybook/addon-essentials' ],
  framework: {
    name: '@storybook/angular',
    options: {},
  }, 
};

export default config;