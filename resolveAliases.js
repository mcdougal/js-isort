const fs = require(`fs`);
const os = require(`os`);
const path = require(`path`);

// Cache aliases parsed from Webpack because it can take 1 second or more
// to load Webpack config, which is too long if you are sorting imports
// on every save or if you are running a git precommit hook.
const ALIASES_CACHE_FILE = path.join(
  os.tmpdir(),
  `js-isort-aliases-cache.json`
);

const loadCache = () => {
  let cache = {};

  if (fs.existsSync(ALIASES_CACHE_FILE)) {
    let cacheJson;

    try {
      cacheJson = fs.readFileSync(ALIASES_CACHE_FILE);
    } catch (error) {
      cacheJson = null;
    }

    if (cacheJson !== null) {
      try {
        cache = JSON.parse(cacheJson);
      } catch (error) {
        // Return empty cache if file is corrupted
      }
    }
  }

  return cache;
};

const setCachedAliases = (cache, webpackConfigPath, aliases) => {
  const webpackConfigAbsPath = path.resolve(webpackConfigPath);
  const webpackMTime = fs.statSync(webpackConfigAbsPath).mtime;

  const newCache = Object.assign({}, cache);

  newCache[webpackConfigAbsPath] = {
    mtime: webpackMTime,
    aliases,
  };

  fs.writeFileSync(ALIASES_CACHE_FILE, JSON.stringify(newCache));
};

const getCachedAliases = (cache, webpackConfigPath) => {
  let aliases = null;

  const webpackConfigAbsPath = path.resolve(webpackConfigPath);

  if (cache[webpackConfigAbsPath]) {
    const webpackCache = cache[webpackConfigAbsPath];

    const cacheMTime = new Date(webpackCache.mtime);
    const webpackMTime = fs.statSync(webpackConfigAbsPath).mtime;

    if (webpackMTime <= cacheMTime) {
      aliases = webpackCache.aliases;
    }
  }

  return aliases;
};

const resolveAliases = (webpackConfigPath) => {
  let aliases = [];

  if (webpackConfigPath) {
    const cache = loadCache();
    const cachedAliases = getCachedAliases(cache, webpackConfigPath);

    if (cachedAliases) {
      aliases = cachedAliases;
    } else {
      /* eslint-disable global-require, import/no-dynamic-require */
      const webpackConfig = require(webpackConfigPath);

      if (webpackConfig.resolve && webpackConfig.resolve.alias) {
        aliases = Object.keys(webpackConfig.resolve.alias);
      }

      setCachedAliases(cache, webpackConfigPath, aliases);
    }
  }

  return aliases;
};

module.exports = resolveAliases;
