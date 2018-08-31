module.exports = {
  presets: [`next/babel`],
  plugins: [
    [
      `module-resolver`,
      {
        root: [`./src`],
        alias: {
          components: `./src/components`,
          utils: `./src/utils`,
        },
      },
    ],
  ],
};
