#!/usr/bin/env node

const program = require(`commander`);
const fs = require(`fs`);

const isort = require(`./js-isort`);
const resolveAliases = require(`./resolveAliases`);

program
  .version(`2.0.2`, `-v, --version`)
  .usage(`[options] <file ...>`)
  .option(
    `--config-path [value]`,
    `Path to Babel or Webpack config file containing aliases`
  )
  .parse(process.argv);

const filePaths = program.args;
const configPath = program.configPath;

if (filePaths.length === 0) {
  program.help();
}

const aliases = resolveAliases(configPath);

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
