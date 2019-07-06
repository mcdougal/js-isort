const crypto = require(`crypto`);
const fs = require(`fs`);
const os = require(`os`);
const path = require(`path`);

// Cache parsed aliases because it can take 1 second or more to load the config
// file. This is too long if you are sorting imports on every save or if you are
// running a git precommit hook.
const getAliasesCacheFilePath = () => {
  // Make sure the cache doesn't collide across multiple projects
  const dirnameHash = crypto
    .createHash(`md5`)
    .update(__dirname)
    .digest(`hex`);

  return path.join(os.tmpdir(), `js-isort-aliases-cache-${dirnameHash}.json`);
};

const loadCache = () => {
  let cache = {};

  if (fs.existsSync(getAliasesCacheFilePath())) {
    let cacheJson;

    try {
      cacheJson = fs.readFileSync(getAliasesCacheFilePath());
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

const setCachedAliases = (cache, configAbsPath, aliases) => {
  const configMTime = fs.statSync(configAbsPath).mtime;
  const newCache = Object.assign({}, cache);

  newCache[configAbsPath] = {
    mtime: configMTime,
    aliases,
  };

  fs.writeFileSync(getAliasesCacheFilePath(), JSON.stringify(newCache));
};

const getCachedAliases = (cache, configAbsPath) => {
  let aliases = null;

  if (cache[configAbsPath]) {
    const configCache = cache[configAbsPath];
    const cacheMTime = new Date(configCache.mtime);
    const configMTime = fs.statSync(configAbsPath).mtime;

    if (configMTime <= cacheMTime) {
      aliases = configCache.aliases;
    }
  }

  return aliases;
};

const parseWebpackAliases = (config) => {
  if (!config.resolve || !config.resolve.alias) {
    return null;
  }

  return Object.keys(config.resolve.alias);
};

const parseBabelAliases = (config) => {
  if (!config.plugins) {
    return null;
  }

  const moduleResolver = config.plugins.find((plugin) => {
    return (
      Array.isArray(plugin) &&
      plugin.length === 2 &&
      plugin[0] === `module-resolver`
    );
  });

  if (!moduleResolver) {
    return null;
  }

  const moduleResolverOptions = moduleResolver[1];

  if (!moduleResolverOptions.alias) {
    return null;
  }

  return Object.keys(moduleResolverOptions.alias);
};

const resolveAliases = (configPath) => {
  let aliases = [];

  if (configPath) {
    const configAbsPath = path.resolve(configPath);
    const cache = loadCache();
    const cachedAliases = getCachedAliases(cache, configPath);

    if (cachedAliases) {
      aliases = cachedAliases;
    } else {
      /* eslint-disable global-require, import/no-dynamic-require */
      const config = require(configAbsPath);

      aliases = parseWebpackAliases(config) || parseBabelAliases(config) || [];

      setCachedAliases(cache, configPath, aliases);
    }
  }

  return aliases;
};

module.exports = resolveAliases;
