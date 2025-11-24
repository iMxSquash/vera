const { join } = require('path');

const sharedConfig = require('../theme/tailwind.config');

module.exports = {
  presets: [sharedConfig],
  content: [
    join(__dirname, 'src/**/!(*.spec).{ts,html}'),
  ],
};
