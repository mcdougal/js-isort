const fs = require(`fs`);
const os = require(`os`);
const path = require(`path`);

const resolveAliases = require(`../src/resolveAliases`);

beforeEach(() => {
  const aliasesCachePath = path.join(
    os.tmpdir(),
    `/tmp/js-isort-aliases-cache-f614917f2bc8c0f6c64534efdb455bfa.json`
  );

  if (fs.existsSync(aliasesCachePath)) {
    fs.unlinkSync(aliasesCachePath);
  }
});

it(`returns nothing when config is undefined`, () => {
  expect(resolveAliases(undefined)).toEqual([]);
});

it(`returns nothing when config is null`, () => {
  expect(resolveAliases(null)).toEqual([]);
});

it(`returns nothing when config is empty string`, () => {
  expect(resolveAliases(``)).toEqual([]);
});

it(`returns nothing when webpack config does not define aliases`, () => {
  const configPath = path.resolve(__dirname, `webpack.config.no.alias.js`);
  expect(resolveAliases(configPath)).toEqual([]);
});

it(`works when webpack config defines aliases`, () => {
  const configPath = path.resolve(__dirname, `webpack.config.with.alias.js`);
  expect(resolveAliases(configPath)).toEqual([`components`, `utils`]);
});

it(`works when loading webpack aliases from the cache`, () => {
  const configPath = path.resolve(__dirname, `webpack.config.with.alias.js`);

  // Populate cache
  resolveAliases(configPath);

  expect(resolveAliases(configPath)).toEqual([`components`, `utils`]);
});

it(`returns nothing when babel config does not define aliases`, () => {
  const configPath = path.resolve(__dirname, `babel.config.no.alias.js`);
  expect(resolveAliases(configPath)).toEqual([]);
});

it(`works when babel config defines aliases`, () => {
  const configPath = path.resolve(__dirname, `babel.config.with.alias.js`);
  expect(resolveAliases(configPath)).toEqual([`components`, `utils`]);
});

it(`works when loading babel aliases from the cache`, () => {
  const configPath = path.resolve(__dirname, `babel.config.with.alias.js`);

  // Populate cache
  resolveAliases(configPath);

  expect(resolveAliases(configPath)).toEqual([`components`, `utils`]);
});

it(`returns nothing when TypeScript config does not define aliases`, () => {
  const configPath = path.resolve(__dirname, `ts.config.no.alias.json`);
  expect(resolveAliases(configPath)).toEqual([]);
});

it(`works when TypeScript config defines aliases`, () => {
  const configPath = path.resolve(__dirname, `ts.config.with.alias.json`);
  expect(resolveAliases(configPath)).toEqual([`@components`, `@utils`]);
});

it(`works when loading TypeScript aliases from the cache`, () => {
  const configPath = path.resolve(__dirname, `ts.config.with.alias.json`);

  // Populate cache
  resolveAliases(configPath);

  expect(resolveAliases(configPath)).toEqual([`@components`, `@utils`]);
});
