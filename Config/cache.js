const cache = new Map();

module.exports = {
  get: (key) => cache.get(key),

  set: (key, value) => cache.set(key, value),

  del: (key) => cache.delete(key),

  flushAll: () => cache.clear(),
};