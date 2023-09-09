import { defineBuildConfig } from 'unbuild';
import scss from 'rollup-plugin-scss';

export default defineBuildConfig({
  entries: [
    './src/index',
    './src/BetterSelect',
    './src/WebComponent',
    './src/registerWebComponent',
    './src/autoRegisterWebComponent',
    './src/registerForJquery',
    './src/autoRegisterForJquery',
    {
      builder: 'rollup',
      input: './src/scss/main.scss',
    },
  ],
  declaration: true,
  externals: ['jquery'],
  rollup: {
    emitCJS: true,
    output: {
      exports: 'named',
      globals: {
        jquery: '$',
      },
      assetFileNames: '[name][extname]',
    },
  },
  failOnWarn: false,
  hooks: {
    'rollup:options'(_ctx, options) {
      const plugin = scss({
        fileName: 'css/main.css',
      });

      if (options.plugins === undefined) {
        options.plugins = [plugin];
      } else if (Array.isArray(options.plugins)) {
        options.plugins.push(plugin);
      } else {
        options.plugins = [options.plugins, plugin];
      }
    },
  },
});
