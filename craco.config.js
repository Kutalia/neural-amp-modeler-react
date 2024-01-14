const StyleXBabelPlugin = require('@stylexjs/babel-plugin');
const StylexWebpackPlugin = require('@stylexjs/webpack-plugin');

module.exports = {
  devServer: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  // babel: {
  //   plugins: [
  //     [
  //       StyleXBabelPlugin,
  //       {
  //         dev: true,
  //         // Set this to true for snapshot testing
  //         // default: false
  //         test: false,
  //         // Required for CSS variable support
  //         unstable_moduleResolution: {
  //           // type: 'commonJS' | 'haste'
  //           // default: 'commonJS'
  //           type: 'commonJS',
  //           // The absolute path to the root directory of your project
  //           rootDir: __dirname,
  //         },
  //       },
  //     ],
  //   ],
  // },
  webpack: {
    plugins: {
      add: [
        new StylexWebpackPlugin({
          filename: 'styles.[contenthash].css',
          // get webpack mode and set value for dev
          dev: process.env.NODE_ENV === 'development',
          // Use statically generated CSS files and not runtime injected CSS.
          // Even in development.
          // for some reason false doesn't work in production
          runtimeInjection: process.env.NODE_ENV === 'production',
          // optional. default: 'x'
          classNamePrefix: 'x',
          // Required for CSS variable support
          unstable_moduleResolution: {
            // type: 'commonJS' | 'haste'
            // default: 'commonJS'
            type: 'commonJS',
            // The absolute path to the root directory of your project
            rootDir: __dirname,
          },
        })
      ]
    },
  }
};
