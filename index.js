const flatCache = require('flat-cache');
const uuidv4 = require('uuid/v4');
const path = require('path');

module.exports = function(app, opts) {
  const options = Object.assign({
    // the directory of session file
    directory: path.resolve(__dirname, './cache/session'),
    // the key in cookie for session
    key: 'SESSION_ID',
    // The `file session` maxAge, independent to `cookie session` maxAge, prevent cookie stolen.
    // use seconds, if maxAge <= 0, never expired
    // note: if `cookie session` expired, the `file session` still exist, but invalid，becaulse the `seesion id` is exoired.
    maxAge: 0,
  }, opts);

  return async function fileSessionMiddleware(ctx, next) {
    const session = ctx.session || {};
    const {directory, key, maxAge} = options;

    // if no session id, init it
    if (!session[key]) {
      session[key] = uuidv4();
    }

    // the cache of file session
    let cacheID = `session-${session[key]}`;
    let cache = flatCache.load(cacheID, directory);

    // maxAge and expired
    let time = new Date().getTime();
    let newExpired = maxAge > 0 ? Math.round(time / 1000) + maxAge : 0;

    // no session, init it
    if (!cache.getKey('session')) {
      cache.setKey('session', {});
      cache.setKey('__session_expired', newExpired);
      cache.save(true);
    }

    let expired = cache.getKey('__session_expired');
    // expired, rest cache
    if (expired > 0 && expired * 1000 < time) {
      cache.setKey('session', {});
      cache.setKey('__session_expired', newExpired);
      cache.save(true);
    }

    // file session obj
    ctx.fileSession = {
      get(key) {
        let sessionData = cache.getKey('session') || {};
        return key ? sessionData[key] : sessionData;
      },
      set(key, val) {
        let sessionData = cache.getKey('session') || {};
        sessionData[key] = val;
        cache.setKey('session', sessionData);
        cache.save(true);
      },
      clear() {
        delete session[key];
        flatCache.clearCacheById(cacheID);
      }
    };

    next();
  }
}
