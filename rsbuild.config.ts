import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      popup: './src/popup.tsx',
      newtab: './src/newtab.tsx',
      background: './src/background.ts',
    },
  },
  html: {
    template: ({ entryName }) => {
      if (entryName === 'popup') {
        return './src/popup.html';
      }
      if (entryName === 'newtab') {
        return './src/newtab.html';
      }
      return false;
    },
  },
  output: {
    distPath: {
      root: 'dist',
      js: '',
    },
    assetPrefix: './',
    filenameHash: false,
    copy: [
      { from: './src/manifest.json', to: '' },
      { from: './src/icons', to: 'icons' },
    ],
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
    rspack: {
      optimization: {
        splitChunks: false,
      },
      output: {
        filename: '[name].js',
      },
    },
  },
});
      