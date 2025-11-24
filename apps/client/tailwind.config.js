const { join } = require('path');
const sharedTheme = require('../../libs/client/shared/theme/tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedTheme],
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../../libs/client/**/src/**/*.{ts,html}'),
  ],
};
