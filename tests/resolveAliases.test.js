const fs = require(`fs`);
const os = require(`os`);
const path = require(`path`);

const resolveAliases = require(`../src/resolveAliases`);

beforeEach(() => {
  const aliasesCachePath = path.join(
    os.tmpdir(),
    `js-isort-aliases-cache.json`
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
