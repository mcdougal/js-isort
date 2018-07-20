#!/usr/bin/env node

const program = require(`commander`);
const fs = require(`fs`);

const isort = require(`./js-isort`);
const resolveAliases = require(`./resolveAliases`);

program
  .version(`1.0.0`, `-v, --version`)
  .usage(`[options] <file ...>`)
  .option(`--webpack-config [value]`, `Path to webpack config with aliases`)
  .parse(process.argv);

const filePaths = program.args;
const webpackConfigPath = program.webpackConfig;

if (filePaths.length === 0) {
  program.help();
}

const aliases = resolveAliases(webpackConfigPath);

filePaths.forEach((filePath) => {
  fs.readFile(filePath, `utf8`, (readError, content) => {
    if (readError) {
      throw readError;
    }

    const sortedContent = isort(content, aliases);

    if (sortedContent !== content) {
      fs.writeFile(filePath, sortedContent, (writeError) => {
        if (writeError) {
          throw writeError;
        }
      });
    }
  });
});
