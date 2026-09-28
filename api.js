/* ============================================================================
   Sijill · سِجِلّ — everything that talks to the database.
   No other file makes a network call.
   ============================================================================ */
(function () {
  "use strict";

  var CFG = window.SIJILL || {};
  var BASE = (CFG.SUPABASE_URL || "").replace(/\/+$/, "");
  var KEY  = CFG.SUPABASE_KEY || "";

  /* --------------------------------------------------------------- session */
  /* The sign-in token lives in this browser only. It is not a password: it
     is a 144-bit code the server issued, it can be revoked from the SQL
     editor at any time, and it dies when the school passphrase is rotated.  */
  var TOKEN_KEY = "sijill.token";

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || null; } catch (e) { return MEM.token; }
  }
  function setToken(t) {
    MEM.token = t;
    try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); }
    catch (e) { /* private browsing — fall back to memory for this visit */ }
  }
  var MEM = { token: null };

  /* WHICH HEADERS. This looks fussy and is not.
     Supabase has two generations of public key:
       - the legacy anon key, a JWT beginning "eyJ", which clients send on
         BOTH the apikey and Authorization headers;
       - the newer publishable key, "sb_publishable_...", which Supabase's own
         docs say must go on the apikey header ONLY. Send it as a Bearer token
         as well and the platform tries to parse it as a JWT and rejects the
         whole request — with an error that points nowhere near the cause.
     So we look at the key and send what that kind of key expects. */
  function headers() {
    var h = {
      "apikey": KEY,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    if (/^ey[A-Za-z0-9_-]/.test(KEY)) h["Authorization"] = "Bearer " + KEY;
    return h;
  }

  /* ------------------------------------------------------------------ call */
  /* One shape for every request, because there is only one shape: POST a
     JSON object of the SQL function's parameters, get JSON back.            */
  function rpc(fn, args) {
    if (!BASE || !KEY) {
      return Promise.reject(new ApiError(
        "This app has not been pointed at a database yet — config.js still has the example values in it.", "config"));
    }
    return fetch(BASE + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(args || {})
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (!res.ok) {
          var msg = (data && (data.message || data.error)) || ("Request failed (" + res.status + ")");
          throw new ApiError(msg, (data && data.code) || String(res.status));
        }
        return data;
      });
    }, function (netErr) {
      throw new ApiError("Could not reach the database. Check the connection and try again.", "network");
    });
  }

  function ApiError(message, code) {
    this.name = "ApiError"; this.message = message; this.code = code || "";
  }
  ApiError.prototype = Object.create(Error.prototype);

  /* A session that has expired or been revoked. Everything above the app
     layer treats this as "show the sign-in screen again", never as an error
     to display — it is not the teacher's fault and not interesting to them. */
  function isSignedOut(err) {
    return err && err.code === "42501" && /sign in first/i.test(err.message || "");
  }

  /* ------------------------------------------------------------ read paths */
  function read(fn, args) {
    args = Object.assign({ p_token: getToken() }, args || {});
    return rpc(fn, args);
  }

  /* ----------------------------------------------------------- write paths */
  /*
     Tarek's requirement, in his words: "can we implement a way to alert or
     notify if something didn't commit the update". Everyone is on wifi, so
     this is not about working offline — it is about never letting a teacher
     believe a mark was saved when it was not.

     Every write goes through here. It is retried twice on its own, and if it
     still fails it lands in FAILED, which the screen turns into a red banner
     with a Retry button. Nothing is ever dropped silently.
  */
  var PENDING = 0;
  var FAILED  = [];
  var listeners = [];

  function onSaveState(fn) { listeners.push(fn); }
  function fire() {
    var s = { pending: PENDING, failed: FAILED.length };
    listeners.forEach(function (fn) { try { fn(s); } catch (e) {} });
  }

  function write(fn, args, label) {
    args = Object.assign({ p_token: getToken() }, args || {});
    PENDING++; fire();
    return attempt(fn, args, 0).then(function (r) {
      PENDING--; fire(); return r;
    }, function (err) {
      PENDING--;
      if (isSignedOut(err) || err.code === "22023" || err.code === "config") {
        // A rejected write is not a lost write: the server refused it on
        // purpose and the screen will say why. Only genuine failures queue.
        fire(); throw err;
      }
      FAILED.push({ fn: fn, args: args, label: label || fn, error: err.message });
      fire(); throw err;
    });
  }

  function attempt(fn, args, n) {
    return rpc(fn, args).catch(function (err) {
      var worthRetrying = err.code === "network" || /^5/.test(err.code);
      if (worthRetrying && n < 2) {
        return new Promise(function (r) { setTimeout(r, 400 * (n + 1)); })
          .then(function () { return attempt(fn, args, n + 1); });
      }
      throw err;
    });
  }

  function retryFailed() {
    var queue = FAILED.slice(); FAILED.length = 0; fire();
    return queue.reduce(function (chain, item) {
      return chain.then(function () {
        return rpc(item.fn, item.args).catch(function (e) {
          FAILED.push(item); throw e;
        });
      });
    }, Promise.resolve()).then(function () { fire(); return true; },
                               function () { fire(); return false; });
  }

  window.api = {
    rpc: rpc, read: read, write: write,
    getToken: getToken, setToken: setToken,
    isSignedOut: isSignedOut,
    onSaveState: onSaveState, retryFailed: retryFailed,
    failed: function () { return FAILED.slice(); },
    ApiError: ApiError,
    config: CFG
  };
})();
