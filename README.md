# koa-file-session

> !!! Deprecated.  

> please use [koa-filestore](https://github.com/ccqgithub/koa-filestore).


## features

- Independent with `koa-session`, you can use `ctx.session` same as before.
- Sensitive information is stored on the server, more secure.
- If the cookie be stolen, the `file session` aslo can be expired.

## usage

install

```
npm i koa-file-session -S
```

use

```js
const session = require('koa-session');
const fileSession = require('koa-file-session');

//....

// use middleware
app.use(session(app));
app.use(fileSession(app, {
  // the directory of session file
  directory: path.resolve(__dirname, './cache/session'),
  // the key in cookie for session
  key: 'SESSION_ID',
  // The `file session` maxAge, independent to `cookie session` maxAge, prevent cookie stolen.
  // use seconds, if maxAge <= 0, never expired
  // note: if `cookie session` expired, the `file session` still exist, but invalid，becaulse the `seesion id` is exoired.
  maxAge: 0,
}));

// use session
app.use(async (ctx, next) => {
  // get
  let user = ctx.fileSession.get('user');

  // set user
  ctx.fileSession.set('user', {/*...use info...*/});
  // clear user
  ctx.fileSession.set('user', null);

  // clear all
  ctx.fileSession.clear();
});
```
