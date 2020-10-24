# 3.1.1 / 2020-10-24

- Fix bug where namespace imports were merged with non-namepsace imports, causing the output to have a syntax error

# 3.1.0 / 2020-01-15

- Support sorting of TypeScript files

# 3.0.0 / 2020-01-12

BREAKING CHANGES:

1. The CLI tool now prints the file modifications to stdout by default instead of writing directly to the file. To write to the file, the `--write` flag is now required.
2. The `--config-path` flag was renamed to `--config`

# 2.1.0 / 2020-01-12

- Fixed bug where import alias cache would apply to other projects using js-isort
- Updated all dependencies to latest versions

# 2.0.4 / 2018-09-22

- Added CHANGELOG

# 2.0.3 / 2018-09-22

- Added support for `dynamicImport` syntax to babel parser

# 2.0.2 / 2018-08-31

- Updated `--help` text

# 2.0.1 / 2018-08-31

- README update

# 2.0.0 / 2018-08-30

**BREAKING CHANGES:**

- Changed command line flag from `--webpack-config` to `--config-path`

**Features:**

- Added support for Babel config files

# 1.0.1 / 2018-07-20

- Fixed bug with checking whether module is alias
