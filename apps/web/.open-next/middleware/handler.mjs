
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "4.1.0";globalThis.nextVersion = "15.1.7";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer2.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
function initializeOnce() {
  if (initialized)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized = true;
}
var cachedOrigins, cachedPatterns, initialized, envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized = false;
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/stream.js
import { ReadableStream as ReadableStream2 } from "node:stream/web";
function toReadableStream(value, isBase64) {
  return new ReadableStream2({
    pull(controller) {
      controller.enqueue(Buffer.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream2({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream2({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          const cur = responseHeaders[key];
          if (cur === void 0) {
            responseHeaders[key] = value;
          } else if (Array.isArray(cur)) {
            cur.push(value);
          } else {
            responseHeaders[key] = [cur, value];
          }
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge-runtime-webpack.js
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var e = {}, r = {};
      function t(o) {
        var n = r[o];
        if (void 0 !== n) return n.exports;
        var i = r[o] = { exports: {} }, a = true;
        try {
          e[o](i, i.exports, t), a = false;
        } finally {
          a && delete r[o];
        }
        return i.exports;
      }
      t.m = e, t.amdO = {}, (() => {
        var e2 = [];
        t.O = (r2, o, n, i) => {
          if (o) {
            i = i || 0;
            for (var a = e2.length; a > 0 && e2[a - 1][2] > i; a--) e2[a] = e2[a - 1];
            e2[a] = [o, n, i];
            return;
          }
          for (var l = 1 / 0, a = 0; a < e2.length; a++) {
            for (var [o, n, i] = e2[a], u = true, f = 0; f < o.length; f++) (false & i || l >= i) && Object.keys(t.O).every((e3) => t.O[e3](o[f])) ? o.splice(f--, 1) : (u = false, i < l && (l = i));
            if (u) {
              e2.splice(a--, 1);
              var s = n();
              void 0 !== s && (r2 = s);
            }
          }
          return r2;
        };
      })(), t.n = (e2) => {
        var r2 = e2 && e2.__esModule ? () => e2.default : () => e2;
        return t.d(r2, { a: r2 }), r2;
      }, t.d = (e2, r2) => {
        for (var o in r2) t.o(r2, o) && !t.o(e2, o) && Object.defineProperty(e2, o, { enumerable: true, get: r2[o] });
      }, t.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || Function("return this")();
        } catch (e2) {
          if ("object" == typeof window) return window;
        }
      }(), t.o = (e2, r2) => Object.prototype.hasOwnProperty.call(e2, r2), t.r = (e2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
      }, (() => {
        var e2 = { 149: 0 };
        t.O.j = (r3) => 0 === e2[r3];
        var r2 = (r3, o2) => {
          var n, i, [a, l, u] = o2, f = 0;
          if (a.some((r4) => 0 !== e2[r4])) {
            for (n in l) t.o(l, n) && (t.m[n] = l[n]);
            if (u) var s = u(t);
          }
          for (r3 && r3(o2); f < a.length; f++) i = a[f], t.o(e2, i) && e2[i] && e2[i][0](), e2[i] = 0;
          return t.O(s);
        }, o = self.webpackChunk_N_E = self.webpackChunk_N_E || [];
        o.forEach(r2.bind(null, 0)), o.push = r2.bind(null, o.push.bind(o));
      })();
    })();
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// .next/server/src/middleware.js
var require_middleware = __commonJS({
  ".next/server/src/middleware.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[550], { 521: (e) => {
      "use strict";
      e.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 356: (e) => {
      "use strict";
      e.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 341: (e) => {
      "use strict";
      var t = Object.defineProperty, r = Object.getOwnPropertyDescriptor, n = Object.getOwnPropertyNames, i = Object.prototype.hasOwnProperty, o = {};
      function a(e2) {
        var t2;
        let r2 = ["path" in e2 && e2.path && `Path=${e2.path}`, "expires" in e2 && (e2.expires || 0 === e2.expires) && `Expires=${("number" == typeof e2.expires ? new Date(e2.expires) : e2.expires).toUTCString()}`, "maxAge" in e2 && "number" == typeof e2.maxAge && `Max-Age=${e2.maxAge}`, "domain" in e2 && e2.domain && `Domain=${e2.domain}`, "secure" in e2 && e2.secure && "Secure", "httpOnly" in e2 && e2.httpOnly && "HttpOnly", "sameSite" in e2 && e2.sameSite && `SameSite=${e2.sameSite}`, "partitioned" in e2 && e2.partitioned && "Partitioned", "priority" in e2 && e2.priority && `Priority=${e2.priority}`].filter(Boolean), n2 = `${e2.name}=${encodeURIComponent(null != (t2 = e2.value) ? t2 : "")}`;
        return 0 === r2.length ? n2 : `${n2}; ${r2.join("; ")}`;
      }
      function s(e2) {
        let t2 = /* @__PURE__ */ new Map();
        for (let r2 of e2.split(/; */)) {
          if (!r2) continue;
          let e3 = r2.indexOf("=");
          if (-1 === e3) {
            t2.set(r2, "true");
            continue;
          }
          let [n2, i2] = [r2.slice(0, e3), r2.slice(e3 + 1)];
          try {
            t2.set(n2, decodeURIComponent(null != i2 ? i2 : "true"));
          } catch {
          }
        }
        return t2;
      }
      function l(e2) {
        var t2, r2;
        if (!e2) return;
        let [[n2, i2], ...o2] = s(e2), { domain: a2, expires: l2, httponly: d2, maxage: p2, path: h, samesite: f, secure: m, partitioned: g, priority: y } = Object.fromEntries(o2.map(([e3, t3]) => [e3.toLowerCase().replace(/-/g, ""), t3]));
        return function(e3) {
          let t3 = {};
          for (let r3 in e3) e3[r3] && (t3[r3] = e3[r3]);
          return t3;
        }({ name: n2, value: decodeURIComponent(i2), domain: a2, ...l2 && { expires: new Date(l2) }, ...d2 && { httpOnly: true }, ..."string" == typeof p2 && { maxAge: Number(p2) }, path: h, ...f && { sameSite: c.includes(t2 = (t2 = f).toLowerCase()) ? t2 : void 0 }, ...m && { secure: true }, ...y && { priority: u.includes(r2 = (r2 = y).toLowerCase()) ? r2 : void 0 }, ...g && { partitioned: true } });
      }
      ((e2, r2) => {
        for (var n2 in r2) t(e2, n2, { get: r2[n2], enumerable: true });
      })(o, { RequestCookies: () => d, ResponseCookies: () => p, parseCookie: () => s, parseSetCookie: () => l, stringifyCookie: () => a }), e.exports = ((e2, o2, a2, s2) => {
        if (o2 && "object" == typeof o2 || "function" == typeof o2) for (let l2 of n(o2)) i.call(e2, l2) || l2 === a2 || t(e2, l2, { get: () => o2[l2], enumerable: !(s2 = r(o2, l2)) || s2.enumerable });
        return e2;
      })(t({}, "__esModule", { value: true }), o);
      var c = ["strict", "lax", "none"], u = ["low", "medium", "high"], d = class {
        constructor(e2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let t2 = e2.get("cookie");
          if (t2) for (let [e3, r2] of s(t2)) this._parsed.set(e3, { name: e3, value: r2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed);
          if (!e2.length) return r2.map(([e3, t3]) => t3);
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter(([e3]) => e3 === n2).map(([e3, t3]) => t3);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2] = 1 === e2.length ? [e2[0].name, e2[0].value] : e2, n2 = this._parsed;
          return n2.set(t2, { name: t2, value: r2 }), this._headers.set("cookie", Array.from(n2).map(([e3, t3]) => a(t3)).join("; ")), this;
        }
        delete(e2) {
          let t2 = this._parsed, r2 = Array.isArray(e2) ? e2.map((e3) => t2.delete(e3)) : t2.delete(e2);
          return this._headers.set("cookie", Array.from(t2).map(([e3, t3]) => a(t3)).join("; ")), r2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((e2) => `${e2.name}=${encodeURIComponent(e2.value)}`).join("; ");
        }
      }, p = class {
        constructor(e2) {
          var t2, r2, n2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          let i2 = null != (n2 = null != (r2 = null == (t2 = e2.getSetCookie) ? void 0 : t2.call(e2)) ? r2 : e2.get("set-cookie")) ? n2 : [];
          for (let e3 of Array.isArray(i2) ? i2 : function(e4) {
            if (!e4) return [];
            var t3, r3, n3, i3, o2, a2 = [], s2 = 0;
            function l2() {
              for (; s2 < e4.length && /\s/.test(e4.charAt(s2)); ) s2 += 1;
              return s2 < e4.length;
            }
            for (; s2 < e4.length; ) {
              for (t3 = s2, o2 = false; l2(); ) if ("," === (r3 = e4.charAt(s2))) {
                for (n3 = s2, s2 += 1, l2(), i3 = s2; s2 < e4.length && "=" !== (r3 = e4.charAt(s2)) && ";" !== r3 && "," !== r3; ) s2 += 1;
                s2 < e4.length && "=" === e4.charAt(s2) ? (o2 = true, s2 = i3, a2.push(e4.substring(t3, n3)), t3 = s2) : s2 = n3 + 1;
              } else s2 += 1;
              (!o2 || s2 >= e4.length) && a2.push(e4.substring(t3, e4.length));
            }
            return a2;
          }(i2)) {
            let t3 = l(e3);
            t3 && this._parsed.set(t3.name, t3);
          }
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed.values());
          if (!e2.length) return r2;
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter((e3) => e3.name === n2);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2, n2] = 1 === e2.length ? [e2[0].name, e2[0].value, e2[0]] : e2, i2 = this._parsed;
          return i2.set(t2, function(e3 = { name: "", value: "" }) {
            return "number" == typeof e3.expires && (e3.expires = new Date(e3.expires)), e3.maxAge && (e3.expires = new Date(Date.now() + 1e3 * e3.maxAge)), (null === e3.path || void 0 === e3.path) && (e3.path = "/"), e3;
          }({ name: t2, value: r2, ...n2 })), function(e3, t3) {
            for (let [, r3] of (t3.delete("set-cookie"), e3)) {
              let e4 = a(r3);
              t3.append("set-cookie", e4);
            }
          }(i2, this._headers), this;
        }
        delete(...e2) {
          let [t2, r2] = "string" == typeof e2[0] ? [e2[0]] : [e2[0].name, e2[0]];
          return this.set({ ...r2, name: t2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(a).join("; ");
        }
      };
    }, 131: (e, t, r) => {
      (() => {
        "use strict";
        var t2 = { 491: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ContextAPI = void 0;
          let n2 = r2(223), i2 = r2(172), o2 = r2(930), a = "context", s = new n2.NoopContextManager();
          class l {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new l()), this._instance;
            }
            setGlobalContextManager(e3) {
              return (0, i2.registerGlobal)(a, e3, o2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(e3, t4, r3, ...n3) {
              return this._getContextManager().with(e3, t4, r3, ...n3);
            }
            bind(e3, t4) {
              return this._getContextManager().bind(e3, t4);
            }
            _getContextManager() {
              return (0, i2.getGlobal)(a) || s;
            }
            disable() {
              this._getContextManager().disable(), (0, i2.unregisterGlobal)(a, o2.DiagAPI.instance());
            }
          }
          t3.ContextAPI = l;
        }, 930: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagAPI = void 0;
          let n2 = r2(56), i2 = r2(912), o2 = r2(957), a = r2(172);
          class s {
            constructor() {
              function e3(e4) {
                return function(...t5) {
                  let r3 = (0, a.getGlobal)("diag");
                  if (r3) return r3[e4](...t5);
                };
              }
              let t4 = this;
              t4.setLogger = (e4, r3 = { logLevel: o2.DiagLogLevel.INFO }) => {
                var n3, s2, l;
                if (e4 === t4) {
                  let e5 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return t4.error(null !== (n3 = e5.stack) && void 0 !== n3 ? n3 : e5.message), false;
                }
                "number" == typeof r3 && (r3 = { logLevel: r3 });
                let c = (0, a.getGlobal)("diag"), u = (0, i2.createLogLevelDiagLogger)(null !== (s2 = r3.logLevel) && void 0 !== s2 ? s2 : o2.DiagLogLevel.INFO, e4);
                if (c && !r3.suppressOverrideMessage) {
                  let e5 = null !== (l = Error().stack) && void 0 !== l ? l : "<failed to generate stacktrace>";
                  c.warn(`Current logger will be overwritten from ${e5}`), u.warn(`Current logger will overwrite one already registered from ${e5}`);
                }
                return (0, a.registerGlobal)("diag", u, t4, true);
              }, t4.disable = () => {
                (0, a.unregisterGlobal)("diag", t4);
              }, t4.createComponentLogger = (e4) => new n2.DiagComponentLogger(e4), t4.verbose = e3("verbose"), t4.debug = e3("debug"), t4.info = e3("info"), t4.warn = e3("warn"), t4.error = e3("error");
            }
            static instance() {
              return this._instance || (this._instance = new s()), this._instance;
            }
          }
          t3.DiagAPI = s;
        }, 653: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.MetricsAPI = void 0;
          let n2 = r2(660), i2 = r2(172), o2 = r2(930), a = "metrics";
          class s {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new s()), this._instance;
            }
            setGlobalMeterProvider(e3) {
              return (0, i2.registerGlobal)(a, e3, o2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, i2.getGlobal)(a) || n2.NOOP_METER_PROVIDER;
            }
            getMeter(e3, t4, r3) {
              return this.getMeterProvider().getMeter(e3, t4, r3);
            }
            disable() {
              (0, i2.unregisterGlobal)(a, o2.DiagAPI.instance());
            }
          }
          t3.MetricsAPI = s;
        }, 181: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.PropagationAPI = void 0;
          let n2 = r2(172), i2 = r2(874), o2 = r2(194), a = r2(277), s = r2(369), l = r2(930), c = "propagation", u = new i2.NoopTextMapPropagator();
          class d {
            constructor() {
              this.createBaggage = s.createBaggage, this.getBaggage = a.getBaggage, this.getActiveBaggage = a.getActiveBaggage, this.setBaggage = a.setBaggage, this.deleteBaggage = a.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new d()), this._instance;
            }
            setGlobalPropagator(e3) {
              return (0, n2.registerGlobal)(c, e3, l.DiagAPI.instance());
            }
            inject(e3, t4, r3 = o2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(e3, t4, r3);
            }
            extract(e3, t4, r3 = o2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(e3, t4, r3);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, n2.unregisterGlobal)(c, l.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, n2.getGlobal)(c) || u;
            }
          }
          t3.PropagationAPI = d;
        }, 997: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.TraceAPI = void 0;
          let n2 = r2(172), i2 = r2(846), o2 = r2(139), a = r2(607), s = r2(930), l = "trace";
          class c {
            constructor() {
              this._proxyTracerProvider = new i2.ProxyTracerProvider(), this.wrapSpanContext = o2.wrapSpanContext, this.isSpanContextValid = o2.isSpanContextValid, this.deleteSpan = a.deleteSpan, this.getSpan = a.getSpan, this.getActiveSpan = a.getActiveSpan, this.getSpanContext = a.getSpanContext, this.setSpan = a.setSpan, this.setSpanContext = a.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new c()), this._instance;
            }
            setGlobalTracerProvider(e3) {
              let t4 = (0, n2.registerGlobal)(l, this._proxyTracerProvider, s.DiagAPI.instance());
              return t4 && this._proxyTracerProvider.setDelegate(e3), t4;
            }
            getTracerProvider() {
              return (0, n2.getGlobal)(l) || this._proxyTracerProvider;
            }
            getTracer(e3, t4) {
              return this.getTracerProvider().getTracer(e3, t4);
            }
            disable() {
              (0, n2.unregisterGlobal)(l, s.DiagAPI.instance()), this._proxyTracerProvider = new i2.ProxyTracerProvider();
            }
          }
          t3.TraceAPI = c;
        }, 277: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.deleteBaggage = t3.setBaggage = t3.getActiveBaggage = t3.getBaggage = void 0;
          let n2 = r2(491), i2 = (0, r2(780).createContextKey)("OpenTelemetry Baggage Key");
          function o2(e3) {
            return e3.getValue(i2) || void 0;
          }
          t3.getBaggage = o2, t3.getActiveBaggage = function() {
            return o2(n2.ContextAPI.getInstance().active());
          }, t3.setBaggage = function(e3, t4) {
            return e3.setValue(i2, t4);
          }, t3.deleteBaggage = function(e3) {
            return e3.deleteValue(i2);
          };
        }, 993: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.BaggageImpl = void 0;
          class r2 {
            constructor(e3) {
              this._entries = e3 ? new Map(e3) : /* @__PURE__ */ new Map();
            }
            getEntry(e3) {
              let t4 = this._entries.get(e3);
              if (t4) return Object.assign({}, t4);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([e3, t4]) => [e3, t4]);
            }
            setEntry(e3, t4) {
              let n2 = new r2(this._entries);
              return n2._entries.set(e3, t4), n2;
            }
            removeEntry(e3) {
              let t4 = new r2(this._entries);
              return t4._entries.delete(e3), t4;
            }
            removeEntries(...e3) {
              let t4 = new r2(this._entries);
              for (let r3 of e3) t4._entries.delete(r3);
              return t4;
            }
            clear() {
              return new r2();
            }
          }
          t3.BaggageImpl = r2;
        }, 830: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.baggageEntryMetadataSymbol = void 0, t3.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        }, 369: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.baggageEntryMetadataFromString = t3.createBaggage = void 0;
          let n2 = r2(930), i2 = r2(993), o2 = r2(830), a = n2.DiagAPI.instance();
          t3.createBaggage = function(e3 = {}) {
            return new i2.BaggageImpl(new Map(Object.entries(e3)));
          }, t3.baggageEntryMetadataFromString = function(e3) {
            return "string" != typeof e3 && (a.error(`Cannot create baggage metadata from unknown type: ${typeof e3}`), e3 = ""), { __TYPE__: o2.baggageEntryMetadataSymbol, toString: () => e3 };
          };
        }, 67: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.context = void 0;
          let n2 = r2(491);
          t3.context = n2.ContextAPI.getInstance();
        }, 223: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopContextManager = void 0;
          let n2 = r2(780);
          class i2 {
            active() {
              return n2.ROOT_CONTEXT;
            }
            with(e3, t4, r3, ...n3) {
              return t4.call(r3, ...n3);
            }
            bind(e3, t4) {
              return t4;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          }
          t3.NoopContextManager = i2;
        }, 780: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ROOT_CONTEXT = t3.createContextKey = void 0, t3.createContextKey = function(e3) {
            return Symbol.for(e3);
          };
          class r2 {
            constructor(e3) {
              let t4 = this;
              t4._currentContext = e3 ? new Map(e3) : /* @__PURE__ */ new Map(), t4.getValue = (e4) => t4._currentContext.get(e4), t4.setValue = (e4, n2) => {
                let i2 = new r2(t4._currentContext);
                return i2._currentContext.set(e4, n2), i2;
              }, t4.deleteValue = (e4) => {
                let n2 = new r2(t4._currentContext);
                return n2._currentContext.delete(e4), n2;
              };
            }
          }
          t3.ROOT_CONTEXT = new r2();
        }, 506: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.diag = void 0;
          let n2 = r2(930);
          t3.diag = n2.DiagAPI.instance();
        }, 56: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagComponentLogger = void 0;
          let n2 = r2(172);
          class i2 {
            constructor(e3) {
              this._namespace = e3.namespace || "DiagComponentLogger";
            }
            debug(...e3) {
              return o2("debug", this._namespace, e3);
            }
            error(...e3) {
              return o2("error", this._namespace, e3);
            }
            info(...e3) {
              return o2("info", this._namespace, e3);
            }
            warn(...e3) {
              return o2("warn", this._namespace, e3);
            }
            verbose(...e3) {
              return o2("verbose", this._namespace, e3);
            }
          }
          function o2(e3, t4, r3) {
            let i3 = (0, n2.getGlobal)("diag");
            if (i3) return r3.unshift(t4), i3[e3](...r3);
          }
          t3.DiagComponentLogger = i2;
        }, 972: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagConsoleLogger = void 0;
          let r2 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          class n2 {
            constructor() {
              for (let e3 = 0; e3 < r2.length; e3++) this[r2[e3].n] = /* @__PURE__ */ function(e4) {
                return function(...t4) {
                  if (console) {
                    let r3 = console[e4];
                    if ("function" != typeof r3 && (r3 = console.log), "function" == typeof r3) return r3.apply(console, t4);
                  }
                };
              }(r2[e3].c);
            }
          }
          t3.DiagConsoleLogger = n2;
        }, 912: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.createLogLevelDiagLogger = void 0;
          let n2 = r2(957);
          t3.createLogLevelDiagLogger = function(e3, t4) {
            function r3(r4, n3) {
              let i2 = t4[r4];
              return "function" == typeof i2 && e3 >= n3 ? i2.bind(t4) : function() {
              };
            }
            return e3 < n2.DiagLogLevel.NONE ? e3 = n2.DiagLogLevel.NONE : e3 > n2.DiagLogLevel.ALL && (e3 = n2.DiagLogLevel.ALL), t4 = t4 || {}, { error: r3("error", n2.DiagLogLevel.ERROR), warn: r3("warn", n2.DiagLogLevel.WARN), info: r3("info", n2.DiagLogLevel.INFO), debug: r3("debug", n2.DiagLogLevel.DEBUG), verbose: r3("verbose", n2.DiagLogLevel.VERBOSE) };
          };
        }, 957: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.DiagLogLevel = void 0, function(e3) {
            e3[e3.NONE = 0] = "NONE", e3[e3.ERROR = 30] = "ERROR", e3[e3.WARN = 50] = "WARN", e3[e3.INFO = 60] = "INFO", e3[e3.DEBUG = 70] = "DEBUG", e3[e3.VERBOSE = 80] = "VERBOSE", e3[e3.ALL = 9999] = "ALL";
          }(t3.DiagLogLevel || (t3.DiagLogLevel = {}));
        }, 172: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.unregisterGlobal = t3.getGlobal = t3.registerGlobal = void 0;
          let n2 = r2(200), i2 = r2(521), o2 = r2(130), a = i2.VERSION.split(".")[0], s = Symbol.for(`opentelemetry.js.api.${a}`), l = n2._globalThis;
          t3.registerGlobal = function(e3, t4, r3, n3 = false) {
            var o3;
            let a2 = l[s] = null !== (o3 = l[s]) && void 0 !== o3 ? o3 : { version: i2.VERSION };
            if (!n3 && a2[e3]) {
              let t5 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${e3}`);
              return r3.error(t5.stack || t5.message), false;
            }
            if (a2.version !== i2.VERSION) {
              let t5 = Error(`@opentelemetry/api: Registration of version v${a2.version} for ${e3} does not match previously registered API v${i2.VERSION}`);
              return r3.error(t5.stack || t5.message), false;
            }
            return a2[e3] = t4, r3.debug(`@opentelemetry/api: Registered a global for ${e3} v${i2.VERSION}.`), true;
          }, t3.getGlobal = function(e3) {
            var t4, r3;
            let n3 = null === (t4 = l[s]) || void 0 === t4 ? void 0 : t4.version;
            if (n3 && (0, o2.isCompatible)(n3)) return null === (r3 = l[s]) || void 0 === r3 ? void 0 : r3[e3];
          }, t3.unregisterGlobal = function(e3, t4) {
            t4.debug(`@opentelemetry/api: Unregistering a global for ${e3} v${i2.VERSION}.`);
            let r3 = l[s];
            r3 && delete r3[e3];
          };
        }, 130: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.isCompatible = t3._makeCompatibilityCheck = void 0;
          let n2 = r2(521), i2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function o2(e3) {
            let t4 = /* @__PURE__ */ new Set([e3]), r3 = /* @__PURE__ */ new Set(), n3 = e3.match(i2);
            if (!n3) return () => false;
            let o3 = { major: +n3[1], minor: +n3[2], patch: +n3[3], prerelease: n3[4] };
            if (null != o3.prerelease) return function(t5) {
              return t5 === e3;
            };
            function a(e4) {
              return r3.add(e4), false;
            }
            return function(e4) {
              if (t4.has(e4)) return true;
              if (r3.has(e4)) return false;
              let n4 = e4.match(i2);
              if (!n4) return a(e4);
              let s = { major: +n4[1], minor: +n4[2], patch: +n4[3], prerelease: n4[4] };
              return null != s.prerelease || o3.major !== s.major ? a(e4) : 0 === o3.major ? o3.minor === s.minor && o3.patch <= s.patch ? (t4.add(e4), true) : a(e4) : o3.minor <= s.minor ? (t4.add(e4), true) : a(e4);
            };
          }
          t3._makeCompatibilityCheck = o2, t3.isCompatible = o2(n2.VERSION);
        }, 886: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.metrics = void 0;
          let n2 = r2(653);
          t3.metrics = n2.MetricsAPI.getInstance();
        }, 901: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ValueType = void 0, function(e3) {
            e3[e3.INT = 0] = "INT", e3[e3.DOUBLE = 1] = "DOUBLE";
          }(t3.ValueType || (t3.ValueType = {}));
        }, 102: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.createNoopMeter = t3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = t3.NOOP_OBSERVABLE_GAUGE_METRIC = t3.NOOP_OBSERVABLE_COUNTER_METRIC = t3.NOOP_UP_DOWN_COUNTER_METRIC = t3.NOOP_HISTOGRAM_METRIC = t3.NOOP_COUNTER_METRIC = t3.NOOP_METER = t3.NoopObservableUpDownCounterMetric = t3.NoopObservableGaugeMetric = t3.NoopObservableCounterMetric = t3.NoopObservableMetric = t3.NoopHistogramMetric = t3.NoopUpDownCounterMetric = t3.NoopCounterMetric = t3.NoopMetric = t3.NoopMeter = void 0;
          class r2 {
            constructor() {
            }
            createHistogram(e3, r3) {
              return t3.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(e3, r3) {
              return t3.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(e3, r3) {
              return t3.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(e3, r3) {
              return t3.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(e3, r3) {
              return t3.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(e3, r3) {
              return t3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(e3, t4) {
            }
            removeBatchObservableCallback(e3) {
            }
          }
          t3.NoopMeter = r2;
          class n2 {
          }
          t3.NoopMetric = n2;
          class i2 extends n2 {
            add(e3, t4) {
            }
          }
          t3.NoopCounterMetric = i2;
          class o2 extends n2 {
            add(e3, t4) {
            }
          }
          t3.NoopUpDownCounterMetric = o2;
          class a extends n2 {
            record(e3, t4) {
            }
          }
          t3.NoopHistogramMetric = a;
          class s {
            addCallback(e3) {
            }
            removeCallback(e3) {
            }
          }
          t3.NoopObservableMetric = s;
          class l extends s {
          }
          t3.NoopObservableCounterMetric = l;
          class c extends s {
          }
          t3.NoopObservableGaugeMetric = c;
          class u extends s {
          }
          t3.NoopObservableUpDownCounterMetric = u, t3.NOOP_METER = new r2(), t3.NOOP_COUNTER_METRIC = new i2(), t3.NOOP_HISTOGRAM_METRIC = new a(), t3.NOOP_UP_DOWN_COUNTER_METRIC = new o2(), t3.NOOP_OBSERVABLE_COUNTER_METRIC = new l(), t3.NOOP_OBSERVABLE_GAUGE_METRIC = new c(), t3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new u(), t3.createNoopMeter = function() {
            return t3.NOOP_METER;
          };
        }, 660: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NOOP_METER_PROVIDER = t3.NoopMeterProvider = void 0;
          let n2 = r2(102);
          class i2 {
            getMeter(e3, t4, r3) {
              return n2.NOOP_METER;
            }
          }
          t3.NoopMeterProvider = i2, t3.NOOP_METER_PROVIDER = new i2();
        }, 200: function(e2, t3, r2) {
          var n2 = this && this.__createBinding || (Object.create ? function(e3, t4, r3, n3) {
            void 0 === n3 && (n3 = r3), Object.defineProperty(e3, n3, { enumerable: true, get: function() {
              return t4[r3];
            } });
          } : function(e3, t4, r3, n3) {
            void 0 === n3 && (n3 = r3), e3[n3] = t4[r3];
          }), i2 = this && this.__exportStar || function(e3, t4) {
            for (var r3 in e3) "default" === r3 || Object.prototype.hasOwnProperty.call(t4, r3) || n2(t4, e3, r3);
          };
          Object.defineProperty(t3, "__esModule", { value: true }), i2(r2(46), t3);
        }, 651: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3._globalThis = void 0, t3._globalThis = "object" == typeof globalThis ? globalThis : r.g;
        }, 46: function(e2, t3, r2) {
          var n2 = this && this.__createBinding || (Object.create ? function(e3, t4, r3, n3) {
            void 0 === n3 && (n3 = r3), Object.defineProperty(e3, n3, { enumerable: true, get: function() {
              return t4[r3];
            } });
          } : function(e3, t4, r3, n3) {
            void 0 === n3 && (n3 = r3), e3[n3] = t4[r3];
          }), i2 = this && this.__exportStar || function(e3, t4) {
            for (var r3 in e3) "default" === r3 || Object.prototype.hasOwnProperty.call(t4, r3) || n2(t4, e3, r3);
          };
          Object.defineProperty(t3, "__esModule", { value: true }), i2(r2(651), t3);
        }, 939: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.propagation = void 0;
          let n2 = r2(181);
          t3.propagation = n2.PropagationAPI.getInstance();
        }, 874: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopTextMapPropagator = void 0;
          class r2 {
            inject(e3, t4) {
            }
            extract(e3, t4) {
              return e3;
            }
            fields() {
              return [];
            }
          }
          t3.NoopTextMapPropagator = r2;
        }, 194: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.defaultTextMapSetter = t3.defaultTextMapGetter = void 0, t3.defaultTextMapGetter = { get(e3, t4) {
            if (null != e3) return e3[t4];
          }, keys: (e3) => null == e3 ? [] : Object.keys(e3) }, t3.defaultTextMapSetter = { set(e3, t4, r2) {
            null != e3 && (e3[t4] = r2);
          } };
        }, 845: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.trace = void 0;
          let n2 = r2(997);
          t3.trace = n2.TraceAPI.getInstance();
        }, 403: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NonRecordingSpan = void 0;
          let n2 = r2(476);
          class i2 {
            constructor(e3 = n2.INVALID_SPAN_CONTEXT) {
              this._spanContext = e3;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(e3, t4) {
              return this;
            }
            setAttributes(e3) {
              return this;
            }
            addEvent(e3, t4) {
              return this;
            }
            setStatus(e3) {
              return this;
            }
            updateName(e3) {
              return this;
            }
            end(e3) {
            }
            isRecording() {
              return false;
            }
            recordException(e3, t4) {
            }
          }
          t3.NonRecordingSpan = i2;
        }, 614: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopTracer = void 0;
          let n2 = r2(491), i2 = r2(607), o2 = r2(403), a = r2(139), s = n2.ContextAPI.getInstance();
          class l {
            startSpan(e3, t4, r3 = s.active()) {
              if (null == t4 ? void 0 : t4.root) return new o2.NonRecordingSpan();
              let n3 = r3 && (0, i2.getSpanContext)(r3);
              return "object" == typeof n3 && "string" == typeof n3.spanId && "string" == typeof n3.traceId && "number" == typeof n3.traceFlags && (0, a.isSpanContextValid)(n3) ? new o2.NonRecordingSpan(n3) : new o2.NonRecordingSpan();
            }
            startActiveSpan(e3, t4, r3, n3) {
              let o3, a2, l2;
              if (arguments.length < 2) return;
              2 == arguments.length ? l2 = t4 : 3 == arguments.length ? (o3 = t4, l2 = r3) : (o3 = t4, a2 = r3, l2 = n3);
              let c = null != a2 ? a2 : s.active(), u = this.startSpan(e3, o3, c), d = (0, i2.setSpan)(c, u);
              return s.with(d, l2, void 0, u);
            }
          }
          t3.NoopTracer = l;
        }, 124: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.NoopTracerProvider = void 0;
          let n2 = r2(614);
          class i2 {
            getTracer(e3, t4, r3) {
              return new n2.NoopTracer();
            }
          }
          t3.NoopTracerProvider = i2;
        }, 125: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ProxyTracer = void 0;
          let n2 = new (r2(614)).NoopTracer();
          class i2 {
            constructor(e3, t4, r3, n3) {
              this._provider = e3, this.name = t4, this.version = r3, this.options = n3;
            }
            startSpan(e3, t4, r3) {
              return this._getTracer().startSpan(e3, t4, r3);
            }
            startActiveSpan(e3, t4, r3, n3) {
              let i3 = this._getTracer();
              return Reflect.apply(i3.startActiveSpan, i3, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let e3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return e3 ? (this._delegate = e3, this._delegate) : n2;
            }
          }
          t3.ProxyTracer = i2;
        }, 846: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.ProxyTracerProvider = void 0;
          let n2 = r2(125), i2 = new (r2(124)).NoopTracerProvider();
          class o2 {
            getTracer(e3, t4, r3) {
              var i3;
              return null !== (i3 = this.getDelegateTracer(e3, t4, r3)) && void 0 !== i3 ? i3 : new n2.ProxyTracer(this, e3, t4, r3);
            }
            getDelegate() {
              var e3;
              return null !== (e3 = this._delegate) && void 0 !== e3 ? e3 : i2;
            }
            setDelegate(e3) {
              this._delegate = e3;
            }
            getDelegateTracer(e3, t4, r3) {
              var n3;
              return null === (n3 = this._delegate) || void 0 === n3 ? void 0 : n3.getTracer(e3, t4, r3);
            }
          }
          t3.ProxyTracerProvider = o2;
        }, 996: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.SamplingDecision = void 0, function(e3) {
            e3[e3.NOT_RECORD = 0] = "NOT_RECORD", e3[e3.RECORD = 1] = "RECORD", e3[e3.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
          }(t3.SamplingDecision || (t3.SamplingDecision = {}));
        }, 607: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.getSpanContext = t3.setSpanContext = t3.deleteSpan = t3.setSpan = t3.getActiveSpan = t3.getSpan = void 0;
          let n2 = r2(780), i2 = r2(403), o2 = r2(491), a = (0, n2.createContextKey)("OpenTelemetry Context Key SPAN");
          function s(e3) {
            return e3.getValue(a) || void 0;
          }
          function l(e3, t4) {
            return e3.setValue(a, t4);
          }
          t3.getSpan = s, t3.getActiveSpan = function() {
            return s(o2.ContextAPI.getInstance().active());
          }, t3.setSpan = l, t3.deleteSpan = function(e3) {
            return e3.deleteValue(a);
          }, t3.setSpanContext = function(e3, t4) {
            return l(e3, new i2.NonRecordingSpan(t4));
          }, t3.getSpanContext = function(e3) {
            var t4;
            return null === (t4 = s(e3)) || void 0 === t4 ? void 0 : t4.spanContext();
          };
        }, 325: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.TraceStateImpl = void 0;
          let n2 = r2(564);
          class i2 {
            constructor(e3) {
              this._internalState = /* @__PURE__ */ new Map(), e3 && this._parse(e3);
            }
            set(e3, t4) {
              let r3 = this._clone();
              return r3._internalState.has(e3) && r3._internalState.delete(e3), r3._internalState.set(e3, t4), r3;
            }
            unset(e3) {
              let t4 = this._clone();
              return t4._internalState.delete(e3), t4;
            }
            get(e3) {
              return this._internalState.get(e3);
            }
            serialize() {
              return this._keys().reduce((e3, t4) => (e3.push(t4 + "=" + this.get(t4)), e3), []).join(",");
            }
            _parse(e3) {
              !(e3.length > 512) && (this._internalState = e3.split(",").reverse().reduce((e4, t4) => {
                let r3 = t4.trim(), i3 = r3.indexOf("=");
                if (-1 !== i3) {
                  let o2 = r3.slice(0, i3), a = r3.slice(i3 + 1, t4.length);
                  (0, n2.validateKey)(o2) && (0, n2.validateValue)(a) && e4.set(o2, a);
                }
                return e4;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let e3 = new i2();
              return e3._internalState = new Map(this._internalState), e3;
            }
          }
          t3.TraceStateImpl = i2;
        }, 564: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.validateValue = t3.validateKey = void 0;
          let r2 = "[_0-9a-z-*/]", n2 = `[a-z]${r2}{0,255}`, i2 = `[a-z0-9]${r2}{0,240}@[a-z]${r2}{0,13}`, o2 = RegExp(`^(?:${n2}|${i2})$`), a = /^[ -~]{0,255}[!-~]$/, s = /,|=/;
          t3.validateKey = function(e3) {
            return o2.test(e3);
          }, t3.validateValue = function(e3) {
            return a.test(e3) && !s.test(e3);
          };
        }, 98: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.createTraceState = void 0;
          let n2 = r2(325);
          t3.createTraceState = function(e3) {
            return new n2.TraceStateImpl(e3);
          };
        }, 476: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.INVALID_SPAN_CONTEXT = t3.INVALID_TRACEID = t3.INVALID_SPANID = void 0;
          let n2 = r2(475);
          t3.INVALID_SPANID = "0000000000000000", t3.INVALID_TRACEID = "00000000000000000000000000000000", t3.INVALID_SPAN_CONTEXT = { traceId: t3.INVALID_TRACEID, spanId: t3.INVALID_SPANID, traceFlags: n2.TraceFlags.NONE };
        }, 357: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.SpanKind = void 0, function(e3) {
            e3[e3.INTERNAL = 0] = "INTERNAL", e3[e3.SERVER = 1] = "SERVER", e3[e3.CLIENT = 2] = "CLIENT", e3[e3.PRODUCER = 3] = "PRODUCER", e3[e3.CONSUMER = 4] = "CONSUMER";
          }(t3.SpanKind || (t3.SpanKind = {}));
        }, 139: (e2, t3, r2) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.wrapSpanContext = t3.isSpanContextValid = t3.isValidSpanId = t3.isValidTraceId = void 0;
          let n2 = r2(476), i2 = r2(403), o2 = /^([0-9a-f]{32})$/i, a = /^[0-9a-f]{16}$/i;
          function s(e3) {
            return o2.test(e3) && e3 !== n2.INVALID_TRACEID;
          }
          function l(e3) {
            return a.test(e3) && e3 !== n2.INVALID_SPANID;
          }
          t3.isValidTraceId = s, t3.isValidSpanId = l, t3.isSpanContextValid = function(e3) {
            return s(e3.traceId) && l(e3.spanId);
          }, t3.wrapSpanContext = function(e3) {
            return new i2.NonRecordingSpan(e3);
          };
        }, 847: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.SpanStatusCode = void 0, function(e3) {
            e3[e3.UNSET = 0] = "UNSET", e3[e3.OK = 1] = "OK", e3[e3.ERROR = 2] = "ERROR";
          }(t3.SpanStatusCode || (t3.SpanStatusCode = {}));
        }, 475: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.TraceFlags = void 0, function(e3) {
            e3[e3.NONE = 0] = "NONE", e3[e3.SAMPLED = 1] = "SAMPLED";
          }(t3.TraceFlags || (t3.TraceFlags = {}));
        }, 521: (e2, t3) => {
          Object.defineProperty(t3, "__esModule", { value: true }), t3.VERSION = void 0, t3.VERSION = "1.6.0";
        } }, n = {};
        function i(e2) {
          var r2 = n[e2];
          if (void 0 !== r2) return r2.exports;
          var o2 = n[e2] = { exports: {} }, a = true;
          try {
            t2[e2].call(o2.exports, o2, o2.exports, i), a = false;
          } finally {
            a && delete n[e2];
          }
          return o2.exports;
        }
        i.ab = "//";
        var o = {};
        (() => {
          Object.defineProperty(o, "__esModule", { value: true }), o.trace = o.propagation = o.metrics = o.diag = o.context = o.INVALID_SPAN_CONTEXT = o.INVALID_TRACEID = o.INVALID_SPANID = o.isValidSpanId = o.isValidTraceId = o.isSpanContextValid = o.createTraceState = o.TraceFlags = o.SpanStatusCode = o.SpanKind = o.SamplingDecision = o.ProxyTracerProvider = o.ProxyTracer = o.defaultTextMapSetter = o.defaultTextMapGetter = o.ValueType = o.createNoopMeter = o.DiagLogLevel = o.DiagConsoleLogger = o.ROOT_CONTEXT = o.createContextKey = o.baggageEntryMetadataFromString = void 0;
          var e2 = i(369);
          Object.defineProperty(o, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
            return e2.baggageEntryMetadataFromString;
          } });
          var t3 = i(780);
          Object.defineProperty(o, "createContextKey", { enumerable: true, get: function() {
            return t3.createContextKey;
          } }), Object.defineProperty(o, "ROOT_CONTEXT", { enumerable: true, get: function() {
            return t3.ROOT_CONTEXT;
          } });
          var r2 = i(972);
          Object.defineProperty(o, "DiagConsoleLogger", { enumerable: true, get: function() {
            return r2.DiagConsoleLogger;
          } });
          var n2 = i(957);
          Object.defineProperty(o, "DiagLogLevel", { enumerable: true, get: function() {
            return n2.DiagLogLevel;
          } });
          var a = i(102);
          Object.defineProperty(o, "createNoopMeter", { enumerable: true, get: function() {
            return a.createNoopMeter;
          } });
          var s = i(901);
          Object.defineProperty(o, "ValueType", { enumerable: true, get: function() {
            return s.ValueType;
          } });
          var l = i(194);
          Object.defineProperty(o, "defaultTextMapGetter", { enumerable: true, get: function() {
            return l.defaultTextMapGetter;
          } }), Object.defineProperty(o, "defaultTextMapSetter", { enumerable: true, get: function() {
            return l.defaultTextMapSetter;
          } });
          var c = i(125);
          Object.defineProperty(o, "ProxyTracer", { enumerable: true, get: function() {
            return c.ProxyTracer;
          } });
          var u = i(846);
          Object.defineProperty(o, "ProxyTracerProvider", { enumerable: true, get: function() {
            return u.ProxyTracerProvider;
          } });
          var d = i(996);
          Object.defineProperty(o, "SamplingDecision", { enumerable: true, get: function() {
            return d.SamplingDecision;
          } });
          var p = i(357);
          Object.defineProperty(o, "SpanKind", { enumerable: true, get: function() {
            return p.SpanKind;
          } });
          var h = i(847);
          Object.defineProperty(o, "SpanStatusCode", { enumerable: true, get: function() {
            return h.SpanStatusCode;
          } });
          var f = i(475);
          Object.defineProperty(o, "TraceFlags", { enumerable: true, get: function() {
            return f.TraceFlags;
          } });
          var m = i(98);
          Object.defineProperty(o, "createTraceState", { enumerable: true, get: function() {
            return m.createTraceState;
          } });
          var g = i(139);
          Object.defineProperty(o, "isSpanContextValid", { enumerable: true, get: function() {
            return g.isSpanContextValid;
          } }), Object.defineProperty(o, "isValidTraceId", { enumerable: true, get: function() {
            return g.isValidTraceId;
          } }), Object.defineProperty(o, "isValidSpanId", { enumerable: true, get: function() {
            return g.isValidSpanId;
          } });
          var y = i(476);
          Object.defineProperty(o, "INVALID_SPANID", { enumerable: true, get: function() {
            return y.INVALID_SPANID;
          } }), Object.defineProperty(o, "INVALID_TRACEID", { enumerable: true, get: function() {
            return y.INVALID_TRACEID;
          } }), Object.defineProperty(o, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
            return y.INVALID_SPAN_CONTEXT;
          } });
          let w = i(67);
          Object.defineProperty(o, "context", { enumerable: true, get: function() {
            return w.context;
          } });
          let b = i(506);
          Object.defineProperty(o, "diag", { enumerable: true, get: function() {
            return b.diag;
          } });
          let v = i(886);
          Object.defineProperty(o, "metrics", { enumerable: true, get: function() {
            return v.metrics;
          } });
          let _ = i(939);
          Object.defineProperty(o, "propagation", { enumerable: true, get: function() {
            return _.propagation;
          } });
          let S = i(845);
          Object.defineProperty(o, "trace", { enumerable: true, get: function() {
            return S.trace;
          } }), o.default = { context: w.context, diag: b.diag, metrics: v.metrics, propagation: _.propagation, trace: S.trace };
        })(), e.exports = o;
      })();
    }, 945: (e) => {
      (() => {
        "use strict";
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var t = {};
        (() => {
          t.parse = function(t2, r2) {
            if ("string" != typeof t2) throw TypeError("argument str must be a string");
            for (var i2 = {}, o = t2.split(n), a = (r2 || {}).decode || e2, s = 0; s < o.length; s++) {
              var l = o[s], c = l.indexOf("=");
              if (!(c < 0)) {
                var u = l.substr(0, c).trim(), d = l.substr(++c, l.length).trim();
                '"' == d[0] && (d = d.slice(1, -1)), void 0 == i2[u] && (i2[u] = function(e3, t3) {
                  try {
                    return t3(e3);
                  } catch (t4) {
                    return e3;
                  }
                }(d, a));
              }
            }
            return i2;
          }, t.serialize = function(e3, t2, n2) {
            var o = n2 || {}, a = o.encode || r;
            if ("function" != typeof a) throw TypeError("option encode is invalid");
            if (!i.test(e3)) throw TypeError("argument name is invalid");
            var s = a(t2);
            if (s && !i.test(s)) throw TypeError("argument val is invalid");
            var l = e3 + "=" + s;
            if (null != o.maxAge) {
              var c = o.maxAge - 0;
              if (isNaN(c) || !isFinite(c)) throw TypeError("option maxAge is invalid");
              l += "; Max-Age=" + Math.floor(c);
            }
            if (o.domain) {
              if (!i.test(o.domain)) throw TypeError("option domain is invalid");
              l += "; Domain=" + o.domain;
            }
            if (o.path) {
              if (!i.test(o.path)) throw TypeError("option path is invalid");
              l += "; Path=" + o.path;
            }
            if (o.expires) {
              if ("function" != typeof o.expires.toUTCString) throw TypeError("option expires is invalid");
              l += "; Expires=" + o.expires.toUTCString();
            }
            if (o.httpOnly && (l += "; HttpOnly"), o.secure && (l += "; Secure"), o.sameSite) switch ("string" == typeof o.sameSite ? o.sameSite.toLowerCase() : o.sameSite) {
              case true:
              case "strict":
                l += "; SameSite=Strict";
                break;
              case "lax":
                l += "; SameSite=Lax";
                break;
              case "none":
                l += "; SameSite=None";
                break;
              default:
                throw TypeError("option sameSite is invalid");
            }
            return l;
          };
          var e2 = decodeURIComponent, r = encodeURIComponent, n = /; */, i = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        })(), e.exports = t;
      })();
    }, 891: (e) => {
      (() => {
        "use strict";
        var t = { 993: (e2) => {
          var t2 = Object.prototype.hasOwnProperty, r2 = "~";
          function n2() {
          }
          function i2(e3, t3, r3) {
            this.fn = e3, this.context = t3, this.once = r3 || false;
          }
          function o(e3, t3, n3, o2, a2) {
            if ("function" != typeof n3) throw TypeError("The listener must be a function");
            var s2 = new i2(n3, o2 || e3, a2), l = r2 ? r2 + t3 : t3;
            return e3._events[l] ? e3._events[l].fn ? e3._events[l] = [e3._events[l], s2] : e3._events[l].push(s2) : (e3._events[l] = s2, e3._eventsCount++), e3;
          }
          function a(e3, t3) {
            0 == --e3._eventsCount ? e3._events = new n2() : delete e3._events[t3];
          }
          function s() {
            this._events = new n2(), this._eventsCount = 0;
          }
          Object.create && (n2.prototype = /* @__PURE__ */ Object.create(null), new n2().__proto__ || (r2 = false)), s.prototype.eventNames = function() {
            var e3, n3, i3 = [];
            if (0 === this._eventsCount) return i3;
            for (n3 in e3 = this._events) t2.call(e3, n3) && i3.push(r2 ? n3.slice(1) : n3);
            return Object.getOwnPropertySymbols ? i3.concat(Object.getOwnPropertySymbols(e3)) : i3;
          }, s.prototype.listeners = function(e3) {
            var t3 = r2 ? r2 + e3 : e3, n3 = this._events[t3];
            if (!n3) return [];
            if (n3.fn) return [n3.fn];
            for (var i3 = 0, o2 = n3.length, a2 = Array(o2); i3 < o2; i3++) a2[i3] = n3[i3].fn;
            return a2;
          }, s.prototype.listenerCount = function(e3) {
            var t3 = r2 ? r2 + e3 : e3, n3 = this._events[t3];
            return n3 ? n3.fn ? 1 : n3.length : 0;
          }, s.prototype.emit = function(e3, t3, n3, i3, o2, a2) {
            var s2 = r2 ? r2 + e3 : e3;
            if (!this._events[s2]) return false;
            var l, c, u = this._events[s2], d = arguments.length;
            if (u.fn) {
              switch (u.once && this.removeListener(e3, u.fn, void 0, true), d) {
                case 1:
                  return u.fn.call(u.context), true;
                case 2:
                  return u.fn.call(u.context, t3), true;
                case 3:
                  return u.fn.call(u.context, t3, n3), true;
                case 4:
                  return u.fn.call(u.context, t3, n3, i3), true;
                case 5:
                  return u.fn.call(u.context, t3, n3, i3, o2), true;
                case 6:
                  return u.fn.call(u.context, t3, n3, i3, o2, a2), true;
              }
              for (c = 1, l = Array(d - 1); c < d; c++) l[c - 1] = arguments[c];
              u.fn.apply(u.context, l);
            } else {
              var p, h = u.length;
              for (c = 0; c < h; c++) switch (u[c].once && this.removeListener(e3, u[c].fn, void 0, true), d) {
                case 1:
                  u[c].fn.call(u[c].context);
                  break;
                case 2:
                  u[c].fn.call(u[c].context, t3);
                  break;
                case 3:
                  u[c].fn.call(u[c].context, t3, n3);
                  break;
                case 4:
                  u[c].fn.call(u[c].context, t3, n3, i3);
                  break;
                default:
                  if (!l) for (p = 1, l = Array(d - 1); p < d; p++) l[p - 1] = arguments[p];
                  u[c].fn.apply(u[c].context, l);
              }
            }
            return true;
          }, s.prototype.on = function(e3, t3, r3) {
            return o(this, e3, t3, r3, false);
          }, s.prototype.once = function(e3, t3, r3) {
            return o(this, e3, t3, r3, true);
          }, s.prototype.removeListener = function(e3, t3, n3, i3) {
            var o2 = r2 ? r2 + e3 : e3;
            if (!this._events[o2]) return this;
            if (!t3) return a(this, o2), this;
            var s2 = this._events[o2];
            if (s2.fn) s2.fn !== t3 || i3 && !s2.once || n3 && s2.context !== n3 || a(this, o2);
            else {
              for (var l = 0, c = [], u = s2.length; l < u; l++) (s2[l].fn !== t3 || i3 && !s2[l].once || n3 && s2[l].context !== n3) && c.push(s2[l]);
              c.length ? this._events[o2] = 1 === c.length ? c[0] : c : a(this, o2);
            }
            return this;
          }, s.prototype.removeAllListeners = function(e3) {
            var t3;
            return e3 ? (t3 = r2 ? r2 + e3 : e3, this._events[t3] && a(this, t3)) : (this._events = new n2(), this._eventsCount = 0), this;
          }, s.prototype.off = s.prototype.removeListener, s.prototype.addListener = s.prototype.on, s.prefixed = r2, s.EventEmitter = s, e2.exports = s;
        }, 213: (e2) => {
          e2.exports = (e3, t2) => (t2 = t2 || (() => {
          }), e3.then((e4) => new Promise((e5) => {
            e5(t2());
          }).then(() => e4), (e4) => new Promise((e5) => {
            e5(t2());
          }).then(() => {
            throw e4;
          })));
        }, 574: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function(e3, t3, r2) {
            let n2 = 0, i2 = e3.length;
            for (; i2 > 0; ) {
              let o = i2 / 2 | 0, a = n2 + o;
              0 >= r2(e3[a], t3) ? (n2 = ++a, i2 -= o + 1) : i2 = o;
            }
            return n2;
          };
        }, 821: (e2, t2, r2) => {
          Object.defineProperty(t2, "__esModule", { value: true });
          let n2 = r2(574);
          class i2 {
            constructor() {
              this._queue = [];
            }
            enqueue(e3, t3) {
              let r3 = { priority: (t3 = Object.assign({ priority: 0 }, t3)).priority, run: e3 };
              if (this.size && this._queue[this.size - 1].priority >= t3.priority) {
                this._queue.push(r3);
                return;
              }
              let i3 = n2.default(this._queue, r3, (e4, t4) => t4.priority - e4.priority);
              this._queue.splice(i3, 0, r3);
            }
            dequeue() {
              let e3 = this._queue.shift();
              return null == e3 ? void 0 : e3.run;
            }
            filter(e3) {
              return this._queue.filter((t3) => t3.priority === e3.priority).map((e4) => e4.run);
            }
            get size() {
              return this._queue.length;
            }
          }
          t2.default = i2;
        }, 816: (e2, t2, r2) => {
          let n2 = r2(213);
          class i2 extends Error {
            constructor(e3) {
              super(e3), this.name = "TimeoutError";
            }
          }
          let o = (e3, t3, r3) => new Promise((o2, a) => {
            if ("number" != typeof t3 || t3 < 0) throw TypeError("Expected `milliseconds` to be a positive number");
            if (t3 === 1 / 0) {
              o2(e3);
              return;
            }
            let s = setTimeout(() => {
              if ("function" == typeof r3) {
                try {
                  o2(r3());
                } catch (e4) {
                  a(e4);
                }
                return;
              }
              let n3 = "string" == typeof r3 ? r3 : `Promise timed out after ${t3} milliseconds`, s2 = r3 instanceof Error ? r3 : new i2(n3);
              "function" == typeof e3.cancel && e3.cancel(), a(s2);
            }, t3);
            n2(e3.then(o2, a), () => {
              clearTimeout(s);
            });
          });
          e2.exports = o, e2.exports.default = o, e2.exports.TimeoutError = i2;
        } }, r = {};
        function n(e2) {
          var i2 = r[e2];
          if (void 0 !== i2) return i2.exports;
          var o = r[e2] = { exports: {} }, a = true;
          try {
            t[e2](o, o.exports, n), a = false;
          } finally {
            a && delete r[e2];
          }
          return o.exports;
        }
        n.ab = "//";
        var i = {};
        (() => {
          Object.defineProperty(i, "__esModule", { value: true });
          let e2 = n(993), t2 = n(816), r2 = n(821), o = () => {
          }, a = new t2.TimeoutError();
          class s extends e2 {
            constructor(e3) {
              var t3, n2, i2, a2;
              if (super(), this._intervalCount = 0, this._intervalEnd = 0, this._pendingCount = 0, this._resolveEmpty = o, this._resolveIdle = o, !("number" == typeof (e3 = Object.assign({ carryoverConcurrencyCount: false, intervalCap: 1 / 0, interval: 0, concurrency: 1 / 0, autoStart: true, queueClass: r2.default }, e3)).intervalCap && e3.intervalCap >= 1)) throw TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${null !== (n2 = null === (t3 = e3.intervalCap) || void 0 === t3 ? void 0 : t3.toString()) && void 0 !== n2 ? n2 : ""}\` (${typeof e3.intervalCap})`);
              if (void 0 === e3.interval || !(Number.isFinite(e3.interval) && e3.interval >= 0)) throw TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${null !== (a2 = null === (i2 = e3.interval) || void 0 === i2 ? void 0 : i2.toString()) && void 0 !== a2 ? a2 : ""}\` (${typeof e3.interval})`);
              this._carryoverConcurrencyCount = e3.carryoverConcurrencyCount, this._isIntervalIgnored = e3.intervalCap === 1 / 0 || 0 === e3.interval, this._intervalCap = e3.intervalCap, this._interval = e3.interval, this._queue = new e3.queueClass(), this._queueClass = e3.queueClass, this.concurrency = e3.concurrency, this._timeout = e3.timeout, this._throwOnTimeout = true === e3.throwOnTimeout, this._isPaused = false === e3.autoStart;
            }
            get _doesIntervalAllowAnother() {
              return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
            }
            get _doesConcurrentAllowAnother() {
              return this._pendingCount < this._concurrency;
            }
            _next() {
              this._pendingCount--, this._tryToStartAnother(), this.emit("next");
            }
            _resolvePromises() {
              this._resolveEmpty(), this._resolveEmpty = o, 0 === this._pendingCount && (this._resolveIdle(), this._resolveIdle = o, this.emit("idle"));
            }
            _onResumeInterval() {
              this._onInterval(), this._initializeIntervalIfNeeded(), this._timeoutId = void 0;
            }
            _isIntervalPaused() {
              let e3 = Date.now();
              if (void 0 === this._intervalId) {
                let t3 = this._intervalEnd - e3;
                if (!(t3 < 0)) return void 0 === this._timeoutId && (this._timeoutId = setTimeout(() => {
                  this._onResumeInterval();
                }, t3)), true;
                this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
              }
              return false;
            }
            _tryToStartAnother() {
              if (0 === this._queue.size) return this._intervalId && clearInterval(this._intervalId), this._intervalId = void 0, this._resolvePromises(), false;
              if (!this._isPaused) {
                let e3 = !this._isIntervalPaused();
                if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                  let t3 = this._queue.dequeue();
                  return !!t3 && (this.emit("active"), t3(), e3 && this._initializeIntervalIfNeeded(), true);
                }
              }
              return false;
            }
            _initializeIntervalIfNeeded() {
              this._isIntervalIgnored || void 0 !== this._intervalId || (this._intervalId = setInterval(() => {
                this._onInterval();
              }, this._interval), this._intervalEnd = Date.now() + this._interval);
            }
            _onInterval() {
              0 === this._intervalCount && 0 === this._pendingCount && this._intervalId && (clearInterval(this._intervalId), this._intervalId = void 0), this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0, this._processQueue();
            }
            _processQueue() {
              for (; this._tryToStartAnother(); ) ;
            }
            get concurrency() {
              return this._concurrency;
            }
            set concurrency(e3) {
              if (!("number" == typeof e3 && e3 >= 1)) throw TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${e3}\` (${typeof e3})`);
              this._concurrency = e3, this._processQueue();
            }
            async add(e3, r3 = {}) {
              return new Promise((n2, i2) => {
                let o2 = async () => {
                  this._pendingCount++, this._intervalCount++;
                  try {
                    let o3 = void 0 === this._timeout && void 0 === r3.timeout ? e3() : t2.default(Promise.resolve(e3()), void 0 === r3.timeout ? this._timeout : r3.timeout, () => {
                      (void 0 === r3.throwOnTimeout ? this._throwOnTimeout : r3.throwOnTimeout) && i2(a);
                    });
                    n2(await o3);
                  } catch (e4) {
                    i2(e4);
                  }
                  this._next();
                };
                this._queue.enqueue(o2, r3), this._tryToStartAnother(), this.emit("add");
              });
            }
            async addAll(e3, t3) {
              return Promise.all(e3.map(async (e4) => this.add(e4, t3)));
            }
            start() {
              return this._isPaused && (this._isPaused = false, this._processQueue()), this;
            }
            pause() {
              this._isPaused = true;
            }
            clear() {
              this._queue = new this._queueClass();
            }
            async onEmpty() {
              if (0 !== this._queue.size) return new Promise((e3) => {
                let t3 = this._resolveEmpty;
                this._resolveEmpty = () => {
                  t3(), e3();
                };
              });
            }
            async onIdle() {
              if (0 !== this._pendingCount || 0 !== this._queue.size) return new Promise((e3) => {
                let t3 = this._resolveIdle;
                this._resolveIdle = () => {
                  t3(), e3();
                };
              });
            }
            get size() {
              return this._queue.size;
            }
            sizeBy(e3) {
              return this._queue.filter(e3).length;
            }
            get pending() {
              return this._pendingCount;
            }
            get isPaused() {
              return this._isPaused;
            }
            get timeout() {
              return this._timeout;
            }
            set timeout(e3) {
              this._timeout = e3;
            }
          }
          i.default = s;
        })(), e.exports = i;
      })();
    }, 222: (e, t) => {
      "use strict";
      var r = { H: null, A: null };
      function n(e2) {
        var t2 = "https://react.dev/errors/" + e2;
        if (1 < arguments.length) {
          t2 += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var r2 = 2; r2 < arguments.length; r2++) t2 += "&args[]=" + encodeURIComponent(arguments[r2]);
        }
        return "Minified React error #" + e2 + "; visit " + t2 + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      var i = Array.isArray, o = Symbol.for("react.transitional.element"), a = Symbol.for("react.portal"), s = Symbol.for("react.fragment"), l = Symbol.for("react.strict_mode"), c = Symbol.for("react.profiler"), u = Symbol.for("react.forward_ref"), d = Symbol.for("react.suspense"), p = Symbol.for("react.memo"), h = Symbol.for("react.lazy"), f = Symbol.iterator, m = Object.prototype.hasOwnProperty, g = Object.assign;
      function y(e2, t2, r2, n2, i2, a2) {
        return { $$typeof: o, type: e2, key: t2, ref: void 0 !== (r2 = a2.ref) ? r2 : null, props: a2 };
      }
      function w(e2) {
        return "object" == typeof e2 && null !== e2 && e2.$$typeof === o;
      }
      var b = /\/+/g;
      function v(e2, t2) {
        var r2, n2;
        return "object" == typeof e2 && null !== e2 && null != e2.key ? (r2 = "" + e2.key, n2 = { "=": "=0", ":": "=2" }, "$" + r2.replace(/[=:]/g, function(e3) {
          return n2[e3];
        })) : t2.toString(36);
      }
      function _() {
      }
      function S(e2, t2, r2) {
        if (null == e2) return e2;
        var s2 = [], l2 = 0;
        return !function e3(t3, r3, s3, l3, c2) {
          var u2, d2, p2, m2 = typeof t3;
          ("undefined" === m2 || "boolean" === m2) && (t3 = null);
          var g2 = false;
          if (null === t3) g2 = true;
          else switch (m2) {
            case "bigint":
            case "string":
            case "number":
              g2 = true;
              break;
            case "object":
              switch (t3.$$typeof) {
                case o:
                case a:
                  g2 = true;
                  break;
                case h:
                  return e3((g2 = t3._init)(t3._payload), r3, s3, l3, c2);
              }
          }
          if (g2) return c2 = c2(t3), g2 = "" === l3 ? "." + v(t3, 0) : l3, i(c2) ? (s3 = "", null != g2 && (s3 = g2.replace(b, "$&/") + "/"), e3(c2, r3, s3, "", function(e4) {
            return e4;
          })) : null != c2 && (w(c2) && (u2 = c2, d2 = s3 + (null == c2.key || t3 && t3.key === c2.key ? "" : ("" + c2.key).replace(b, "$&/") + "/") + g2, c2 = y(u2.type, d2, void 0, void 0, void 0, u2.props)), r3.push(c2)), 1;
          g2 = 0;
          var S2 = "" === l3 ? "." : l3 + ":";
          if (i(t3)) for (var k2 = 0; k2 < t3.length; k2++) m2 = S2 + v(l3 = t3[k2], k2), g2 += e3(l3, r3, s3, m2, c2);
          else if ("function" == typeof (k2 = null === (p2 = t3) || "object" != typeof p2 ? null : "function" == typeof (p2 = f && p2[f] || p2["@@iterator"]) ? p2 : null)) for (t3 = k2.call(t3), k2 = 0; !(l3 = t3.next()).done; ) m2 = S2 + v(l3 = l3.value, k2++), g2 += e3(l3, r3, s3, m2, c2);
          else if ("object" === m2) {
            if ("function" == typeof t3.then) return e3(function(e4) {
              switch (e4.status) {
                case "fulfilled":
                  return e4.value;
                case "rejected":
                  throw e4.reason;
                default:
                  switch ("string" == typeof e4.status ? e4.then(_, _) : (e4.status = "pending", e4.then(function(t4) {
                    "pending" === e4.status && (e4.status = "fulfilled", e4.value = t4);
                  }, function(t4) {
                    "pending" === e4.status && (e4.status = "rejected", e4.reason = t4);
                  })), e4.status) {
                    case "fulfilled":
                      return e4.value;
                    case "rejected":
                      throw e4.reason;
                  }
              }
              throw e4;
            }(t3), r3, s3, l3, c2);
            throw Error(n(31, "[object Object]" === (r3 = String(t3)) ? "object with keys {" + Object.keys(t3).join(", ") + "}" : r3));
          }
          return g2;
        }(e2, s2, "", "", function(e3) {
          return t2.call(r2, e3, l2++);
        }), s2;
      }
      function k(e2) {
        if (-1 === e2._status) {
          var t2 = e2._result;
          (t2 = t2()).then(function(t3) {
            (0 === e2._status || -1 === e2._status) && (e2._status = 1, e2._result = t3);
          }, function(t3) {
            (0 === e2._status || -1 === e2._status) && (e2._status = 2, e2._result = t3);
          }), -1 === e2._status && (e2._status = 0, e2._result = t2);
        }
        if (1 === e2._status) return e2._result.default;
        throw e2._result;
      }
      function x() {
        return /* @__PURE__ */ new WeakMap();
      }
      function E() {
        return { s: 0, v: void 0, o: null, p: null };
      }
      t.Children = { map: S, forEach: function(e2, t2, r2) {
        S(e2, function() {
          t2.apply(this, arguments);
        }, r2);
      }, count: function(e2) {
        var t2 = 0;
        return S(e2, function() {
          t2++;
        }), t2;
      }, toArray: function(e2) {
        return S(e2, function(e3) {
          return e3;
        }) || [];
      }, only: function(e2) {
        if (!w(e2)) throw Error(n(143));
        return e2;
      } }, t.Fragment = s, t.Profiler = c, t.StrictMode = l, t.Suspense = d, t.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = r, t.cache = function(e2) {
        return function() {
          var t2 = r.A;
          if (!t2) return e2.apply(null, arguments);
          var n2 = t2.getCacheForType(x);
          void 0 === (t2 = n2.get(e2)) && (t2 = E(), n2.set(e2, t2)), n2 = 0;
          for (var i2 = arguments.length; n2 < i2; n2++) {
            var o2 = arguments[n2];
            if ("function" == typeof o2 || "object" == typeof o2 && null !== o2) {
              var a2 = t2.o;
              null === a2 && (t2.o = a2 = /* @__PURE__ */ new WeakMap()), void 0 === (t2 = a2.get(o2)) && (t2 = E(), a2.set(o2, t2));
            } else null === (a2 = t2.p) && (t2.p = a2 = /* @__PURE__ */ new Map()), void 0 === (t2 = a2.get(o2)) && (t2 = E(), a2.set(o2, t2));
          }
          if (1 === t2.s) return t2.v;
          if (2 === t2.s) throw t2.v;
          try {
            var s2 = e2.apply(null, arguments);
            return (n2 = t2).s = 1, n2.v = s2;
          } catch (e3) {
            throw (s2 = t2).s = 2, s2.v = e3, e3;
          }
        };
      }, t.cloneElement = function(e2, t2, r2) {
        if (null == e2) throw Error(n(267, e2));
        var i2 = g({}, e2.props), o2 = e2.key, a2 = void 0;
        if (null != t2) for (s2 in void 0 !== t2.ref && (a2 = void 0), void 0 !== t2.key && (o2 = "" + t2.key), t2) m.call(t2, s2) && "key" !== s2 && "__self" !== s2 && "__source" !== s2 && ("ref" !== s2 || void 0 !== t2.ref) && (i2[s2] = t2[s2]);
        var s2 = arguments.length - 2;
        if (1 === s2) i2.children = r2;
        else if (1 < s2) {
          for (var l2 = Array(s2), c2 = 0; c2 < s2; c2++) l2[c2] = arguments[c2 + 2];
          i2.children = l2;
        }
        return y(e2.type, o2, void 0, void 0, a2, i2);
      }, t.createElement = function(e2, t2, r2) {
        var n2, i2 = {}, o2 = null;
        if (null != t2) for (n2 in void 0 !== t2.key && (o2 = "" + t2.key), t2) m.call(t2, n2) && "key" !== n2 && "__self" !== n2 && "__source" !== n2 && (i2[n2] = t2[n2]);
        var a2 = arguments.length - 2;
        if (1 === a2) i2.children = r2;
        else if (1 < a2) {
          for (var s2 = Array(a2), l2 = 0; l2 < a2; l2++) s2[l2] = arguments[l2 + 2];
          i2.children = s2;
        }
        if (e2 && e2.defaultProps) for (n2 in a2 = e2.defaultProps) void 0 === i2[n2] && (i2[n2] = a2[n2]);
        return y(e2, o2, void 0, void 0, null, i2);
      }, t.createRef = function() {
        return { current: null };
      }, t.forwardRef = function(e2) {
        return { $$typeof: u, render: e2 };
      }, t.isValidElement = w, t.lazy = function(e2) {
        return { $$typeof: h, _payload: { _status: -1, _result: e2 }, _init: k };
      }, t.memo = function(e2, t2) {
        return { $$typeof: p, type: e2, compare: void 0 === t2 ? null : t2 };
      }, t.use = function(e2) {
        return r.H.use(e2);
      }, t.useCallback = function(e2, t2) {
        return r.H.useCallback(e2, t2);
      }, t.useDebugValue = function() {
      }, t.useId = function() {
        return r.H.useId();
      }, t.useMemo = function(e2, t2) {
        return r.H.useMemo(e2, t2);
      }, t.version = "19.0.0-rc-65e06cb7-20241218";
    }, 400: (e, t, r) => {
      "use strict";
      e.exports = r(222);
    }, 455: (e, t, r) => {
      var n;
      (() => {
        var i = { 226: function(i2, o2) {
          !function(a2, s2) {
            "use strict";
            var l = "function", c = "undefined", u = "object", d = "string", p = "major", h = "model", f = "name", m = "type", g = "vendor", y = "version", w = "architecture", b = "console", v = "mobile", _ = "tablet", S = "smarttv", k = "wearable", x = "embedded", E = "Amazon", A = "Apple", T = "ASUS", P = "BlackBerry", C = "Browser", R = "Chrome", O = "Firefox", I = "Google", U = "Huawei", N = "Microsoft", $ = "Motorola", j = "Opera", L = "Samsung", D = "Sharp", M = "Sony", H = "Xiaomi", W = "Zebra", B = "Facebook", q = "Chromium OS", K = "Mac OS", V = function(e2, t2) {
              var r2 = {};
              for (var n2 in e2) t2[n2] && t2[n2].length % 2 == 0 ? r2[n2] = t2[n2].concat(e2[n2]) : r2[n2] = e2[n2];
              return r2;
            }, z = function(e2) {
              for (var t2 = {}, r2 = 0; r2 < e2.length; r2++) t2[e2[r2].toUpperCase()] = e2[r2];
              return t2;
            }, J = function(e2, t2) {
              return typeof e2 === d && -1 !== F(t2).indexOf(F(e2));
            }, F = function(e2) {
              return e2.toLowerCase();
            }, G = function(e2, t2) {
              if (typeof e2 === d) return e2 = e2.replace(/^\s\s*/, ""), typeof t2 === c ? e2 : e2.substring(0, 350);
            }, X = function(e2, t2) {
              for (var r2, n2, i3, o3, a3, c2, d2 = 0; d2 < t2.length && !a3; ) {
                var p2 = t2[d2], h2 = t2[d2 + 1];
                for (r2 = n2 = 0; r2 < p2.length && !a3 && p2[r2]; ) if (a3 = p2[r2++].exec(e2)) for (i3 = 0; i3 < h2.length; i3++) c2 = a3[++n2], typeof (o3 = h2[i3]) === u && o3.length > 0 ? 2 === o3.length ? typeof o3[1] == l ? this[o3[0]] = o3[1].call(this, c2) : this[o3[0]] = o3[1] : 3 === o3.length ? typeof o3[1] !== l || o3[1].exec && o3[1].test ? this[o3[0]] = c2 ? c2.replace(o3[1], o3[2]) : void 0 : this[o3[0]] = c2 ? o3[1].call(this, c2, o3[2]) : void 0 : 4 === o3.length && (this[o3[0]] = c2 ? o3[3].call(this, c2.replace(o3[1], o3[2])) : void 0) : this[o3] = c2 || s2;
                d2 += 2;
              }
            }, Z = function(e2, t2) {
              for (var r2 in t2) if (typeof t2[r2] === u && t2[r2].length > 0) {
                for (var n2 = 0; n2 < t2[r2].length; n2++) if (J(t2[r2][n2], e2)) return "?" === r2 ? s2 : r2;
              } else if (J(t2[r2], e2)) return "?" === r2 ? s2 : r2;
              return e2;
            }, Y = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, Q = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [y, [f, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [y, [f, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [f, y], [/opios[\/ ]+([\w\.]+)/i], [y, [f, j + " Mini"]], [/\bopr\/([\w\.]+)/i], [y, [f, j]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [f, y], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [y, [f, "UC" + C]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [y, [f, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [y, [f, "WeChat"]], [/konqueror\/([\w\.]+)/i], [y, [f, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [y, [f, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [y, [f, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[f, /(.+)/, "$1 Secure " + C], y], [/\bfocus\/([\w\.]+)/i], [y, [f, O + " Focus"]], [/\bopt\/([\w\.]+)/i], [y, [f, j + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [y, [f, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [y, [f, "Dolphin"]], [/coast\/([\w\.]+)/i], [y, [f, j + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [y, [f, "MIUI " + C]], [/fxios\/([-\w\.]+)/i], [y, [f, O]], [/\bqihu|(qi?ho?o?|360)browser/i], [[f, "360 " + C]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[f, /(.+)/, "$1 " + C], y], [/(comodo_dragon)\/([\w\.]+)/i], [[f, /_/g, " "], y], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [f, y], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [f], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[f, B], y], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [f, y], [/\bgsa\/([\w\.]+) .*safari\//i], [y, [f, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [y, [f, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [y, [f, R + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[f, R + " WebView"], y], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [y, [f, "Android " + C]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [f, y], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [y, [f, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [y, f], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [f, [y, Z, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [f, y], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[f, "Netscape"], y], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [y, [f, O + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [f, y], [/(cobalt)\/([\w\.]+)/i], [f, [y, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[w, "amd64"]], [/(ia32(?=;))/i], [[w, F]], [/((?:i[346]|x)86)[;\)]/i], [[w, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[w, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[w, "armhf"]], [/windows (ce|mobile); ppc;/i], [[w, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[w, /ower/, "", F]], [/(sun4\w)[;\)]/i], [[w, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[w, F]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [h, [g, L], [m, _]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [h, [g, L], [m, v]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [h, [g, A], [m, v]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [h, [g, A], [m, _]], [/(macintosh);/i], [h, [g, A]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [h, [g, D], [m, v]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [h, [g, U], [m, _]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [h, [g, U], [m, v]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[h, /_/g, " "], [g, H], [m, v]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[h, /_/g, " "], [g, H], [m, _]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [h, [g, "OPPO"], [m, v]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [h, [g, "Vivo"], [m, v]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [h, [g, "Realme"], [m, v]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [h, [g, $], [m, v]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [h, [g, $], [m, _]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [h, [g, "LG"], [m, _]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [h, [g, "LG"], [m, v]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [h, [g, "Lenovo"], [m, _]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[h, /_/g, " "], [g, "Nokia"], [m, v]], [/(pixel c)\b/i], [h, [g, I], [m, _]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [h, [g, I], [m, v]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [h, [g, M], [m, v]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[h, "Xperia Tablet"], [g, M], [m, _]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [h, [g, "OnePlus"], [m, v]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [h, [g, E], [m, _]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[h, /(.+)/g, "Fire Phone $1"], [g, E], [m, v]], [/(playbook);[-\w\),; ]+(rim)/i], [h, g, [m, _]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [h, [g, P], [m, v]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [h, [g, T], [m, _]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [h, [g, T], [m, v]], [/(nexus 9)/i], [h, [g, "HTC"], [m, _]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [g, [h, /_/g, " "], [m, v]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [h, [g, "Acer"], [m, _]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [h, [g, "Meizu"], [m, v]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [g, h, [m, v]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [g, h, [m, _]], [/(surface duo)/i], [h, [g, N], [m, _]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [h, [g, "Fairphone"], [m, v]], [/(u304aa)/i], [h, [g, "AT&T"], [m, v]], [/\bsie-(\w*)/i], [h, [g, "Siemens"], [m, v]], [/\b(rct\w+) b/i], [h, [g, "RCA"], [m, _]], [/\b(venue[\d ]{2,7}) b/i], [h, [g, "Dell"], [m, _]], [/\b(q(?:mv|ta)\w+) b/i], [h, [g, "Verizon"], [m, _]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [h, [g, "Barnes & Noble"], [m, _]], [/\b(tm\d{3}\w+) b/i], [h, [g, "NuVision"], [m, _]], [/\b(k88) b/i], [h, [g, "ZTE"], [m, _]], [/\b(nx\d{3}j) b/i], [h, [g, "ZTE"], [m, v]], [/\b(gen\d{3}) b.+49h/i], [h, [g, "Swiss"], [m, v]], [/\b(zur\d{3}) b/i], [h, [g, "Swiss"], [m, _]], [/\b((zeki)?tb.*\b) b/i], [h, [g, "Zeki"], [m, _]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[g, "Dragon Touch"], h, [m, _]], [/\b(ns-?\w{0,9}) b/i], [h, [g, "Insignia"], [m, _]], [/\b((nxa|next)-?\w{0,9}) b/i], [h, [g, "NextBook"], [m, _]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[g, "Voice"], h, [m, v]], [/\b(lvtel\-)?(v1[12]) b/i], [[g, "LvTel"], h, [m, v]], [/\b(ph-1) /i], [h, [g, "Essential"], [m, v]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [h, [g, "Envizen"], [m, _]], [/\b(trio[-\w\. ]+) b/i], [h, [g, "MachSpeed"], [m, _]], [/\btu_(1491) b/i], [h, [g, "Rotor"], [m, _]], [/(shield[\w ]+) b/i], [h, [g, "Nvidia"], [m, _]], [/(sprint) (\w+)/i], [g, h, [m, v]], [/(kin\.[onetw]{3})/i], [[h, /\./g, " "], [g, N], [m, v]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [h, [g, W], [m, _]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [h, [g, W], [m, v]], [/smart-tv.+(samsung)/i], [g, [m, S]], [/hbbtv.+maple;(\d+)/i], [[h, /^/, "SmartTV"], [g, L], [m, S]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[g, "LG"], [m, S]], [/(apple) ?tv/i], [g, [h, A + " TV"], [m, S]], [/crkey/i], [[h, R + "cast"], [g, I], [m, S]], [/droid.+aft(\w)( bui|\))/i], [h, [g, E], [m, S]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [h, [g, D], [m, S]], [/(bravia[\w ]+)( bui|\))/i], [h, [g, M], [m, S]], [/(mitv-\w{5}) bui/i], [h, [g, H], [m, S]], [/Hbbtv.*(technisat) (.*);/i], [g, h, [m, S]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[g, G], [h, G], [m, S]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[m, S]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [g, h, [m, b]], [/droid.+; (shield) bui/i], [h, [g, "Nvidia"], [m, b]], [/(playstation [345portablevi]+)/i], [h, [g, M], [m, b]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [h, [g, N], [m, b]], [/((pebble))app/i], [g, h, [m, k]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [h, [g, A], [m, k]], [/droid.+; (glass) \d/i], [h, [g, I], [m, k]], [/droid.+; (wt63?0{2,3})\)/i], [h, [g, W], [m, k]], [/(quest( 2| pro)?)/i], [h, [g, B], [m, k]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [g, [m, x]], [/(aeobc)\b/i], [h, [g, E], [m, x]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [h, [m, v]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [h, [m, _]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[m, _]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[m, v]], [/(android[-\w\. ]{0,9});.+buil/i], [h, [g, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [y, [f, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [y, [f, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [f, y], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [y, f]], os: [[/microsoft (windows) (vista|xp)/i], [f, y], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [f, [y, Z, Y]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[f, "Windows"], [y, Z, Y]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[y, /_/g, "."], [f, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[f, K], [y, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [y, f], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [f, y], [/\(bb(10);/i], [y, [f, P]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [y, [f, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [y, [f, O + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [y, [f, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [y, [f, "watchOS"]], [/crkey\/([\d\.]+)/i], [y, [f, R + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[f, q], y], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [f, y], [/(sunos) ?([\w\.\d]*)/i], [[f, "Solaris"], y], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [f, y]] }, ee = function(e2, t2) {
              if (typeof e2 === u && (t2 = e2, e2 = s2), !(this instanceof ee)) return new ee(e2, t2).getResult();
              var r2 = typeof a2 !== c && a2.navigator ? a2.navigator : s2, n2 = e2 || (r2 && r2.userAgent ? r2.userAgent : ""), i3 = r2 && r2.userAgentData ? r2.userAgentData : s2, o3 = t2 ? V(Q, t2) : Q, b2 = r2 && r2.userAgent == n2;
              return this.getBrowser = function() {
                var e3, t3 = {};
                return t3[f] = s2, t3[y] = s2, X.call(t3, n2, o3.browser), t3[p] = typeof (e3 = t3[y]) === d ? e3.replace(/[^\d\.]/g, "").split(".")[0] : s2, b2 && r2 && r2.brave && typeof r2.brave.isBrave == l && (t3[f] = "Brave"), t3;
              }, this.getCPU = function() {
                var e3 = {};
                return e3[w] = s2, X.call(e3, n2, o3.cpu), e3;
              }, this.getDevice = function() {
                var e3 = {};
                return e3[g] = s2, e3[h] = s2, e3[m] = s2, X.call(e3, n2, o3.device), b2 && !e3[m] && i3 && i3.mobile && (e3[m] = v), b2 && "Macintosh" == e3[h] && r2 && typeof r2.standalone !== c && r2.maxTouchPoints && r2.maxTouchPoints > 2 && (e3[h] = "iPad", e3[m] = _), e3;
              }, this.getEngine = function() {
                var e3 = {};
                return e3[f] = s2, e3[y] = s2, X.call(e3, n2, o3.engine), e3;
              }, this.getOS = function() {
                var e3 = {};
                return e3[f] = s2, e3[y] = s2, X.call(e3, n2, o3.os), b2 && !e3[f] && i3 && "Unknown" != i3.platform && (e3[f] = i3.platform.replace(/chrome os/i, q).replace(/macos/i, K)), e3;
              }, this.getResult = function() {
                return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
              }, this.getUA = function() {
                return n2;
              }, this.setUA = function(e3) {
                return n2 = typeof e3 === d && e3.length > 350 ? G(e3, 350) : e3, this;
              }, this.setUA(n2), this;
            };
            ee.VERSION = "1.0.35", ee.BROWSER = z([f, y, p]), ee.CPU = z([w]), ee.DEVICE = z([h, g, m, b, v, S, _, k, x]), ee.ENGINE = ee.OS = z([f, y]), typeof o2 !== c ? (i2.exports && (o2 = i2.exports = ee), o2.UAParser = ee) : r.amdO ? void 0 !== (n = function() {
              return ee;
            }.call(t, r, t, e)) && (e.exports = n) : typeof a2 !== c && (a2.UAParser = ee);
            var et = typeof a2 !== c && (a2.jQuery || a2.Zepto);
            if (et && !et.ua) {
              var er = new ee();
              et.ua = er.getResult(), et.ua.get = function() {
                return er.getUA();
              }, et.ua.set = function(e2) {
                er.setUA(e2);
                var t2 = er.getResult();
                for (var r2 in t2) et.ua[r2] = t2[r2];
              };
            }
          }("object" == typeof window ? window : this);
        } }, o = {};
        function a(e2) {
          var t2 = o[e2];
          if (void 0 !== t2) return t2.exports;
          var r2 = o[e2] = { exports: {} }, n2 = true;
          try {
            i[e2].call(r2.exports, r2, r2.exports, a), n2 = false;
          } finally {
            n2 && delete o[e2];
          }
          return r2.exports;
        }
        a.ab = "//";
        var s = a(226);
        e.exports = s;
      })();
    }, 938: (e, t, r) => {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { getTestReqInfo: function() {
        return a;
      }, withRequest: function() {
        return o;
      } });
      let n = new (r(521)).AsyncLocalStorage();
      function i(e2, t2) {
        let r2 = t2.header(e2, "next-test-proxy-port");
        if (r2) return { url: t2.url(e2), proxyPort: Number(r2), testData: t2.header(e2, "next-test-data") || "" };
      }
      function o(e2, t2, r2) {
        let o2 = i(e2, t2);
        return o2 ? n.run(o2, r2) : r2();
      }
      function a(e2, t2) {
        return n.getStore() || (e2 && t2 ? i(e2, t2) : void 0);
      }
    }, 667: (e, t, r) => {
      "use strict";
      var n = r(356).Buffer;
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { handleFetch: function() {
        return s;
      }, interceptFetch: function() {
        return l;
      }, reader: function() {
        return o;
      } });
      let i = r(938), o = { url: (e2) => e2.url, header: (e2, t2) => e2.headers.get(t2) };
      async function a(e2, t2) {
        let { url: r2, method: i2, headers: o2, body: a2, cache: s2, credentials: l2, integrity: c, mode: u, redirect: d, referrer: p, referrerPolicy: h } = t2;
        return { testData: e2, api: "fetch", request: { url: r2, method: i2, headers: [...Array.from(o2), ["next-test-stack", function() {
          let e3 = (Error().stack ?? "").split("\n");
          for (let t3 = 1; t3 < e3.length; t3++) if (e3[t3].length > 0) {
            e3 = e3.slice(t3);
            break;
          }
          return (e3 = (e3 = (e3 = e3.filter((e4) => !e4.includes("/next/dist/"))).slice(0, 5)).map((e4) => e4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: a2 ? n.from(await t2.arrayBuffer()).toString("base64") : null, cache: s2, credentials: l2, integrity: c, mode: u, redirect: d, referrer: p, referrerPolicy: h } };
      }
      async function s(e2, t2) {
        let r2 = (0, i.getTestReqInfo)(t2, o);
        if (!r2) return e2(t2);
        let { testData: s2, proxyPort: l2 } = r2, c = await a(s2, t2), u = await e2(`http://localhost:${l2}`, { method: "POST", body: JSON.stringify(c), next: { internal: true } });
        if (!u.ok) throw Error(`Proxy request failed: ${u.status}`);
        let d = await u.json(), { api: p } = d;
        switch (p) {
          case "continue":
            return e2(t2);
          case "abort":
          case "unhandled":
            throw Error(`Proxy request aborted [${t2.method} ${t2.url}]`);
        }
        return function(e3) {
          let { status: t3, headers: r3, body: i2 } = e3.response;
          return new Response(i2 ? n.from(i2, "base64") : null, { status: t3, headers: new Headers(r3) });
        }(d);
      }
      function l(e2) {
        return r.g.fetch = function(t2, r2) {
          var n2;
          return (null == r2 ? void 0 : null == (n2 = r2.next) ? void 0 : n2.internal) ? e2(t2, r2) : s(e2, new Request(t2, r2));
        }, () => {
          r.g.fetch = e2;
        };
      }
    }, 458: (e, t, r) => {
      "use strict";
      Object.defineProperty(t, "__esModule", { value: true }), function(e2, t2) {
        for (var r2 in t2) Object.defineProperty(e2, r2, { enumerable: true, get: t2[r2] });
      }(t, { interceptTestApis: function() {
        return o;
      }, wrapRequestHandler: function() {
        return a;
      } });
      let n = r(938), i = r(667);
      function o() {
        return (0, i.interceptFetch)(r.g.fetch);
      }
      function a(e2) {
        return (t2, r2) => (0, n.withRequest)(t2, i.reader, () => e2(t2, r2));
      }
    }, 394: (e, t, r) => {
      "use strict";
      let n, i, o, a, s, l, c;
      r.r(t), r.d(t, { default: () => lG });
      var u = {};
      r.r(u), r.d(u, { q: () => n0, l: () => n3 });
      var d = {};
      async function p() {
        return "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && await _ENTRIES.middleware_instrumentation;
      }
      r.r(d), r.d(d, { config: () => lV, default: () => lK });
      let h = null;
      async function f() {
        if ("phase-production-build" === process.env.NEXT_PHASE) return;
        h || (h = p());
        let e10 = await h;
        if (null == e10 ? void 0 : e10.register) try {
          await e10.register();
        } catch (e11) {
          throw e11.message = `An error occurred while loading instrumentation hook: ${e11.message}`, e11;
        }
      }
      async function m(...e10) {
        let t10 = await p();
        try {
          var r10;
          await (null == t10 ? void 0 : null == (r10 = t10.onRequestError) ? void 0 : r10.call(t10, ...e10));
        } catch (e11) {
          console.error("Error in instrumentation.onRequestError:", e11);
        }
      }
      let g = null;
      function y() {
        return g || (g = f()), g;
      }
      function w(e10) {
        return `The edge runtime does not support Node.js '${e10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== r.g.process && (process.env = r.g.process.env, r.g.process = process), Object.defineProperty(globalThis, "__import_unsupported", { value: function(e10) {
        let t10 = new Proxy(function() {
        }, { get(t11, r10) {
          if ("then" === r10) return {};
          throw Error(w(e10));
        }, construct() {
          throw Error(w(e10));
        }, apply(r10, n10, i10) {
          if ("function" == typeof i10[0]) return i10[0](t10);
          throw Error(w(e10));
        } });
        return new Proxy({}, { get: () => t10 });
      }, enumerable: false, configurable: false }), y();
      class b extends Error {
        constructor({ page: e10 }) {
          super(`The middleware "${e10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class v extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class _ extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
      let S = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", api: "api", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser" };
      function k(e10) {
        var t10, r10, n10, i10, o10, a10 = [], s10 = 0;
        function l2() {
          for (; s10 < e10.length && /\s/.test(e10.charAt(s10)); ) s10 += 1;
          return s10 < e10.length;
        }
        for (; s10 < e10.length; ) {
          for (t10 = s10, o10 = false; l2(); ) if ("," === (r10 = e10.charAt(s10))) {
            for (n10 = s10, s10 += 1, l2(), i10 = s10; s10 < e10.length && "=" !== (r10 = e10.charAt(s10)) && ";" !== r10 && "," !== r10; ) s10 += 1;
            s10 < e10.length && "=" === e10.charAt(s10) ? (o10 = true, s10 = i10, a10.push(e10.substring(t10, n10)), t10 = s10) : s10 = n10 + 1;
          } else s10 += 1;
          (!o10 || s10 >= e10.length) && a10.push(e10.substring(t10, e10.length));
        }
        return a10;
      }
      function x(e10) {
        let t10 = {}, r10 = [];
        if (e10) for (let [n10, i10] of e10.entries()) "set-cookie" === n10.toLowerCase() ? (r10.push(...k(i10)), t10[n10] = 1 === r10.length ? r10[0] : r10) : t10[n10] = i10;
        return t10;
      }
      function E(e10) {
        try {
          return String(new URL(String(e10)));
        } catch (t10) {
          throw Error(`URL is malformed "${String(e10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: t10 });
        }
      }
      ({ ...S, GROUP: { builtinReact: [S.reactServerComponents, S.actionBrowser], serverOnly: [S.reactServerComponents, S.actionBrowser, S.instrument, S.middleware], neutralTarget: [S.api], clientOnly: [S.serverSideRendering, S.appPagesBrowser], bundled: [S.reactServerComponents, S.actionBrowser, S.serverSideRendering, S.appPagesBrowser, S.shared, S.instrument], appPages: [S.reactServerComponents, S.serverSideRendering, S.appPagesBrowser, S.actionBrowser] } });
      let A = Symbol("response"), T = Symbol("passThrough"), P = Symbol("waitUntil");
      class C {
        constructor(e10, t10) {
          this[T] = false, this[P] = t10 ? { kind: "external", function: t10 } : { kind: "internal", promises: [] };
        }
        respondWith(e10) {
          this[A] || (this[A] = Promise.resolve(e10));
        }
        passThroughOnException() {
          this[T] = true;
        }
        waitUntil(e10) {
          if ("external" === this[P].kind) return (0, this[P].function)(e10);
          this[P].promises.push(e10);
        }
      }
      class R extends C {
        constructor(e10) {
          var t10;
          super(e10.request, null == (t10 = e10.context) ? void 0 : t10.waitUntil), this.sourcePage = e10.page;
        }
        get request() {
          throw new b({ page: this.sourcePage });
        }
        respondWith() {
          throw new b({ page: this.sourcePage });
        }
      }
      function O(e10) {
        return e10.replace(/\/$/, "") || "/";
      }
      function I(e10) {
        let t10 = e10.indexOf("#"), r10 = e10.indexOf("?"), n10 = r10 > -1 && (t10 < 0 || r10 < t10);
        return n10 || t10 > -1 ? { pathname: e10.substring(0, n10 ? r10 : t10), query: n10 ? e10.substring(r10, t10 > -1 ? t10 : void 0) : "", hash: t10 > -1 ? e10.slice(t10) : "" } : { pathname: e10, query: "", hash: "" };
      }
      function U(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r10, query: n10, hash: i10 } = I(e10);
        return "" + t10 + r10 + n10 + i10;
      }
      function N(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r10, query: n10, hash: i10 } = I(e10);
        return "" + r10 + t10 + n10 + i10;
      }
      function $(e10, t10) {
        if ("string" != typeof e10) return false;
        let { pathname: r10 } = I(e10);
        return r10 === t10 || r10.startsWith(t10 + "/");
      }
      function j(e10, t10) {
        let r10;
        let n10 = e10.split("/");
        return (t10 || []).some((t11) => !!n10[1] && n10[1].toLowerCase() === t11.toLowerCase() && (r10 = t11, n10.splice(1, 1), e10 = n10.join("/") || "/", true)), { pathname: e10, detectedLocale: r10 };
      }
      let L = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function D(e10, t10) {
        return new URL(String(e10).replace(L, "localhost"), t10 && String(t10).replace(L, "localhost"));
      }
      let M = Symbol("NextURLInternal");
      class H {
        constructor(e10, t10, r10) {
          let n10, i10;
          "object" == typeof t10 && "pathname" in t10 || "string" == typeof t10 ? (n10 = t10, i10 = r10 || {}) : i10 = r10 || t10 || {}, this[M] = { url: D(e10, n10 ?? i10.base), options: i10, basePath: "" }, this.analyze();
        }
        analyze() {
          var e10, t10, r10, n10, i10;
          let o10 = function(e11, t11) {
            var r11, n11;
            let { basePath: i11, i18n: o11, trailingSlash: a11 } = null != (r11 = t11.nextConfig) ? r11 : {}, s11 = { pathname: e11, trailingSlash: "/" !== e11 ? e11.endsWith("/") : a11 };
            i11 && $(s11.pathname, i11) && (s11.pathname = function(e12, t12) {
              if (!$(e12, t12)) return e12;
              let r12 = e12.slice(t12.length);
              return r12.startsWith("/") ? r12 : "/" + r12;
            }(s11.pathname, i11), s11.basePath = i11);
            let l2 = s11.pathname;
            if (s11.pathname.startsWith("/_next/data/") && s11.pathname.endsWith(".json")) {
              let e12 = s11.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/"), r12 = e12[0];
              s11.buildId = r12, l2 = "index" !== e12[1] ? "/" + e12.slice(1).join("/") : "/", true === t11.parseData && (s11.pathname = l2);
            }
            if (o11) {
              let e12 = t11.i18nProvider ? t11.i18nProvider.analyze(s11.pathname) : j(s11.pathname, o11.locales);
              s11.locale = e12.detectedLocale, s11.pathname = null != (n11 = e12.pathname) ? n11 : s11.pathname, !e12.detectedLocale && s11.buildId && (e12 = t11.i18nProvider ? t11.i18nProvider.analyze(l2) : j(l2, o11.locales)).detectedLocale && (s11.locale = e12.detectedLocale);
            }
            return s11;
          }(this[M].url.pathname, { nextConfig: this[M].options.nextConfig, parseData: true, i18nProvider: this[M].options.i18nProvider }), a10 = function(e11, t11) {
            let r11;
            if ((null == t11 ? void 0 : t11.host) && !Array.isArray(t11.host)) r11 = t11.host.toString().split(":", 1)[0];
            else {
              if (!e11.hostname) return;
              r11 = e11.hostname;
            }
            return r11.toLowerCase();
          }(this[M].url, this[M].options.headers);
          this[M].domainLocale = this[M].options.i18nProvider ? this[M].options.i18nProvider.detectDomainLocale(a10) : function(e11, t11, r11) {
            if (e11) for (let o11 of (r11 && (r11 = r11.toLowerCase()), e11)) {
              var n11, i11;
              if (t11 === (null == (n11 = o11.domain) ? void 0 : n11.split(":", 1)[0].toLowerCase()) || r11 === o11.defaultLocale.toLowerCase() || (null == (i11 = o11.locales) ? void 0 : i11.some((e12) => e12.toLowerCase() === r11))) return o11;
            }
          }(null == (t10 = this[M].options.nextConfig) ? void 0 : null == (e10 = t10.i18n) ? void 0 : e10.domains, a10);
          let s10 = (null == (r10 = this[M].domainLocale) ? void 0 : r10.defaultLocale) || (null == (i10 = this[M].options.nextConfig) ? void 0 : null == (n10 = i10.i18n) ? void 0 : n10.defaultLocale);
          this[M].url.pathname = o10.pathname, this[M].defaultLocale = s10, this[M].basePath = o10.basePath ?? "", this[M].buildId = o10.buildId, this[M].locale = o10.locale ?? s10, this[M].trailingSlash = o10.trailingSlash;
        }
        formatPathname() {
          var e10;
          let t10;
          return t10 = function(e11, t11, r10, n10) {
            if (!t11 || t11 === r10) return e11;
            let i10 = e11.toLowerCase();
            return !n10 && ($(i10, "/api") || $(i10, "/" + t11.toLowerCase())) ? e11 : U(e11, "/" + t11);
          }((e10 = { basePath: this[M].basePath, buildId: this[M].buildId, defaultLocale: this[M].options.forceLocale ? void 0 : this[M].defaultLocale, locale: this[M].locale, pathname: this[M].url.pathname, trailingSlash: this[M].trailingSlash }).pathname, e10.locale, e10.buildId ? void 0 : e10.defaultLocale, e10.ignorePrefix), (e10.buildId || !e10.trailingSlash) && (t10 = O(t10)), e10.buildId && (t10 = N(U(t10, "/_next/data/" + e10.buildId), "/" === e10.pathname ? "index.json" : ".json")), t10 = U(t10, e10.basePath), !e10.buildId && e10.trailingSlash ? t10.endsWith("/") ? t10 : N(t10, "/") : O(t10);
        }
        formatSearch() {
          return this[M].url.search;
        }
        get buildId() {
          return this[M].buildId;
        }
        set buildId(e10) {
          this[M].buildId = e10;
        }
        get locale() {
          return this[M].locale ?? "";
        }
        set locale(e10) {
          var t10, r10;
          if (!this[M].locale || !(null == (r10 = this[M].options.nextConfig) ? void 0 : null == (t10 = r10.i18n) ? void 0 : t10.locales.includes(e10))) throw TypeError(`The NextURL configuration includes no locale "${e10}"`);
          this[M].locale = e10;
        }
        get defaultLocale() {
          return this[M].defaultLocale;
        }
        get domainLocale() {
          return this[M].domainLocale;
        }
        get searchParams() {
          return this[M].url.searchParams;
        }
        get host() {
          return this[M].url.host;
        }
        set host(e10) {
          this[M].url.host = e10;
        }
        get hostname() {
          return this[M].url.hostname;
        }
        set hostname(e10) {
          this[M].url.hostname = e10;
        }
        get port() {
          return this[M].url.port;
        }
        set port(e10) {
          this[M].url.port = e10;
        }
        get protocol() {
          return this[M].url.protocol;
        }
        set protocol(e10) {
          this[M].url.protocol = e10;
        }
        get href() {
          let e10 = this.formatPathname(), t10 = this.formatSearch();
          return `${this.protocol}//${this.host}${e10}${t10}${this.hash}`;
        }
        set href(e10) {
          this[M].url = D(e10), this.analyze();
        }
        get origin() {
          return this[M].url.origin;
        }
        get pathname() {
          return this[M].url.pathname;
        }
        set pathname(e10) {
          this[M].url.pathname = e10;
        }
        get hash() {
          return this[M].url.hash;
        }
        set hash(e10) {
          this[M].url.hash = e10;
        }
        get search() {
          return this[M].url.search;
        }
        set search(e10) {
          this[M].url.search = e10;
        }
        get password() {
          return this[M].url.password;
        }
        set password(e10) {
          this[M].url.password = e10;
        }
        get username() {
          return this[M].url.username;
        }
        set username(e10) {
          this[M].url.username = e10;
        }
        get basePath() {
          return this[M].basePath;
        }
        set basePath(e10) {
          this[M].basePath = e10.startsWith("/") ? e10 : `/${e10}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new H(String(this), this[M].options);
        }
      }
      var W = r(341);
      let B = Symbol("internal request");
      class q extends Request {
        constructor(e10, t10 = {}) {
          let r10 = "string" != typeof e10 && "url" in e10 ? e10.url : String(e10);
          E(r10), e10 instanceof Request ? super(e10, t10) : super(r10, t10);
          let n10 = new H(r10, { headers: x(this.headers), nextConfig: t10.nextConfig });
          this[B] = { cookies: new W.RequestCookies(this.headers), nextUrl: n10, url: n10.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[B].cookies;
        }
        get nextUrl() {
          return this[B].nextUrl;
        }
        get page() {
          throw new v();
        }
        get ua() {
          throw new _();
        }
        get url() {
          return this[B].url;
        }
      }
      class K {
        static get(e10, t10, r10) {
          let n10 = Reflect.get(e10, t10, r10);
          return "function" == typeof n10 ? n10.bind(e10) : n10;
        }
        static set(e10, t10, r10, n10) {
          return Reflect.set(e10, t10, r10, n10);
        }
        static has(e10, t10) {
          return Reflect.has(e10, t10);
        }
        static deleteProperty(e10, t10) {
          return Reflect.deleteProperty(e10, t10);
        }
      }
      let V = Symbol("internal response"), z = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function J(e10, t10) {
        var r10;
        if (null == e10 ? void 0 : null == (r10 = e10.request) ? void 0 : r10.headers) {
          if (!(e10.request.headers instanceof Headers)) throw Error("request.headers must be an instance of Headers");
          let r11 = [];
          for (let [n10, i10] of e10.request.headers) t10.set("x-middleware-request-" + n10, i10), r11.push(n10);
          t10.set("x-middleware-override-headers", r11.join(","));
        }
      }
      class F extends Response {
        constructor(e10, t10 = {}) {
          super(e10, t10);
          let r10 = this.headers, n10 = new Proxy(new W.ResponseCookies(r10), { get(e11, n11, i10) {
            switch (n11) {
              case "delete":
              case "set":
                return (...i11) => {
                  let o10 = Reflect.apply(e11[n11], e11, i11), a10 = new Headers(r10);
                  return o10 instanceof W.ResponseCookies && r10.set("x-middleware-set-cookie", o10.getAll().map((e12) => (0, W.stringifyCookie)(e12)).join(",")), J(t10, a10), o10;
                };
              default:
                return K.get(e11, n11, i10);
            }
          } });
          this[V] = { cookies: n10, url: t10.url ? new H(t10.url, { headers: x(r10), nextConfig: t10.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[V].cookies;
        }
        static json(e10, t10) {
          let r10 = Response.json(e10, t10);
          return new F(r10.body, r10);
        }
        static redirect(e10, t10) {
          let r10 = "number" == typeof t10 ? t10 : (null == t10 ? void 0 : t10.status) ?? 307;
          if (!z.has(r10)) throw RangeError('Failed to execute "redirect" on "response": Invalid status code');
          let n10 = "object" == typeof t10 ? t10 : {}, i10 = new Headers(null == n10 ? void 0 : n10.headers);
          return i10.set("Location", E(e10)), new F(null, { ...n10, headers: i10, status: r10 });
        }
        static rewrite(e10, t10) {
          let r10 = new Headers(null == t10 ? void 0 : t10.headers);
          return r10.set("x-middleware-rewrite", E(e10)), J(t10, r10), new F(null, { ...t10, headers: r10 });
        }
        static next(e10) {
          let t10 = new Headers(null == e10 ? void 0 : e10.headers);
          return t10.set("x-middleware-next", "1"), J(e10, t10), new F(null, { ...e10, headers: t10 });
        }
      }
      function G(e10, t10) {
        let r10 = "string" == typeof t10 ? new URL(t10) : t10, n10 = new URL(e10, t10), i10 = r10.protocol + "//" + r10.host;
        return n10.protocol + "//" + n10.host === i10 ? n10.toString().replace(i10, "") : n10.toString();
      }
      let X = "Next-Router-Prefetch", Z = ["RSC", "Next-Router-State-Tree", X, "Next-HMR-Refresh", "Next-Router-Segment-Prefetch"], Y = ["__nextFallback", "__nextLocale", "__nextInferredLocaleFromDefault", "__nextDefaultLocale", "__nextIsNotFound", "_rsc"], Q = ["__nextDataReq"];
      class ee extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new ee();
        }
      }
      class et extends Headers {
        constructor(e10) {
          super(), this.headers = new Proxy(e10, { get(t10, r10, n10) {
            if ("symbol" == typeof r10) return K.get(t10, r10, n10);
            let i10 = r10.toLowerCase(), o10 = Object.keys(e10).find((e11) => e11.toLowerCase() === i10);
            if (void 0 !== o10) return K.get(t10, o10, n10);
          }, set(t10, r10, n10, i10) {
            if ("symbol" == typeof r10) return K.set(t10, r10, n10, i10);
            let o10 = r10.toLowerCase(), a10 = Object.keys(e10).find((e11) => e11.toLowerCase() === o10);
            return K.set(t10, a10 ?? r10, n10, i10);
          }, has(t10, r10) {
            if ("symbol" == typeof r10) return K.has(t10, r10);
            let n10 = r10.toLowerCase(), i10 = Object.keys(e10).find((e11) => e11.toLowerCase() === n10);
            return void 0 !== i10 && K.has(t10, i10);
          }, deleteProperty(t10, r10) {
            if ("symbol" == typeof r10) return K.deleteProperty(t10, r10);
            let n10 = r10.toLowerCase(), i10 = Object.keys(e10).find((e11) => e11.toLowerCase() === n10);
            return void 0 === i10 || K.deleteProperty(t10, i10);
          } });
        }
        static seal(e10) {
          return new Proxy(e10, { get(e11, t10, r10) {
            switch (t10) {
              case "append":
              case "delete":
              case "set":
                return ee.callable;
              default:
                return K.get(e11, t10, r10);
            }
          } });
        }
        merge(e10) {
          return Array.isArray(e10) ? e10.join(", ") : e10;
        }
        static from(e10) {
          return e10 instanceof Headers ? e10 : new et(e10);
        }
        append(e10, t10) {
          let r10 = this.headers[e10];
          "string" == typeof r10 ? this.headers[e10] = [r10, t10] : Array.isArray(r10) ? r10.push(t10) : this.headers[e10] = t10;
        }
        delete(e10) {
          delete this.headers[e10];
        }
        get(e10) {
          let t10 = this.headers[e10];
          return void 0 !== t10 ? this.merge(t10) : null;
        }
        has(e10) {
          return void 0 !== this.headers[e10];
        }
        set(e10, t10) {
          this.headers[e10] = t10;
        }
        forEach(e10, t10) {
          for (let [r10, n10] of this.entries()) e10.call(t10, n10, r10, this);
        }
        *entries() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase(), r10 = this.get(t10);
            yield [t10, r10];
          }
        }
        *keys() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase();
            yield t10;
          }
        }
        *values() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = this.get(e10);
            yield t10;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      let er = Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available");
      class en {
        disable() {
          throw er;
        }
        getStore() {
        }
        run() {
          throw er;
        }
        exit() {
          throw er;
        }
        enterWith() {
          throw er;
        }
        static bind(e10) {
          return e10;
        }
      }
      let ei = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage;
      function eo() {
        return ei ? new ei() : new en();
      }
      let ea = eo(), es = eo();
      function el(e10) {
        let t10 = es.getStore();
        if (t10) {
          if ("request" === t10.type) return t10;
          if ("prerender" === t10.type || "prerender-ppr" === t10.type || "prerender-legacy" === t10.type) throw Error(`\`${e10}\` cannot be called inside a prerender. This is a bug in Next.js.`);
          if ("cache" === t10.type) throw Error(`\`${e10}\` cannot be called inside "use cache". Call it outside and pass an argument instead. Read more: https://nextjs.org/docs/messages/next-request-in-use-cache`);
          if ("unstable-cache" === t10.type) throw Error(`\`${e10}\` cannot be called inside unstable_cache. Call it outside and pass an argument instead. Read more: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`);
        }
        throw Error(`\`${e10}\` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`);
      }
      class ec extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
        }
        static callable() {
          throw new ec();
        }
      }
      class eu {
        static seal(e10) {
          return new Proxy(e10, { get(e11, t10, r10) {
            switch (t10) {
              case "clear":
              case "delete":
              case "set":
                return ec.callable;
              default:
                return K.get(e11, t10, r10);
            }
          } });
        }
      }
      let ed = Symbol.for("next.mutated.cookies");
      class ep {
        static wrap(e10, t10) {
          let r10 = new W.ResponseCookies(new Headers());
          for (let t11 of e10.getAll()) r10.set(t11);
          let n10 = [], i10 = /* @__PURE__ */ new Set(), o10 = () => {
            let e11 = ea.getStore();
            if (e11 && (e11.pathWasRevalidated = true), n10 = r10.getAll().filter((e12) => i10.has(e12.name)), t10) {
              let e12 = [];
              for (let t11 of n10) {
                let r11 = new W.ResponseCookies(new Headers());
                r11.set(t11), e12.push(r11.toString());
              }
              t10(e12);
            }
          }, a10 = new Proxy(r10, { get(e11, t11, r11) {
            switch (t11) {
              case ed:
                return n10;
              case "delete":
                return function(...t12) {
                  i10.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    return e11.delete(...t12), a10;
                  } finally {
                    o10();
                  }
                };
              case "set":
                return function(...t12) {
                  i10.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    return e11.set(...t12), a10;
                  } finally {
                    o10();
                  }
                };
              default:
                return K.get(e11, t11, r11);
            }
          } });
          return a10;
        }
      }
      function eh(e10) {
        return "action" === e10.phase;
      }
      function ef(e10) {
        if (!eh(el(e10))) throw new ec();
      }
      var em = function(e10) {
        return e10.handleRequest = "BaseServer.handleRequest", e10.run = "BaseServer.run", e10.pipe = "BaseServer.pipe", e10.getStaticHTML = "BaseServer.getStaticHTML", e10.render = "BaseServer.render", e10.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", e10.renderToResponse = "BaseServer.renderToResponse", e10.renderToHTML = "BaseServer.renderToHTML", e10.renderError = "BaseServer.renderError", e10.renderErrorToResponse = "BaseServer.renderErrorToResponse", e10.renderErrorToHTML = "BaseServer.renderErrorToHTML", e10.render404 = "BaseServer.render404", e10;
      }(em || {}), eg = function(e10) {
        return e10.loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", e10.loadComponents = "LoadComponents.loadComponents", e10;
      }(eg || {}), ey = function(e10) {
        return e10.getRequestHandler = "NextServer.getRequestHandler", e10.getServer = "NextServer.getServer", e10.getServerRequestHandler = "NextServer.getServerRequestHandler", e10.createServer = "createServer.createServer", e10;
      }(ey || {}), ew = function(e10) {
        return e10.compression = "NextNodeServer.compression", e10.getBuildId = "NextNodeServer.getBuildId", e10.createComponentTree = "NextNodeServer.createComponentTree", e10.clientComponentLoading = "NextNodeServer.clientComponentLoading", e10.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", e10.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", e10.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", e10.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", e10.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", e10.sendRenderResult = "NextNodeServer.sendRenderResult", e10.proxyRequest = "NextNodeServer.proxyRequest", e10.runApi = "NextNodeServer.runApi", e10.render = "NextNodeServer.render", e10.renderHTML = "NextNodeServer.renderHTML", e10.imageOptimizer = "NextNodeServer.imageOptimizer", e10.getPagePath = "NextNodeServer.getPagePath", e10.getRoutesManifest = "NextNodeServer.getRoutesManifest", e10.findPageComponents = "NextNodeServer.findPageComponents", e10.getFontManifest = "NextNodeServer.getFontManifest", e10.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", e10.getRequestHandler = "NextNodeServer.getRequestHandler", e10.renderToHTML = "NextNodeServer.renderToHTML", e10.renderError = "NextNodeServer.renderError", e10.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", e10.render404 = "NextNodeServer.render404", e10.startResponse = "NextNodeServer.startResponse", e10.route = "route", e10.onProxyReq = "onProxyReq", e10.apiResolver = "apiResolver", e10.internalFetch = "internalFetch", e10;
      }(ew || {}), eb = function(e10) {
        return e10.startServer = "startServer.startServer", e10;
      }(eb || {}), ev = function(e10) {
        return e10.getServerSideProps = "Render.getServerSideProps", e10.getStaticProps = "Render.getStaticProps", e10.renderToString = "Render.renderToString", e10.renderDocument = "Render.renderDocument", e10.createBodyResult = "Render.createBodyResult", e10;
      }(ev || {}), e_ = function(e10) {
        return e10.renderToString = "AppRender.renderToString", e10.renderToReadableStream = "AppRender.renderToReadableStream", e10.getBodyResult = "AppRender.getBodyResult", e10.fetch = "AppRender.fetch", e10;
      }(e_ || {}), eS = function(e10) {
        return e10.executeRoute = "Router.executeRoute", e10;
      }(eS || {}), ek = function(e10) {
        return e10.runHandler = "Node.runHandler", e10;
      }(ek || {}), ex = function(e10) {
        return e10.runHandler = "AppRouteRouteHandlers.runHandler", e10;
      }(ex || {}), eE = function(e10) {
        return e10.generateMetadata = "ResolveMetadata.generateMetadata", e10.generateViewport = "ResolveMetadata.generateViewport", e10;
      }(eE || {}), eA = function(e10) {
        return e10.execute = "Middleware.execute", e10;
      }(eA || {});
      let eT = ["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"], eP = ["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"];
      function eC(e10) {
        return null !== e10 && "object" == typeof e10 && "then" in e10 && "function" == typeof e10.then;
      }
      let { context: eR, propagation: eO, trace: eI, SpanStatusCode: eU, SpanKind: eN, ROOT_CONTEXT: e$ } = n = r(131);
      class ej extends Error {
        constructor(e10, t10) {
          super(), this.bubble = e10, this.result = t10;
        }
      }
      let eL = (e10, t10) => {
        (function(e11) {
          return "object" == typeof e11 && null !== e11 && e11 instanceof ej;
        })(t10) && t10.bubble ? e10.setAttribute("next.bubble", true) : (t10 && e10.recordException(t10), e10.setStatus({ code: eU.ERROR, message: null == t10 ? void 0 : t10.message })), e10.end();
      }, eD = /* @__PURE__ */ new Map(), eM = n.createContextKey("next.rootSpanId"), eH = 0, eW = () => eH++, eB = { set(e10, t10, r10) {
        e10.push({ key: t10, value: r10 });
      } };
      class eq {
        getTracerInstance() {
          return eI.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return eR;
        }
        getTracePropagationData() {
          let e10 = eR.active(), t10 = [];
          return eO.inject(e10, t10, eB), t10;
        }
        getActiveScopeSpan() {
          return eI.getSpan(null == eR ? void 0 : eR.active());
        }
        withPropagatedContext(e10, t10, r10) {
          let n10 = eR.active();
          if (eI.getSpanContext(n10)) return t10();
          let i10 = eO.extract(n10, e10, r10);
          return eR.with(i10, t10);
        }
        trace(...e10) {
          var t10;
          let [r10, n10, i10] = e10, { fn: o10, options: a10 } = "function" == typeof n10 ? { fn: n10, options: {} } : { fn: i10, options: { ...n10 } }, s10 = a10.spanName ?? r10;
          if (!eT.includes(r10) && "1" !== process.env.NEXT_OTEL_VERBOSE || a10.hideSpan) return o10();
          let l2 = this.getSpanContext((null == a10 ? void 0 : a10.parentSpan) ?? this.getActiveScopeSpan()), c2 = false;
          l2 ? (null == (t10 = eI.getSpanContext(l2)) ? void 0 : t10.isRemote) && (c2 = true) : (l2 = (null == eR ? void 0 : eR.active()) ?? e$, c2 = true);
          let u2 = eW();
          return a10.attributes = { "next.span_name": s10, "next.span_type": r10, ...a10.attributes }, eR.with(l2.setValue(eM, u2), () => this.getTracerInstance().startActiveSpan(s10, a10, (e11) => {
            let t11 = "performance" in globalThis && "measure" in performance ? globalThis.performance.now() : void 0, n11 = () => {
              eD.delete(u2), t11 && process.env.NEXT_OTEL_PERFORMANCE_PREFIX && eP.includes(r10 || "") && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-${(r10.split(".").pop() || "").replace(/[A-Z]/g, (e12) => "-" + e12.toLowerCase())}`, { start: t11, end: performance.now() });
            };
            c2 && eD.set(u2, new Map(Object.entries(a10.attributes ?? {})));
            try {
              if (o10.length > 1) return o10(e11, (t13) => eL(e11, t13));
              let t12 = o10(e11);
              if (eC(t12)) return t12.then((t13) => (e11.end(), t13)).catch((t13) => {
                throw eL(e11, t13), t13;
              }).finally(n11);
              return e11.end(), n11(), t12;
            } catch (t12) {
              throw eL(e11, t12), n11(), t12;
            }
          }));
        }
        wrap(...e10) {
          let t10 = this, [r10, n10, i10] = 3 === e10.length ? e10 : [e10[0], {}, e10[1]];
          return eT.includes(r10) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let e11 = n10;
            "function" == typeof e11 && "function" == typeof i10 && (e11 = e11.apply(this, arguments));
            let o10 = arguments.length - 1, a10 = arguments[o10];
            if ("function" != typeof a10) return t10.trace(r10, e11, () => i10.apply(this, arguments));
            {
              let n11 = t10.getContext().bind(eR.active(), a10);
              return t10.trace(r10, e11, (e12, t11) => (arguments[o10] = function(e13) {
                return null == t11 || t11(e13), n11.apply(this, arguments);
              }, i10.apply(this, arguments)));
            }
          } : i10;
        }
        startSpan(...e10) {
          let [t10, r10] = e10, n10 = this.getSpanContext((null == r10 ? void 0 : r10.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(t10, r10, n10);
        }
        getSpanContext(e10) {
          return e10 ? eI.setSpan(eR.active(), e10) : void 0;
        }
        getRootSpanAttributes() {
          let e10 = eR.active().getValue(eM);
          return eD.get(e10);
        }
        setRootSpanAttribute(e10, t10) {
          let r10 = eR.active().getValue(eM), n10 = eD.get(r10);
          n10 && n10.set(e10, t10);
        }
      }
      let eK = (() => {
        let e10 = new eq();
        return () => e10;
      })(), eV = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(eV);
      class ez {
        constructor(e10, t10, r10, n10) {
          var i10;
          let o10 = e10 && function(e11, t11) {
            let r11 = et.from(e11.headers);
            return { isOnDemandRevalidate: r11.get("x-prerender-revalidate") === t11.previewModeId, revalidateOnlyGenerated: r11.has("x-prerender-revalidate-if-generated") };
          }(t10, e10).isOnDemandRevalidate, a10 = null == (i10 = r10.get(eV)) ? void 0 : i10.value;
          this.isEnabled = !!(!o10 && a10 && e10 && a10 === e10.previewModeId), this._previewModeId = null == e10 ? void 0 : e10.previewModeId, this._mutableCookies = n10;
        }
        enable() {
          if (!this._previewModeId) throw Error("Invariant: previewProps missing previewModeId this should never happen");
          this._mutableCookies.set({ name: eV, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" });
        }
        disable() {
          this._mutableCookies.set({ name: eV, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) });
        }
      }
      function eJ(e10, t10) {
        if ("x-middleware-set-cookie" in e10.headers && "string" == typeof e10.headers["x-middleware-set-cookie"]) {
          let r10 = e10.headers["x-middleware-set-cookie"], n10 = new Headers();
          for (let e11 of k(r10)) n10.append("set-cookie", e11);
          for (let e11 of new W.ResponseCookies(n10).getAll()) t10.set(e11);
        }
      }
      var eF = r(891), eG = r.n(eF);
      class eX extends Error {
        constructor(e10, t10) {
          super("Invariant: " + (e10.endsWith(".") ? e10 : e10 + ".") + " This is a bug in Next.js.", t10), this.name = "InvariantError";
        }
      }
      async function eZ(e10, t10) {
        if (!e10) return t10();
        let r10 = eY(e10);
        try {
          return await t10();
        } finally {
          let t11 = function(e11, t12) {
            let r11 = new Set(e11.revalidatedTags), n10 = new Set(e11.pendingRevalidateWrites);
            return { revalidatedTags: t12.revalidatedTags.filter((e12) => !r11.has(e12)), pendingRevalidates: Object.fromEntries(Object.entries(t12.pendingRevalidates).filter(([t13]) => !(t13 in e11.pendingRevalidates))), pendingRevalidateWrites: t12.pendingRevalidateWrites.filter((e12) => !n10.has(e12)) };
          }(r10, eY(e10));
          await eQ(e10, t11);
        }
      }
      function eY(e10) {
        return { revalidatedTags: e10.revalidatedTags ? [...e10.revalidatedTags] : [], pendingRevalidates: { ...e10.pendingRevalidates }, pendingRevalidateWrites: e10.pendingRevalidateWrites ? [...e10.pendingRevalidateWrites] : [] };
      }
      async function eQ(e10, { revalidatedTags: t10, pendingRevalidates: r10, pendingRevalidateWrites: n10 }) {
        var i10;
        return Promise.all([null == (i10 = e10.incrementalCache) ? void 0 : i10.revalidateTag(t10), ...Object.values(r10), ...n10]);
      }
      let e0 = Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available");
      class e1 {
        disable() {
          throw e0;
        }
        getStore() {
        }
        run() {
          throw e0;
        }
        exit() {
          throw e0;
        }
        enterWith() {
          throw e0;
        }
        static bind(e10) {
          return e10;
        }
      }
      let e2 = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage, e3 = e2 ? new e2() : new e1();
      class e5 {
        constructor({ waitUntil: e10, onClose: t10, onTaskError: r10 }) {
          this.workUnitStores = /* @__PURE__ */ new Set(), this.waitUntil = e10, this.onClose = t10, this.onTaskError = r10, this.callbackQueue = new (eG())(), this.callbackQueue.pause();
        }
        after(e10) {
          if (eC(e10)) this.waitUntil || e6(), this.waitUntil(e10.catch((e11) => this.reportTaskError("promise", e11)));
          else if ("function" == typeof e10) this.addCallback(e10);
          else throw Error("`after()`: Argument must be a promise or a function");
        }
        addCallback(e10) {
          var t10;
          this.waitUntil || e6();
          let r10 = es.getStore();
          r10 && this.workUnitStores.add(r10);
          let n10 = e3.getStore(), i10 = n10 ? n10.rootTaskSpawnPhase : null == r10 ? void 0 : r10.phase;
          this.runCallbacksOnClosePromise || (this.runCallbacksOnClosePromise = this.runCallbacksOnClose(), this.waitUntil(this.runCallbacksOnClosePromise));
          let o10 = (t10 = async () => {
            try {
              await e3.run({ rootTaskSpawnPhase: i10 }, () => e10());
            } catch (e11) {
              this.reportTaskError("function", e11);
            }
          }, e2 ? e2.bind(t10) : e1.bind(t10));
          this.callbackQueue.add(o10);
        }
        async runCallbacksOnClose() {
          return await new Promise((e10) => this.onClose(e10)), this.runCallbacks();
        }
        async runCallbacks() {
          if (0 === this.callbackQueue.size) return;
          for (let e11 of this.workUnitStores) e11.phase = "after";
          let e10 = ea.getStore();
          if (!e10) throw new eX("Missing workStore in AfterContext.runCallbacks");
          return eZ(e10, () => (this.callbackQueue.start(), this.callbackQueue.onIdle()));
        }
        reportTaskError(e10, t10) {
          if (console.error("promise" === e10 ? "A promise passed to `after()` rejected:" : "An error occurred in a function passed to `after()`:", t10), this.onTaskError) try {
            null == this.onTaskError || this.onTaskError.call(this, t10);
          } catch (e11) {
            console.error(new eX("`onTaskError` threw while handling an error thrown from an `after` task", { cause: e11 }));
          }
        }
      }
      function e6() {
        throw Error("`after()` will not work correctly, because `waitUntil` is not available in the current environment.");
      }
      class e4 {
        onClose(e10) {
          if (this.isClosed) throw Error("Cannot subscribe to a closed CloseController");
          this.target.addEventListener("close", e10), this.listeners++;
        }
        dispatchClose() {
          if (this.isClosed) throw Error("Cannot close a CloseController multiple times");
          this.listeners > 0 && this.target.dispatchEvent(new Event("close")), this.isClosed = true;
        }
        constructor() {
          this.target = new EventTarget(), this.listeners = 0, this.isClosed = false;
        }
      }
      function e8() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID, previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      let e9 = Symbol.for("@next/request-context");
      class e7 extends q {
        constructor(e10) {
          super(e10.input, e10.init), this.sourcePage = e10.page;
        }
        get request() {
          throw new b({ page: this.sourcePage });
        }
        respondWith() {
          throw new b({ page: this.sourcePage });
        }
        waitUntil() {
          throw new b({ page: this.sourcePage });
        }
      }
      let te = { keys: (e10) => Array.from(e10.keys()), get: (e10, t10) => e10.get(t10) ?? void 0 }, tt = (e10, t10) => eK().withPropagatedContext(e10.headers, t10, te), tr = false;
      async function tn(e10) {
        var t10;
        let n10, i10;
        !function() {
          if (!tr && (tr = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
            let { interceptTestApis: e11, wrapRequestHandler: t11 } = r(458);
            e11(), tt = t11(tt);
          }
        }(), await y();
        let o10 = void 0 !== self.__BUILD_MANIFEST;
        e10.request.url = e10.request.url.replace(/\.rsc($|\?)/, "$1");
        let a10 = new H(e10.request.url, { headers: e10.request.headers, nextConfig: e10.request.nextConfig });
        for (let e11 of [...a10.searchParams.keys()]) {
          let t11 = a10.searchParams.getAll(e11);
          !function(e12, t12) {
            for (let r10 of ["nxtP", "nxtI"]) e12 !== r10 && e12.startsWith(r10) && t12(e12.substring(r10.length));
          }(e11, (r10) => {
            for (let e12 of (a10.searchParams.delete(r10), t11)) a10.searchParams.append(r10, e12);
            a10.searchParams.delete(e11);
          });
        }
        let s10 = a10.buildId;
        a10.buildId = "";
        let l2 = e10.request.headers["x-nextjs-data"];
        l2 && "/index" === a10.pathname && (a10.pathname = "/");
        let c2 = function(e11) {
          let t11 = new Headers();
          for (let [r10, n11] of Object.entries(e11)) for (let e12 of Array.isArray(n11) ? n11 : [n11]) void 0 !== e12 && ("number" == typeof e12 && (e12 = e12.toString()), t11.append(r10, e12));
          return t11;
        }(e10.request.headers), u2 = /* @__PURE__ */ new Map();
        if (!o10) for (let e11 of Z) {
          let t11 = e11.toLowerCase(), r10 = c2.get(t11);
          r10 && (u2.set(t11, r10), c2.delete(t11));
        }
        let d2 = new e7({ page: e10.page, input: function(e11, t11) {
          let r10 = "string" == typeof e11, n11 = r10 ? new URL(e11) : e11;
          for (let e12 of Y) n11.searchParams.delete(e12);
          if (t11) for (let e12 of Q) n11.searchParams.delete(e12);
          return r10 ? n11.toString() : n11;
        }(a10, true).toString(), init: { body: e10.request.body, headers: c2, method: e10.request.method, nextConfig: e10.request.nextConfig, signal: e10.request.signal } });
        l2 && Object.defineProperty(d2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCache && e10.IncrementalCache && (globalThis.__incrementalCache = new e10.IncrementalCache({ appDir: true, fetchCache: true, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: e10.request.headers, requestProtocol: "https", getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: e8() }) }));
        let p2 = e10.request.waitUntil ?? (null == (t10 = function() {
          let e11 = globalThis[e9];
          return null == e11 ? void 0 : e11.get();
        }()) ? void 0 : t10.waitUntil), h2 = new R({ request: d2, page: e10.page, context: p2 ? { waitUntil: p2 } : void 0 });
        if ((n10 = await tt(d2, () => {
          if ("/middleware" === e10.page || "/src/middleware" === e10.page) {
            let t11 = h2.waitUntil.bind(h2), r10 = new e4();
            return eK().trace(eA.execute, { spanName: `middleware ${d2.method} ${d2.nextUrl.pathname}`, attributes: { "http.target": d2.nextUrl.pathname, "http.method": d2.method } }, async () => {
              try {
                var n11, o11, a11, l3, c3, u3, p3;
                let f3 = e8(), m3 = (c3 = d2.nextUrl, u3 = void 0, p3 = (e11) => {
                  i10 = e11;
                }, function(e11, t12, r11, n12, i11, o12, a12, s11, l4, c4) {
                  function u4(e12) {
                    r11 && r11.setHeader("Set-Cookie", e12);
                  }
                  let d3 = {};
                  return { type: "request", phase: e11, implicitTags: i11 ?? [], url: { pathname: n12.pathname, search: n12.search ?? "" }, get headers() {
                    return d3.headers || (d3.headers = function(e12) {
                      let t13 = et.from(e12);
                      for (let e13 of Z) t13.delete(e13.toLowerCase());
                      return et.seal(t13);
                    }(t12.headers)), d3.headers;
                  }, get cookies() {
                    if (!d3.cookies) {
                      let e12 = new W.RequestCookies(et.from(t12.headers));
                      eJ(t12, e12), d3.cookies = eu.seal(e12);
                    }
                    return d3.cookies;
                  }, set cookies(value) {
                    d3.cookies = value;
                  }, get mutableCookies() {
                    if (!d3.mutableCookies) {
                      let e12 = function(e13, t13) {
                        let r12 = new W.RequestCookies(et.from(e13));
                        return ep.wrap(r12, t13);
                      }(t12.headers, o12 || (r11 ? u4 : void 0));
                      eJ(t12, e12), d3.mutableCookies = e12;
                    }
                    return d3.mutableCookies;
                  }, get userspaceMutableCookies() {
                    if (!d3.userspaceMutableCookies) {
                      let e12 = function(e13) {
                        let t13 = new Proxy(e13, { get(e14, r12, n13) {
                          switch (r12) {
                            case "delete":
                              return function(...r13) {
                                return ef("cookies().delete"), e14.delete(...r13), t13;
                              };
                            case "set":
                              return function(...r13) {
                                return ef("cookies().set"), e14.set(...r13), t13;
                              };
                            default:
                              return K.get(e14, r12, n13);
                          }
                        } });
                        return t13;
                      }(this.mutableCookies);
                      d3.userspaceMutableCookies = e12;
                    }
                    return d3.userspaceMutableCookies;
                  }, get draftMode() {
                    return d3.draftMode || (d3.draftMode = new ez(s11, t12, this.cookies, this.mutableCookies)), d3.draftMode;
                  }, renderResumeDataCache: a12 ?? null, isHmrRefresh: l4, serverComponentsHmrCache: c4 || globalThis.__serverComponentsHmrCache };
                }("action", d2, void 0, c3, u3, p3, void 0, f3, false, void 0)), g3 = function({ page: e11, fallbackRouteParams: t12, renderOpts: r11, requestEndedState: n12, isPrefetchRequest: i11 }) {
                  var o12;
                  let a12 = { isStaticGeneration: !r11.supportsDynamicResponse && !r11.isDraftMode && !r11.isServerAction, page: e11, fallbackRouteParams: t12, route: (o12 = e11.split("/").reduce((e12, t13, r12, n13) => t13 ? "(" === t13[0] && t13.endsWith(")") || "@" === t13[0] || ("page" === t13 || "route" === t13) && r12 === n13.length - 1 ? e12 : e12 + "/" + t13 : e12, "")).startsWith("/") ? o12 : "/" + o12, incrementalCache: r11.incrementalCache || globalThis.__incrementalCache, cacheLifeProfiles: r11.cacheLifeProfiles, isRevalidate: r11.isRevalidate, isPrerendering: r11.nextExport, fetchCache: r11.fetchCache, isOnDemandRevalidate: r11.isOnDemandRevalidate, isDraftMode: r11.isDraftMode, requestEndedState: n12, isPrefetchRequest: i11, buildId: r11.buildId, reactLoadableManifest: (null == r11 ? void 0 : r11.reactLoadableManifest) || {}, assetPrefix: (null == r11 ? void 0 : r11.assetPrefix) || "", afterContext: function(e12) {
                    let { waitUntil: t13, onClose: r12, onAfterTaskError: n13 } = e12;
                    return new e5({ waitUntil: t13, onClose: r12, onTaskError: n13 });
                  }(r11) };
                  return r11.store = a12, a12;
                }({ page: "/", fallbackRouteParams: null, renderOpts: { cacheLifeProfiles: null == (o11 = e10.request.nextConfig) ? void 0 : null == (n11 = o11.experimental) ? void 0 : n11.cacheLife, experimental: { isRoutePPREnabled: false, dynamicIO: false, authInterrupts: !!(null == (l3 = e10.request.nextConfig) ? void 0 : null == (a11 = l3.experimental) ? void 0 : a11.authInterrupts) }, buildId: s10 ?? "", supportsDynamicResponse: true, waitUntil: t11, onClose: r10.onClose.bind(r10), onAfterTaskError: void 0 }, requestEndedState: { ended: false }, isPrefetchRequest: d2.headers.has(X) });
                return await ea.run(g3, () => es.run(m3, e10.handler, d2, h2));
              } finally {
                setTimeout(() => {
                  r10.dispatchClose();
                }, 0);
              }
            });
          }
          return e10.handler(d2, h2);
        })) && !(n10 instanceof Response)) throw TypeError("Expected an instance of Response to be returned");
        n10 && i10 && n10.headers.set("set-cookie", i10);
        let f2 = null == n10 ? void 0 : n10.headers.get("x-middleware-rewrite");
        if (n10 && f2 && !o10) {
          let t11 = new H(f2, { forceLocale: true, headers: e10.request.headers, nextConfig: e10.request.nextConfig });
          t11.host === d2.nextUrl.host && (t11.buildId = s10 || t11.buildId, n10.headers.set("x-middleware-rewrite", String(t11)));
          let r10 = G(String(t11), String(a10));
          l2 && n10.headers.set("x-nextjs-rewrite", r10);
        }
        let m2 = null == n10 ? void 0 : n10.headers.get("Location");
        if (n10 && m2 && !o10) {
          let t11 = new H(m2, { forceLocale: false, headers: e10.request.headers, nextConfig: e10.request.nextConfig });
          n10 = new Response(n10.body, n10), t11.host === d2.nextUrl.host && (t11.buildId = s10 || t11.buildId, n10.headers.set("Location", String(t11))), l2 && (n10.headers.delete("Location"), n10.headers.set("x-nextjs-redirect", G(String(t11), String(a10))));
        }
        let g2 = n10 || F.next(), w2 = g2.headers.get("x-middleware-override-headers"), b2 = [];
        if (w2) {
          for (let [e11, t11] of u2) g2.headers.set(`x-middleware-request-${e11}`, t11), b2.push(e11);
          b2.length > 0 && g2.headers.set("x-middleware-override-headers", w2 + "," + b2.join(","));
        }
        return { response: g2, waitUntil: ("internal" === h2[P].kind ? Promise.all(h2[P].promises).then(() => {
        }) : void 0) ?? Promise.resolve(), fetchMetrics: d2.fetchMetrics };
      }
      var ti = function(e10, t10, r10, n10, i10) {
        if ("m" === n10) throw TypeError("Private method is not writable");
        if ("a" === n10 && !i10) throw TypeError("Private accessor was defined without a setter");
        if ("function" == typeof t10 ? e10 !== t10 || !i10 : !t10.has(e10)) throw TypeError("Cannot write private member to an object whose class did not declare it");
        return "a" === n10 ? i10.call(e10, r10) : i10 ? i10.value = r10 : t10.set(e10, r10), r10;
      }, to = function(e10, t10, r10, n10) {
        if ("a" === r10 && !n10) throw TypeError("Private accessor was defined without a getter");
        if ("function" == typeof t10 ? e10 !== t10 || !n10 : !t10.has(e10)) throw TypeError("Cannot read private member from an object whose class did not declare it");
        return "m" === r10 ? n10 : "a" === r10 ? n10.call(e10) : n10 ? n10.value : t10.get(e10);
      };
      function ta(e10) {
        let t10 = e10 ? "__Secure-" : "";
        return { sessionToken: { name: `${t10}authjs.session-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, callbackUrl: { name: `${t10}authjs.callback-url`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, csrfToken: { name: `${e10 ? "__Host-" : ""}authjs.csrf-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, pkceCodeVerifier: { name: `${t10}authjs.pkce.code_verifier`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10, maxAge: 900 } }, state: { name: `${t10}authjs.state`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10, maxAge: 900 } }, nonce: { name: `${t10}authjs.nonce`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, webauthnChallenge: { name: `${t10}authjs.challenge`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10, maxAge: 900 } } };
      }
      class ts {
        constructor(e10, t10, r10) {
          if (iR.add(this), iO.set(this, {}), iI.set(this, void 0), iU.set(this, void 0), ti(this, iU, r10, "f"), ti(this, iI, e10, "f"), !t10) return;
          let { name: n10 } = e10;
          for (let [e11, r11] of Object.entries(t10)) e11.startsWith(n10) && r11 && (to(this, iO, "f")[e11] = r11);
        }
        get value() {
          return Object.keys(to(this, iO, "f")).sort((e10, t10) => parseInt(e10.split(".").pop() || "0") - parseInt(t10.split(".").pop() || "0")).map((e10) => to(this, iO, "f")[e10]).join("");
        }
        chunk(e10, t10) {
          let r10 = to(this, iR, "m", i$).call(this);
          for (let n10 of to(this, iR, "m", iN).call(this, { name: to(this, iI, "f").name, value: e10, options: { ...to(this, iI, "f").options, ...t10 } })) r10[n10.name] = n10;
          return Object.values(r10);
        }
        clean() {
          return Object.values(to(this, iR, "m", i$).call(this));
        }
      }
      iO = /* @__PURE__ */ new WeakMap(), iI = /* @__PURE__ */ new WeakMap(), iU = /* @__PURE__ */ new WeakMap(), iR = /* @__PURE__ */ new WeakSet(), iN = function(e10) {
        let t10 = Math.ceil(e10.value.length / 3936);
        if (1 === t10) return to(this, iO, "f")[e10.name] = e10.value, [e10];
        let r10 = [];
        for (let n10 = 0; n10 < t10; n10++) {
          let t11 = `${e10.name}.${n10}`, i10 = e10.value.substr(3936 * n10, 3936);
          r10.push({ ...e10, name: t11, value: i10 }), to(this, iO, "f")[t11] = i10;
        }
        return to(this, iU, "f").debug("CHUNKING_SESSION_COOKIE", { message: "Session cookie exceeds allowed 4096 bytes.", emptyCookieSize: 160, valueSize: e10.value.length, chunks: r10.map((e11) => e11.value.length + 160) }), r10;
      }, i$ = function() {
        let e10 = {};
        for (let t10 in to(this, iO, "f")) delete to(this, iO, "f")?.[t10], e10[t10] = { name: t10, value: "", options: { ...to(this, iI, "f").options, maxAge: 0 } };
        return e10;
      };
      class tl extends Error {
        constructor(e10, t10) {
          e10 instanceof Error ? super(void 0, { cause: { err: e10, ...e10.cause, ...t10 } }) : "string" == typeof e10 ? (t10 instanceof Error && (t10 = { err: t10, ...t10.cause }), super(e10, t10)) : super(void 0, e10), this.name = this.constructor.name, this.type = this.constructor.type ?? "AuthError", this.kind = this.constructor.kind ?? "error", Error.captureStackTrace?.(this, this.constructor);
          let r10 = `https://errors.authjs.dev#${this.type.toLowerCase()}`;
          this.message += `${this.message ? ". " : ""}Read more at ${r10}`;
        }
      }
      class tc extends tl {
      }
      tc.kind = "signIn";
      class tu extends tl {
      }
      tu.type = "AdapterError";
      class td extends tl {
      }
      td.type = "AccessDenied";
      class tp extends tl {
      }
      tp.type = "CallbackRouteError";
      class th extends tl {
      }
      th.type = "ErrorPageLoop";
      class tf extends tl {
      }
      tf.type = "EventError";
      class tm extends tl {
      }
      tm.type = "InvalidCallbackUrl";
      class tg extends tc {
        constructor() {
          super(...arguments), this.code = "credentials";
        }
      }
      tg.type = "CredentialsSignin";
      class ty extends tl {
      }
      ty.type = "InvalidEndpoints";
      class tw extends tl {
      }
      tw.type = "InvalidCheck";
      class tb extends tl {
      }
      tb.type = "JWTSessionError";
      class tv extends tl {
      }
      tv.type = "MissingAdapter";
      class t_ extends tl {
      }
      t_.type = "MissingAdapterMethods";
      class tS extends tl {
      }
      tS.type = "MissingAuthorize";
      class tk extends tl {
      }
      tk.type = "MissingSecret";
      class tx extends tc {
      }
      tx.type = "OAuthAccountNotLinked";
      class tE extends tc {
      }
      tE.type = "OAuthCallbackError";
      class tA extends tl {
      }
      tA.type = "OAuthProfileParseError";
      class tT extends tl {
      }
      tT.type = "SessionTokenError";
      class tP extends tc {
      }
      tP.type = "OAuthSignInError";
      class tC extends tc {
      }
      tC.type = "EmailSignInError";
      class tR extends tl {
      }
      tR.type = "SignOutError";
      class tO extends tl {
      }
      tO.type = "UnknownAction";
      class tI extends tl {
      }
      tI.type = "UnsupportedStrategy";
      class tU extends tl {
      }
      tU.type = "InvalidProvider";
      class tN extends tl {
      }
      tN.type = "UntrustedHost";
      class t$ extends tl {
      }
      t$.type = "Verification";
      class tj extends tc {
      }
      tj.type = "MissingCSRF";
      let tL = /* @__PURE__ */ new Set(["CredentialsSignin", "OAuthAccountNotLinked", "OAuthCallbackError", "AccessDenied", "Verification", "MissingCSRF", "AccountNotLinked", "WebAuthnVerificationError"]);
      class tD extends tl {
      }
      tD.type = "DuplicateConditionalUI";
      class tM extends tl {
      }
      tM.type = "MissingWebAuthnAutocomplete";
      class tH extends tl {
      }
      tH.type = "WebAuthnVerificationError";
      class tW extends tc {
      }
      tW.type = "AccountNotLinked";
      class tB extends tl {
      }
      tB.type = "ExperimentalFeatureNotEnabled";
      let tq = false;
      function tK(e10, t10) {
        try {
          return /^https?:/.test(new URL(e10, e10.startsWith("/") ? t10 : void 0).protocol);
        } catch {
          return false;
        }
      }
      let tV = false, tz = false, tJ = false, tF = ["createVerificationToken", "useVerificationToken", "getUserByEmail"], tG = ["createUser", "getUser", "getUserByEmail", "getUserByAccount", "updateUser", "linkAccount", "createSession", "getSessionAndUser", "updateSession", "deleteSession"], tX = ["createUser", "getUser", "linkAccount", "getAccount", "getAuthenticator", "createAuthenticator", "listAuthenticatorsByUserId", "updateAuthenticatorCounter"], tZ = () => {
        if ("undefined" != typeof globalThis) return globalThis;
        if ("undefined" != typeof self) return self;
        if ("undefined" != typeof window) return window;
        throw Error("unable to locate global object");
      }, tY = async (e10, t10, r10, n10, i10) => {
        let { crypto: { subtle: o10 } } = tZ();
        return new Uint8Array(await o10.deriveBits({ name: "HKDF", hash: `SHA-${e10.substr(3)}`, salt: r10, info: n10 }, await o10.importKey("raw", t10, "HKDF", false, ["deriveBits"]), i10 << 3));
      };
      function tQ(e10, t10) {
        if ("string" == typeof e10) return new TextEncoder().encode(e10);
        if (!(e10 instanceof Uint8Array)) throw TypeError(`"${t10}"" must be an instance of Uint8Array or a string`);
        return e10;
      }
      async function t0(e10, t10, r10, n10, i10) {
        return tY(function(e11) {
          switch (e11) {
            case "sha256":
            case "sha384":
            case "sha512":
            case "sha1":
              return e11;
            default:
              throw TypeError('unsupported "digest" value');
          }
        }(e10), function(e11) {
          let t11 = tQ(e11, "ikm");
          if (!t11.byteLength) throw TypeError('"ikm" must be at least one byte in length');
          return t11;
        }(t10), tQ(r10, "salt"), function(e11) {
          let t11 = tQ(e11, "info");
          if (t11.byteLength > 1024) throw TypeError('"info" must not contain more than 1024 bytes');
          return t11;
        }(n10), function(e11, t11) {
          if ("number" != typeof e11 || !Number.isInteger(e11) || e11 < 1) throw TypeError('"keylen" must be a positive integer');
          if (e11 > 255 * (parseInt(t11.substr(3), 10) >> 3 || 20)) throw TypeError('"keylen" too large');
          return e11;
        }(i10, e10));
      }
      let t1 = new TextEncoder(), t2 = new TextDecoder(), t3 = new TextDecoder("utf-8", { fatal: true });
      function t5(...e10) {
        let t10 = new Uint8Array(e10.reduce((e11, { length: t11 }) => e11 + t11, 0)), r10 = 0;
        for (let n10 of e10) t10.set(n10, r10), r10 += n10.length;
        return t10;
      }
      function t6(e10, t10, r10) {
        if (t10 < 0 || t10 >= 4294967296) throw RangeError(`value must be >= 0 and <= ${4294967296 - 1}. Received ${t10}`);
        e10.set([t10 >>> 24, t10 >>> 16, t10 >>> 8, 255 & t10], r10);
      }
      function t4(e10) {
        let t10 = Math.floor(e10 / 4294967296), r10 = new Uint8Array(8);
        return t6(r10, t10, 0), t6(r10, e10 % 4294967296, 4), r10;
      }
      function t8(e10) {
        let t10 = new Uint8Array(4);
        return t6(t10, e10), t10;
      }
      function t9(e10) {
        let t10 = new Uint8Array(e10.length);
        for (let r10 = 0; r10 < e10.length; r10++) {
          let n10 = e10.charCodeAt(r10);
          if (n10 > 127) throw TypeError("non-ASCII string encountered in encode()");
          t10[r10] = n10;
        }
        return t10;
      }
      let t7 = "The input to be decoded is not correctly encoded.";
      function re(e10) {
        if (Uint8Array.fromBase64) try {
          return Uint8Array.fromBase64("string" == typeof e10 ? e10 : t2.decode(e10), { alphabet: "base64url" });
        } catch (e11) {
          throw TypeError(t7, { cause: e11 });
        }
        let t10 = e10;
        if (t10 instanceof Uint8Array && (t10 = t2.decode(t10)), t10.includes("+") || t10.includes("/")) throw TypeError(t7);
        t10 = t10.replace(/-/g, "+").replace(/_/g, "/");
        try {
          return function(e11) {
            if (Uint8Array.fromBase64) return Uint8Array.fromBase64(e11);
            let t11 = atob(e11), r10 = new Uint8Array(t11.length);
            for (let e12 = 0; e12 < t11.length; e12++) r10[e12] = t11.charCodeAt(e12);
            return r10;
          }(t10);
        } catch {
          throw TypeError(t7);
        }
      }
      function rt(e10) {
        let t10 = e10;
        return ("string" == typeof t10 && (t10 = t1.encode(t10)), Uint8Array.prototype.toBase64) ? t10.toBase64({ alphabet: "base64url", omitPadding: true }) : function(e11) {
          if (Uint8Array.prototype.toBase64) return e11.toBase64();
          let t11 = [];
          for (let r10 = 0; r10 < e11.length; r10 += 32768) t11.push(String.fromCharCode.apply(null, e11.subarray(r10, r10 + 32768)));
          return btoa(t11.join(""));
        }(t10).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      function rr(e10) {
        if ("object" != typeof e10 || null === e10 || "[object Object]" !== Object.prototype.toString.call(e10)) return false;
        let t10 = Object.getPrototypeOf(e10);
        if (null === t10) return true;
        let r10 = t10;
        for (; null !== Object.getPrototypeOf(r10); ) r10 = Object.getPrototypeOf(r10);
        return t10 === r10;
      }
      function rn(...e10) {
        let t10 = /* @__PURE__ */ new Set();
        for (let r10 of e10) if (r10) for (let e11 of Object.keys(r10)) {
          if (t10.has(e11)) return false;
          t10.add(e11);
        }
        return true;
      }
      let ri = (e10) => rr(e10) && "string" == typeof e10.kty, ro = (e10) => "oct" !== e10.kty && ("AKP" === e10.kty && "string" == typeof e10.priv || "string" == typeof e10.d), ra = (e10) => "oct" !== e10.kty && void 0 === e10.d && void 0 === e10.priv, rs = (e10) => "oct" === e10.kty && "string" == typeof e10.k, rl = Symbol();
      function rc(e10, t10) {
        if (e10) throw TypeError(`${t10} can only be called once`);
      }
      function ru(e10, t10, r10) {
        try {
          return re(e10);
        } catch {
          throw new r10(`Failed to base64url decode the ${t10}`);
        }
      }
      async function rd(e10, t10) {
        let r10 = `SHA-${e10.slice(-3)}`;
        return new Uint8Array(await crypto.subtle.digest(r10, t10));
      }
      class rp extends Error {
        static code = "ERR_JOSE_GENERIC";
        code = "ERR_JOSE_GENERIC";
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class rh extends rp {
        static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        claim;
        reason;
        payload;
        constructor(e10, t10, r10 = "unspecified", n10 = "unspecified") {
          super(e10, { cause: { claim: r10, reason: n10, payload: t10 } }), this.claim = r10, this.reason = n10, this.payload = t10;
        }
      }
      class rf extends rp {
        static code = "ERR_JWT_EXPIRED";
        code = "ERR_JWT_EXPIRED";
        claim;
        reason;
        payload;
        constructor(e10, t10, r10 = "unspecified", n10 = "unspecified") {
          super(e10, { cause: { claim: r10, reason: n10, payload: t10 } }), this.claim = r10, this.reason = n10, this.payload = t10;
        }
      }
      class rm extends rp {
        static code = "ERR_JOSE_ALG_NOT_ALLOWED";
        code = "ERR_JOSE_ALG_NOT_ALLOWED";
      }
      class rg extends rp {
        static code = "ERR_JOSE_NOT_SUPPORTED";
        code = "ERR_JOSE_NOT_SUPPORTED";
      }
      class ry extends rp {
        static code = "ERR_JWE_DECRYPTION_FAILED";
        code = "ERR_JWE_DECRYPTION_FAILED";
        constructor(e10 = "decryption operation failed", t10) {
          super(e10, t10);
        }
      }
      class rw extends rp {
        static code = "ERR_JWE_INVALID";
        code = "ERR_JWE_INVALID";
      }
      class rb extends rp {
        static code = "ERR_JWT_INVALID";
        code = "ERR_JWT_INVALID";
      }
      class rv extends rp {
        static code = "ERR_JWK_INVALID";
        code = "ERR_JWK_INVALID";
      }
      class r_ extends rp {
        [Symbol.asyncIterator] = async function* () {
        };
        static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
        code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
        constructor(e10 = "multiple matching keys found in the JSON Web Key Set", t10) {
          super(e10, t10);
        }
      }
      function rS(e10) {
        if (!rk(e10)) throw Error("CryptoKey instance expected");
      }
      let rk = (e10) => {
        if (e10?.[Symbol.toStringTag] === "CryptoKey") return true;
        try {
          return e10 instanceof CryptoKey;
        } catch {
          return false;
        }
      }, rx = (e10) => e10?.[Symbol.toStringTag] === "KeyObject", rE = (e10) => rk(e10) || rx(e10);
      function rA(e10, t10, ...r10) {
        if (r10.length > 2) {
          let t11 = r10.pop();
          e10 += `one of type ${r10.join(", ")}, or ${t11}.`;
        } else 2 === r10.length ? e10 += `one of type ${r10[0]} or ${r10[1]}.` : e10 += `of type ${r10[0]}.`;
        return null == t10 ? e10 += ` Received ${t10}` : "function" == typeof t10 && t10.name ? e10 += ` Received function ${t10.name}` : "object" == typeof t10 && null != t10 && t10.constructor?.name && (e10 += ` Received an instance of ${t10.constructor.name}`), e10;
      }
      let rT = (e10, ...t10) => rA("Key must be ", e10, ...t10), rP = (e10, t10, ...r10) => rA(`Key for the ${e10} algorithm must be `, t10, ...r10);
      async function rC(e10) {
        if (rx(e10)) {
          if ("secret" !== e10.type) return e10.export({ format: "jwk" });
          e10 = e10.export();
        }
        if (e10 instanceof Uint8Array) return { kty: "oct", k: rt(e10) };
        if (!rk(e10)) throw TypeError(rT(e10, "CryptoKey", "KeyObject", "Uint8Array"));
        if (!e10.extractable) throw TypeError("non-extractable CryptoKey cannot be exported as a JWK");
        let { ext: t10, key_ops: r10, alg: n10, use: i10, ...o10 } = Object.fromEntries(Object.entries(await crypto.subtle.exportKey("jwk", e10)).filter(([, e11]) => void 0 !== e11));
        return "AKP" === o10.kty && (o10.alg = n10), o10;
      }
      let rR = (e10, t10) => {
        if ("string" != typeof e10 || !e10) throw new rv(`${t10} missing or invalid`);
      };
      async function rO(e10, t10) {
        let r10, n10;
        if (ri(e10)) r10 = e10;
        else if (rE(e10)) r10 = await rC(e10);
        else throw TypeError(rT(e10, "CryptoKey", "KeyObject", "JSON Web Key"));
        if ("sha256" !== (t10 ??= "sha256") && "sha384" !== t10 && "sha512" !== t10) throw TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
        switch (r10.kty) {
          case "AKP":
            rR(r10.alg, '"alg" (Algorithm) Parameter'), rR(r10.pub, '"pub" (Public key) Parameter'), n10 = { alg: r10.alg, kty: r10.kty, pub: r10.pub };
            break;
          case "EC":
            rR(r10.crv, '"crv" (Curve) Parameter'), rR(r10.x, '"x" (X Coordinate) Parameter'), rR(r10.y, '"y" (Y Coordinate) Parameter'), n10 = { crv: r10.crv, kty: r10.kty, x: r10.x, y: r10.y };
            break;
          case "OKP":
            rR(r10.crv, '"crv" (Subtype of Key Pair) Parameter'), rR(r10.x, '"x" (Public Key) Parameter'), n10 = { crv: r10.crv, kty: r10.kty, x: r10.x };
            break;
          case "RSA":
            rR(r10.e, '"e" (Exponent) Parameter'), rR(r10.n, '"n" (Modulus) Parameter'), n10 = { e: r10.e, kty: r10.kty, n: r10.n };
            break;
          case "oct":
            rR(r10.k, '"k" (Key Value) Parameter'), n10 = { k: r10.k, kty: r10.kty };
            break;
          default:
            throw new rg('"kty" (Key Type) Parameter missing or unsupported');
        }
        let i10 = t9(JSON.stringify(n10));
        return rt(await rd(t10, i10));
      }
      let rI = (e10, t10 = "algorithm.name") => TypeError(`CryptoKey does not support this operation, its ${t10} must be ${e10}`);
      function rU(e10, t10) {
        if (t10 && !e10.usages.includes(t10)) throw TypeError(`CryptoKey does not support this operation, its usages must include ${t10}.`);
      }
      function rN(e10, t10, r10) {
        let n10 = e10.algorithm;
        if (n10.name !== t10.name) throw rI(t10.name);
        if (t10.hash && n10.hash?.name !== t10.hash) throw rI(t10.hash, "algorithm.hash");
        if (t10.namedCurve && n10.namedCurve !== t10.namedCurve) throw rI(t10.namedCurve, "algorithm.namedCurve");
        if (void 0 !== t10.length && n10.length !== t10.length) throw rI(t10.length, "algorithm.length");
        rU(e10, r10);
      }
      let r$ = (e10) => crypto.getRandomValues(new Uint8Array(e10.cekBits >> 3));
      function rj(e10, t10) {
        let r10 = e10.byteLength << 3;
        if (r10 !== t10) throw new rw(`Invalid Content Encryption Key length. Expected ${t10} bits, got ${r10} bits`);
      }
      let rL = (e10) => crypto.getRandomValues(new Uint8Array(e10.ivBits >> 3));
      function rD(e10, t10) {
        if (t10.length << 3 !== e10.ivBits) throw new rw("Invalid Initialization Vector length");
      }
      async function rM(e10, t10, r10) {
        if (!(t10 instanceof Uint8Array)) throw TypeError(rT(t10, "Uint8Array"));
        let n10 = e10.cekBits >> 1;
        return [await crypto.subtle.importKey("raw", t10.subarray(n10 >> 3), "AES-CBC", false, [r10]), await crypto.subtle.importKey("raw", t10.subarray(0, n10 >> 3), { hash: `SHA-${n10 << 1}`, name: "HMAC" }, false, ["sign"]), n10];
      }
      async function rH(e10, t10, r10) {
        return new Uint8Array((await crypto.subtle.sign("HMAC", e10, t10)).slice(0, r10 >> 3));
      }
      async function rW(e10, t10, r10, n10, i10) {
        let [o10, a10, s10] = await rM(e10, r10, "encrypt"), l2 = new Uint8Array(await crypto.subtle.encrypt({ iv: n10, name: "AES-CBC" }, o10, t10)), c2 = t5(i10, n10, l2, t4(8 * i10.length));
        return { ciphertext: l2, tag: await rH(a10, c2, s10), iv: n10 };
      }
      async function rB(e10, t10) {
        let r10 = { name: "HMAC", hash: "SHA-256" }, n10 = await crypto.subtle.generateKey(r10, false, ["sign", "verify"]), i10 = await crypto.subtle.sign(r10, n10, e10);
        return crypto.subtle.verify(r10, n10, i10, t10);
      }
      async function rq(e10, t10, r10, n10, i10, o10) {
        let a10, s10;
        let [l2, c2, u2] = await rM(e10, t10, "decrypt"), d2 = t5(o10, n10, r10, t4(8 * o10.length)), p2 = await rH(c2, d2, u2);
        try {
          a10 = await rB(i10, p2);
        } catch {
        }
        if (!a10) throw new ry();
        try {
          s10 = new Uint8Array(await crypto.subtle.decrypt({ iv: n10, name: "AES-CBC" }, l2, r10));
        } catch {
        }
        if (!s10) throw new ry();
        return s10;
      }
      async function rK(e10, t10, r10, n10, i10) {
        let o10 = r10 instanceof Uint8Array ? await crypto.subtle.importKey("raw", r10, "AES-GCM", false, ["encrypt"]) : (rN(r10, e10.subtle, "encrypt"), r10), a10 = new Uint8Array(await crypto.subtle.encrypt({ additionalData: i10, iv: n10, name: "AES-GCM", tagLength: 128 }, o10, t10)), s10 = a10.slice(-16);
        return { ciphertext: a10.slice(0, -16), tag: s10, iv: n10 };
      }
      async function rV(e10, t10, r10, n10, i10, o10) {
        let a10 = t10 instanceof Uint8Array ? await crypto.subtle.importKey("raw", t10, "AES-GCM", false, ["decrypt"]) : (rN(t10, e10.subtle, "decrypt"), t10);
        try {
          return new Uint8Array(await crypto.subtle.decrypt({ additionalData: o10, iv: n10, name: "AES-GCM", tagLength: 128 }, a10, t5(r10, i10)));
        } catch {
          throw new ry();
        }
      }
      async function rz(e10, t10, r10, n10, i10) {
        if (!rk(r10) && !(r10 instanceof Uint8Array)) throw TypeError(rT(r10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        return n10 ? rD(e10, n10) : n10 = rL(e10), r10 instanceof Uint8Array && rj(r10, e10.cekBits), e10.cbc ? rW(e10, t10, r10, n10, i10) : rK(e10, t10, r10, n10, i10);
      }
      async function rJ(e10, t10, r10, n10, i10, o10) {
        if (!rk(t10) && !(t10 instanceof Uint8Array)) throw TypeError(rT(t10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        if (!n10) throw new rw("JWE Initialization Vector missing");
        if (!i10) throw new rw("JWE Authentication Tag missing");
        return rD(e10, n10), t10 instanceof Uint8Array && rj(t10, e10.cekBits), e10.cbc ? rq(e10, t10, r10, n10, i10, o10) : rV(e10, t10, r10, n10, i10, o10);
      }
      async function rF(e10, t10) {
        if ("RSA" === t10.kty && "oth" in t10 && void 0 !== t10.oth) throw new rg('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
        if (!e10.kty.includes(t10.kty)) throw new rg('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
        let r10 = e10.resolve?.({ kty: t10.kty, crv: t10.crv }) ?? e10.subtle, n10 = !!(t10.d || t10.priv), i10 = { ...t10 };
        return "AKP" !== i10.kty && delete i10.alg, delete i10.use, crypto.subtle.importKey("jwk", i10, r10, t10.ext ?? !n10, t10.key_ops ?? e10.usages[n10 ? 1 : 0]);
      }
      let rG = (e10) => e10[Symbol.toStringTag], rX = (e10, t10, r10) => {
        let { alg: n10 } = e10;
        if (void 0 !== t10.use) {
          let e11 = "sign" === r10 || "verify" === r10 ? "sig" : "enc";
          if (t10.use !== e11) throw TypeError(`Invalid key for this operation, its "use" must be "${e11}" when present`);
        }
        if (void 0 !== t10.alg && t10.alg !== n10) throw TypeError(`Invalid key for this operation, its "alg" must be "${n10}" when present`);
        if (Array.isArray(t10.key_ops)) {
          let n11 = "encrypt" === r10 || "decrypt" === r10 ? e10.ops?.["encrypt" === r10 ? 0 : 1] : r10;
          if (n11 && !t10.key_ops.includes(n11)) throw TypeError(`Invalid key for this operation, its "key_ops" must include "${n11}" when present`);
        }
      }, rZ = { __proto__: null, prime256v1: "P-256", secp384r1: "P-384", secp521r1: "P-521" };
      function rY(e10, t10, r10) {
        let n10 = (i ||= /* @__PURE__ */ new WeakMap()).get(e10);
        return r10 && (n10 ? n10[t10] = r10 : i.set(e10, { __proto__: null, [t10]: r10 })), r10 ?? n10?.[t10];
      }
      let rQ = async (e10, t10, r10) => rY(e10, r10.alg) ?? rY(e10, r10.alg, await rF(r10, { ...t10, alg: r10.alg })), r0 = (e10, t10) => {
        let r10 = rY(e10, t10.alg);
        if (r10) return r10;
        let n10 = "public" === e10.type, i10 = t10.usages[n10 ? 0 : 1], { asymmetricKeyType: o10 } = e10, a10 = rZ[e10.asymmetricKeyDetails?.namedCurve], s10 = t10.resolve?.({ crv: a10, asymmetricKeyType: o10 }) ?? t10.subtle;
        return rY(e10, t10.alg, e10.toCryptoKey(s10, n10, i10));
      };
      async function r1(e10, t10, r10) {
        let n10 = function(e11, t11, r11) {
          let { alg: n11, secret: i10 } = e11, o10 = "decrypt" === r11 || "sign" === r11;
          if (i10 && t11 instanceof Uint8Array) return [0, t11];
          if (ri(t11)) {
            if (i10 ? !rs(t11) : !(o10 ? ro(t11) : ra(t11))) throw TypeError(i10 ? 'JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present' : `JSON Web Key for this operation must be a ${o10 ? "private" : "public"} JWK`);
            return rX(e11, t11, r11), [3, t11];
          }
          if (!rE(t11)) throw TypeError(i10 ? rP(n11, t11, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array") : rP(n11, t11, "CryptoKey", "KeyObject", "JSON Web Key"));
          if (i10) {
            if ("secret" !== t11.type) throw TypeError(`${rG(t11)} instances for symmetric algorithms must be of type "secret"`);
          } else {
            if ("secret" === t11.type) throw TypeError(`${rG(t11)} instances for asymmetric algorithms must not be of type "secret"`);
            let e12 = o10 ? "private" : "public";
            if (("public" === t11.type || "private" === t11.type) && t11.type !== e12) {
              let n12 = "sign" === r11 ? "signing" : "verify" === r11 ? "verifying" : `${r11.slice(0, -1)}tion`;
              throw TypeError(`${rG(t11)} instances for asymmetric algorithm ${n12} must be of type "${e12}"`);
            }
          }
          return rk(t11) ? [1, t11] : [2, t11];
        }(e10, t10, r10);
        switch (n10[0]) {
          case 0:
          case 1:
            return n10[1];
          case 3: {
            let t11 = n10[1];
            if (t11.k) return re(t11.k);
            if (!Object.isFrozen(t11)) {
              let { key_ops: e11 } = t11;
              Array.isArray(e11) && Object.freeze(e11), Object.freeze(t11);
            }
            return rQ(t11, t11, e10);
          }
          case 2: {
            let t11 = n10[1];
            if ("secret" === t11.type) return t11.export();
            if ("toCryptoKey" in t11 && "function" == typeof t11.toCryptoKey) return r0(t11, e10);
            return rQ(t11, t11.export({ format: "jwk" }), e10);
          }
        }
      }
      function r2(e10) {
        let t10 = { __proto__: null };
        for (let r10 in e10) t10[r10] = { ...e10[r10], alg: r10 };
        return t10;
      }
      let r3 = [["encrypt", "wrapKey"], ["decrypt", "unwrapKey"]], r5 = [[], ["deriveBits"]], r6 = [[], []];
      function r4(e10) {
        return { kty: ["RSA"], subtle: { name: "RSA-OAEP", hash: `SHA-${e10}` }, usages: r3, ops: ["wrapKey", "unwrapKey"] };
      }
      function r8() {
        return { kty: ["EC", "OKP"], subtle: { name: "ECDH" }, resolve: ({ kty: e10, crv: t10, asymmetricKeyType: r10 }) => {
          if ("X25519" === t10 || "x25519" === r10) return { name: "X25519" };
          if ("OKP" === e10) throw new rg('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
          return { name: "ECDH", namedCurve: t10 };
        }, usages: r5, ops: [void 0, "deriveBits"] };
      }
      function r9(e10, t10 = false) {
        return { kty: ["oct"], secret: true, subtle: { name: t10 ? "AES-GCM" : "AES-KW", length: e10 }, usages: r6, ops: t10 ? ["encrypt", "decrypt"] : ["wrapKey", "unwrapKey"] };
      }
      function r7() {
        return { kty: ["oct"], secret: true, subtle: { name: "PBKDF2" }, usages: r6, ops: ["deriveBits", "deriveBits"] };
      }
      let ne = r2({ dir: { kty: ["oct"], secret: true, subtle: { name: "AES-GCM" }, usages: r6, ops: ["encrypt", "decrypt"] }, "RSA-OAEP": r4(1), "RSA-OAEP-256": r4(256), "RSA-OAEP-384": r4(384), "RSA-OAEP-512": r4(512), "ECDH-ES": r8(), "ECDH-ES+A128KW": r8(), "ECDH-ES+A192KW": r8(), "ECDH-ES+A256KW": r8(), A128KW: r9(128), A192KW: r9(192), A256KW: r9(256), A128GCMKW: r9(128, true), A192GCMKW: r9(192, true), A256GCMKW: r9(256, true), "PBES2-HS256+A128KW": r7(), "PBES2-HS384+A192KW": r7(), "PBES2-HS512+A256KW": r7() }), nt = ["encrypt", "decrypt"];
      function nr(e10, t10 = false) {
        return { kty: ["oct"], secret: true, subtle: { name: t10 ? "AES-CBC" : "AES-GCM", length: e10 }, usages: r6, ops: nt, cekBits: e10, ivBits: t10 ? 128 : 96, cbc: t10 };
      }
      let nn = r2({ A128GCM: nr(128), A192GCM: nr(192), A256GCM: nr(256), "A128CBC-HS256": nr(256, true), "A192CBC-HS384": nr(384, true), "A256CBC-HS512": nr(512, true) });
      function ni(e10, t10) {
        throw new rg(`Invalid or unsupported "${e10}" (JWE ${t10}) header value`);
      }
      function no(e10) {
        return ("string" == typeof e10 ? ne[e10] : void 0) ?? ni("alg", "Algorithm");
      }
      function na(e10) {
        return ("string" == typeof e10 ? nn[e10] : void 0) ?? ni("enc", "Encryption Algorithm");
      }
      function ns(e10, t10) {
        if ("ECDH" !== e10.algorithm.name && "X25519" !== e10.algorithm.name) throw TypeError("CryptoKey does not support this operation, its algorithm.name must be ECDH or X25519");
        rU(e10, t10);
      }
      async function nl(e10, t10, r10) {
        let n10 = no(t10).subtle, i10 = e10 instanceof Uint8Array ? await crypto.subtle.importKey("raw", e10, "AES-KW", true, [r10]) : e10;
        return rN(i10, n10, r10), i10;
      }
      async function nc(e10, t10, r10) {
        let n10 = await nl(t10, e10, "wrapKey"), i10 = await crypto.subtle.importKey("raw", r10, { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.wrapKey("raw", i10, n10, "AES-KW"));
      }
      async function nu(e10, t10, r10) {
        let n10 = await nl(t10, e10, "unwrapKey"), i10 = await crypto.subtle.unwrapKey("raw", r10, n10, "AES-KW", { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.exportKey("raw", i10));
      }
      function nd(e10, t10, r10) {
        rN(t10, no(e10).subtle, r10), function(e11, t11) {
          let { modulusLength: r11 } = t11.algorithm;
          if ("number" != typeof r11 || r11 < 2048) throw TypeError(`${e11} requires key modulusLength to be 2048 bits or larger`);
        }(e10, t10);
      }
      async function np(e10, t10, r10, n10) {
        if (!(e10 instanceof Uint8Array) || e10.length < 8) throw new rw("PBES2 Salt Input must be 8 or more octets");
        if (!Number.isSafeInteger(r10) || 1 !== Math.sign(r10)) throw new rw("PBES2 Count Input must be a positive integer");
        let i10 = t5(t9(t10), Uint8Array.of(0), e10), o10 = parseInt(t10.slice(13, 16), 10), a10 = { hash: `SHA-${t10.slice(8, 11)}`, iterations: r10, name: "PBKDF2", salt: i10 }, s10 = await (n10 instanceof Uint8Array ? crypto.subtle.importKey("raw", n10, "PBKDF2", false, ["deriveBits"]) : (rN(n10, no(t10).subtle, "deriveBits"), n10));
        return new Uint8Array(await crypto.subtle.deriveBits(a10, s10, o10));
      }
      function nh(e10) {
        return t5(t8(e10.length), e10);
      }
      async function nf(e10, t10, r10) {
        let n10 = t10 >> 3, i10 = Math.ceil(n10 / 32), o10 = new Uint8Array(32 * i10);
        for (let t11 = 1; t11 <= i10; t11++) {
          let n11 = await rd("sha256", t5(t8(t11), e10, r10));
          o10.set(n11, (t11 - 1) * 32);
        }
        return o10.slice(0, n10);
      }
      async function nm(e10, t10, r10, n10, i10 = new Uint8Array(), o10 = new Uint8Array()) {
        ns(e10), ns(t10, "deriveBits");
        let a10 = t5(nh(t9(r10)), nh(i10), nh(o10), t8(n10));
        return nf(new Uint8Array(await crypto.subtle.deriveBits({ name: e10.algorithm.name, public: e10 }, t10, "X25519" === e10.algorithm.name ? 256 : Math.ceil(parseInt(e10.algorithm.namedCurve.slice(-3), 10) / 8) << 3)), n10, a10);
      }
      function ng(e10) {
        rS(e10);
        let t10 = e10.algorithm.namedCurve;
        if ("P-256" !== t10 && "P-384" !== t10 && "P-521" !== t10 && "X25519" !== e10.algorithm.name) throw new rg("ECDH with the provided key is not allowed or not supported by your javascript runtime");
      }
      function ny(e10) {
        if (void 0 === e10) throw new rw("JWE Encrypted Key missing");
      }
      function nw(e10) {
        if (void 0 !== e10) throw new rw("Encountered unexpected JWE Encrypted Key");
      }
      async function nb(e10, t10, r10, n10, i10, o10) {
        let a10 = no(e10);
        if ("dir" === e10) return nw(n10), r10;
        switch (a10.subtle.name) {
          case "ECDH": {
            let o11, s10;
            if ("ECDH-ES" === e10 && nw(n10), !rr(i10.epk)) throw new rw('JOSE Header "epk" (Ephemeral Public Key) missing or invalid');
            ng(r10);
            let l2 = await rF(a10, i10.epk);
            if (void 0 !== i10.apu) {
              if ("string" != typeof i10.apu) throw new rw('JOSE Header "apu" (Agreement PartyUInfo) invalid');
              o11 = ru(i10.apu, "apu", rw);
            }
            if (void 0 !== i10.apv) {
              if ("string" != typeof i10.apv) throw new rw('JOSE Header "apv" (Agreement PartyVInfo) invalid');
              s10 = ru(i10.apv, "apv", rw);
            }
            let c2 = await nm(l2, r10, "ECDH-ES" === e10 ? t10.alg : e10, "ECDH-ES" === e10 ? t10.cekBits : parseInt(e10.slice(-5, -2), 10), o11, s10);
            if ("ECDH-ES" === e10) return c2;
            return ny(n10), nu(e10.slice(-6), c2, n10);
          }
          case "RSA-OAEP":
            return ny(n10), rS(r10), nd(e10, r10, "decrypt"), new Uint8Array(await crypto.subtle.decrypt("RSA-OAEP", r10, n10));
          case "PBKDF2": {
            if (ny(n10), "number" != typeof i10.p2c) throw new rw('JOSE Header "p2c" (PBES2 Count) missing or invalid');
            let t11 = o10?.maxPBES2Count || 1e4;
            if (i10.p2c > t11) throw new rw('JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds');
            if ("string" != typeof i10.p2s) throw new rw('JOSE Header "p2s" (PBES2 Salt) missing or invalid');
            let a11 = ru(i10.p2s, "p2s", rw), s10 = await np(a11, e10, i10.p2c, r10);
            return nu(e10.slice(-6), s10, n10);
          }
          case "AES-KW":
            return ny(n10), nu(e10, r10, n10);
          case "AES-GCM": {
            let t11, o11;
            if (ny(n10), "string" != typeof i10.iv) throw new rw('JOSE Header "iv" (Initialization Vector) missing or invalid');
            if ("string" != typeof i10.tag) throw new rw('JOSE Header "tag" (Authentication Tag) missing or invalid');
            return t11 = ru(i10.iv, "iv", rw), o11 = ru(i10.tag, "tag", rw), rJ(na(e10.slice(0, -2)), r10, n10, t11, o11, new Uint8Array());
          }
        }
      }
      async function nv(e10, t10, r10, n10, i10 = {}) {
        let o10, a10, s10;
        let l2 = no(e10);
        if ("dir" === e10) return [r10, void 0, void 0];
        switch (l2.subtle.name) {
          case "ECDH": {
            let c2;
            ng(r10);
            let { apu: u2, apv: d2 } = i10;
            c2 = i10.epk ? await r1(l2, i10.epk, "decrypt") : (await crypto.subtle.generateKey(r10.algorithm, true, ["deriveBits"])).privateKey;
            let p2 = crypto.subtle, h2 = c2;
            if (!h2.extractable) {
              if ("function" != typeof p2.getPublicKey) throw TypeError('CryptoKey for "epk" must be extractable');
              h2 = await p2.getPublicKey(c2, []);
            }
            let { x: f2, y: m2, crv: g2, kty: y2 } = await p2.exportKey("jwk", h2), w2 = await nm(r10, c2, "ECDH-ES" === e10 ? t10.alg : e10, "ECDH-ES" === e10 ? t10.cekBits : parseInt(e10.slice(-5, -2), 10), u2, d2);
            if (a10 = { epk: { x: f2, crv: g2, kty: y2 } }, "EC" === y2 && (a10.epk.y = m2), u2 && (a10.apu = rt(u2)), d2 && (a10.apv = rt(d2)), "ECDH-ES" === e10) {
              s10 = w2;
              break;
            }
            s10 = n10 || r$(t10);
            let b2 = e10.slice(-6);
            o10 = await nc(b2, w2, s10);
            break;
          }
          case "RSA-OAEP":
            s10 = n10 || r$(t10), rS(r10), nd(e10, r10, "encrypt"), o10 = new Uint8Array(await crypto.subtle.encrypt("RSA-OAEP", r10, s10));
            break;
          case "PBKDF2": {
            s10 = n10 || r$(t10);
            let { p2c: l3 = 2048, p2s: c2 = crypto.getRandomValues(new Uint8Array(16)) } = i10, u2 = await np(c2, e10, l3, r10);
            o10 = await nc(e10.slice(-6), u2, s10), a10 = { p2c: l3, p2s: rt(c2) };
            break;
          }
          case "AES-KW":
            s10 = n10 || r$(t10), o10 = await nc(e10, r10, s10);
            break;
          case "AES-GCM": {
            s10 = n10 || r$(t10);
            let { iv: l3 } = i10, c2 = await rz(na(e10.slice(0, -2)), s10, r10, l3, new Uint8Array());
            o10 = c2.ciphertext, a10 = { iv: rt(c2.iv), tag: rt(c2.tag) };
          }
        }
        return [s10, o10, a10];
      }
      let n_ = { __proto__: null };
      function nS(e10, t10) {
        if (void 0 !== t10 && (!Array.isArray(t10) || t10.some((e11) => "string" != typeof e11))) throw TypeError(`"${e10}" option must be an array of strings`);
        if (t10) return new Set(t10);
      }
      function nk(e10, t10, r10, n10, i10) {
        if (void 0 !== i10.crit && n10?.crit === void 0) throw new e10('"crit" (Critical) Header Parameter MUST be integrity protected');
        if (!n10 || void 0 === n10.crit) return [];
        if (!Array.isArray(n10.crit) || 0 === n10.crit.length || n10.crit.some((e11) => "string" != typeof e11 || 0 === e11.length)) throw new e10('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
        let o10 = void 0 === r10 ? t10 : { __proto__: null, ...r10, ...t10 };
        for (let t11 of n10.crit) {
          if (!(t11 in o10)) throw new rg(`Extension Header Parameter "${t11}" is not recognized`);
          if (!Object.hasOwn(i10, t11) || void 0 === i10[t11]) throw new e10(`Extension Header Parameter "${t11}" is missing`);
          if (o10[t11] && (!Object.hasOwn(n10, t11) || void 0 === n10[t11])) throw new e10(`Extension Header Parameter "${t11}" MUST be integrity protected`);
        }
        return n10.crit;
      }
      function nx(e10) {
        if (void 0 === globalThis[e10]) throw new rg(`JWE "zip" (Compression Algorithm) Header Parameter requires the ${e10} API.`);
      }
      async function nE(e10) {
        nx("CompressionStream");
        let t10 = new CompressionStream("deflate-raw"), r10 = t10.writable.getWriter();
        r10.write(e10).catch(() => {
        }), r10.close().catch(() => {
        });
        let n10 = [], i10 = t10.readable.getReader();
        for (; ; ) {
          let { value: e11, done: t11 } = await i10.read();
          if (t11) break;
          n10.push(e11);
        }
        return t5(...n10);
      }
      async function nA(e10, t10) {
        nx("DecompressionStream");
        let r10 = new DecompressionStream("deflate-raw"), n10 = r10.writable.getWriter();
        n10.write(e10).catch(() => {
        }), n10.close().catch(() => {
        });
        let i10 = [], o10 = 0, a10 = r10.readable.getReader();
        for (; ; ) {
          let { value: e11, done: r11 } = await a10.read();
          if (r11) break;
          if (i10.push(e11), o10 += e11.byteLength, t10 !== 1 / 0 && o10 > t10) throw new rw("Decompressed plaintext exceeded the configured limit");
        }
        return t5(...i10);
      }
      async function nT(e10, t10, r10) {
        let n10, i10, o10, a10;
        let [s10, l2, , c2] = t10, [u2, d2, p2, h2, f2, m2, g2, y2, , w2] = e10, b2 = d2, v2 = p2;
        if (m2 && ("dir" === l2 || "ECDH-ES" === l2)) throw TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${l2}`);
        let _2 = no(l2), S2 = await r1("dir" === l2 ? c2 : _2, r10, "encrypt"), [k2, x2, E2] = await nv(l2, c2, S2, m2, y2);
        E2 && (w2 ? v2 = v2 ? { ...v2, ...E2 } : E2 : b2 = b2 ? { ...b2, ...E2 } : E2), b2 ? i10 = t9(n10 = rt(JSON.stringify(b2))) : (n10 = "", i10 = new Uint8Array()), f2?.byteLength ? (a10 = rt(f2), o10 = t5(i10, t9("."), t9(a10))) : o10 = i10;
        let A2 = u2;
        "DEF" === s10.zip && (A2 = await nE(A2).catch((e11) => {
          throw new rw("Failed to compress plaintext", { cause: e11 });
        }));
        let { ciphertext: T2, tag: P2, iv: C2 } = await rz(c2, A2, k2, g2, o10), R2 = { ciphertext: rt(T2) };
        return C2 && (R2.iv = rt(C2)), P2 && (R2.tag = rt(P2)), x2 && (R2.encrypted_key = rt(x2)), a10 && (R2.aad = a10), b2 && (R2.protected = n10), h2 && (R2.unprotected = h2), v2 && (R2.header = v2), R2;
      }
      async function nP(e10, t10) {
        return nT(e10, function(e11) {
          let [, t11, r10, n10, , , , , i10] = e11;
          if (!rn(t11, r10, n10)) throw new rw("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
          let o10 = { ...t11, ...r10, ...n10 };
          if (nk(rw, n_, i10, t11, o10), void 0 !== o10.zip && "DEF" !== o10.zip) throw new rg('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value.');
          if (void 0 !== o10.zip && !t11?.zip) throw new rw('JWE "zip" (Compression Algorithm) Header Parameter MUST be in a protected header.');
          let { alg: a10, enc: s10 } = o10;
          if ("string" != typeof a10 || !a10) throw new rw('JWE "alg" (Algorithm) Header Parameter missing or invalid');
          if ("string" != typeof s10 || !s10) throw new rw('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
          return [o10, a10, s10, na(s10)];
        }(e10), t10);
      }
      class nC {
        #e;
        #t;
        #r;
        #n;
        #i;
        #o;
        #a;
        #s;
        constructor(e10) {
          if (!(e10 instanceof Uint8Array)) throw TypeError("plaintext must be an instance of Uint8Array");
          this.#e = e10;
        }
        setKeyManagementParameters(e10) {
          return rc(this.#s, "setKeyManagementParameters"), this.#s = e10, this;
        }
        setProtectedHeader(e10) {
          return rc(this.#t, "setProtectedHeader"), this.#t = e10, this;
        }
        setSharedUnprotectedHeader(e10) {
          return rc(this.#r, "setSharedUnprotectedHeader"), this.#r = e10, this;
        }
        setUnprotectedHeader(e10) {
          return rc(this.#n, "setUnprotectedHeader"), this.#n = e10, this;
        }
        setAdditionalAuthenticatedData(e10) {
          return this.#i = e10, this;
        }
        setContentEncryptionKey(e10) {
          return rc(this.#o, "setContentEncryptionKey"), this.#o = e10, this;
        }
        setInitializationVector(e10) {
          return rc(this.#a, "setInitializationVector"), this.#a = e10, this;
        }
        async encrypt(e10, t10) {
          if (!this.#t && !this.#n && !this.#r) throw new rw("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
          return !function(e11, t11) {
            let { crit: r10 } = t11 ?? {};
            if (Array.isArray(r10) && new Set(r10).size !== r10.length) throw new e11('"crit" (Critical) Header Parameter MUST NOT contain duplicate values');
          }(rw, this.#t), nP([this.#e, this.#t, this.#n, this.#r, this.#i, this.#o, this.#a, this.#s, t10?.crit, !!t10 && rl in t10], e10);
        }
      }
      class nR {
        #l;
        constructor(e10) {
          this.#l = new nC(e10);
        }
        setContentEncryptionKey(e10) {
          return this.#l.setContentEncryptionKey(e10), this;
        }
        setInitializationVector(e10) {
          return this.#l.setInitializationVector(e10), this;
        }
        setProtectedHeader(e10) {
          return this.#l.setProtectedHeader(e10), this;
        }
        setKeyManagementParameters(e10) {
          return this.#l.setKeyManagementParameters(e10), this;
        }
        async encrypt(e10, t10) {
          let r10 = await this.#l.encrypt(e10, t10);
          return [r10.protected, r10.encrypted_key, r10.iv, r10.ciphertext, r10.tag].join(".");
        }
      }
      let nO = (e10) => Math.floor(e10.getTime() / 1e3), nI = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, y: 31557600 }, nU = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i, nN = "check_failed";
      function n$(e10) {
        let t10 = nU.exec(e10);
        if (!t10 || t10[4] && t10[1]) throw TypeError("Invalid time period format");
        let r10 = Math.round(parseFloat(t10[2]) * nI[t10[3][0].toLowerCase()]);
        return "-" === t10[1] || "ago" === t10[4] ? -r10 : r10;
      }
      function nj(e10, t10) {
        if (!Number.isFinite(t10)) throw TypeError(`Invalid ${e10} input`);
        return t10;
      }
      function nL(e10, t10) {
        return "number" == typeof e10 ? nj(t10, e10) : e10 instanceof Date ? nj(t10, nO(e10)) : nO(/* @__PURE__ */ new Date()) + n$(e10);
      }
      let nD = (e10) => e10.includes("/") ? e10.toLowerCase() : `application/${e10.toLowerCase()}`, nM = (e10, t10) => "string" == typeof e10 ? t10.includes(e10) : !!Array.isArray(e10) && t10.some((t11) => e10.includes(t11));
      function nH(e10, t10, r10 = false) {
        let n10 = e10[t10];
        if (void 0 !== n10 || r10) {
          if ("number" != typeof n10) throw new rh(`"${t10}" claim must be a number`, e10, t10, "invalid");
          return n10;
        }
      }
      function nW(e10, t10) {
        throw new rh(`unexpected "${t10}" claim value`, e10, t10, nN);
      }
      class nB {
        #c;
        constructor(e10) {
          if (!rr(e10)) throw TypeError("JWT Claims Set MUST be an object");
          this.#c = structuredClone(e10);
        }
        data() {
          return t1.encode(JSON.stringify(this.#c));
        }
        get iss() {
          return this.#c.iss;
        }
        set iss(e10) {
          this.#c.iss = e10;
        }
        get sub() {
          return this.#c.sub;
        }
        set sub(e10) {
          this.#c.sub = e10;
        }
        get aud() {
          return this.#c.aud;
        }
        set aud(e10) {
          this.#c.aud = e10;
        }
        set jti(e10) {
          this.#c.jti = e10;
        }
        set nbf(e10) {
          this.#c.nbf = nL(e10, "setNotBefore");
        }
        set exp(e10) {
          this.#c.exp = nL(e10, "setExpirationTime");
        }
        set iat(e10) {
          void 0 === e10 ? this.#c.iat = nO(/* @__PURE__ */ new Date()) : "string" == typeof e10 ? this.#c.iat = nj("setIssuedAt", nO(/* @__PURE__ */ new Date()) + n$(e10)) : this.#c.iat = nL(e10, "setIssuedAt");
        }
      }
      class nq {
        #o;
        #a;
        #s;
        #t;
        #u;
        #d;
        #p;
        #h;
        constructor(e10 = {}) {
          this.#h = new nB(e10);
        }
        setIssuer(e10) {
          return this.#h.iss = e10, this;
        }
        setSubject(e10) {
          return this.#h.sub = e10, this;
        }
        setAudience(e10) {
          return this.#h.aud = e10, this;
        }
        setJti(e10) {
          return this.#h.jti = e10, this;
        }
        setNotBefore(e10) {
          return this.#h.nbf = e10, this;
        }
        setExpirationTime(e10) {
          return this.#h.exp = e10, this;
        }
        setIssuedAt(e10) {
          return this.#h.iat = e10, this;
        }
        setProtectedHeader(e10) {
          return rc(this.#t, "setProtectedHeader"), this.#t = e10, this;
        }
        setKeyManagementParameters(e10) {
          return rc(this.#s, "setKeyManagementParameters"), this.#s = e10, this;
        }
        setContentEncryptionKey(e10) {
          return rc(this.#o, "setContentEncryptionKey"), this.#o = e10, this;
        }
        setInitializationVector(e10) {
          return rc(this.#a, "setInitializationVector"), this.#a = e10, this;
        }
        replicateIssuerAsHeader() {
          return this.#u = true, this;
        }
        replicateSubjectAsHeader() {
          return this.#d = true, this;
        }
        replicateAudienceAsHeader() {
          return this.#p = true, this;
        }
        async encrypt(e10, t10) {
          let r10 = new nR(this.#h.data());
          return this.#t && (this.#u || this.#d || this.#p) && (this.#t = { ...this.#t, iss: this.#u ? this.#h.iss : void 0, sub: this.#d ? this.#h.sub : void 0, aud: this.#p ? this.#h.aud : void 0 }), r10.setProtectedHeader(this.#t), this.#a && r10.setInitializationVector(this.#a), this.#o && r10.setContentEncryptionKey(this.#o), this.#s && r10.setKeyManagementParameters(this.#s), r10.encrypt(e10, t10);
        }
      }
      async function nK(e10, t10, r10, n10) {
        let i10, o10, a10;
        let [s10, l2, c2] = r10, [u2, d2, p2, h2, f2] = t10, { encrypted_key: m2, header: g2, unprotected: y2 } = e10;
        if (void 0 !== g2 || void 0 !== y2) {
          if (!rn(u2, g2, y2)) throw new rw("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
          i10 = { ...u2, ...g2, ...y2 };
        } else i10 = u2 ?? {};
        if (nk(rw, n_, c2?.crit, u2, i10), void 0 !== i10.zip && "DEF" !== i10.zip) throw new rg('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value.');
        if (void 0 !== i10.zip && !u2?.zip) throw new rw('JWE "zip" (Compression Algorithm) Header Parameter MUST be in a protected header.');
        let { alg: w2, enc: b2 } = i10;
        if ("string" != typeof w2 || !w2) throw new rw("missing JWE Algorithm (alg) in JWE Header");
        if ("string" != typeof b2 || !b2) throw new rw("missing JWE Encryption Algorithm (enc) in JWE Header");
        if (s10 && !s10.has(w2) || !s10 && w2.startsWith("PBES2")) throw new rm('"alg" (Algorithm) Header Parameter value not allowed');
        if (l2 && !l2.has(b2)) throw new rm('"enc" (Encryption Algorithm) Header Parameter value not allowed');
        let v2 = na(b2);
        void 0 !== m2 && (o10 = ru(m2, "encrypted_key", rw));
        let _2 = false;
        "function" == typeof n10 && (n10 = await n10(u2, e10), _2 = true);
        let S2 = no(w2), k2 = await r1("dir" === w2 ? v2 : S2, n10, "decrypt");
        try {
          a10 = await nb(w2, v2, k2, o10, i10, c2);
        } catch (e11) {
          if (e11 instanceof TypeError || e11 instanceof rw || e11 instanceof rg) throw e11;
          a10 = r$(v2);
        }
        let x2 = await rJ(v2, a10, d2, p2, h2, f2);
        if ("DEF" === i10.zip) {
          let e11 = c2?.maxDecompressedLength ?? 25e4;
          if (0 === e11) throw new rg('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
          if (e11 !== 1 / 0 && (!Number.isSafeInteger(e11) || e11 < 1)) throw TypeError("maxDecompressedLength must be 0, a positive safe integer, or Infinity");
          x2 = await nA(x2, e11).catch((e12) => {
            if (e12 instanceof rw) throw e12;
            throw new rw("Failed to decompress plaintext", { cause: e12 });
          });
        }
        return [x2, u2, k2, _2];
      }
      async function nV(e10, t10, r10) {
        return nK(e10, function(e11) {
          let t11;
          let { protected: r11, ciphertext: n10, iv: i10, tag: o10, aad: a10 } = e11;
          r11 && (t11 = function(e12, t12, r12) {
            let n11;
            try {
              n11 = JSON.parse(t3.decode(re(e12)));
            } catch {
              throw new t12(r12);
            }
            if (!rr(n11)) throw new t12(r12);
            return n11;
          }(r11, rw, "JWE Protected Header is invalid"));
          let s10 = void 0 !== r11 ? t9(r11) : new Uint8Array();
          return [t11, ru(n10, "ciphertext", rw), void 0 !== i10 ? ru(i10, "iv", rw) : void 0, void 0 !== o10 ? ru(o10, "tag", rw) : void 0, void 0 !== a10 ? t5(s10, t9("."), function(e12, t12, r12) {
            try {
              return t9(e12);
            } catch {
              throw new r12("The aad is not a valid base64url string");
            }
          }(a10, 0, rw)) : s10];
        }(e10), t10, r10);
      }
      async function nz(e10, t10, r10) {
        if (e10 instanceof Uint8Array && (e10 = t2.decode(e10)), "string" != typeof e10) throw new rw("Compact JWE must be a string or Uint8Array");
        let { 0: n10, 1: i10, 2: o10, 3: a10, 4: s10, length: l2 } = e10.split(".");
        if (5 !== l2) throw new rw("Invalid Compact JWE");
        return nV({ ciphertext: a10, iv: o10 || void 0, protected: n10, tag: s10 || void 0, encrypted_key: i10 || void 0 }, t10, r10);
      }
      async function nJ(e10, t10, r10) {
        let n10 = await nz(e10, [r10 && nS("keyManagementAlgorithms", r10.keyManagementAlgorithms), r10 && nS("contentEncryptionAlgorithms", r10.contentEncryptionAlgorithms), r10], t10), i10 = n10[1], o10 = function(e11, t11, r11 = {}) {
          let n11;
          try {
            n11 = JSON.parse(t3.decode(t11));
          } catch {
          }
          if (!rr(n11)) throw new rb("JWT Claims Set must be a top-level JSON object");
          let { typ: i11 } = r11;
          if (i11 && ("string" != typeof e11.typ || nD(e11.typ) !== nD(i11))) throw new rh('unexpected "typ" JWT header value', n11, "typ", nN);
          let { requiredClaims: o11 = [], issuer: a11, subject: s10, audience: l2, maxTokenAge: c2 } = r11, u2 = [...o11];
          for (let e12 of (void 0 !== c2 && u2.push("iat"), void 0 !== l2 && u2.push("aud"), void 0 !== s10 && u2.push("sub"), void 0 !== a11 && u2.push("iss"), new Set(u2.reverse()))) if (!Object.hasOwn(n11, e12)) throw new rh(`missing required "${e12}" claim`, n11, e12, "missing");
          void 0 === a11 || (Array.isArray(a11) ? a11 : [a11]).includes(n11.iss) || nW(n11, "iss"), void 0 !== s10 && n11.sub !== s10 && nW(n11, "sub"), void 0 === l2 || nM(n11.aud, "string" == typeof l2 ? [l2] : l2) || nW(n11, "aud");
          let { clockTolerance: d2 } = r11, p2 = 0;
          if ("string" == typeof d2) p2 = n$(d2);
          else if (void 0 !== d2) {
            if ("number" != typeof d2) throw TypeError("Invalid clockTolerance option type");
            p2 = d2;
          }
          nj("clockTolerance option", p2);
          let { currentDate: h2 } = r11, f2 = nj("currentDate option", nO(h2 || /* @__PURE__ */ new Date())), m2 = nH(n11, "iat", void 0 !== c2), g2 = nH(n11, "nbf");
          if (void 0 !== g2 && g2 > f2 + p2) throw new rh('"nbf" claim timestamp check failed', n11, "nbf", nN);
          let y2 = nH(n11, "exp");
          if (void 0 !== y2 && y2 <= f2 - p2) throw new rf('"exp" claim timestamp check failed', n11, "exp", nN);
          if (void 0 !== c2) {
            let e12 = f2 - m2;
            if (e12 - p2 > ("number" == typeof c2 ? c2 : n$(c2))) throw new rf('"iat" claim timestamp check failed (too far in the past)', n11, "iat", nN);
            if (e12 < 0 - p2) throw new rh('"iat" claim timestamp check failed (it should be in the past)', n11, "iat", nN);
          }
          return n11;
        }(i10, n10[0], r10);
        if (void 0 !== i10.iss && i10.iss !== o10.iss) throw new rh('replicated "iss" claim header parameter mismatch', o10, "iss", "mismatch");
        if (void 0 !== i10.sub && i10.sub !== o10.sub) throw new rh('replicated "sub" claim header parameter mismatch', o10, "sub", "mismatch");
        if (void 0 !== i10.aud && JSON.stringify(i10.aud) !== JSON.stringify(o10.aud)) throw new rh('replicated "aud" claim header parameter mismatch', o10, "aud", "mismatch");
        let a10 = { payload: o10, protectedHeader: i10 };
        return "function" == typeof t10 ? { ...a10, key: n10[2] } : a10;
      }
      let nF = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/, nG = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/, nX = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, nZ = /^[\u0020-\u003A\u003D-\u007E]*$/, nY = Object.prototype.toString, nQ = (() => {
        let e10 = function() {
        };
        return e10.prototype = /* @__PURE__ */ Object.create(null), e10;
      })();
      function n0(e10, t10) {
        let r10 = new nQ(), n10 = e10.length;
        if (n10 < 2) return r10;
        let i10 = t10?.decode || n5, o10 = 0;
        do {
          let t11 = e10.indexOf("=", o10);
          if (-1 === t11) break;
          let a10 = e10.indexOf(";", o10), s10 = -1 === a10 ? n10 : a10;
          if (t11 > s10) {
            o10 = e10.lastIndexOf(";", t11 - 1) + 1;
            continue;
          }
          let l2 = n1(e10, o10, t11), c2 = n2(e10, t11, l2), u2 = e10.slice(l2, c2);
          if (void 0 === r10[u2]) {
            let n11 = n1(e10, t11 + 1, s10), o11 = n2(e10, s10, n11), a11 = i10(e10.slice(n11, o11));
            r10[u2] = a11;
          }
          o10 = s10 + 1;
        } while (o10 < n10);
        return r10;
      }
      function n1(e10, t10, r10) {
        do {
          let r11 = e10.charCodeAt(t10);
          if (32 !== r11 && 9 !== r11) return t10;
        } while (++t10 < r10);
        return r10;
      }
      function n2(e10, t10, r10) {
        for (; t10 > r10; ) {
          let r11 = e10.charCodeAt(--t10);
          if (32 !== r11 && 9 !== r11) return t10 + 1;
        }
        return r10;
      }
      function n3(e10, t10, r10) {
        let n10 = r10?.encode || encodeURIComponent;
        if (!nF.test(e10)) throw TypeError(`argument name is invalid: ${e10}`);
        let i10 = n10(t10);
        if (!nG.test(i10)) throw TypeError(`argument val is invalid: ${t10}`);
        let o10 = e10 + "=" + i10;
        if (!r10) return o10;
        if (void 0 !== r10.maxAge) {
          if (!Number.isInteger(r10.maxAge)) throw TypeError(`option maxAge is invalid: ${r10.maxAge}`);
          o10 += "; Max-Age=" + r10.maxAge;
        }
        if (r10.domain) {
          if (!nX.test(r10.domain)) throw TypeError(`option domain is invalid: ${r10.domain}`);
          o10 += "; Domain=" + r10.domain;
        }
        if (r10.path) {
          if (!nZ.test(r10.path)) throw TypeError(`option path is invalid: ${r10.path}`);
          o10 += "; Path=" + r10.path;
        }
        if (r10.expires) {
          var a10;
          if (a10 = r10.expires, "[object Date]" !== nY.call(a10) || !Number.isFinite(r10.expires.valueOf())) throw TypeError(`option expires is invalid: ${r10.expires}`);
          o10 += "; Expires=" + r10.expires.toUTCString();
        }
        if (r10.httpOnly && (o10 += "; HttpOnly"), r10.secure && (o10 += "; Secure"), r10.partitioned && (o10 += "; Partitioned"), r10.priority) switch ("string" == typeof r10.priority ? r10.priority.toLowerCase() : void 0) {
          case "low":
            o10 += "; Priority=Low";
            break;
          case "medium":
            o10 += "; Priority=Medium";
            break;
          case "high":
            o10 += "; Priority=High";
            break;
          default:
            throw TypeError(`option priority is invalid: ${r10.priority}`);
        }
        if (r10.sameSite) switch ("string" == typeof r10.sameSite ? r10.sameSite.toLowerCase() : r10.sameSite) {
          case true:
          case "strict":
            o10 += "; SameSite=Strict";
            break;
          case "lax":
            o10 += "; SameSite=Lax";
            break;
          case "none":
            o10 += "; SameSite=None";
            break;
          default:
            throw TypeError(`option sameSite is invalid: ${r10.sameSite}`);
        }
        return o10;
      }
      function n5(e10) {
        if (-1 === e10.indexOf("%")) return e10;
        try {
          return decodeURIComponent(e10);
        } catch (t10) {
          return e10;
        }
      }
      let { q: n6 } = u, n4 = () => Date.now() / 1e3 | 0, n8 = "A256CBC-HS512";
      async function n9(e10) {
        let { token: t10 = {}, secret: r10, maxAge: n10 = 2592e3, salt: i10 } = e10, o10 = Array.isArray(r10) ? r10 : [r10], a10 = await ie(n8, o10[0], i10), s10 = await rO({ kty: "oct", k: rt(a10) }, `sha${a10.byteLength << 3}`);
        return await new nq(t10).setProtectedHeader({ alg: "dir", enc: n8, kid: s10 }).setIssuedAt().setExpirationTime(n4() + n10).setJti(crypto.randomUUID()).encrypt(a10);
      }
      async function n7(e10) {
        let { token: t10, secret: r10, salt: n10 } = e10, i10 = Array.isArray(r10) ? r10 : [r10];
        if (!t10) return null;
        let { payload: o10 } = await nJ(t10, async ({ kid: e11, enc: t11 }) => {
          for (let r11 of i10) {
            let i11 = await ie(t11, r11, n10);
            if (void 0 === e11 || e11 === await rO({ kty: "oct", k: rt(i11) }, `sha${i11.byteLength << 3}`)) return i11;
          }
          throw Error("no matching decryption secret");
        }, { clockTolerance: 15, keyManagementAlgorithms: ["dir"], contentEncryptionAlgorithms: [n8, "A256GCM"] });
        return o10;
      }
      async function ie(e10, t10, r10) {
        let n10;
        switch (e10) {
          case "A256CBC-HS512":
            n10 = 64;
            break;
          case "A256GCM":
            n10 = 32;
            break;
          default:
            throw Error("Unsupported JWT Content Encryption Algorithm");
        }
        return await t0("sha256", t10, r10, `Auth.js Generated Encryption Key (${r10})`, n10);
      }
      async function it({ options: e10, paramValue: t10, cookieValue: r10 }) {
        let { url: n10, callbacks: i10 } = e10, o10 = n10.origin;
        return t10 ? o10 = await i10.redirect({ url: t10, baseUrl: n10.origin }) : r10 && (o10 = await i10.redirect({ url: r10, baseUrl: n10.origin })), { callbackUrl: o10, callbackUrlCookie: o10 !== r10 ? o10 : void 0 };
      }
      let ir = "\x1B[31m", ii = "\x1B[0m", io = { error(e10) {
        let t10 = e10 instanceof tl ? e10.type : e10.name;
        if (console.error(`${ir}[auth][error]${ii} ${t10}: ${e10.message}`), e10.cause && "object" == typeof e10.cause && "err" in e10.cause && e10.cause.err instanceof Error) {
          let { err: t11, ...r10 } = e10.cause;
          console.error(`${ir}[auth][cause]${ii}:`, t11.stack), r10 && console.error(`${ir}[auth][details]${ii}:`, JSON.stringify(r10, null, 2));
        } else e10.stack && console.error(e10.stack.replace(/.*/, "").substring(1));
      }, warn(e10) {
        console.warn(`\x1B[33m[auth][warn][${e10}]${ii}`, "Read more: https://warnings.authjs.dev");
      }, debug(e10, t10) {
        console.log(`\x1B[90m[auth][debug]:${ii} ${e10}`, JSON.stringify(t10, null, 2));
      } };
      function ia(e10) {
        let t10 = { ...io };
        return e10.debug || (t10.debug = () => {
        }), e10.logger?.error && (t10.error = e10.logger.error), e10.logger?.warn && (t10.warn = e10.logger.warn), e10.logger?.debug && (t10.debug = e10.logger.debug), e10.logger ?? (e10.logger = t10), t10;
      }
      let is = ["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error", "webauthn-options"], { q: il, l: ic } = u;
      async function iu(e10) {
        if (!("body" in e10) || !e10.body || "POST" !== e10.method) return;
        let t10 = e10.headers.get("content-type");
        return t10?.includes("application/json") ? await e10.json() : t10?.includes("application/x-www-form-urlencoded") ? Object.fromEntries(new URLSearchParams(await e10.text())) : void 0;
      }
      async function id(e10, t10) {
        try {
          if ("GET" !== e10.method && "POST" !== e10.method) throw new tO("Only GET and POST requests are supported");
          t10.basePath ?? (t10.basePath = "/auth");
          let r10 = new URL(e10.url), { action: n10, providerId: i10 } = function(e11, t11) {
            let r11 = e11.match(RegExp(`^${t11}(.+)`));
            if (null === r11) throw new tO(`Cannot parse action at ${e11}`);
            let n11 = r11.at(-1).replace(/^\//, "").split("/").filter(Boolean);
            if (1 !== n11.length && 2 !== n11.length) throw new tO(`Cannot parse action at ${e11}`);
            let [i11, o10] = n11;
            if (!is.includes(i11) || o10 && !["signin", "callback", "webauthn-options"].includes(i11)) throw new tO(`Cannot parse action at ${e11}`);
            return { action: i11, providerId: "undefined" == o10 ? void 0 : o10 };
          }(r10.pathname, t10.basePath);
          return { url: r10, action: n10, providerId: i10, method: e10.method, headers: Object.fromEntries(e10.headers), body: e10.body ? await iu(e10) : void 0, cookies: il(e10.headers.get("cookie") ?? "") ?? {}, error: r10.searchParams.get("error") ?? void 0, query: Object.fromEntries(r10.searchParams) };
        } catch (n10) {
          let r10 = ia(t10);
          r10.error(n10), r10.debug("request", e10);
        }
      }
      function ip(e10) {
        let t10 = new Headers(e10.headers);
        e10.cookies?.forEach((e11) => {
          let { name: r11, value: n11, options: i10 } = e11, o10 = ic(r11, n11, i10);
          t10.has("Set-Cookie") ? t10.append("Set-Cookie", o10) : t10.set("Set-Cookie", o10);
        });
        let r10 = e10.body;
        "application/json" === t10.get("content-type") ? r10 = JSON.stringify(e10.body) : "application/x-www-form-urlencoded" === t10.get("content-type") && (r10 = new URLSearchParams(e10.body).toString());
        let n10 = new Response(r10, { headers: t10, status: e10.redirect ? 302 : e10.status ?? 200 });
        return e10.redirect && n10.headers.set("Location", e10.redirect), n10;
      }
      async function ih(e10) {
        let t10 = new TextEncoder().encode(e10);
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", t10))).map((e11) => e11.toString(16).padStart(2, "0")).join("").toString();
      }
      function im(e10) {
        let t10 = (e11) => ("0" + e11.toString(16)).slice(-2);
        return Array.from(crypto.getRandomValues(new Uint8Array(e10))).reduce((e11, r10) => e11 + t10(r10), "");
      }
      async function ig({ options: e10, cookieValue: t10, isPost: r10, bodyValue: n10 }) {
        if (t10) {
          let [i11, o11] = t10.split("|");
          if (o11 === await ih(`${i11}${e10.secret}`)) return { csrfTokenVerified: r10 && i11 === n10, csrfToken: i11 };
        }
        let i10 = im(32), o10 = await ih(`${i10}${e10.secret}`);
        return { cookie: `${i10}|${o10}`, csrfToken: i10 };
      }
      function iy(e10, t10) {
        if (!t10) throw new tj(`CSRF token was missing during an action ${e10}`);
      }
      function iw(e10) {
        return null !== e10 && "object" == typeof e10;
      }
      function ib(e10, ...t10) {
        if (!t10.length) return e10;
        let r10 = t10.shift();
        if (iw(e10) && iw(r10)) for (let t11 in r10) iw(r10[t11]) ? (iw(e10[t11]) || (e10[t11] = Array.isArray(r10[t11]) ? [] : {}), ib(e10[t11], r10[t11])) : void 0 !== r10[t11] && (e10[t11] = r10[t11]);
        return ib(e10, ...t10);
      }
      let iv = Symbol("skip-csrf-check"), i_ = Symbol("return-type-raw"), iS = Symbol("custom-fetch"), ik = Symbol("conform-internal"), ix = (e10) => iA({ id: e10.sub ?? e10.id ?? crypto.randomUUID(), name: e10.name ?? e10.nickname ?? e10.preferred_username, email: e10.email, image: e10.picture }), iE = (e10) => iA({ access_token: e10.access_token, id_token: e10.id_token, refresh_token: e10.refresh_token, expires_at: e10.expires_at, scope: e10.scope, token_type: e10.token_type, session_state: e10.session_state });
      function iA(e10) {
        let t10 = {};
        for (let [r10, n10] of Object.entries(e10)) void 0 !== n10 && (t10[r10] = n10);
        return t10;
      }
      function iT(e10, t10) {
        if (!e10 && t10) return;
        if ("string" == typeof e10) return { url: new URL(e10) };
        let r10 = new URL(e10?.url ?? "https://authjs.dev");
        if (e10?.params != null) for (let [t11, n10] of Object.entries(e10.params)) "claims" === t11 && (n10 = JSON.stringify(n10)), r10.searchParams.set(t11, String(n10));
        return { url: r10, request: e10?.request, conform: e10?.conform, ...e10?.clientPrivateKey ? { clientPrivateKey: e10?.clientPrivateKey } : null };
      }
      let iP = { signIn: () => true, redirect: ({ url: e10, baseUrl: t10 }) => e10.startsWith("/") ? `${t10}${e10}` : new URL(e10).origin === t10 ? e10 : t10, session: ({ session: e10 }) => ({ user: { name: e10.user?.name, email: e10.user?.email, image: e10.user?.image }, expires: e10.expires?.toISOString?.() ?? e10.expires }), jwt: ({ token: e10 }) => e10 };
      async function iC({ authOptions: e10, providerId: t10, action: r10, url: n10, cookies: i10, callbackUrl: o10, csrfToken: a10, csrfDisabled: s10, isPost: l2 }) {
        var c2;
        let u2 = ia(e10), { providers: d2, provider: p2 } = function(e11) {
          let { providerId: t11, config: r11 } = e11, n11 = new URL(r11.basePath ?? "/auth", e11.url.origin), i11 = r11.providers.map((e12) => {
            let t12 = "function" == typeof e12 ? e12() : e12, { options: i12, ...o12 } = t12, a11 = i12?.id ?? o12.id, s11 = ib(o12, i12, { signinUrl: `${n11}/signin/${a11}`, callbackUrl: `${n11}/callback/${a11}` });
            if ("oauth" === t12.type || "oidc" === t12.type) {
              s11.redirectProxyUrl ?? (s11.redirectProxyUrl = i12?.redirectProxyUrl ?? r11.redirectProxyUrl);
              let e13 = function(e14) {
                e14.issuer && (e14.wellKnown ?? (e14.wellKnown = `${e14.issuer}/.well-known/openid-configuration`));
                let t13 = iT(e14.authorization, e14.issuer);
                t13 && !t13.url?.searchParams.has("scope") && t13.url.searchParams.set("scope", "openid profile email");
                let r12 = iT(e14.token, e14.issuer), n12 = iT(e14.userinfo, e14.issuer), i13 = e14.checks ?? ["pkce"];
                return e14.redirectProxyUrl && (i13.includes("state") || i13.push("state"), e14.redirectProxyUrl = `${e14.redirectProxyUrl}/callback/${e14.id}`), { ...e14, authorization: t13, token: r12, checks: i13, userinfo: n12, profile: e14.profile ?? ix, account: e14.account ?? iE };
              }(s11);
              return e13.authorization?.url.searchParams.get("response_mode") === "form_post" && delete e13.redirectProxyUrl, e13[iS] ?? (e13[iS] = i12?.[iS]), e13;
            }
            return s11;
          }), o11 = i11.find(({ id: e12 }) => e12 === t11);
          if (t11 && !o11) {
            let e12 = i11.map((e13) => e13.id).join(", ");
            throw Error(`Provider with id "${t11}" not found. Available providers: [${e12}].`);
          }
          return { providers: i11, provider: o11 };
        }({ url: n10, providerId: t10, config: e10 }), h2 = false;
        if ((p2?.type === "oauth" || p2?.type === "oidc") && p2.redirectProxyUrl) try {
          h2 = new URL(p2.redirectProxyUrl).origin === n10.origin;
        } catch {
          throw TypeError(`redirectProxyUrl must be a valid URL. Received: ${p2.redirectProxyUrl}`);
        }
        let f2 = { debug: false, pages: {}, theme: { colorScheme: "auto", logo: "", brandColor: "", buttonText: "" }, ...e10, url: n10, action: r10, provider: p2, cookies: ib(ta(e10.useSecureCookies ?? "https:" === n10.protocol), e10.cookies), providers: d2, session: { strategy: e10.adapter ? "database" : "jwt", maxAge: 2592e3, updateAge: 86400, generateSessionToken: () => crypto.randomUUID(), ...e10.session }, jwt: { secret: e10.secret, maxAge: e10.session?.maxAge ?? 2592e3, encode: n9, decode: n7, ...e10.jwt }, events: Object.keys(c2 = e10.events ?? {}).reduce((e11, t11) => (e11[t11] = async (...e12) => {
          try {
            let r11 = c2[t11];
            return await r11(...e12);
          } catch (e13) {
            u2.error(new tf(e13));
          }
        }, e11), {}), adapter: function(e11, t11) {
          if (e11) return Object.keys(e11).reduce((r11, n11) => (r11[n11] = async (...r12) => {
            try {
              t11.debug(`adapter_${n11}`, { args: r12 });
              let i11 = e11[n11];
              return await i11(...r12);
            } catch (r13) {
              let e12 = new tu(r13);
              throw t11.error(e12), e12;
            }
          }, r11), {});
        }(e10.adapter, u2), callbacks: { ...iP, ...e10.callbacks }, logger: u2, callbackUrl: n10.origin, isOnRedirectProxy: h2, experimental: { ...e10.experimental } }, m2 = [];
        if (s10) f2.csrfTokenVerified = true;
        else {
          let { csrfToken: e11, cookie: t11, csrfTokenVerified: r11 } = await ig({ options: f2, cookieValue: i10?.[f2.cookies.csrfToken.name], isPost: l2, bodyValue: a10 });
          f2.csrfToken = e11, f2.csrfTokenVerified = r11, t11 && m2.push({ name: f2.cookies.csrfToken.name, value: t11, options: f2.cookies.csrfToken.options });
        }
        let { callbackUrl: g2, callbackUrlCookie: y2 } = await it({ options: f2, cookieValue: i10?.[f2.cookies.callbackUrl.name], paramValue: o10 });
        return f2.callbackUrl = g2, y2 && m2.push({ name: f2.cookies.callbackUrl.name, value: y2, options: f2.cookies.callbackUrl.options }), { options: f2, cookies: m2 };
      }
      var iR, iO, iI, iU, iN, i$, ij, iL, iD, iM, iH, iW, iB, iq, iK, iV, iz = {}, iJ = [], iF = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, iG = Array.isArray;
      function iX(e10, t10) {
        for (var r10 in t10) e10[r10] = t10[r10];
        return e10;
      }
      function iZ(e10) {
        e10 && e10.parentNode && e10.parentNode.removeChild(e10);
      }
      function iY(e10, t10, r10) {
        var n10, i10, o10, a10 = {};
        for (o10 in t10) "key" == o10 ? n10 = t10[o10] : "ref" == o10 ? i10 = t10[o10] : a10[o10] = t10[o10];
        if (arguments.length > 2 && (a10.children = arguments.length > 3 ? ij.call(arguments, 2) : r10), "function" == typeof e10 && null != e10.defaultProps) for (o10 in e10.defaultProps) void 0 === a10[o10] && (a10[o10] = e10.defaultProps[o10]);
        return iQ(e10, a10, n10, i10, null);
      }
      function iQ(e10, t10, r10, n10, i10) {
        var o10 = { type: e10, props: t10, key: r10, ref: n10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: null == i10 ? ++iD : i10, __i: -1, __u: 0 };
        return null == i10 && null != iL.vnode && iL.vnode(o10), o10;
      }
      function i0(e10) {
        return e10.children;
      }
      function i1(e10, t10) {
        this.props = e10, this.context = t10;
      }
      function i2(e10, t10) {
        if (null == t10) return e10.__ ? i2(e10.__, e10.__i + 1) : null;
        for (var r10; t10 < e10.__k.length; t10++) if (null != (r10 = e10.__k[t10]) && null != r10.__e) return r10.__e;
        return "function" == typeof e10.type ? i2(e10) : null;
      }
      function i3(e10) {
        (!e10.__d && (e10.__d = true) && iM.push(e10) && !i5.__r++ || iH !== iL.debounceRendering) && ((iH = iL.debounceRendering) || iW)(i5);
      }
      function i5() {
        var e10, t10, r10, n10, i10, o10, a10, s10;
        for (iM.sort(iB); e10 = iM.shift(); ) e10.__d && (t10 = iM.length, n10 = void 0, o10 = (i10 = (r10 = e10).__v).__e, a10 = [], s10 = [], r10.__P && ((n10 = iX({}, i10)).__v = i10.__v + 1, iL.vnode && iL.vnode(n10), i7(r10.__P, n10, i10, r10.__n, r10.__P.namespaceURI, 32 & i10.__u ? [o10] : null, a10, null == o10 ? i2(i10) : o10, !!(32 & i10.__u), s10), n10.__v = i10.__v, n10.__.__k[n10.__i] = n10, oe(a10, n10, s10), n10.__e != o10 && function e11(t11) {
          var r11, n11;
          if (null != (t11 = t11.__) && null != t11.__c) {
            for (t11.__e = t11.__c.base = null, r11 = 0; r11 < t11.__k.length; r11++) if (null != (n11 = t11.__k[r11]) && null != n11.__e) {
              t11.__e = t11.__c.base = n11.__e;
              break;
            }
            return e11(t11);
          }
        }(n10)), iM.length > t10 && iM.sort(iB));
        i5.__r = 0;
      }
      function i6(e10, t10, r10, n10, i10, o10, a10, s10, l2, c2, u2) {
        var d2, p2, h2, f2, m2, g2 = n10 && n10.__k || iJ, y2 = t10.length;
        for (r10.__d = l2, function(e11, t11, r11) {
          var n11, i11, o11, a11, s11, l3 = t11.length, c3 = r11.length, u3 = c3, d3 = 0;
          for (e11.__k = [], n11 = 0; n11 < l3; n11++) null != (i11 = t11[n11]) && "boolean" != typeof i11 && "function" != typeof i11 ? (a11 = n11 + d3, (i11 = e11.__k[n11] = "string" == typeof i11 || "number" == typeof i11 || "bigint" == typeof i11 || i11.constructor == String ? iQ(null, i11, null, null, null) : iG(i11) ? iQ(i0, { children: i11 }, null, null, null) : void 0 === i11.constructor && i11.__b > 0 ? iQ(i11.type, i11.props, i11.key, i11.ref ? i11.ref : null, i11.__v) : i11).__ = e11, i11.__b = e11.__b + 1, o11 = null, -1 !== (s11 = i11.__i = function(e12, t12, r12, n12) {
            var i12 = e12.key, o12 = e12.type, a12 = r12 - 1, s12 = r12 + 1, l4 = t12[r12];
            if (null === l4 || l4 && i12 == l4.key && o12 === l4.type && 0 == (131072 & l4.__u)) return r12;
            if (n12 > (null != l4 && 0 == (131072 & l4.__u) ? 1 : 0)) for (; a12 >= 0 || s12 < t12.length; ) {
              if (a12 >= 0) {
                if ((l4 = t12[a12]) && 0 == (131072 & l4.__u) && i12 == l4.key && o12 === l4.type) return a12;
                a12--;
              }
              if (s12 < t12.length) {
                if ((l4 = t12[s12]) && 0 == (131072 & l4.__u) && i12 == l4.key && o12 === l4.type) return s12;
                s12++;
              }
            }
            return -1;
          }(i11, r11, a11, u3)) && (u3--, (o11 = r11[s11]) && (o11.__u |= 131072)), null == o11 || null === o11.__v ? (-1 == s11 && d3--, "function" != typeof i11.type && (i11.__u |= 65536)) : s11 !== a11 && (s11 == a11 - 1 ? d3-- : s11 == a11 + 1 ? d3++ : (s11 > a11 ? d3-- : d3++, i11.__u |= 65536))) : i11 = e11.__k[n11] = null;
          if (u3) for (n11 = 0; n11 < c3; n11++) null != (o11 = r11[n11]) && 0 == (131072 & o11.__u) && (o11.__e == e11.__d && (e11.__d = i2(o11)), function e12(t12, r12, n12) {
            var i12, o12;
            if (iL.unmount && iL.unmount(t12), (i12 = t12.ref) && (i12.current && i12.current !== t12.__e || ot(i12, null, r12)), null != (i12 = t12.__c)) {
              if (i12.componentWillUnmount) try {
                i12.componentWillUnmount();
              } catch (e13) {
                iL.__e(e13, r12);
              }
              i12.base = i12.__P = null;
            }
            if (i12 = t12.__k) for (o12 = 0; o12 < i12.length; o12++) i12[o12] && e12(i12[o12], r12, n12 || "function" != typeof t12.type);
            n12 || iZ(t12.__e), t12.__c = t12.__ = t12.__e = t12.__d = void 0;
          }(o11, o11));
        }(r10, t10, g2), l2 = r10.__d, d2 = 0; d2 < y2; d2++) null != (h2 = r10.__k[d2]) && (p2 = -1 === h2.__i ? iz : g2[h2.__i] || iz, h2.__i = d2, i7(e10, h2, p2, i10, o10, a10, s10, l2, c2, u2), f2 = h2.__e, h2.ref && p2.ref != h2.ref && (p2.ref && ot(p2.ref, null, h2), u2.push(h2.ref, h2.__c || f2, h2)), null == m2 && null != f2 && (m2 = f2), 65536 & h2.__u || p2.__k === h2.__k ? l2 = function e11(t11, r11, n11) {
          var i11, o11;
          if ("function" == typeof t11.type) {
            for (i11 = t11.__k, o11 = 0; i11 && o11 < i11.length; o11++) i11[o11] && (i11[o11].__ = t11, r11 = e11(i11[o11], r11, n11));
            return r11;
          }
          t11.__e != r11 && (r11 && t11.type && !n11.contains(r11) && (r11 = i2(t11)), n11.insertBefore(t11.__e, r11 || null), r11 = t11.__e);
          do
            r11 = r11 && r11.nextSibling;
          while (null != r11 && 8 === r11.nodeType);
          return r11;
        }(h2, l2, e10) : "function" == typeof h2.type && void 0 !== h2.__d ? l2 = h2.__d : f2 && (l2 = f2.nextSibling), h2.__d = void 0, h2.__u &= -196609);
        r10.__d = l2, r10.__e = m2;
      }
      function i4(e10, t10, r10) {
        "-" === t10[0] ? e10.setProperty(t10, null == r10 ? "" : r10) : e10[t10] = null == r10 ? "" : "number" != typeof r10 || iF.test(t10) ? r10 : r10 + "px";
      }
      function i8(e10, t10, r10, n10, i10) {
        var o10;
        e: if ("style" === t10) {
          if ("string" == typeof r10) e10.style.cssText = r10;
          else {
            if ("string" == typeof n10 && (e10.style.cssText = n10 = ""), n10) for (t10 in n10) r10 && t10 in r10 || i4(e10.style, t10, "");
            if (r10) for (t10 in r10) n10 && r10[t10] === n10[t10] || i4(e10.style, t10, r10[t10]);
          }
        } else if ("o" === t10[0] && "n" === t10[1]) o10 = t10 !== (t10 = t10.replace(/(PointerCapture)$|Capture$/i, "$1")), t10 = t10.toLowerCase() in e10 || "onFocusOut" === t10 || "onFocusIn" === t10 ? t10.toLowerCase().slice(2) : t10.slice(2), e10.l || (e10.l = {}), e10.l[t10 + o10] = r10, r10 ? n10 ? r10.u = n10.u : (r10.u = iq, e10.addEventListener(t10, o10 ? iV : iK, o10)) : e10.removeEventListener(t10, o10 ? iV : iK, o10);
        else {
          if ("http://www.w3.org/2000/svg" == i10) t10 = t10.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
          else if ("width" != t10 && "height" != t10 && "href" != t10 && "list" != t10 && "form" != t10 && "tabIndex" != t10 && "download" != t10 && "rowSpan" != t10 && "colSpan" != t10 && "role" != t10 && "popover" != t10 && t10 in e10) try {
            e10[t10] = null == r10 ? "" : r10;
            break e;
          } catch (e11) {
          }
          "function" == typeof r10 || (null == r10 || false === r10 && "-" !== t10[4] ? e10.removeAttribute(t10) : e10.setAttribute(t10, "popover" == t10 && 1 == r10 ? "" : r10));
        }
      }
      function i9(e10) {
        return function(t10) {
          if (this.l) {
            var r10 = this.l[t10.type + e10];
            if (null == t10.t) t10.t = iq++;
            else if (t10.t < r10.u) return;
            return r10(iL.event ? iL.event(t10) : t10);
          }
        };
      }
      function i7(e10, t10, r10, n10, i10, o10, a10, s10, l2, c2) {
        var u2, d2, p2, h2, f2, m2, g2, y2, w2, b2, v2, _2, S2, k2, x2, E2, A2 = t10.type;
        if (void 0 !== t10.constructor) return null;
        128 & r10.__u && (l2 = !!(32 & r10.__u), o10 = [s10 = t10.__e = r10.__e]), (u2 = iL.__b) && u2(t10);
        e: if ("function" == typeof A2) try {
          if (y2 = t10.props, w2 = "prototype" in A2 && A2.prototype.render, b2 = (u2 = A2.contextType) && n10[u2.__c], v2 = u2 ? b2 ? b2.props.value : u2.__ : n10, r10.__c ? g2 = (d2 = t10.__c = r10.__c).__ = d2.__E : (w2 ? t10.__c = d2 = new A2(y2, v2) : (t10.__c = d2 = new i1(y2, v2), d2.constructor = A2, d2.render = or), b2 && b2.sub(d2), d2.props = y2, d2.state || (d2.state = {}), d2.context = v2, d2.__n = n10, p2 = d2.__d = true, d2.__h = [], d2._sb = []), w2 && null == d2.__s && (d2.__s = d2.state), w2 && null != A2.getDerivedStateFromProps && (d2.__s == d2.state && (d2.__s = iX({}, d2.__s)), iX(d2.__s, A2.getDerivedStateFromProps(y2, d2.__s))), h2 = d2.props, f2 = d2.state, d2.__v = t10, p2) w2 && null == A2.getDerivedStateFromProps && null != d2.componentWillMount && d2.componentWillMount(), w2 && null != d2.componentDidMount && d2.__h.push(d2.componentDidMount);
          else {
            if (w2 && null == A2.getDerivedStateFromProps && y2 !== h2 && null != d2.componentWillReceiveProps && d2.componentWillReceiveProps(y2, v2), !d2.__e && (null != d2.shouldComponentUpdate && false === d2.shouldComponentUpdate(y2, d2.__s, v2) || t10.__v === r10.__v)) {
              for (t10.__v !== r10.__v && (d2.props = y2, d2.state = d2.__s, d2.__d = false), t10.__e = r10.__e, t10.__k = r10.__k, t10.__k.some(function(e11) {
                e11 && (e11.__ = t10);
              }), _2 = 0; _2 < d2._sb.length; _2++) d2.__h.push(d2._sb[_2]);
              d2._sb = [], d2.__h.length && a10.push(d2);
              break e;
            }
            null != d2.componentWillUpdate && d2.componentWillUpdate(y2, d2.__s, v2), w2 && null != d2.componentDidUpdate && d2.__h.push(function() {
              d2.componentDidUpdate(h2, f2, m2);
            });
          }
          if (d2.context = v2, d2.props = y2, d2.__P = e10, d2.__e = false, S2 = iL.__r, k2 = 0, w2) {
            for (d2.state = d2.__s, d2.__d = false, S2 && S2(t10), u2 = d2.render(d2.props, d2.state, d2.context), x2 = 0; x2 < d2._sb.length; x2++) d2.__h.push(d2._sb[x2]);
            d2._sb = [];
          } else do
            d2.__d = false, S2 && S2(t10), u2 = d2.render(d2.props, d2.state, d2.context), d2.state = d2.__s;
          while (d2.__d && ++k2 < 25);
          d2.state = d2.__s, null != d2.getChildContext && (n10 = iX(iX({}, n10), d2.getChildContext())), w2 && !p2 && null != d2.getSnapshotBeforeUpdate && (m2 = d2.getSnapshotBeforeUpdate(h2, f2)), i6(e10, iG(E2 = null != u2 && u2.type === i0 && null == u2.key ? u2.props.children : u2) ? E2 : [E2], t10, r10, n10, i10, o10, a10, s10, l2, c2), d2.base = t10.__e, t10.__u &= -161, d2.__h.length && a10.push(d2), g2 && (d2.__E = d2.__ = null);
        } catch (e11) {
          if (t10.__v = null, l2 || null != o10) {
            for (t10.__u |= l2 ? 160 : 128; s10 && 8 === s10.nodeType && s10.nextSibling; ) s10 = s10.nextSibling;
            o10[o10.indexOf(s10)] = null, t10.__e = s10;
          } else t10.__e = r10.__e, t10.__k = r10.__k;
          iL.__e(e11, t10, r10);
        }
        else null == o10 && t10.__v === r10.__v ? (t10.__k = r10.__k, t10.__e = r10.__e) : t10.__e = function(e11, t11, r11, n11, i11, o11, a11, s11, l3) {
          var c3, u3, d3, p3, h3, f3, m3, g3 = r11.props, y3 = t11.props, w3 = t11.type;
          if ("svg" === w3 ? i11 = "http://www.w3.org/2000/svg" : "math" === w3 ? i11 = "http://www.w3.org/1998/Math/MathML" : i11 || (i11 = "http://www.w3.org/1999/xhtml"), null != o11) {
            for (c3 = 0; c3 < o11.length; c3++) if ((h3 = o11[c3]) && "setAttribute" in h3 == !!w3 && (w3 ? h3.localName === w3 : 3 === h3.nodeType)) {
              e11 = h3, o11[c3] = null;
              break;
            }
          }
          if (null == e11) {
            if (null === w3) return document.createTextNode(y3);
            e11 = document.createElementNS(i11, w3, y3.is && y3), s11 && (iL.__m && iL.__m(t11, o11), s11 = false), o11 = null;
          }
          if (null === w3) g3 === y3 || s11 && e11.data === y3 || (e11.data = y3);
          else {
            if (o11 = o11 && ij.call(e11.childNodes), g3 = r11.props || iz, !s11 && null != o11) for (g3 = {}, c3 = 0; c3 < e11.attributes.length; c3++) g3[(h3 = e11.attributes[c3]).name] = h3.value;
            for (c3 in g3) if (h3 = g3[c3], "children" == c3) ;
            else if ("dangerouslySetInnerHTML" == c3) d3 = h3;
            else if (!(c3 in y3)) {
              if ("value" == c3 && "defaultValue" in y3 || "checked" == c3 && "defaultChecked" in y3) continue;
              i8(e11, c3, null, h3, i11);
            }
            for (c3 in y3) h3 = y3[c3], "children" == c3 ? p3 = h3 : "dangerouslySetInnerHTML" == c3 ? u3 = h3 : "value" == c3 ? f3 = h3 : "checked" == c3 ? m3 = h3 : s11 && "function" != typeof h3 || g3[c3] === h3 || i8(e11, c3, h3, g3[c3], i11);
            if (u3) s11 || d3 && (u3.__html === d3.__html || u3.__html === e11.innerHTML) || (e11.innerHTML = u3.__html), t11.__k = [];
            else if (d3 && (e11.innerHTML = ""), i6(e11, iG(p3) ? p3 : [p3], t11, r11, n11, "foreignObject" === w3 ? "http://www.w3.org/1999/xhtml" : i11, o11, a11, o11 ? o11[0] : r11.__k && i2(r11, 0), s11, l3), null != o11) for (c3 = o11.length; c3--; ) iZ(o11[c3]);
            s11 || (c3 = "value", "progress" === w3 && null == f3 ? e11.removeAttribute("value") : void 0 === f3 || f3 === e11[c3] && ("progress" !== w3 || f3) && ("option" !== w3 || f3 === g3[c3]) || i8(e11, c3, f3, g3[c3], i11), c3 = "checked", void 0 !== m3 && m3 !== e11[c3] && i8(e11, c3, m3, g3[c3], i11));
          }
          return e11;
        }(r10.__e, t10, r10, n10, i10, o10, a10, l2, c2);
        (u2 = iL.diffed) && u2(t10);
      }
      function oe(e10, t10, r10) {
        t10.__d = void 0;
        for (var n10 = 0; n10 < r10.length; n10++) ot(r10[n10], r10[++n10], r10[++n10]);
        iL.__c && iL.__c(t10, e10), e10.some(function(t11) {
          try {
            e10 = t11.__h, t11.__h = [], e10.some(function(e11) {
              e11.call(t11);
            });
          } catch (e11) {
            iL.__e(e11, t11.__v);
          }
        });
      }
      function ot(e10, t10, r10) {
        try {
          if ("function" == typeof e10) {
            var n10 = "function" == typeof e10.__u;
            n10 && e10.__u(), n10 && null == t10 || (e10.__u = e10(t10));
          } else e10.current = t10;
        } catch (e11) {
          iL.__e(e11, r10);
        }
      }
      function or(e10, t10, r10) {
        return this.constructor(e10, r10);
      }
      function on(e10, t10) {
        var r10, n10, i10, o10, a10;
        r10 = e10, iL.__ && iL.__(r10, t10), i10 = (n10 = "function" == typeof on) ? null : on && on.__k || t10.__k, o10 = [], a10 = [], i7(t10, r10 = (!n10 && on || t10).__k = iY(i0, null, [r10]), i10 || iz, iz, t10.namespaceURI, !n10 && on ? [on] : i10 ? null : t10.firstChild ? ij.call(t10.childNodes) : null, o10, !n10 && on ? on : i10 ? i10.__e : t10.firstChild, n10, a10), oe(o10, r10, a10);
      }
      ij = iJ.slice, iL = { __e: function(e10, t10, r10, n10) {
        for (var i10, o10, a10; t10 = t10.__; ) if ((i10 = t10.__c) && !i10.__) try {
          if ((o10 = i10.constructor) && null != o10.getDerivedStateFromError && (i10.setState(o10.getDerivedStateFromError(e10)), a10 = i10.__d), null != i10.componentDidCatch && (i10.componentDidCatch(e10, n10 || {}), a10 = i10.__d), a10) return i10.__E = i10;
        } catch (t11) {
          e10 = t11;
        }
        throw e10;
      } }, iD = 0, i1.prototype.setState = function(e10, t10) {
        var r10;
        r10 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = iX({}, this.state), "function" == typeof e10 && (e10 = e10(iX({}, r10), this.props)), e10 && iX(r10, e10), null != e10 && this.__v && (t10 && this._sb.push(t10), i3(this));
      }, i1.prototype.forceUpdate = function(e10) {
        this.__v && (this.__e = true, e10 && this.__h.push(e10), i3(this));
      }, i1.prototype.render = i0, iM = [], iW = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, iB = function(e10, t10) {
        return e10.__v.__b - t10.__v.__b;
      }, i5.__r = 0, iq = 0, iK = i9(false), iV = i9(true);
      var oi = /[\s\n\\/='"\0<>]/, oo = /^(xlink|xmlns|xml)([A-Z])/, oa = /^accessK|^auto[A-Z]|^cell|^ch|^col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z]/, os = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/, ol = /* @__PURE__ */ new Set(["draggable", "spellcheck"]), oc = /["&<]/;
      function ou(e10) {
        if (0 === e10.length || false === oc.test(e10)) return e10;
        for (var t10 = 0, r10 = 0, n10 = "", i10 = ""; r10 < e10.length; r10++) {
          switch (e10.charCodeAt(r10)) {
            case 34:
              i10 = "&quot;";
              break;
            case 38:
              i10 = "&amp;";
              break;
            case 60:
              i10 = "&lt;";
              break;
            default:
              continue;
          }
          r10 !== t10 && (n10 += e10.slice(t10, r10)), n10 += i10, t10 = r10 + 1;
        }
        return r10 !== t10 && (n10 += e10.slice(t10, r10)), n10;
      }
      var od = {}, op = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]), oh = /[A-Z]/g;
      function of() {
        this.__d = true;
      }
      var om, og, oy, ow, ob = {}, ov = [], o_ = Array.isArray, oS = Object.assign;
      function ok(e10, t10) {
        var r10, n10 = e10.type, i10 = true;
        return e10.__c ? (i10 = false, (r10 = e10.__c).state = r10.__s) : r10 = new n10(e10.props, t10), e10.__c = r10, r10.__v = e10, r10.props = e10.props, r10.context = t10, r10.__d = true, null == r10.state && (r10.state = ob), null == r10.__s && (r10.__s = r10.state), n10.getDerivedStateFromProps ? r10.state = oS({}, r10.state, n10.getDerivedStateFromProps(r10.props, r10.state)) : i10 && r10.componentWillMount ? (r10.componentWillMount(), r10.state = r10.__s !== r10.state ? r10.__s : r10.state) : !i10 && r10.componentWillUpdate && r10.componentWillUpdate(), oy && oy(e10), r10.render(r10.props, r10.state, t10);
      }
      var ox = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]), oE = 0;
      function oA(e10, t10, r10, n10, i10, o10) {
        t10 || (t10 = {});
        var a10, s10, l2 = t10;
        "ref" in t10 && (a10 = t10.ref, delete t10.ref);
        var c2 = { type: e10, props: l2, key: r10, ref: a10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: --oE, __i: -1, __u: 0, __source: i10, __self: o10 };
        if ("function" == typeof e10 && (a10 = e10.defaultProps)) for (s10 in a10) void 0 === l2[s10] && (l2[s10] = a10[s10]);
        return iL.vnode && iL.vnode(c2), c2;
      }
      async function oT(e10, t10) {
        let r10 = window.SimpleWebAuthnBrowser;
        async function n10(r11) {
          let n11 = new URL(`${e10}/webauthn-options/${t10}`);
          r11 && n11.searchParams.append("action", r11), o10().forEach((e11) => {
            n11.searchParams.append(e11.name, e11.value);
          });
          let i11 = await fetch(n11);
          if (!i11.ok) {
            console.error("Failed to fetch options", i11);
            return;
          }
          return i11.json();
        }
        function i10() {
          let e11 = `#${t10}-form`, r11 = document.querySelector(e11);
          if (!r11) throw Error(`Form '${e11}' not found`);
          return r11;
        }
        function o10() {
          return Array.from(i10().querySelectorAll("input[data-form-field]"));
        }
        async function a10(e11, t11) {
          let r11 = i10();
          if (e11) {
            let t12 = document.createElement("input");
            t12.type = "hidden", t12.name = "action", t12.value = e11, r11.appendChild(t12);
          }
          if (t11) {
            let e12 = document.createElement("input");
            e12.type = "hidden", e12.name = "data", e12.value = JSON.stringify(t11), r11.appendChild(e12);
          }
          return r11.submit();
        }
        async function s10(e11, t11) {
          let n11 = await r10.startAuthentication(e11, t11);
          return await a10("authenticate", n11);
        }
        async function l2(e11) {
          o10().forEach((e12) => {
            if (e12.required && !e12.value) throw Error(`Missing required field: ${e12.name}`);
          });
          let t11 = await r10.startRegistration(e11);
          return await a10("register", t11);
        }
        async function c2() {
          if (!r10.browserSupportsWebAuthnAutofill()) return;
          let e11 = await n10("authenticate");
          if (!e11) {
            console.error("Failed to fetch option for autofill authentication");
            return;
          }
          try {
            await s10(e11.options, true);
          } catch (e12) {
            console.error(e12);
          }
        }
        (async function() {
          let e11 = i10();
          if (!r10.browserSupportsWebAuthn()) {
            e11.style.display = "none";
            return;
          }
          e11 && e11.addEventListener("submit", async (e12) => {
            e12.preventDefault();
            let t11 = await n10(void 0);
            if (!t11) {
              console.error("Failed to fetch options for form submission");
              return;
            }
            if ("authenticate" === t11.action) try {
              await s10(t11.options, false);
            } catch (e13) {
              console.error(e13);
            }
            else if ("register" === t11.action) try {
              await l2(t11.options);
            } catch (e13) {
              console.error(e13);
            }
          });
        })(), c2();
      }
      let oP = { default: "Unable to sign in.", Signin: "Try signing in with a different account.", OAuthSignin: "Try signing in with a different account.", OAuthCallbackError: "Try signing in with a different account.", OAuthCreateAccount: "Try signing in with a different account.", EmailCreateAccount: "Try signing in with a different account.", Callback: "Try signing in with a different account.", OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.", EmailSignin: "The e-mail could not be sent.", CredentialsSignin: "Sign in failed. Check the details you provided are correct.", SessionRequired: "Please sign in to access this page." }, oC = `:root {
  --border-width: 1px;
  --border-radius: 0.5rem;
  --color-error: #c94b4b;
  --color-info: #157efb;
  --color-info-hover: #0f6ddb;
  --color-info-text: #fff;
}

.__next-auth-theme-auto,
.__next-auth-theme-light {
  --color-background: #ececec;
  --color-background-hover: rgba(236, 236, 236, 0.8);
  --color-background-card: #fff;
  --color-text: #000;
  --color-primary: #444;
  --color-control-border: #bbb;
  --color-button-active-background: #f9f9f9;
  --color-button-active-border: #aaa;
  --color-separator: #ccc;
  --provider-bg: #fff;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #fff
  );
}

.__next-auth-theme-dark {
  --color-background: #161b22;
  --color-background-hover: rgba(22, 27, 34, 0.8);
  --color-background-card: #0d1117;
  --color-text: #fff;
  --color-primary: #ccc;
  --color-control-border: #555;
  --color-button-active-background: #060606;
  --color-button-active-border: #666;
  --color-separator: #444;
  --provider-bg: #161b22;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #000
  );
}

.__next-auth-theme-dark img[src$="42-school.svg"],
  .__next-auth-theme-dark img[src$="apple.svg"],
  .__next-auth-theme-dark img[src$="boxyhq-saml.svg"],
  .__next-auth-theme-dark img[src$="eveonline.svg"],
  .__next-auth-theme-dark img[src$="github.svg"],
  .__next-auth-theme-dark img[src$="mailchimp.svg"],
  .__next-auth-theme-dark img[src$="medium.svg"],
  .__next-auth-theme-dark img[src$="okta.svg"],
  .__next-auth-theme-dark img[src$="patreon.svg"],
  .__next-auth-theme-dark img[src$="ping-id.svg"],
  .__next-auth-theme-dark img[src$="roblox.svg"],
  .__next-auth-theme-dark img[src$="threads.svg"],
  .__next-auth-theme-dark img[src$="wikimedia.svg"] {
    filter: invert(1);
  }

.__next-auth-theme-dark #submitButton {
    background-color: var(--provider-bg, var(--color-info));
  }

@media (prefers-color-scheme: dark) {
  .__next-auth-theme-auto {
    --color-background: #161b22;
    --color-background-hover: rgba(22, 27, 34, 0.8);
    --color-background-card: #0d1117;
    --color-text: #fff;
    --color-primary: #ccc;
    --color-control-border: #555;
    --color-button-active-background: #060606;
    --color-button-active-border: #666;
    --color-separator: #444;
    --provider-bg: #161b22;
    --provider-bg-hover: color-mix(
      in srgb,
      var(--provider-brand-color) 30%,
      #000
    );
  }
    .__next-auth-theme-auto img[src$="42-school.svg"],
    .__next-auth-theme-auto img[src$="apple.svg"],
    .__next-auth-theme-auto img[src$="boxyhq-saml.svg"],
    .__next-auth-theme-auto img[src$="eveonline.svg"],
    .__next-auth-theme-auto img[src$="github.svg"],
    .__next-auth-theme-auto img[src$="mailchimp.svg"],
    .__next-auth-theme-auto img[src$="medium.svg"],
    .__next-auth-theme-auto img[src$="okta.svg"],
    .__next-auth-theme-auto img[src$="patreon.svg"],
    .__next-auth-theme-auto img[src$="ping-id.svg"],
    .__next-auth-theme-auto img[src$="roblox.svg"],
    .__next-auth-theme-auto img[src$="threads.svg"],
    .__next-auth-theme-auto img[src$="wikimedia.svg"] {
      filter: invert(1);
    }
    .__next-auth-theme-auto #submitButton {
      background-color: var(--provider-bg, var(--color-info));
    }
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif,
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji";
}

h1 {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  font-weight: 400;
  color: var(--color-text);
}

p {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  color: var(--color-text);
}

form {
  margin: 0;
  padding: 0;
}

label {
  font-weight: 500;
  text-align: left;
  margin-bottom: 0.25rem;
  display: block;
  color: var(--color-text);
}

input[type] {
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: var(--border-width) solid var(--color-control-border);
  background: var(--color-background-card);
  font-size: 1rem;
  border-radius: var(--border-radius);
  color: var(--color-text);
}

p {
  font-size: 1.1rem;
  line-height: 2rem;
}

a.button {
  text-decoration: none;
  line-height: 1rem;
}

a.button:link,
  a.button:visited {
    background-color: var(--color-background);
    color: var(--color-primary);
  }

button,
a.button {
  padding: 0.75rem 1rem;
  color: var(--provider-color, var(--color-primary));
  background-color: var(--provider-bg, var(--color-background));
  border: 1px solid #00000031;
  font-size: 0.9rem;
  height: 50px;
  border-radius: var(--border-radius);
  transition: background-color 250ms ease-in-out;
  font-weight: 300;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:is(button,a.button):hover {
    background-color: var(--provider-bg-hover, var(--color-background-hover));
    cursor: pointer;
  }

:is(button,a.button):active {
    cursor: pointer;
  }

:is(button,a.button) span {
    color: var(--provider-bg);
  }

#submitButton {
  color: var(--button-text-color, var(--color-info-text));
  background-color: var(--brand-color, var(--color-info));
  width: 100%;
}

#submitButton:hover {
    background-color: var(
      --button-hover-bg,
      var(--color-info-hover)
    ) !important;
  }

a.site {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 1rem;
  line-height: 2rem;
}

a.site:hover {
    text-decoration: underline;
  }

.page {
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page > div {
    text-align: center;
  }

.error a.button {
    padding-left: 2rem;
    padding-right: 2rem;
    margin-top: 0.5rem;
  }

.error .message {
    margin-bottom: 1.5rem;
  }

.signin input[type="text"] {
    margin-left: auto;
    margin-right: auto;
    display: block;
  }

.signin hr {
    display: block;
    border: 0;
    border-top: 1px solid var(--color-separator);
    margin: 2rem auto 1rem auto;
    overflow: visible;
  }

.signin hr::before {
      content: "or";
      background: var(--color-background-card);
      color: #888;
      padding: 0 0.4rem;
      position: relative;
      top: -0.7rem;
    }

.signin .error {
    background: #f5f5f5;
    font-weight: 500;
    border-radius: 0.3rem;
    background: var(--color-error);
  }

.signin .error p {
      text-align: left;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      line-height: 1.2rem;
      color: var(--color-info-text);
    }

.signin > div,
  .signin form {
    display: block;
  }

.signin > div input[type], .signin form input[type] {
      margin-bottom: 0.5rem;
    }

.signin > div button, .signin form button {
      width: 100%;
    }

.signin .provider + .provider {
    margin-top: 1rem;
  }

.logo {
  display: inline-block;
  max-width: 150px;
  margin: 1.25rem 0;
  max-height: 70px;
}

.card {
  background-color: var(--color-background-card);
  border-radius: 1rem;
  padding: 1.25rem 2rem;
}

.card .header {
    color: var(--color-primary);
  }

.card input[type]::-moz-placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type]::placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type] {
    background: color-mix(in srgb, var(--color-background-card) 95%, black);
  }

.section-header {
  color: var(--color-text);
}

@media screen and (min-width: 450px) {
  .card {
    margin: 2rem 0;
    width: 368px;
  }
}

@media screen and (max-width: 450px) {
  .card {
    margin: 1rem 0;
    width: 343px;
  }
}
`;
      function oR({ html: e10, title: t10, status: r10, cookies: n10, theme: i10, headTags: o10 }) {
        return { cookies: n10, status: r10, headers: { "Content-Type": "text/html" }, body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${oC}</style><title>${t10}</title>${o10 ?? ""}</head><body class="__next-auth-theme-${i10?.colorScheme ?? "auto"}"><div class="page">${function(e11, t11, r11) {
          var n11 = iL.__s;
          iL.__s = true, om = iL.__b, og = iL.diffed, oy = iL.__r, ow = iL.unmount;
          var i11 = iY(i0, null);
          i11.__k = [e11];
          try {
            var o11 = function e12(t12, r12, n12, i12, o12, a10, s10) {
              if (null == t12 || true === t12 || false === t12 || "" === t12) return "";
              var l2 = typeof t12;
              if ("object" != l2) return "function" == l2 ? "" : "string" == l2 ? ou(t12) : t12 + "";
              if (o_(t12)) {
                var c2, u2 = "";
                o12.__k = t12;
                for (var d2 = 0; d2 < t12.length; d2++) {
                  var p2 = t12[d2];
                  if (null != p2 && "boolean" != typeof p2) {
                    var h2, f2 = e12(p2, r12, n12, i12, o12, a10, s10);
                    "string" == typeof f2 ? u2 += f2 : (c2 || (c2 = []), u2 && c2.push(u2), u2 = "", o_(f2) ? (h2 = c2).push.apply(h2, f2) : c2.push(f2));
                  }
                }
                return c2 ? (u2 && c2.push(u2), c2) : u2;
              }
              if (void 0 !== t12.constructor) return "";
              t12.__ = o12, om && om(t12);
              var m2 = t12.type, g2 = t12.props;
              if ("function" == typeof m2) {
                var y2, w2, b2, v2 = r12;
                if (m2 === i0) {
                  if ("tpl" in g2) {
                    for (var _2 = "", S2 = 0; S2 < g2.tpl.length; S2++) if (_2 += g2.tpl[S2], g2.exprs && S2 < g2.exprs.length) {
                      var k2 = g2.exprs[S2];
                      if (null == k2) continue;
                      "object" == typeof k2 && (void 0 === k2.constructor || o_(k2)) ? _2 += e12(k2, r12, n12, i12, t12, a10, s10) : _2 += k2;
                    }
                    return _2;
                  }
                  if ("UNSTABLE_comment" in g2) return "<!--" + ou(g2.UNSTABLE_comment) + "-->";
                  w2 = g2.children;
                } else {
                  if (null != (y2 = m2.contextType)) {
                    var x2 = r12[y2.__c];
                    v2 = x2 ? x2.props.value : y2.__;
                  }
                  var E2 = m2.prototype && "function" == typeof m2.prototype.render;
                  if (E2) w2 = ok(t12, v2), b2 = t12.__c;
                  else {
                    t12.__c = b2 = { __v: t12, context: v2, props: t12.props, setState: of, forceUpdate: of, __d: true, __h: [] };
                    for (var A2 = 0; b2.__d && A2++ < 25; ) b2.__d = false, oy && oy(t12), w2 = m2.call(b2, g2, v2);
                    b2.__d = true;
                  }
                  if (null != b2.getChildContext && (r12 = oS({}, r12, b2.getChildContext())), E2 && iL.errorBoundaries && (m2.getDerivedStateFromError || b2.componentDidCatch)) {
                    w2 = null != w2 && w2.type === i0 && null == w2.key && null == w2.props.tpl ? w2.props.children : w2;
                    try {
                      return e12(w2, r12, n12, i12, t12, a10, s10);
                    } catch (o13) {
                      return m2.getDerivedStateFromError && (b2.__s = m2.getDerivedStateFromError(o13)), b2.componentDidCatch && b2.componentDidCatch(o13, ob), b2.__d ? (w2 = ok(t12, r12), null != (b2 = t12.__c).getChildContext && (r12 = oS({}, r12, b2.getChildContext())), e12(w2 = null != w2 && w2.type === i0 && null == w2.key && null == w2.props.tpl ? w2.props.children : w2, r12, n12, i12, t12, a10, s10)) : "";
                    } finally {
                      og && og(t12), t12.__ = null, ow && ow(t12);
                    }
                  }
                }
                w2 = null != w2 && w2.type === i0 && null == w2.key && null == w2.props.tpl ? w2.props.children : w2;
                try {
                  var T2 = e12(w2, r12, n12, i12, t12, a10, s10);
                  return og && og(t12), t12.__ = null, iL.unmount && iL.unmount(t12), T2;
                } catch (o13) {
                  if (!a10 && s10 && s10.onError) {
                    var P2 = s10.onError(o13, t12, function(o14) {
                      return e12(o14, r12, n12, i12, t12, a10, s10);
                    });
                    if (void 0 !== P2) return P2;
                    var C2 = iL.__e;
                    return C2 && C2(o13, t12), "";
                  }
                  if (!a10 || !o13 || "function" != typeof o13.then) throw o13;
                  return o13.then(function o14() {
                    try {
                      return e12(w2, r12, n12, i12, t12, a10, s10);
                    } catch (l3) {
                      if (!l3 || "function" != typeof l3.then) throw l3;
                      return l3.then(function() {
                        return e12(w2, r12, n12, i12, t12, a10, s10);
                      }, o14);
                    }
                  });
                }
              }
              var R2, O2 = "<" + m2, I2 = "";
              for (var U2 in g2) {
                var N2 = g2[U2];
                if ("function" != typeof N2 || "class" === U2 || "className" === U2) {
                  switch (U2) {
                    case "children":
                      R2 = N2;
                      continue;
                    case "key":
                    case "ref":
                    case "__self":
                    case "__source":
                      continue;
                    case "htmlFor":
                      if ("for" in g2) continue;
                      U2 = "for";
                      break;
                    case "className":
                      if ("class" in g2) continue;
                      U2 = "class";
                      break;
                    case "defaultChecked":
                      U2 = "checked";
                      break;
                    case "defaultSelected":
                      U2 = "selected";
                      break;
                    case "defaultValue":
                    case "value":
                      switch (U2 = "value", m2) {
                        case "textarea":
                          R2 = N2;
                          continue;
                        case "select":
                          i12 = N2;
                          continue;
                        case "option":
                          i12 != N2 || "selected" in g2 || (O2 += " selected");
                      }
                      break;
                    case "dangerouslySetInnerHTML":
                      I2 = N2 && N2.__html;
                      continue;
                    case "style":
                      "object" == typeof N2 && (N2 = function(e13) {
                        var t13 = "";
                        for (var r13 in e13) {
                          var n13 = e13[r13];
                          if (null != n13 && "" !== n13) {
                            var i13 = "-" == r13[0] ? r13 : od[r13] || (od[r13] = r13.replace(oh, "-$&").toLowerCase()), o13 = ";";
                            "number" != typeof n13 || i13.startsWith("--") || op.has(i13) || (o13 = "px;"), t13 = t13 + i13 + ":" + n13 + o13;
                          }
                        }
                        return t13 || void 0;
                      }(N2));
                      break;
                    case "acceptCharset":
                      U2 = "accept-charset";
                      break;
                    case "httpEquiv":
                      U2 = "http-equiv";
                      break;
                    default:
                      if (oo.test(U2)) U2 = U2.replace(oo, "$1:$2").toLowerCase();
                      else {
                        if (oi.test(U2)) continue;
                        ("-" === U2[4] || ol.has(U2)) && null != N2 ? N2 += "" : n12 ? os.test(U2) && (U2 = "panose1" === U2 ? "panose-1" : U2.replace(/([A-Z])/g, "-$1").toLowerCase()) : oa.test(U2) && (U2 = U2.toLowerCase());
                      }
                  }
                  null != N2 && false !== N2 && (O2 = true === N2 || "" === N2 ? O2 + " " + U2 : O2 + " " + U2 + '="' + ("string" == typeof N2 ? ou(N2) : N2 + "") + '"');
                }
              }
              if (oi.test(m2)) throw Error(m2 + " is not a valid HTML tag name in " + O2 + ">");
              if (I2 || ("string" == typeof R2 ? I2 = ou(R2) : null != R2 && false !== R2 && true !== R2 && (I2 = e12(R2, r12, "svg" === m2 || "foreignObject" !== m2 && n12, i12, t12, a10, s10))), og && og(t12), t12.__ = null, ow && ow(t12), !I2 && ox.has(m2)) return O2 + "/>";
              var $2 = "</" + m2 + ">", j2 = O2 + ">";
              return o_(I2) ? [j2].concat(I2, [$2]) : "string" != typeof I2 ? [j2, I2, $2] : j2 + I2 + $2;
            }(e11, ob, false, void 0, i11, false, void 0);
            return o_(o11) ? o11.join("") : o11;
          } catch (e12) {
            if (e12.then) throw Error('Use "renderToStringAsync" for suspenseful rendering.');
            throw e12;
          } finally {
            iL.__c && iL.__c(e11, ov), iL.__s = n11, ov.length = 0;
          }
        }(e10)}</div></body></html>` };
      }
      function oO(e10) {
        let { url: t10, theme: r10, query: n10, cookies: i10, pages: o10, providers: a10 } = e10;
        return { csrf: (e11, t11, r11) => e11 ? (t11.logger.warn("csrf-disabled"), r11.push({ name: t11.cookies.csrfToken.name, value: "", options: { ...t11.cookies.csrfToken.options, maxAge: 0 } }), { status: 404, cookies: r11 }) : { headers: { "Content-Type": "application/json", "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" }, body: { csrfToken: t11.csrfToken }, cookies: r11 }, providers: (e11) => ({ headers: { "Content-Type": "application/json" }, body: e11.reduce((e12, { id: t11, name: r11, type: n11, signinUrl: i11, callbackUrl: o11 }) => (e12[t11] = { id: t11, name: r11, type: n11, signinUrl: i11, callbackUrl: o11 }, e12), {}) }), signin(t11, s10) {
          if (t11) throw new tO("Unsupported action");
          if (o10?.signIn) {
            let t12 = `${o10.signIn}${o10.signIn.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: e10.callbackUrl ?? "/" })}`;
            return s10 && (t12 = `${t12}&${new URLSearchParams({ error: s10 })}`), { redirect: t12, cookies: i10 };
          }
          let l2 = a10?.find((e11) => "webauthn" === e11.type && e11.enableConditionalUI && !!e11.simpleWebAuthnBrowserVersion), c2 = "";
          if (l2) {
            let { simpleWebAuthnBrowserVersion: e11 } = l2;
            c2 = `<script src="https://unpkg.com/@simplewebauthn/browser@${e11}/dist/bundle/index.umd.min.js" crossorigin="anonymous"></script>`;
          }
          return oR({ cookies: i10, theme: r10, html: function(e11) {
            let { csrfToken: t12, providers: r11 = [], callbackUrl: n11, theme: i11, email: o11, error: a11 } = e11;
            "undefined" != typeof document && i11?.brandColor && document.documentElement.style.setProperty("--brand-color", i11.brandColor), "undefined" != typeof document && i11?.buttonText && document.documentElement.style.setProperty("--button-text-color", i11.buttonText);
            let s11 = a11 && (oP[a11] ?? oP.default), l3 = r11.find((e12) => "webauthn" === e12.type && e12.enableConditionalUI)?.id;
            return oA("div", { className: "signin", children: [i11?.brandColor && oA("style", { dangerouslySetInnerHTML: { __html: `:root {--brand-color: ${i11.brandColor}}` } }), i11?.buttonText && oA("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${i11.buttonText}
        }
      ` } }), oA("div", { className: "card", children: [s11 && oA("div", { className: "error", children: oA("p", { children: s11 }) }), i11?.logo && oA("img", { src: i11.logo, alt: "Logo", className: "logo" }), r11.map((e12, i12) => {
              let a12, s12, l4;
              ("oauth" === e12.type || "oidc" === e12.type) && ({ bg: a12 = "#fff", brandColor: s12, logo: l4 = `https://authjs.dev/img/providers/${e12.id}.svg` } = e12.style ?? {});
              let c3 = s12 ?? a12 ?? "#fff";
              return oA("div", { className: "provider", children: ["oauth" === e12.type || "oidc" === e12.type ? oA("form", { action: e12.signinUrl, method: "POST", children: [oA("input", { type: "hidden", name: "csrfToken", value: t12 }), n11 && oA("input", { type: "hidden", name: "callbackUrl", value: n11 }), oA("button", { type: "submit", className: "button", style: { "--provider-brand-color": c3 }, tabIndex: 0, children: [oA("span", { style: { filter: "invert(1) grayscale(1) brightness(1.3) contrast(9000)", "mix-blend-mode": "luminosity", opacity: 0.95 }, children: ["Sign in with ", e12.name] }), l4 && oA("img", { loading: "lazy", height: 24, src: l4 })] })] }) : null, ("email" === e12.type || "credentials" === e12.type || "webauthn" === e12.type) && i12 > 0 && "email" !== r11[i12 - 1].type && "credentials" !== r11[i12 - 1].type && "webauthn" !== r11[i12 - 1].type && oA("hr", {}), "email" === e12.type && oA("form", { action: e12.signinUrl, method: "POST", children: [oA("input", { type: "hidden", name: "csrfToken", value: t12 }), oA("label", { className: "section-header", htmlFor: `input-email-for-${e12.id}-provider`, children: "Email" }), oA("input", { id: `input-email-for-${e12.id}-provider`, autoFocus: true, type: "email", name: "email", value: o11, placeholder: "email@example.com", required: true }), oA("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", e12.name] })] }), "credentials" === e12.type && oA("form", { action: e12.callbackUrl, method: "POST", children: [oA("input", { type: "hidden", name: "csrfToken", value: t12 }), Object.keys(e12.credentials).map((t13) => oA("div", { children: [oA("label", { className: "section-header", htmlFor: `input-${t13}-for-${e12.id}-provider`, children: e12.credentials[t13].label ?? t13 }), oA("input", { name: t13, id: `input-${t13}-for-${e12.id}-provider`, type: e12.credentials[t13].type ?? "text", placeholder: e12.credentials[t13].placeholder ?? "", ...e12.credentials[t13] })] }, `input-group-${e12.id}`)), oA("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", e12.name] })] }), "webauthn" === e12.type && oA("form", { action: e12.callbackUrl, method: "POST", id: `${e12.id}-form`, children: [oA("input", { type: "hidden", name: "csrfToken", value: t12 }), Object.keys(e12.formFields).map((t13) => oA("div", { children: [oA("label", { className: "section-header", htmlFor: `input-${t13}-for-${e12.id}-provider`, children: e12.formFields[t13].label ?? t13 }), oA("input", { name: t13, "data-form-field": true, id: `input-${t13}-for-${e12.id}-provider`, type: e12.formFields[t13].type ?? "text", placeholder: e12.formFields[t13].placeholder ?? "", ...e12.formFields[t13] })] }, `input-group-${e12.id}`)), oA("button", { id: `submitButton-${e12.id}`, type: "submit", tabIndex: 0, children: ["Sign in with ", e12.name] })] }), ("email" === e12.type || "credentials" === e12.type || "webauthn" === e12.type) && i12 + 1 < r11.length && oA("hr", {})] }, e12.id);
            })] }), l3 && oA(i0, { children: oA("script", { dangerouslySetInnerHTML: { __html: `
const currentURL = window.location.href;
const authURL = currentURL.substring(0, currentURL.lastIndexOf('/'));
(${oT})(authURL, "${l3}");
` } }) })] });
          }({ csrfToken: e10.csrfToken, providers: e10.providers?.filter((e11) => ["email", "oauth", "oidc"].includes(e11.type) || "credentials" === e11.type && e11.credentials || "webauthn" === e11.type && e11.formFields || false), callbackUrl: e10.callbackUrl, theme: e10.theme, error: s10, ...n10 }), title: "Sign In", headTags: c2 });
        }, signout: () => o10?.signOut ? { redirect: o10.signOut, cookies: i10 } : oR({ cookies: i10, theme: r10, html: function(e11) {
          let { url: t11, csrfToken: r11, theme: n11 } = e11;
          return oA("div", { className: "signout", children: [n11?.brandColor && oA("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${n11.brandColor}
        }
      ` } }), n11?.buttonText && oA("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${n11.buttonText}
        }
      ` } }), oA("div", { className: "card", children: [n11?.logo && oA("img", { src: n11.logo, alt: "Logo", className: "logo" }), oA("h1", { children: "Signout" }), oA("p", { children: "Are you sure you want to sign out?" }), oA("form", { action: t11?.toString(), method: "POST", children: [oA("input", { type: "hidden", name: "csrfToken", value: r11 }), oA("button", { id: "submitButton", type: "submit", children: "Sign out" })] })] })] });
        }({ csrfToken: e10.csrfToken, url: t10, theme: r10 }), title: "Sign Out" }), verifyRequest: (e11) => o10?.verifyRequest ? { redirect: `${o10.verifyRequest}${t10?.search ?? ""}`, cookies: i10 } : oR({ cookies: i10, theme: r10, html: function(e12) {
          let { url: t11, theme: r11 } = e12;
          return oA("div", { className: "verify-request", children: [r11.brandColor && oA("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${r11.brandColor}
        }
      ` } }), oA("div", { className: "card", children: [r11.logo && oA("img", { src: r11.logo, alt: "Logo", className: "logo" }), oA("h1", { children: "Check your email" }), oA("p", { children: "A sign in link has been sent to your email address." }), oA("p", { children: oA("a", { className: "site", href: t11.origin, children: t11.host }) })] })] });
        }({ url: t10, theme: r10, ...e11 }), title: "Verify Request" }), error: (e11) => o10?.error ? { redirect: `${o10.error}${o10.error.includes("?") ? "&" : "?"}error=${e11}`, cookies: i10 } : oR({ cookies: i10, theme: r10, ...function(e12) {
          let { url: t11, error: r11 = "default", theme: n11 } = e12, i11 = `${t11}/signin`, o11 = { default: { status: 200, heading: "Error", message: oA("p", { children: oA("a", { className: "site", href: t11?.origin, children: t11?.host }) }) }, Configuration: { status: 500, heading: "Server error", message: oA("div", { children: [oA("p", { children: "There is a problem with the server configuration." }), oA("p", { children: "Check the server logs for more information." })] }) }, AccessDenied: { status: 403, heading: "Access Denied", message: oA("div", { children: [oA("p", { children: "You do not have permission to sign in." }), oA("p", { children: oA("a", { className: "button", href: i11, children: "Sign in" }) })] }) }, Verification: { status: 403, heading: "Unable to sign in", message: oA("div", { children: [oA("p", { children: "The sign in link is no longer valid." }), oA("p", { children: "It may have been used already or it may have expired." })] }), signin: oA("a", { className: "button", href: i11, children: "Sign in" }) } }, { status: a11, heading: s10, message: l2, signin: c2 } = o11[r11] ?? o11.default;
          return { status: a11, html: oA("div", { className: "error", children: [n11?.brandColor && oA("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${n11?.brandColor}
        }
      ` } }), oA("div", { className: "card", children: [n11?.logo && oA("img", { src: n11?.logo, alt: "Logo", className: "logo" }), oA("h1", { children: s10 }), oA("div", { className: "message", children: l2 }), c2] })] }) };
        }({ url: t10, theme: r10, error: e11 }), title: "Error" }) };
      }
      function oI(e10, t10 = Date.now()) {
        return new Date(t10 + 1e3 * e10);
      }
      async function oU(e10, t10, r10, n10) {
        if (!r10?.providerAccountId || !r10.type) throw Error("Missing or invalid provider account");
        if (!["email", "oauth", "oidc", "webauthn"].includes(r10.type)) throw Error("Provider not supported");
        let { adapter: i10, jwt: o10, events: a10, session: { strategy: s10, generateSessionToken: l2 } } = n10;
        if (!i10) return { user: t10, account: r10 };
        let c2 = r10, { createUser: u2, updateUser: d2, getUser: p2, getUserByAccount: h2, getUserByEmail: f2, linkAccount: m2, createSession: g2, getSessionAndUser: y2, deleteSession: w2 } = i10, b2 = null, v2 = null, _2 = false, S2 = "jwt" === s10;
        if (e10) {
          if (S2) try {
            let t11 = n10.cookies.sessionToken.name;
            (b2 = await o10.decode({ ...o10, token: e10, salt: t11 })) && "sub" in b2 && b2.sub && (v2 = await p2(b2.sub));
          } catch {
          }
          else {
            let t11 = await y2(e10);
            t11 && (b2 = t11.session, v2 = t11.user);
          }
        }
        if ("email" === c2.type) {
          let r11 = await f2(t10.email);
          return r11 ? (v2?.id !== r11.id && !S2 && e10 && await w2(e10), v2 = await d2({ id: r11.id, emailVerified: /* @__PURE__ */ new Date() }), await a10.updateUser?.({ user: v2 })) : (v2 = await u2({ ...t10, emailVerified: /* @__PURE__ */ new Date() }), await a10.createUser?.({ user: v2 }), _2 = true), { session: b2 = S2 ? {} : await g2({ sessionToken: l2(), userId: v2.id, expires: oI(n10.session.maxAge) }), user: v2, isNewUser: _2 };
        }
        if ("webauthn" === c2.type) {
          let e11 = await h2({ providerAccountId: c2.providerAccountId, provider: c2.provider });
          if (e11) {
            if (v2) {
              if (e11.id === v2.id) {
                let e12 = { ...c2, userId: v2.id };
                return { session: b2, user: v2, isNewUser: _2, account: e12 };
              }
              throw new tW("The account is already associated with another user", { provider: c2.provider });
            }
            b2 = S2 ? {} : await g2({ sessionToken: l2(), userId: e11.id, expires: oI(n10.session.maxAge) });
            let t11 = { ...c2, userId: e11.id };
            return { session: b2, user: e11, isNewUser: _2, account: t11 };
          }
          {
            if (v2) {
              await m2({ ...c2, userId: v2.id }), await a10.linkAccount?.({ user: v2, account: c2, profile: t10 });
              let e13 = { ...c2, userId: v2.id };
              return { session: b2, user: v2, isNewUser: _2, account: e13 };
            }
            if (t10.email ? await f2(t10.email) : null) throw new tW("Another account already exists with the same e-mail address", { provider: c2.provider });
            v2 = await u2({ ...t10 }), await a10.createUser?.({ user: v2 }), await m2({ ...c2, userId: v2.id }), await a10.linkAccount?.({ user: v2, account: c2, profile: t10 }), b2 = S2 ? {} : await g2({ sessionToken: l2(), userId: v2.id, expires: oI(n10.session.maxAge) });
            let e12 = { ...c2, userId: v2.id };
            return { session: b2, user: v2, isNewUser: true, account: e12 };
          }
        }
        let k2 = await h2({ providerAccountId: c2.providerAccountId, provider: c2.provider });
        if (k2) {
          if (v2) {
            if (k2.id === v2.id) return { session: b2, user: v2, isNewUser: _2 };
            throw new tx("The account is already associated with another user", { provider: c2.provider });
          }
          return { session: b2 = S2 ? {} : await g2({ sessionToken: l2(), userId: k2.id, expires: oI(n10.session.maxAge) }), user: k2, isNewUser: _2 };
        }
        {
          let { provider: e11 } = n10, { type: r11, provider: i11, providerAccountId: o11, userId: s11, ...d3 } = c2;
          if (c2 = Object.assign(e11.account(d3) ?? {}, { providerAccountId: o11, provider: i11, type: r11, userId: s11 }), v2) return await m2({ ...c2, userId: v2.id }), await a10.linkAccount?.({ user: v2, account: c2, profile: t10 }), { session: b2, user: v2, isNewUser: _2 };
          let p3 = t10.email ? await f2(t10.email) : null;
          if (p3) {
            let e12 = n10.provider;
            if (e12?.allowDangerousEmailAccountLinking) v2 = p3, _2 = false;
            else throw new tx("Another account already exists with the same e-mail address", { provider: c2.provider });
          } else v2 = await u2({ ...t10, emailVerified: null }), _2 = true;
          return await a10.createUser?.({ user: v2 }), await m2({ ...c2, userId: v2.id }), await a10.linkAccount?.({ user: v2, account: c2, profile: t10 }), { session: b2 = S2 ? {} : await g2({ sessionToken: l2(), userId: v2.id, expires: oI(n10.session.maxAge) }), user: v2, isNewUser: _2 };
        }
      }
      function oN(e10, t10) {
        if (null == e10) return false;
        try {
          return e10 instanceof t10 || Object.getPrototypeOf(e10)[Symbol.toStringTag] === t10.prototype[Symbol.toStringTag];
        } catch {
          return false;
        }
      }
      "undefined" != typeof navigator && navigator.userAgent?.startsWith?.("Mozilla/5.0 ") || (o = "oauth4webapi/v3.8.7");
      let o$ = "ERR_INVALID_ARG_VALUE", oj = "ERR_INVALID_ARG_TYPE";
      function oL(e10, t10, r10) {
        let n10 = TypeError(e10, { cause: r10 });
        return Object.assign(n10, { code: t10 }), n10;
      }
      let oD = Symbol(), oM = Symbol(), oH = Symbol(), oW = Symbol(), oB = Symbol(), oq = Symbol(), oK = Symbol(), oV = new TextEncoder(), oz = new TextDecoder();
      function oJ(e10) {
        return "string" == typeof e10 ? oV.encode(e10) : oz.decode(e10);
      }
      function oF(e10) {
        return "string" == typeof e10 ? s(e10) : a(e10);
      }
      Uint8Array.prototype.toBase64 ? a = (e10) => (e10 instanceof ArrayBuffer && (e10 = new Uint8Array(e10)), e10.toBase64({ alphabet: "base64url", omitPadding: true })) : a = (e10) => {
        e10 instanceof ArrayBuffer && (e10 = new Uint8Array(e10));
        let t10 = [];
        for (let r10 = 0; r10 < e10.byteLength; r10 += 32768) t10.push(String.fromCharCode.apply(null, e10.subarray(r10, r10 + 32768)));
        return btoa(t10.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }, Uint8Array.fromBase64 ? s = (e10) => {
        try {
          return Uint8Array.fromBase64(e10, { alphabet: "base64url" });
        } catch (e11) {
          throw oL("The input to be decoded is not correctly encoded.", o$, e11);
        }
      } : s = (e10) => {
        try {
          let t10 = atob(e10.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")), r10 = new Uint8Array(t10.length);
          for (let e11 = 0; e11 < t10.length; e11++) r10[e11] = t10.charCodeAt(e11);
          return r10;
        } catch (e11) {
          throw oL("The input to be decoded is not correctly encoded.", o$, e11);
        }
      };
      class oG extends Error {
        code;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = a0, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class oX extends Error {
        code;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, t10?.code && (this.code = t10?.code), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      function oZ(e10, t10, r10) {
        return new oX(e10, { code: t10, cause: r10 });
      }
      function oY(e10) {
        return !(null === e10 || "object" != typeof e10 || Array.isArray(e10));
      }
      function oQ(e10) {
        oN(e10, Headers) && (e10 = Object.fromEntries(e10.entries()));
        let t10 = new Headers(e10 ?? {});
        if (o && !t10.has("user-agent") && t10.set("user-agent", o), t10.has("authorization")) throw oL('"options.headers" must not include the "authorization" header name', o$);
        return t10;
      }
      function o0(e10, t10) {
        if (void 0 !== t10) {
          if ("function" == typeof t10 && (t10 = t10(e10.href)), !(t10 instanceof AbortSignal)) throw oL('"options.signal" must return or be an instance of AbortSignal', oj);
          return t10;
        }
      }
      function o1(e10) {
        return e10.includes("//") ? e10.replace("//", "/") : e10;
      }
      async function o2(e10, t10, r10, n10) {
        if (!(e10 instanceof URL)) throw oL(`"${t10}" must be an instance of URL`, oj);
        au(e10, n10?.[oD] !== true);
        let i10 = r10(new URL(e10.href)), o10 = oQ(n10?.headers);
        return o10.set("accept", "application/json"), (n10?.[oW] || fetch)(i10.href, { body: void 0, headers: Object.fromEntries(o10.entries()), method: "GET", redirect: "manual", signal: o0(i10, n10?.signal) });
      }
      async function o3(e10, t10) {
        return o2(e10, "issuerIdentifier", (e11) => {
          switch (t10?.algorithm) {
            case void 0:
            case "oidc":
              e11.pathname = o1(`${e11.pathname}/.well-known/openid-configuration`);
              break;
            case "oauth2":
              !function(e12, t11, r10 = false) {
                "/" === e12.pathname ? e12.pathname = t11 : e12.pathname = o1(`${t11}/${r10 ? e12.pathname : e12.pathname.replace(/(\/)$/, "")}`);
              }(e11, ".well-known/oauth-authorization-server");
              break;
            default:
              throw oL('"options.algorithm" must be "oidc" (default), or "oauth2"', o$);
          }
          return e11;
        }, t10);
      }
      function o5(e10, t10, r10, n10, i10) {
        try {
          if ("number" != typeof e10 || !Number.isFinite(e10)) throw oL(`${r10} must be a number`, oj, i10);
          if (e10 > 0) return;
          if (t10) {
            if (0 !== e10) throw oL(`${r10} must be a non-negative number`, o$, i10);
            return;
          }
          throw oL(`${r10} must be a positive number`, o$, i10);
        } catch (e11) {
          if (n10) throw oZ(e11.message, n10, i10);
          throw e11;
        }
      }
      function o6(e10, t10, r10, n10) {
        try {
          if ("string" != typeof e10) throw oL(`${t10} must be a string`, oj, n10);
          if (0 === e10.length) throw oL(`${t10} must not be empty`, o$, n10);
        } catch (e11) {
          if (r10) throw oZ(e11.message, r10, n10);
          throw e11;
        }
      }
      async function o4(e10, t10) {
        if (!(e10 instanceof URL) && e10 !== sb) throw oL('"expectedIssuerIdentifier" must be an instance of URL', oj);
        if (!oN(t10, Response)) throw oL('"response" must be an instance of Response', oj);
        if (200 !== t10.status) throw oZ('"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)', a4, t10);
        so(t10);
        let r10 = await sw(t10);
        if (o6(r10.issuer, '"response" body "issuer" property', a5, { body: r10 }), e10 !== sb && new URL(r10.issuer).href !== e10.href) throw oZ('"response" body "issuer" property does not match the expected value', st, { expected: e10.href, body: r10, attribute: "issuer" });
        return r10;
      }
      function o8(e10) {
        !function(e11, t10) {
          if (aC(e11) !== t10) throw o9(e11, t10);
        }(e10, "application/json");
      }
      function o9(e10, ...t10) {
        let r10 = '"response" content-type must be ';
        if (t10.length > 2) {
          let e11 = t10.pop();
          r10 += `${t10.join(", ")}, or ${e11}`;
        } else 2 === t10.length ? r10 += `${t10[0]} or ${t10[1]}` : r10 += t10[0];
        return oZ(r10, a6, e10);
      }
      function o7() {
        return oF(crypto.getRandomValues(new Uint8Array(32)));
      }
      async function ae(e10) {
        return o6(e10, "codeVerifier"), oF(await crypto.subtle.digest("SHA-256", oJ(e10)));
      }
      function at(e10) {
        let t10 = e10?.[oM];
        return "number" == typeof t10 && Number.isFinite(t10) ? t10 : 0;
      }
      function ar(e10) {
        let t10 = e10?.[oH];
        return "number" == typeof t10 && Number.isFinite(t10) && -1 !== Math.sign(t10) ? t10 : 30;
      }
      function an() {
        return Math.floor(Date.now() / 1e3);
      }
      function ai(e10) {
        if ("object" != typeof e10 || null === e10) throw oL('"as" must be an object', oj);
        o6(e10.issuer, '"as.issuer"');
      }
      function ao(e10) {
        if ("object" != typeof e10 || null === e10) throw oL('"client" must be an object', oj);
        o6(e10.client_id, '"client.client_id"');
      }
      function aa(e10, t10) {
        let r10 = an() + at(t10);
        return { jti: o7(), aud: e10.issuer, exp: r10 + 60, iat: r10, nbf: r10, iss: t10.client_id, sub: t10.client_id };
      }
      async function as(e10, t10, r10) {
        if (!r10.usages.includes("sign")) throw oL('CryptoKey instances used for signing assertions must include "sign" in their "usages"', o$);
        let n10 = `${oF(oJ(JSON.stringify(e10)))}.${oF(oJ(JSON.stringify(t10)))}`, i10 = oF(await crypto.subtle.sign(sc(r10), r10, oJ(n10)));
        return `${n10}.${i10}`;
      }
      async function al(e10, t10) {
        let { kty: r10, e: n10, n: i10, x: o10, y: a10, crv: s10, pub: c2 } = await crypto.subtle.exportKey("jwk", e10), u2 = { kty: r10, e: n10, n: i10, x: o10, y: a10, crv: s10, pub: c2 };
        return "AKP" === r10 && (u2.alg = t10), l.set(e10, u2), u2;
      }
      let ac = URL.parse ? (e10, t10) => URL.parse(e10, t10) : (e10, t10) => {
        try {
          return new URL(e10, t10);
        } catch {
          return null;
        }
      };
      function au(e10, t10) {
        if (t10 && "https:" !== e10.protocol) throw oZ("only requests to HTTPS are allowed", a8, e10);
        if ("https:" !== e10.protocol && "http:" !== e10.protocol) throw oZ("only HTTP and HTTPS requests are allowed", a9, e10);
      }
      function ad(e10, t10, r10, n10) {
        let i10;
        if ("string" != typeof e10 || !(i10 = ac(e10))) throw oZ(`authorization server metadata does not contain a valid ${r10 ? `"as.mtls_endpoint_aliases.${t10}"` : `"as.${t10}"`}`, void 0 === e10 ? sn : si, { attribute: r10 ? `mtls_endpoint_aliases.${t10}` : t10 });
        return au(i10, n10), i10;
      }
      function ap(e10, t10, r10, n10) {
        return r10 && e10.mtls_endpoint_aliases && t10 in e10.mtls_endpoint_aliases ? ad(e10.mtls_endpoint_aliases[t10], t10, r10, n10) : ad(e10[t10], t10, r10, n10);
      }
      class ah extends Error {
        cause;
        code;
        error;
        status;
        error_description;
        response;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = aQ, this.cause = t10.cause, this.error = t10.cause.error, this.status = t10.response.status, this.error_description = t10.cause.error_description, Object.defineProperty(this, "response", { enumerable: false, value: t10.response }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class af extends Error {
        cause;
        code;
        error;
        error_description;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = a1, this.cause = t10.cause, this.error = t10.cause.get("error"), this.error_description = t10.cause.get("error_description") ?? void 0, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class am extends Error {
        cause;
        code;
        response;
        status;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = aY, this.cause = t10.cause, this.status = t10.response.status, this.response = t10.response, Object.defineProperty(this, "response", { enumerable: false }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      let ag = "[a-zA-Z0-9!#$%&\\'\\*\\+\\-\\.\\^_`\\|~]+", ay = RegExp("^[,\\s]*(" + ag + ")"), aw = RegExp("^[,\\s]*(" + ag + ')\\s*=\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"[,\\s]*(.*)'), ab = RegExp("^[,\\s]*(" + ag + ")\\s*=\\s*(" + ag + ")[,\\s]*(.*)"), av = RegExp("^([a-zA-Z0-9\\-\\._\\~\\+\\/]+={0,2})(?:$|[,\\s])(.*)");
      async function a_(e10) {
        if (e10.status > 399 && e10.status < 500) {
          so(e10), o8(e10);
          try {
            let t10 = await e10.clone().json();
            if (oY(t10) && "string" == typeof t10.error && t10.error.length) return t10;
          } catch {
          }
        }
      }
      async function aS(e10, t10, r10) {
        if (e10.status !== t10) {
          let t11;
          if (aL(e10), t11 = await a_(e10)) throw await e10.body?.cancel(), new ah("server responded with an error in the response body", { cause: t11, response: e10 });
          throw oZ(`"response" is not a conform ${r10} response (unexpected HTTP status code)`, a4, e10);
        }
      }
      function ak(e10) {
        if (!aB.has(e10)) throw oL('"options.DPoP" is not a valid DPoPHandle', o$);
      }
      async function ax(e10, t10, r10, n10, i10, o10) {
        if (o6(e10, '"accessToken"'), !(r10 instanceof URL)) throw oL('"url" must be an instance of URL', oj);
        au(r10, o10?.[oD] !== true), n10 = oQ(n10), o10?.DPoP && (ak(o10.DPoP), await o10.DPoP.addProof(r10, n10, t10.toUpperCase(), e10)), n10.set("authorization", `${n10.has("dpop") ? "DPoP" : "Bearer"} ${e10}`);
        let a10 = await (o10?.[oW] || fetch)(r10.href, { duplex: oN(i10, ReadableStream) ? "half" : void 0, body: i10, headers: Object.fromEntries(n10.entries()), method: t10, redirect: "manual", signal: o0(r10, o10?.signal) });
        return o10?.DPoP?.cacheNonce(a10, r10), a10;
      }
      async function aE(e10, t10, r10, n10) {
        ai(e10), ao(t10);
        let i10 = ap(e10, "userinfo_endpoint", t10.use_mtls_endpoint_aliases, n10?.[oD] !== true), o10 = oQ(n10?.headers);
        return t10.userinfo_signed_response_alg ? o10.set("accept", "application/jwt") : (o10.set("accept", "application/json"), o10.append("accept", "application/jwt")), ax(r10, "GET", i10, o10, null, { ...n10, [oM]: at(t10) });
      }
      function aA(e10, t10, r10, n10) {
        (c ||= /* @__PURE__ */ new WeakMap()).set(e10, { jwks: t10, uat: r10, get age() {
          return an() - this.uat;
        } }), n10 && Object.assign(n10, { jwks: structuredClone(t10), uat: r10 });
      }
      function aT(e10, t10) {
        c?.delete(e10), delete t10?.jwks, delete t10?.uat;
      }
      let aP = Symbol();
      function aC(e10) {
        return e10.headers.get("content-type")?.split(";")[0];
      }
      async function aR(e10, t10, r10, n10, i10) {
        let o10;
        if (ai(e10), ao(t10), !oN(n10, Response)) throw oL('"response" must be an instance of Response', oj);
        if (aL(n10), 200 !== n10.status) throw oZ('"response" is not a conform UserInfo Endpoint response (unexpected HTTP status code)', a4, n10);
        if (so(n10), "application/jwt" === aC(n10)) {
          let { claims: r11, jwt: a10 } = await su(await n10.text(), sh.bind(void 0, t10.userinfo_signed_response_alg, e10.userinfo_signing_alg_values_supported, void 0), at(t10), ar(t10), i10?.[oq]).then(aD.bind(void 0, t10.client_id)).then(aH.bind(void 0, e10));
          aN.set(n10, a10), o10 = r11;
        } else {
          if (t10.userinfo_signed_response_alg) throw oZ("JWT UserInfo Response expected", a2, n10);
          o10 = await sw(n10);
        }
        if (o6(o10.sub, '"response" body "sub" property', a5, { body: o10 }), r10 === aP) ;
        else if (o6(r10, '"expectedSubject"'), o10.sub !== r10) throw oZ('unexpected "response" body "sub" property value', st, { expected: r10, body: o10, attribute: "sub" });
        return o10;
      }
      async function aO(e10, t10, r10, n10, i10, o10, a10) {
        return await r10(e10, t10, i10, o10), o10.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"), (a10?.[oW] || fetch)(n10.href, { body: i10, headers: Object.fromEntries(o10.entries()), method: "POST", redirect: "manual", signal: o0(n10, a10?.signal) });
      }
      async function aI(e10, t10, r10, n10, i10, o10) {
        let a10 = ap(e10, "token_endpoint", t10.use_mtls_endpoint_aliases, o10?.[oD] !== true);
        i10.set("grant_type", n10);
        let s10 = oQ(o10?.headers);
        s10.set("accept", "application/json"), o10?.DPoP !== void 0 && (ak(o10.DPoP), await o10.DPoP.addProof(a10, s10, "POST"));
        let l2 = await aO(e10, t10, r10, a10, i10, s10, o10);
        return o10?.DPoP?.cacheNonce(l2, a10), l2;
      }
      let aU = /* @__PURE__ */ new WeakMap(), aN = /* @__PURE__ */ new WeakMap();
      function a$(e10) {
        if (!e10.id_token) return;
        let t10 = aU.get(e10);
        if (!t10) throw oL('"ref" was already garbage collected or did not resolve from the proper sources', o$);
        return t10;
      }
      async function aj(e10, t10, r10, n10, i10, o10) {
        if (ai(e10), ao(t10), !oN(r10, Response)) throw oL('"response" must be an instance of Response', oj);
        await aS(r10, 200, "Token Endpoint"), so(r10);
        let a10 = await sw(r10);
        if (o6(a10.access_token, '"response" body "access_token" property', a5, { body: a10 }), o6(a10.token_type, '"response" body "token_type" property', a5, { body: a10 }), a10.token_type = a10.token_type.toLowerCase(), void 0 !== a10.expires_in) {
          let e11 = "number" != typeof a10.expires_in ? parseFloat(a10.expires_in) : a10.expires_in;
          o5(e11, true, '"response" body "expires_in" property', a5, { body: a10 }), a10.expires_in = e11;
        }
        if (void 0 !== a10.refresh_token && o6(a10.refresh_token, '"response" body "refresh_token" property', a5, { body: a10 }), void 0 !== a10.scope && "string" != typeof a10.scope) throw oZ('"response" body "scope" property must be a string', a5, { body: a10 });
        if (void 0 !== a10.id_token) {
          o6(a10.id_token, '"response" body "id_token" property', a5, { body: a10 });
          let o11 = ["aud", "exp", "iat", "iss", "sub"];
          true === t10.require_auth_time && o11.push("auth_time"), void 0 !== t10.default_max_age && (o5(t10.default_max_age, true, '"client.default_max_age"'), o11.push("auth_time")), n10?.length && o11.push(...n10);
          let { claims: s10, jwt: l2 } = await su(a10.id_token, sh.bind(void 0, t10.id_token_signed_response_alg, e10.id_token_signing_alg_values_supported, "RS256"), at(t10), ar(t10), i10).then(az.bind(void 0, o11)).then(aW.bind(void 0, e10)).then(aM.bind(void 0, t10.client_id));
          if (Array.isArray(s10.aud) && 1 !== s10.aud.length) {
            if (void 0 === s10.azp) throw oZ('ID Token "aud" (audience) claim includes additional untrusted audiences', se, { claims: s10, claim: "aud" });
            if (s10.azp !== t10.client_id) throw oZ('unexpected ID Token "azp" (authorized party) claim value', se, { expected: t10.client_id, claims: s10, claim: "azp" });
          }
          void 0 !== s10.auth_time && o5(s10.auth_time, true, 'ID Token "auth_time" (authentication time)', a5, { claims: s10 }), aN.set(r10, l2), aU.set(a10, s10);
        }
        if (o10?.[a10.token_type] !== void 0) o10[a10.token_type](r10, a10);
        else if ("dpop" !== a10.token_type && "bearer" !== a10.token_type) throw new oG("unsupported `token_type` value", { cause: { body: a10 } });
        return a10;
      }
      function aL(e10) {
        let t10;
        if (t10 = function(e11) {
          if (!oN(e11, Response)) throw oL('"response" must be an instance of Response', oj);
          let t11 = e11.headers.get("www-authenticate");
          if (null === t11) return;
          let r10 = [], n10 = t11;
          for (; n10; ) {
            let e12, t12 = n10.match(ay), i10 = t12?.["1"].toLowerCase();
            if (!i10) return;
            let o10 = n10.substring(t12[0].length);
            if (o10 && !o10.match(/^[\s,]/)) return;
            let a10 = o10.match(/^\s+(.*)$/), s10 = !!a10;
            n10 = a10 ? a10[1] : void 0;
            let l2 = {};
            if (s10) for (; n10; ) {
              let r11, i11;
              if (t12 = n10.match(aw)) {
                if ([, r11, i11, n10] = t12, i11.includes("\\")) try {
                  i11 = JSON.parse(`"${i11}"`);
                } catch {
                }
                l2[r11.toLowerCase()] = i11;
                continue;
              }
              if (t12 = n10.match(ab)) {
                [, r11, i11, n10] = t12, l2[r11.toLowerCase()] = i11;
                continue;
              }
              if (t12 = n10.match(av)) {
                if (Object.keys(l2).length) break;
                [, e12, n10] = t12;
                break;
              }
              return;
            }
            else n10 = o10 || void 0;
            let c2 = { scheme: i10, parameters: l2 };
            e12 && (c2.token68 = e12), r10.push(c2);
          }
          if (r10.length) return r10;
        }(e10)) throw new am("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: t10, response: e10 });
      }
      function aD(e10, t10) {
        return void 0 !== t10.claims.aud ? aM(e10, t10) : t10;
      }
      function aM(e10, t10) {
        if (Array.isArray(t10.claims.aud)) {
          if (!t10.claims.aud.includes(e10)) throw oZ('unexpected JWT "aud" (audience) claim value', se, { expected: e10, claims: t10.claims, claim: "aud" });
        } else if (t10.claims.aud !== e10) throw oZ('unexpected JWT "aud" (audience) claim value', se, { expected: e10, claims: t10.claims, claim: "aud" });
        return t10;
      }
      function aH(e10, t10) {
        return void 0 !== t10.claims.iss ? aW(e10, t10) : t10;
      }
      function aW(e10, t10) {
        let r10 = e10[sv]?.(t10) ?? e10.issuer;
        if (t10.claims.iss !== r10) throw oZ('unexpected JWT "iss" (issuer) claim value', se, { expected: r10, claims: t10.claims, claim: "iss" });
        return t10;
      }
      let aB = /* @__PURE__ */ new WeakSet(), aq = Symbol();
      async function aK(e10, t10, r10, n10, i10, o10, a10) {
        if (ai(e10), ao(t10), !aB.has(n10)) throw oL('"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()', o$);
        o6(i10, '"redirectUri"');
        let s10 = sf(n10, "code");
        if (!s10) throw oZ('no authorization code in "callbackParameters"', a5);
        let l2 = new URLSearchParams(a10?.additionalParameters);
        return l2.set("redirect_uri", i10), l2.set("code", s10), o10 !== aq && (o6(o10, '"codeVerifier"'), l2.set("code_verifier", o10)), aI(e10, t10, r10, "authorization_code", l2, a10);
      }
      let aV = { aud: "audience", c_hash: "code hash", client_id: "client id", exp: "expiration time", iat: "issued at", iss: "issuer", jti: "jwt id", nonce: "nonce", s_hash: "state hash", sub: "subject", ath: "access token hash", htm: "http method", htu: "http uri", cnf: "confirmation", auth_time: "authentication time" };
      function az(e10, t10) {
        for (let r10 of e10) if (void 0 === t10.claims[r10]) throw oZ(`JWT "${r10}" (${aV[r10]}) claim missing`, a5, { claims: t10.claims });
        return t10;
      }
      let aJ = Symbol(), aF = Symbol();
      async function aG(e10, t10, r10, n10) {
        return "string" == typeof n10?.expectedNonce || "number" == typeof n10?.maxAge || n10?.requireIdToken ? aX(e10, t10, r10, n10.expectedNonce, n10.maxAge, n10[oq], n10.recognizedTokenTypes) : aZ(e10, t10, r10, n10?.[oq], n10?.recognizedTokenTypes);
      }
      async function aX(e10, t10, r10, n10, i10, o10, a10) {
        let s10 = [];
        switch (n10) {
          case void 0:
            n10 = aJ;
            break;
          case aJ:
            break;
          default:
            o6(n10, '"expectedNonce" argument'), s10.push("nonce");
        }
        switch (i10 ??= t10.default_max_age) {
          case void 0:
            i10 = aF;
            break;
          case aF:
            break;
          default:
            o5(i10, true, '"maxAge" argument'), s10.push("auth_time");
        }
        let l2 = await aj(e10, t10, r10, s10, o10, a10);
        o6(l2.id_token, '"response" body "id_token" property', a5, { body: l2 });
        let c2 = a$(l2);
        if (i10 !== aF) {
          let e11 = an() + at(t10), r11 = ar(t10);
          if (c2.auth_time + i10 < e11 - r11) throw oZ("too much time has elapsed since the last End-User authentication", a7, { claims: c2, now: e11, tolerance: r11, claim: "auth_time" });
        }
        if (n10 === aJ) {
          if (void 0 !== c2.nonce) throw oZ('unexpected ID Token "nonce" claim value', se, { expected: void 0, claims: c2, claim: "nonce" });
        } else if (c2.nonce !== n10) throw oZ('unexpected ID Token "nonce" claim value', se, { expected: n10, claims: c2, claim: "nonce" });
        return l2;
      }
      async function aZ(e10, t10, r10, n10, i10) {
        let o10 = await aj(e10, t10, r10, void 0, n10, i10), a10 = a$(o10);
        if (a10) {
          if (void 0 !== t10.default_max_age) {
            o5(t10.default_max_age, true, '"client.default_max_age"');
            let e11 = an() + at(t10), r11 = ar(t10);
            if (a10.auth_time + t10.default_max_age < e11 - r11) throw oZ("too much time has elapsed since the last End-User authentication", a7, { claims: a10, now: e11, tolerance: r11, claim: "auth_time" });
          }
          if (void 0 !== a10.nonce) throw oZ('unexpected ID Token "nonce" claim value', se, { expected: void 0, claims: a10, claim: "nonce" });
        }
        return o10;
      }
      let aY = "OAUTH_WWW_AUTHENTICATE_CHALLENGE", aQ = "OAUTH_RESPONSE_BODY_ERROR", a0 = "OAUTH_UNSUPPORTED_OPERATION", a1 = "OAUTH_AUTHORIZATION_RESPONSE_ERROR", a2 = "OAUTH_JWT_USERINFO_EXPECTED", a3 = "OAUTH_PARSE_ERROR", a5 = "OAUTH_INVALID_RESPONSE", a6 = "OAUTH_RESPONSE_IS_NOT_JSON", a4 = "OAUTH_RESPONSE_IS_NOT_CONFORM", a8 = "OAUTH_HTTP_REQUEST_FORBIDDEN", a9 = "OAUTH_REQUEST_PROTOCOL_FORBIDDEN", a7 = "OAUTH_JWT_TIMESTAMP_CHECK_FAILED", se = "OAUTH_JWT_CLAIM_COMPARISON_FAILED", st = "OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED", sr = "OAUTH_KEY_SELECTION_FAILED", sn = "OAUTH_MISSING_SERVER_METADATA", si = "OAUTH_INVALID_SERVER_METADATA";
      function so(e10) {
        if (e10.bodyUsed) throw oL('"response" body has been used already', o$);
      }
      async function sa(e10, t10) {
        ai(e10);
        let r10 = ap(e10, "jwks_uri", false, t10?.[oD] !== true), n10 = oQ(t10?.headers);
        return n10.set("accept", "application/json"), n10.append("accept", "application/jwk-set+json"), (t10?.[oW] || fetch)(r10.href, { body: void 0, headers: Object.fromEntries(n10.entries()), method: "GET", redirect: "manual", signal: o0(r10, t10?.signal) });
      }
      async function ss(e10) {
        if (!oN(e10, Response)) throw oL('"response" must be an instance of Response', oj);
        if (200 !== e10.status) throw oZ('"response" is not a conform JSON Web Key Set response (unexpected HTTP status code)', a4, e10);
        so(e10);
        let t10 = await sw(e10, (e11) => function(e12, ...t11) {
          if (!t11.includes(aC(e12))) throw o9(e12, ...t11);
        }(e11, "application/json", "application/jwk-set+json"));
        if (!Array.isArray(t10.keys)) throw oZ('"response" body "keys" property must be an array', a5, { body: t10 });
        if (!Array.prototype.every.call(t10.keys, oY)) throw oZ('"response" body "keys" property members must be JWK formatted objects', a5, { body: t10 });
        return t10;
      }
      function sl(e10) {
        let { algorithm: t10 } = e10;
        if ("number" != typeof t10.modulusLength || t10.modulusLength < 2048) throw new oG(`unsupported ${t10.name} modulusLength`, { cause: e10 });
      }
      function sc(e10) {
        switch (e10.algorithm.name) {
          case "ECDSA":
            return { name: e10.algorithm.name, hash: function(e11) {
              let { algorithm: t10 } = e11;
              switch (t10.namedCurve) {
                case "P-256":
                  return "SHA-256";
                case "P-384":
                  return "SHA-384";
                case "P-521":
                  return "SHA-512";
                default:
                  throw new oG("unsupported ECDSA namedCurve", { cause: e11 });
              }
            }(e10) };
          case "RSA-PSS":
            switch (sl(e10), e10.algorithm.hash.name) {
              case "SHA-256":
              case "SHA-384":
              case "SHA-512":
                return { name: e10.algorithm.name, saltLength: parseInt(e10.algorithm.hash.name.slice(-3), 10) >> 3 };
              default:
                throw new oG("unsupported RSA-PSS hash name", { cause: e10 });
            }
          case "RSASSA-PKCS1-v1_5":
            return sl(e10), e10.algorithm.name;
          case "ML-DSA-44":
          case "ML-DSA-65":
          case "ML-DSA-87":
          case "Ed25519":
            return e10.algorithm.name;
        }
        throw new oG("unsupported CryptoKey algorithm name", { cause: e10 });
      }
      async function su(e10, t10, r10, n10, i10) {
        let o10, a10, { 0: s10, 1: l2, length: c2 } = e10.split(".");
        if (5 === c2) {
          if (void 0 !== i10) e10 = await i10(e10), { 0: s10, 1: l2, length: c2 } = e10.split(".");
          else throw new oG("JWE decryption is not configured", { cause: e10 });
        }
        if (3 !== c2) throw oZ("Invalid JWT", a5, e10);
        try {
          o10 = JSON.parse(oJ(oF(s10)));
        } catch (e11) {
          throw oZ("failed to parse JWT Header body as base64url encoded JSON", a3, e11);
        }
        if (!oY(o10)) throw oZ("JWT Header must be a top level object", a5, e10);
        if (t10(o10), void 0 !== o10.crit) throw new oG('no JWT "crit" header parameter extensions are supported', { cause: { header: o10 } });
        try {
          a10 = JSON.parse(oJ(oF(l2)));
        } catch (e11) {
          throw oZ("failed to parse JWT Payload body as base64url encoded JSON", a3, e11);
        }
        if (!oY(a10)) throw oZ("JWT Payload must be a top level object", a5, e10);
        let u2 = an() + r10;
        if (void 0 !== a10.exp) {
          if ("number" != typeof a10.exp) throw oZ('unexpected JWT "exp" (expiration time) claim type', a5, { claims: a10 });
          if (a10.exp <= u2 - n10) throw oZ('unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp', a7, { claims: a10, now: u2, tolerance: n10, claim: "exp" });
        }
        if (void 0 !== a10.iat && "number" != typeof a10.iat) throw oZ('unexpected JWT "iat" (issued at) claim type', a5, { claims: a10 });
        if (void 0 !== a10.iss && "string" != typeof a10.iss) throw oZ('unexpected JWT "iss" (issuer) claim type', a5, { claims: a10 });
        if (void 0 !== a10.nbf) {
          if ("number" != typeof a10.nbf) throw oZ('unexpected JWT "nbf" (not before) claim type', a5, { claims: a10 });
          if (a10.nbf > u2 + n10) throw oZ('unexpected JWT "nbf" (not before) claim value', a7, { claims: a10, now: u2, tolerance: n10, claim: "nbf" });
        }
        if (void 0 !== a10.aud && "string" != typeof a10.aud && !Array.isArray(a10.aud)) throw oZ('unexpected JWT "aud" (audience) claim type', a5, { claims: a10 });
        return { header: o10, claims: a10, jwt: e10 };
      }
      async function sd(e10, t10, r10) {
        let n10;
        switch (t10.alg) {
          case "RS256":
          case "PS256":
          case "ES256":
            n10 = "SHA-256";
            break;
          case "RS384":
          case "PS384":
          case "ES384":
            n10 = "SHA-384";
            break;
          case "RS512":
          case "PS512":
          case "ES512":
          case "Ed25519":
          case "EdDSA":
            n10 = "SHA-512";
            break;
          case "ML-DSA-44":
          case "ML-DSA-65":
          case "ML-DSA-87":
            n10 = { name: "cSHAKE256", length: 512, outputLength: 512 };
            break;
          default:
            throw new oG(`unsupported JWS algorithm for ${r10} calculation`, { cause: { alg: t10.alg } });
        }
        let i10 = await crypto.subtle.digest(n10, oJ(e10));
        return oF(i10.slice(0, i10.byteLength / 2));
      }
      async function sp(e10) {
        if (e10.bodyUsed) throw oL("form_post Request instances must contain a readable body", o$, { cause: e10 });
        return e10.text();
      }
      function sh(e10, t10, r10, n10) {
        if (void 0 !== e10) {
          if ("string" == typeof e10 ? n10.alg !== e10 : !e10.includes(n10.alg)) throw oZ('unexpected JWT "alg" header parameter', a5, { header: n10, expected: e10, reason: "client configuration" });
          return;
        }
        if (Array.isArray(t10)) {
          if (!t10.includes(n10.alg)) throw oZ('unexpected JWT "alg" header parameter', a5, { header: n10, expected: t10, reason: "authorization server metadata" });
          return;
        }
        if (void 0 !== r10) {
          if ("string" == typeof r10 ? n10.alg !== r10 : "function" == typeof r10 ? !r10(n10.alg) : !r10.includes(n10.alg)) throw oZ('unexpected JWT "alg" header parameter', a5, { header: n10, expected: r10, reason: "default value" });
          return;
        }
        throw oZ('missing client or server configuration to verify used JWT "alg" header parameter', void 0, { client: e10, issuer: t10, fallback: r10 });
      }
      function sf(e10, t10) {
        let { 0: r10, length: n10 } = e10.getAll(t10);
        if (n10 > 1) throw oZ(`"${t10}" parameter must be provided only once`, a5);
        return r10;
      }
      let sm = Symbol(), sg = Symbol();
      async function sy(e10, t10) {
        let { ext: r10, key_ops: n10, use: i10, ...o10 } = t10;
        return crypto.subtle.importKey("jwk", o10, function(e11) {
          switch (e11) {
            case "PS256":
            case "PS384":
            case "PS512":
              return { name: "RSA-PSS", hash: `SHA-${e11.slice(-3)}` };
            case "RS256":
            case "RS384":
            case "RS512":
              return { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${e11.slice(-3)}` };
            case "ES256":
            case "ES384":
              return { name: "ECDSA", namedCurve: `P-${e11.slice(-3)}` };
            case "ES512":
              return { name: "ECDSA", namedCurve: "P-521" };
            case "EdDSA":
              return "Ed25519";
            case "Ed25519":
            case "ML-DSA-44":
            case "ML-DSA-65":
            case "ML-DSA-87":
              return e11;
            default:
              throw new oG("unsupported JWS algorithm", { cause: { alg: e11 } });
          }
        }(e10), true, ["verify"]);
      }
      async function sw(e10, t10 = o8) {
        let r10;
        try {
          r10 = await e10.json();
        } catch (r11) {
          throw t10(e10), oZ('failed to parse "response" body as JSON', a3, r11);
        }
        if (!oY(r10)) throw oZ('"response" body must be a top level object', a5, { body: r10 });
        return r10;
      }
      let sb = Symbol(), sv = Symbol();
      async function s_(e10, t10, r10) {
        let { cookies: n10, logger: i10 } = r10, o10 = n10[e10], a10 = /* @__PURE__ */ new Date();
        a10.setTime(a10.getTime() + 9e5), i10.debug(`CREATE_${e10.toUpperCase()}`, { name: o10.name, payload: t10, COOKIE_TTL: 900, expires: a10 });
        let s10 = await n9({ ...r10.jwt, maxAge: 900, token: { value: t10, provider: r10.provider.id }, salt: o10.name }), l2 = { ...o10.options, expires: a10 };
        return { name: o10.name, value: s10, options: l2 };
      }
      async function sS(e10, t10, r10) {
        try {
          let { logger: n10, cookies: i10, jwt: o10 } = r10;
          if (n10.debug(`PARSE_${e10.toUpperCase()}`, { cookie: t10 }), !t10) throw new tw(`${e10} cookie was missing`);
          let a10 = await n7({ ...o10, token: t10, salt: i10[e10].name });
          if (!a10?.value) throw Error("Invalid cookie");
          if (a10.provider !== r10.provider?.id) throw Error(`${e10} cookie was created for a different provider than the one handling the callback`);
          return a10.value;
        } catch (t11) {
          throw new tw(`${e10} value could not be parsed`, { cause: t11 });
        }
      }
      function sk(e10, t10, r10) {
        let { logger: n10, cookies: i10 } = t10, o10 = i10[e10];
        n10.debug(`CLEAR_${e10.toUpperCase()}`, { cookie: o10 }), r10.push({ name: o10.name, value: "", options: { ...i10[e10].options, maxAge: 0 } });
      }
      function sx(e10, t10) {
        return async function(r10, n10, i10) {
          let { provider: o10, logger: a10 } = i10;
          if (!o10?.checks?.includes(e10)) return;
          let s10 = r10?.[i10.cookies[t10].name];
          a10.debug(`USE_${t10.toUpperCase()}`, { value: s10 });
          let l2 = await sS(t10, s10, i10);
          return sk(t10, i10, n10), l2;
        };
      }
      let sE = { async create(e10) {
        let t10 = o7(), r10 = await ae(t10);
        return { cookie: await s_("pkceCodeVerifier", t10, e10), value: r10 };
      }, use: sx("pkce", "pkceCodeVerifier") }, sA = "encodedState", sT = { async create(e10, t10) {
        let { provider: r10 } = e10;
        if (!r10.checks.includes("state")) {
          if (t10) throw new tw("State data was provided but the provider is not configured to use state");
          return;
        }
        let n10 = { origin: t10, random: o7() }, i10 = await n9({ secret: e10.jwt.secret, token: n10, salt: sA, maxAge: 900 });
        return { cookie: await s_("state", i10, e10), value: i10 };
      }, use: sx("state", "state"), async decode(e10, t10) {
        try {
          t10.logger.debug("DECODE_STATE", { state: e10 });
          let r10 = await n7({ secret: t10.jwt.secret, token: e10, salt: sA });
          if (r10) return r10;
          throw Error("Invalid state");
        } catch (e11) {
          throw new tw("State could not be decoded", { cause: e11 });
        }
      } }, sP = { async create(e10) {
        if (!e10.provider.checks.includes("nonce")) return;
        let t10 = o7();
        return { cookie: await s_("nonce", t10, e10), value: t10 };
      }, use: sx("nonce", "nonce") }, sC = "encodedWebauthnChallenge", sR = { create: async (e10, t10, r10) => ({ cookie: await s_("webauthnChallenge", await n9({ secret: e10.jwt.secret, token: { challenge: t10, registerData: r10 }, salt: sC, maxAge: 900 }), e10) }), async use(e10, t10, r10) {
        let n10 = t10?.[e10.cookies.webauthnChallenge.name], i10 = await sS("webauthnChallenge", n10, e10), o10 = await n7({ secret: e10.jwt.secret, token: i10, salt: sC });
        if (sk("webauthnChallenge", e10, r10), !o10) throw new tw("WebAuthn challenge was missing");
        return o10;
      } };
      function sO(e10) {
        return encodeURIComponent(e10).replace(/%20/g, "+");
      }
      async function sI(e10, t10, r10) {
        let n10, i10, o10;
        let { logger: a10, provider: s10 } = r10, { token: l2, userinfo: c2 } = s10;
        if (l2?.url && "authjs.dev" !== l2.url.host || c2?.url && "authjs.dev" !== c2.url.host) n10 = { issuer: s10.issuer ?? "https://authjs.dev", token_endpoint: l2?.url.toString(), userinfo_endpoint: c2?.url.toString() };
        else {
          let e11 = new URL(s10.issuer), t11 = await o3(e11, { [oD]: true, [oW]: s10[iS] });
          if (!(n10 = await o4(e11, t11)).token_endpoint) throw TypeError("TODO: Authorization server did not provide a token endpoint.");
          if (!n10.userinfo_endpoint) throw TypeError("TODO: Authorization server did not provide a userinfo endpoint.");
        }
        let u2 = { client_id: s10.clientId, ...s10.client };
        switch (u2.token_endpoint_auth_method) {
          case void 0:
          case "client_secret_basic":
            i10 = (e11, t11, r11, n11) => {
              n11.set("authorization", function(e12, t12) {
                let r12 = sO(e12), n12 = sO(t12), i11 = btoa(`${r12}:${n12}`);
                return `Basic ${i11}`;
              }(s10.clientId, s10.clientSecret));
            };
            break;
          case "client_secret_post":
            var d2;
            o6(d2 = s10.clientSecret, '"clientSecret"'), i10 = (e11, t11, r11, n11) => {
              r11.set("client_id", t11.client_id), r11.set("client_secret", d2);
            };
            break;
          case "client_secret_jwt":
            i10 = function(e11, t11) {
              let r11;
              o6(e11, '"clientSecret"');
              let n11 = void 0;
              return async (t12, i11, o11, a11) => {
                r11 ||= await crypto.subtle.importKey("raw", oJ(e11), { hash: "SHA-256", name: "HMAC" }, false, ["sign"]);
                let s11 = { alg: "HS256" }, l3 = aa(t12, i11);
                n11?.(s11, l3);
                let c3 = `${oF(oJ(JSON.stringify(s11)))}.${oF(oJ(JSON.stringify(l3)))}`, u3 = await crypto.subtle.sign(r11.algorithm, r11, oJ(c3));
                o11.set("client_id", i11.client_id), o11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), o11.set("client_assertion", `${c3}.${oF(new Uint8Array(u3))}`);
              };
            }(s10.clientSecret);
            break;
          case "private_key_jwt":
            i10 = function(e11, t11) {
              let { key: r11, kid: n11 } = e11 instanceof CryptoKey ? { key: e11 } : e11?.key instanceof CryptoKey ? (void 0 !== e11.kid && o6(e11.kid, '"kid"'), { key: e11.key, kid: e11.kid }) : {};
              return function(e12, t12) {
                if (function(e13, t13) {
                  if (!(e13 instanceof CryptoKey)) throw oL(`${t13} must be a CryptoKey`, oj);
                }(e12, t12), "private" !== e12.type) throw oL(`${t12} must be a private CryptoKey`, o$);
              }(r11, '"clientPrivateKey.key"'), async (e12, i11, o11, a11) => {
                let s11 = { alg: function(e13) {
                  switch (e13.algorithm.name) {
                    case "RSA-PSS":
                      return function(e14) {
                        switch (e14.algorithm.hash.name) {
                          case "SHA-256":
                            return "PS256";
                          case "SHA-384":
                            return "PS384";
                          case "SHA-512":
                            return "PS512";
                          default:
                            throw new oG("unsupported RsaHashedKeyAlgorithm hash name", { cause: e14 });
                        }
                      }(e13);
                    case "RSASSA-PKCS1-v1_5":
                      return function(e14) {
                        switch (e14.algorithm.hash.name) {
                          case "SHA-256":
                            return "RS256";
                          case "SHA-384":
                            return "RS384";
                          case "SHA-512":
                            return "RS512";
                          default:
                            throw new oG("unsupported RsaHashedKeyAlgorithm hash name", { cause: e14 });
                        }
                      }(e13);
                    case "ECDSA":
                      return function(e14) {
                        switch (e14.algorithm.namedCurve) {
                          case "P-256":
                            return "ES256";
                          case "P-384":
                            return "ES384";
                          case "P-521":
                            return "ES512";
                          default:
                            throw new oG("unsupported EcKeyAlgorithm namedCurve", { cause: e14 });
                        }
                      }(e13);
                    case "Ed25519":
                    case "ML-DSA-44":
                    case "ML-DSA-65":
                    case "ML-DSA-87":
                      return e13.algorithm.name;
                    case "EdDSA":
                      return "Ed25519";
                    default:
                      throw new oG("unsupported CryptoKey algorithm name", { cause: e13 });
                  }
                }(r11), kid: n11 }, l3 = aa(e12, i11);
                t11?.[oB]?.(s11, l3), o11.set("client_id", i11.client_id), o11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), o11.set("client_assertion", await as(s11, l3, r11));
              };
            }(s10.token.clientPrivateKey, { [oB](e11, t11) {
              t11.aud = [n10.issuer, n10.token_endpoint];
            } });
            break;
          case "none":
            i10 = (e11, t11, r11, n11) => {
              r11.set("client_id", t11.client_id);
            };
            break;
          default:
            throw Error("unsupported client authentication method");
        }
        let p2 = [], h2 = await sT.use(t10, p2, r10);
        try {
          o10 = function(e11, t11, r11, n11) {
            var i11;
            if (ai(e11), ao(t11), r11 instanceof URL && (r11 = r11.searchParams), !(r11 instanceof URLSearchParams)) throw oL('"parameters" must be an instance of URLSearchParams, or URL', oj);
            if (sf(r11, "response")) throw oZ('"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()', a5, { parameters: r11 });
            let o11 = sf(r11, "iss"), a11 = sf(r11, "state");
            if (!o11 && e11.authorization_response_iss_parameter_supported) throw oZ('response parameter "iss" (issuer) missing', a5, { parameters: r11 });
            if (o11 && o11 !== e11.issuer) throw oZ('unexpected "iss" (issuer) response parameter value', a5, { expected: e11.issuer, parameters: r11 });
            switch (n11) {
              case void 0:
              case sg:
                if (void 0 !== a11) throw oZ('unexpected "state" response parameter encountered', a5, { expected: void 0, parameters: r11 });
                break;
              case sm:
                break;
              default:
                if (o6(n11, '"expectedState" argument'), a11 !== n11) throw oZ(void 0 === a11 ? 'response parameter "state" missing' : 'unexpected "state" response parameter value', a5, { expected: n11, parameters: r11 });
            }
            if (sf(r11, "error")) throw new af("authorization response from the server is an error", { cause: r11 });
            let s11 = sf(r11, "id_token"), l3 = sf(r11, "token");
            if (void 0 !== s11 || void 0 !== l3) throw new oG("implicit and hybrid flows are not supported");
            return i11 = new URLSearchParams(r11), aB.add(i11), i11;
          }(n10, u2, new URLSearchParams(e10), s10.checks.includes("state") ? h2 : sm);
        } catch (e11) {
          if (e11 instanceof af) {
            let t11 = { providerId: s10.id, ...Object.fromEntries(e11.cause.entries()) };
            throw a10.debug("OAuthCallbackError", t11), new tE("OAuth Provider returned an error", t11);
          }
          throw e11;
        }
        let f2 = await sE.use(t10, p2, r10), m2 = s10.callbackUrl;
        !r10.isOnRedirectProxy && s10.redirectProxyUrl && (m2 = s10.redirectProxyUrl);
        let g2 = await aK(n10, u2, i10, o10, m2, f2 ?? "decoy", { [oD]: true, [oW]: (...e11) => (s10.checks.includes("pkce") || e11[1].body.delete("code_verifier"), (s10[iS] ?? fetch)(...e11)) });
        s10.token?.conform && (g2 = await s10.token.conform(g2.clone()) ?? g2);
        let y2 = {}, w2 = "oidc" === s10.type;
        if (s10[ik]) switch (s10.id) {
          case "microsoft-entra-id":
          case "azure-ad": {
            let e11 = await g2.clone().json();
            if (e11.error) {
              let t12 = { providerId: s10.id, ...e11 };
              throw new tE(`OAuth Provider returned an error: ${e11.error}`, t12);
            }
            let { tid: t11 } = function(e12) {
              let t12, r11;
              if ("string" != typeof e12) throw new rb("JWTs must use Compact JWS serialization, JWT must be a string");
              let { 1: n11, length: i11 } = e12.split(".");
              if (5 === i11) throw new rb("Only JWTs using Compact JWS serialization can be decoded");
              if (3 !== i11) throw new rb("Invalid JWT");
              if (!n11) throw new rb("JWTs must contain a payload");
              try {
                t12 = re(n11);
              } catch {
                throw new rb("Failed to base64url decode the payload");
              }
              try {
                r11 = JSON.parse(t3.decode(t12));
              } catch {
                throw new rb("Failed to parse the decoded payload as JSON");
              }
              if (!rr(r11)) throw new rb("Invalid JWT Claims Set");
              return r11;
            }(e11.id_token);
            if ("string" == typeof t11) {
              let e12 = n10.issuer?.match(/microsoftonline\.com\/(\w+)\/v2\.0/)?.[1] ?? "common", r11 = new URL(n10.issuer.replace(e12, t11)), i11 = await o3(r11, { [oW]: s10[iS] });
              n10 = await o4(r11, i11);
            }
          }
        }
        let b2 = await aG(n10, u2, g2, { expectedNonce: await sP.use(t10, p2, r10), requireIdToken: w2 });
        if (w2) {
          let t11 = a$(b2);
          if (y2 = t11, s10[ik] && "apple" === s10.id) try {
            y2.user = JSON.parse(e10?.user);
          } catch {
          }
          if (false === s10.idToken) {
            let e11 = await aE(n10, u2, b2.access_token, { [oW]: s10[iS], [oD]: true });
            y2 = await aR(n10, u2, t11.sub, e11);
          }
        } else if (c2?.request) {
          let e11 = await c2.request({ tokens: b2, provider: s10 });
          e11 instanceof Object && (y2 = e11);
        } else if (c2?.url) {
          let e11 = await aE(n10, u2, b2.access_token, { [oW]: s10[iS], [oD]: true });
          y2 = await e11.json();
        } else throw TypeError("No userinfo endpoint configured");
        return b2.expires_in && (b2.expires_at = Math.floor(Date.now() / 1e3) + Number(b2.expires_in)), { ...await sU(y2, s10, b2, a10), profile: y2, cookies: p2 };
      }
      async function sU(e10, t10, r10, n10) {
        try {
          let n11 = await t10.profile(e10, r10);
          return { user: { ...n11, id: crypto.randomUUID(), email: n11.email?.toLowerCase() }, account: { ...r10, provider: t10.id, type: t10.type, providerAccountId: n11.id ?? crypto.randomUUID() } };
        } catch (r11) {
          n10.debug("getProfile error details", e10), n10.error(new tA(r11, { provider: t10.id }));
        }
      }
      var sN = r(356).Buffer;
      async function s$(e10, t10, r10, n10) {
        let i10 = await sH(e10, t10, r10), { cookie: o10 } = await sR.create(e10, i10.challenge, r10);
        return { status: 200, cookies: [...n10 ?? [], o10], body: { action: "register", options: i10 }, headers: { "Content-Type": "application/json" } };
      }
      async function sj(e10, t10, r10, n10) {
        let i10 = await sM(e10, t10, r10), { cookie: o10 } = await sR.create(e10, i10.challenge);
        return { status: 200, cookies: [...n10 ?? [], o10], body: { action: "authenticate", options: i10 }, headers: { "Content-Type": "application/json" } };
      }
      async function sL(e10, t10, r10) {
        let n10;
        let { adapter: i10, provider: o10 } = e10, a10 = t10.body && "string" == typeof t10.body.data ? JSON.parse(t10.body.data) : void 0;
        if (!a10 || "object" != typeof a10 || !("id" in a10) || "string" != typeof a10.id) throw new tl("Invalid WebAuthn Authentication response");
        let s10 = sq(sB(a10.id)), l2 = await i10.getAuthenticator(s10);
        if (!l2) throw new tl(`WebAuthn authenticator not found in database: ${JSON.stringify({ credentialID: s10 })}`);
        let { challenge: c2 } = await sR.use(e10, t10.cookies, r10);
        try {
          let r11 = o10.getRelayingParty(e10, t10);
          n10 = await o10.simpleWebAuthn.verifyAuthenticationResponse({ ...o10.verifyAuthenticationOptions, expectedChallenge: c2, response: a10, authenticator: { ...l2, credentialDeviceType: l2.credentialDeviceType, transports: sK(l2.transports), credentialID: sB(l2.credentialID), credentialPublicKey: sB(l2.credentialPublicKey) }, expectedOrigin: r11.origin, expectedRPID: r11.id });
        } catch (e11) {
          throw new tH(e11);
        }
        let { verified: u2, authenticationInfo: d2 } = n10;
        if (!u2) throw new tH("WebAuthn authentication response could not be verified");
        try {
          let { newCounter: e11 } = d2;
          await i10.updateAuthenticatorCounter(l2.credentialID, e11);
        } catch (e11) {
          throw new tu(`Failed to update authenticator counter. This may cause future authentication attempts to fail. ${JSON.stringify({ credentialID: s10, oldCounter: l2.counter, newCounter: d2.newCounter })}`, e11);
        }
        let p2 = await i10.getAccount(l2.providerAccountId, o10.id);
        if (!p2) throw new tl(`WebAuthn account not found in database: ${JSON.stringify({ credentialID: s10, providerAccountId: l2.providerAccountId })}`);
        let h2 = await i10.getUser(p2.userId);
        if (!h2) throw new tl(`WebAuthn user not found in database: ${JSON.stringify({ credentialID: s10, providerAccountId: l2.providerAccountId, userID: p2.userId })}`);
        return { account: p2, user: h2 };
      }
      async function sD(e10, t10, r10) {
        var n10;
        let i10;
        let { provider: o10 } = e10, a10 = t10.body && "string" == typeof t10.body.data ? JSON.parse(t10.body.data) : void 0;
        if (!a10 || "object" != typeof a10 || !("id" in a10) || "string" != typeof a10.id) throw new tl("Invalid WebAuthn Registration response");
        let { challenge: s10, registerData: l2 } = await sR.use(e10, t10.cookies, r10);
        if (!l2) throw new tl("Missing user registration data in WebAuthn challenge cookie");
        try {
          let r11 = o10.getRelayingParty(e10, t10);
          i10 = await o10.simpleWebAuthn.verifyRegistrationResponse({ ...o10.verifyRegistrationOptions, expectedChallenge: s10, response: a10, expectedOrigin: r11.origin, expectedRPID: r11.id });
        } catch (e11) {
          throw new tH(e11);
        }
        if (!i10.verified || !i10.registrationInfo) throw new tH("WebAuthn registration response could not be verified");
        let c2 = { providerAccountId: sq(i10.registrationInfo.credentialID), provider: e10.provider.id, type: o10.type }, u2 = { providerAccountId: c2.providerAccountId, counter: i10.registrationInfo.counter, credentialID: sq(i10.registrationInfo.credentialID), credentialPublicKey: sq(i10.registrationInfo.credentialPublicKey), credentialBackedUp: i10.registrationInfo.credentialBackedUp, credentialDeviceType: i10.registrationInfo.credentialDeviceType, transports: (n10 = a10.response.transports, n10?.join(",")) };
        return { user: l2, account: c2, authenticator: u2 };
      }
      async function sM(e10, t10, r10) {
        let { provider: n10, adapter: i10 } = e10, o10 = r10 && r10.id ? await i10.listAuthenticatorsByUserId(r10.id) : null, a10 = n10.getRelayingParty(e10, t10);
        return await n10.simpleWebAuthn.generateAuthenticationOptions({ ...n10.authenticationOptions, rpID: a10.id, allowCredentials: o10?.map((e11) => ({ id: sB(e11.credentialID), type: "public-key", transports: sK(e11.transports) })) });
      }
      async function sH(e10, t10, r10) {
        let { provider: n10, adapter: i10 } = e10, o10 = r10.id ? await i10.listAuthenticatorsByUserId(r10.id) : null, a10 = im(32), s10 = n10.getRelayingParty(e10, t10);
        return await n10.simpleWebAuthn.generateRegistrationOptions({ ...n10.registrationOptions, userID: a10, userName: r10.email, userDisplayName: r10.name ?? void 0, rpID: s10.id, rpName: s10.name, excludeCredentials: o10?.map((e11) => ({ id: sB(e11.credentialID), type: "public-key", transports: sK(e11.transports) })) });
      }
      function sW(e10) {
        let { provider: t10, adapter: r10 } = e10;
        if (!r10) throw new tv("An adapter is required for the WebAuthn provider");
        if (!t10 || "webauthn" !== t10.type) throw new tU("Provider must be WebAuthn");
        return { ...e10, provider: t10, adapter: r10 };
      }
      function sB(e10) {
        return new Uint8Array(sN.from(e10, "base64"));
      }
      function sq(e10) {
        return sN.from(e10).toString("base64");
      }
      function sK(e10) {
        return e10 ? e10.split(",") : void 0;
      }
      async function sV(e10, t10, r10, n10) {
        if (!t10.provider) throw new tU("Callback route called without provider");
        let { query: i10, body: o10, method: a10, headers: s10 } = e10, { provider: l2, adapter: c2, url: u2, callbackUrl: d2, pages: p2, jwt: h2, events: f2, callbacks: m2, session: { strategy: g2, maxAge: y2 }, logger: w2 } = t10, b2 = "jwt" === g2;
        try {
          if ("oauth" === l2.type || "oidc" === l2.type) {
            let a11;
            let s11 = l2.authorization?.url.searchParams.get("response_mode") === "form_post" ? o10 : i10;
            if (t10.isOnRedirectProxy && s11?.state) {
              let e11 = await sT.decode(s11.state, t10);
              if (e11?.origin && new URL(e11.origin).origin !== t10.url.origin) {
                let t11 = `${e11.origin}?${new URLSearchParams(s11)}`;
                return w2.debug("Proxy redirecting to", t11), { redirect: t11, cookies: n10 };
              }
            }
            let g3 = await sI(s11, e10.cookies, t10);
            g3.cookies.length && n10.push(...g3.cookies), w2.debug("authorization result", g3);
            let { user: v2, account: _2, profile: S2 } = g3;
            if (!v2 || !_2 || !S2) return { redirect: `${u2}/signin`, cookies: n10 };
            if (c2) {
              let { getUserByAccount: e11 } = c2;
              a11 = await e11({ providerAccountId: _2.providerAccountId, provider: l2.id });
            }
            let k2 = await sz({ user: a11 ?? v2, account: _2, profile: S2 }, t10);
            if (k2) return { redirect: k2, cookies: n10 };
            let { user: x2, session: E2, isNewUser: A2 } = await oU(r10.value, v2, _2, t10);
            if (b2) {
              let e11 = { name: x2.name, email: x2.email, picture: x2.image, sub: x2.id?.toString() }, i11 = await m2.jwt({ token: e11, user: x2, account: _2, profile: S2, isNewUser: A2, trigger: A2 ? "signUp" : "signIn" });
              if (null === i11) n10.push(...r10.clean());
              else {
                let e12 = t10.cookies.sessionToken.name, o11 = await h2.encode({ ...h2, token: i11, salt: e12 }), a12 = /* @__PURE__ */ new Date();
                a12.setTime(a12.getTime() + 1e3 * y2);
                let s12 = r10.chunk(o11, { expires: a12 });
                n10.push(...s12);
              }
            } else n10.push({ name: t10.cookies.sessionToken.name, value: E2.sessionToken, options: { ...t10.cookies.sessionToken.options, expires: E2.expires } });
            if (await f2.signIn?.({ user: x2, account: _2, profile: S2, isNewUser: A2 }), A2 && p2.newUser) return { redirect: `${p2.newUser}${p2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: d2 })}`, cookies: n10 };
            return { redirect: d2, cookies: n10 };
          }
          if ("email" === l2.type) {
            let e11 = i10?.token, o11 = i10?.email;
            if (!e11) {
              let t11 = TypeError("Missing token. The sign-in URL was manually opened without token or the link was not sent correctly in the email.", { cause: { hasToken: !!e11 } });
              throw t11.name = "Configuration", t11;
            }
            let a11 = l2.secret ?? t10.secret, s11 = await c2.useVerificationToken({ identifier: o11, token: await ih(`${e11}${a11}`) }), u3 = !!s11, g3 = u3 && s11.expires.valueOf() < Date.now();
            if (!u3 || g3 || o11 && s11.identifier !== o11) throw new t$({ hasInvite: u3, expired: g3 });
            let { identifier: w3 } = s11, v2 = await c2.getUserByEmail(w3) ?? { id: crypto.randomUUID(), email: w3, emailVerified: null }, _2 = { providerAccountId: v2.email, userId: v2.id, type: "email", provider: l2.id }, S2 = await sz({ user: v2, account: _2 }, t10);
            if (S2) return { redirect: S2, cookies: n10 };
            let { user: k2, session: x2, isNewUser: E2 } = await oU(r10.value, v2, _2, t10);
            if (b2) {
              let e12 = { name: k2.name, email: k2.email, picture: k2.image, sub: k2.id?.toString() }, i11 = await m2.jwt({ token: e12, user: k2, account: _2, isNewUser: E2, trigger: E2 ? "signUp" : "signIn" });
              if (null === i11) n10.push(...r10.clean());
              else {
                let e13 = t10.cookies.sessionToken.name, o12 = await h2.encode({ ...h2, token: i11, salt: e13 }), a12 = /* @__PURE__ */ new Date();
                a12.setTime(a12.getTime() + 1e3 * y2);
                let s12 = r10.chunk(o12, { expires: a12 });
                n10.push(...s12);
              }
            } else n10.push({ name: t10.cookies.sessionToken.name, value: x2.sessionToken, options: { ...t10.cookies.sessionToken.options, expires: x2.expires } });
            if (await f2.signIn?.({ user: k2, account: _2, isNewUser: E2 }), E2 && p2.newUser) return { redirect: `${p2.newUser}${p2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: d2 })}`, cookies: n10 };
            return { redirect: d2, cookies: n10 };
          }
          if ("credentials" === l2.type && "POST" === a10) {
            let e11 = o10 ?? {};
            Object.entries(i10 ?? {}).forEach(([e12, t11]) => u2.searchParams.set(e12, t11));
            let c3 = await l2.authorize(e11, new Request(u2, { headers: s10, method: a10, body: JSON.stringify(o10) }));
            if (c3) c3.id = c3.id?.toString() ?? crypto.randomUUID();
            else throw new tg();
            let p3 = { providerAccountId: c3.id, type: "credentials", provider: l2.id }, g3 = await sz({ user: c3, account: p3, credentials: e11 }, t10);
            if (g3) return { redirect: g3, cookies: n10 };
            let w3 = { name: c3.name, email: c3.email, picture: c3.image, sub: c3.id }, b3 = await m2.jwt({ token: w3, user: c3, account: p3, isNewUser: false, trigger: "signIn" });
            if (null === b3) n10.push(...r10.clean());
            else {
              let e12 = t10.cookies.sessionToken.name, i11 = await h2.encode({ ...h2, token: b3, salt: e12 }), o11 = /* @__PURE__ */ new Date();
              o11.setTime(o11.getTime() + 1e3 * y2);
              let a11 = r10.chunk(i11, { expires: o11 });
              n10.push(...a11);
            }
            return await f2.signIn?.({ user: c3, account: p3 }), { redirect: d2, cookies: n10 };
          }
          if ("webauthn" === l2.type && "POST" === a10) {
            let i11, o11, a11;
            let s11 = e10.body?.action;
            if ("string" != typeof s11 || "authenticate" !== s11 && "register" !== s11) throw new tl("Invalid action parameter");
            let l3 = sW(t10);
            switch (s11) {
              case "authenticate": {
                let t11 = await sL(l3, e10, n10);
                i11 = t11.user, o11 = t11.account;
                break;
              }
              case "register": {
                let r11 = await sD(t10, e10, n10);
                i11 = r11.user, o11 = r11.account, a11 = r11.authenticator;
              }
            }
            await sz({ user: i11, account: o11 }, t10);
            let { user: c3, isNewUser: u3, session: g3, account: w3 } = await oU(r10.value, i11, o11, t10);
            if (!w3) throw new tl("Error creating or finding account");
            if (a11 && c3.id && await l3.adapter.createAuthenticator({ ...a11, userId: c3.id }), b2) {
              let e11 = { name: c3.name, email: c3.email, picture: c3.image, sub: c3.id?.toString() }, i12 = await m2.jwt({ token: e11, user: c3, account: w3, isNewUser: u3, trigger: u3 ? "signUp" : "signIn" });
              if (null === i12) n10.push(...r10.clean());
              else {
                let e12 = t10.cookies.sessionToken.name, o12 = await h2.encode({ ...h2, token: i12, salt: e12 }), a12 = /* @__PURE__ */ new Date();
                a12.setTime(a12.getTime() + 1e3 * y2);
                let s12 = r10.chunk(o12, { expires: a12 });
                n10.push(...s12);
              }
            } else n10.push({ name: t10.cookies.sessionToken.name, value: g3.sessionToken, options: { ...t10.cookies.sessionToken.options, expires: g3.expires } });
            if (await f2.signIn?.({ user: c3, account: w3, isNewUser: u3 }), u3 && p2.newUser) return { redirect: `${p2.newUser}${p2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: d2 })}`, cookies: n10 };
            return { redirect: d2, cookies: n10 };
          }
          throw new tU(`Callback for provider type (${l2.type}) is not supported`);
        } catch (t11) {
          if (t11 instanceof tl) throw t11;
          let e11 = new tp(t11, { provider: l2.id });
          throw w2.debug("callback route error details", { method: a10, query: i10, body: o10 }), e11;
        }
      }
      async function sz(e10, t10) {
        let r10;
        let { signIn: n10, redirect: i10 } = t10.callbacks;
        try {
          r10 = await n10(e10);
        } catch (e11) {
          if (e11 instanceof tl) throw e11;
          throw new td(e11);
        }
        if (!r10) throw new td("AccessDenied");
        if ("string" == typeof r10) return await i10({ url: r10, baseUrl: t10.url.origin });
      }
      async function sJ(e10, t10, r10, n10, i10) {
        let { adapter: o10, jwt: a10, events: s10, callbacks: l2, logger: c2, session: { strategy: u2, maxAge: d2 } } = e10, p2 = { body: null, headers: { "Content-Type": "application/json", ...!n10 && { "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" } }, cookies: r10 }, h2 = t10.value;
        if (!h2) return p2;
        if ("jwt" === u2) {
          try {
            let r11 = e10.cookies.sessionToken.name, o11 = await a10.decode({ ...a10, token: h2, salt: r11 });
            if (!o11) throw Error("Invalid JWT");
            let c3 = await l2.jwt({ token: o11, ...n10 && { trigger: "update" }, session: i10 }), u3 = oI(d2);
            if (null !== c3) {
              let e11 = { user: { name: c3.name, email: c3.email, image: c3.picture }, expires: u3.toISOString() }, n11 = await l2.session({ session: e11, token: c3 });
              p2.body = n11;
              let i11 = await a10.encode({ ...a10, token: c3, salt: r11 }), o12 = t10.chunk(i11, { expires: u3 });
              p2.cookies?.push(...o12), await s10.session?.({ session: n11, token: c3 });
            } else p2.cookies?.push(...t10.clean());
          } catch (e11) {
            c2.error(new tb(e11)), p2.cookies?.push(...t10.clean());
          }
          return p2;
        }
        try {
          let { getSessionAndUser: r11, deleteSession: a11, updateSession: c3 } = o10, u3 = await r11(h2);
          if (u3 && u3.session.expires.valueOf() < Date.now() && (await a11(h2), u3 = null), u3) {
            let { user: t11, session: r12 } = u3, o11 = e10.session.updateAge, a12 = r12.expires.valueOf() - 1e3 * d2 + 1e3 * o11, f2 = oI(d2);
            a12 <= Date.now() && await c3({ sessionToken: h2, expires: f2 });
            let m2 = await l2.session({ session: { ...r12, user: t11 }, user: t11, newSession: i10, ...n10 ? { trigger: "update" } : {} });
            p2.body = m2, p2.cookies?.push({ name: e10.cookies.sessionToken.name, value: h2, options: { ...e10.cookies.sessionToken.options, expires: f2 } }), await s10.session?.({ session: m2 });
          } else h2 && p2.cookies?.push(...t10.clean());
        } catch (e11) {
          c2.error(new tT(e11));
        }
        return p2;
      }
      async function sF(e10, t10) {
        let r10, n10;
        let { logger: i10, provider: o10 } = t10, a10 = o10.authorization?.url;
        if (!a10 || "authjs.dev" === a10.host) {
          let e11 = new URL(o10.issuer), t11 = await o3(e11, { [oW]: o10[iS], [oD]: true }), r11 = await o4(e11, t11).catch((t12) => {
            if (!(t12 instanceof TypeError) || "Invalid URL" !== t12.message) throw t12;
            throw TypeError(`Discovery request responded with an invalid issuer. expected: ${e11}`);
          });
          if (!r11.authorization_endpoint) throw TypeError("Authorization server did not provide an authorization endpoint.");
          a10 = new URL(r11.authorization_endpoint);
        }
        let s10 = a10.searchParams, l2 = o10.callbackUrl;
        !t10.isOnRedirectProxy && o10.redirectProxyUrl && (l2 = o10.redirectProxyUrl, n10 = o10.callbackUrl, i10.debug("using redirect proxy", { redirect_uri: l2, data: n10 }));
        let c2 = Object.assign({ response_type: "code", client_id: o10.clientId, redirect_uri: l2, ...o10.authorization?.params }, Object.fromEntries(o10.authorization?.url.searchParams ?? []), e10);
        for (let e11 in c2) s10.set(e11, c2[e11]);
        let u2 = [];
        o10.authorization?.url.searchParams.get("response_mode") === "form_post" && (t10.cookies.state.options.sameSite = "none", t10.cookies.state.options.secure = true, t10.cookies.nonce.options.sameSite = "none", t10.cookies.nonce.options.secure = true);
        let d2 = await sT.create(t10, n10);
        if (d2 && (s10.set("state", d2.value), u2.push(d2.cookie)), o10.checks?.includes("pkce")) {
          if (r10 && !r10.code_challenge_methods_supported?.includes("S256")) "oidc" === o10.type && (o10.checks = ["nonce"]);
          else {
            let { value: e11, cookie: r11 } = await sE.create(t10);
            s10.set("code_challenge", e11), s10.set("code_challenge_method", "S256"), u2.push(r11);
          }
        }
        let p2 = await sP.create(t10);
        return p2 && (s10.set("nonce", p2.value), u2.push(p2.cookie)), "oidc" !== o10.type || a10.searchParams.has("scope") || a10.searchParams.set("scope", "openid profile email"), i10.debug("authorization url is ready", { url: a10, cookies: u2, provider: o10 }), { redirect: a10.toString(), cookies: u2 };
      }
      async function sG(e10, t10) {
        let r10;
        let { body: n10 } = e10, { provider: i10, callbacks: o10, adapter: a10 } = t10, s10 = (i10.normalizeIdentifier ?? function(e11) {
          if (!e11) throw Error("Missing email from request body.");
          let t11 = e11.normalize("NFKC").toLowerCase().trim();
          if (t11.includes('"')) throw Error("Invalid email address format.");
          let [r11, n11] = t11.split("@");
          if (!r11 || !n11 || 2 !== t11.split("@").length || !(n11 = n11.split(",")[0])) throw Error("Invalid email address format.");
          return `${r11}@${n11}`;
        })(n10?.email), l2 = { id: crypto.randomUUID(), email: s10, emailVerified: null }, c2 = await a10.getUserByEmail(s10) ?? l2, u2 = { providerAccountId: s10, userId: c2.id, type: "email", provider: i10.id };
        try {
          r10 = await o10.signIn({ user: c2, account: u2, email: { verificationRequest: true } });
        } catch (e11) {
          throw new td(e11);
        }
        if (!r10) throw new td("AccessDenied");
        if ("string" == typeof r10) return { redirect: await o10.redirect({ url: r10, baseUrl: t10.url.origin }) };
        let { callbackUrl: d2, theme: p2 } = t10, h2 = await i10.generateVerificationToken?.() ?? im(32), f2 = new Date(Date.now() + (i10.maxAge ?? 86400) * 1e3), m2 = i10.secret ?? t10.secret, g2 = new URL(t10.basePath, t10.url.origin), y2 = i10.sendVerificationRequest({ identifier: s10, token: h2, expires: f2, url: `${g2}/callback/${i10.id}?${new URLSearchParams({ callbackUrl: d2, token: h2, email: s10 })}`, provider: i10, theme: p2, request: new Request(e10.url, { headers: e10.headers, method: e10.method, body: "POST" === e10.method ? JSON.stringify(e10.body ?? {}) : void 0 }) }), w2 = a10.createVerificationToken?.({ identifier: s10, token: await ih(`${h2}${m2}`), expires: f2 });
        return await Promise.all([y2, w2]), { redirect: `${g2}/verify-request?${new URLSearchParams({ provider: i10.id, type: i10.type })}` };
      }
      async function sX(e10, t10, r10) {
        let n10 = `${r10.url.origin}${r10.basePath}/signin`;
        if (!r10.provider) return { redirect: n10, cookies: t10 };
        switch (r10.provider.type) {
          case "oauth":
          case "oidc": {
            let { redirect: n11, cookies: i10 } = await sF(e10.query, r10);
            return i10 && t10.push(...i10), { redirect: n11, cookies: t10 };
          }
          case "email":
            return { ...await sG(e10, r10), cookies: t10 };
          default:
            return { redirect: n10, cookies: t10 };
        }
      }
      async function sZ(e10, t10, r10) {
        let { jwt: n10, events: i10, callbackUrl: o10, logger: a10, session: s10 } = r10, l2 = t10.value;
        if (!l2) return { redirect: o10, cookies: e10 };
        try {
          if ("jwt" === s10.strategy) {
            let e11 = r10.cookies.sessionToken.name, t11 = await n10.decode({ ...n10, token: l2, salt: e11 });
            await i10.signOut?.({ token: t11 });
          } else {
            let e11 = await r10.adapter?.deleteSession(l2);
            await i10.signOut?.({ session: e11 });
          }
        } catch (e11) {
          a10.error(new tR(e11));
        }
        return e10.push(...t10.clean()), { redirect: o10, cookies: e10 };
      }
      async function sY(e10, t10) {
        let { adapter: r10, jwt: n10, session: { strategy: i10 } } = e10, o10 = t10.value;
        if (!o10) return null;
        if ("jwt" === i10) {
          let t11 = e10.cookies.sessionToken.name, r11 = await n10.decode({ ...n10, token: o10, salt: t11 });
          if (r11 && r11.sub) return { id: r11.sub, name: r11.name, email: r11.email, image: r11.picture };
        } else {
          let e11 = await r10?.getSessionAndUser(o10);
          if (e11) return e11.user;
        }
        return null;
      }
      async function sQ(e10, t10, r10, n10) {
        let i10 = sW(t10), { provider: o10 } = i10, { action: a10 } = e10.query ?? {};
        if ("register" !== a10 && "authenticate" !== a10 && void 0 !== a10) return { status: 400, body: { error: "Invalid action" }, cookies: n10, headers: { "Content-Type": "application/json" } };
        let s10 = await sY(t10, r10), l2 = s10 ? { user: s10, exists: true } : await o10.getUserInfo(t10, e10), c2 = l2?.user;
        switch (function(e11, t11, r11) {
          let { user: n11, exists: i11 = false } = r11 ?? {};
          switch (e11) {
            case "authenticate":
              return "authenticate";
            case "register":
              if (n11 && t11 === i11) return "register";
              break;
            case void 0:
              if (!t11) {
                if (!n11 || i11) return "authenticate";
                return "register";
              }
          }
          return null;
        }(a10, !!s10, l2)) {
          case "authenticate":
            return sj(i10, e10, c2, n10);
          case "register":
            if ("string" == typeof c2?.email) return s$(i10, e10, c2, n10);
            break;
          default:
            return { status: 400, body: { error: "Invalid request" }, cookies: n10, headers: { "Content-Type": "application/json" } };
        }
      }
      async function s0(e10, t10) {
        let { action: r10, providerId: n10, error: i10, method: o10 } = e10, a10 = t10.skipCSRFCheck === iv, { options: s10, cookies: l2 } = await iC({ authOptions: t10, action: r10, providerId: n10, url: e10.url, callbackUrl: e10.body?.callbackUrl ?? e10.query?.callbackUrl, csrfToken: e10.body?.csrfToken, cookies: e10.cookies, isPost: "POST" === o10, csrfDisabled: a10 }), c2 = new ts(s10.cookies.sessionToken, e10.cookies, s10.logger);
        if ("GET" === o10) {
          let t11 = oO({ ...s10, query: e10.query, cookies: l2 });
          switch (r10) {
            case "callback":
              return await sV(e10, s10, c2, l2);
            case "csrf":
              return t11.csrf(a10, s10, l2);
            case "error":
              return t11.error(i10);
            case "providers":
              return t11.providers(s10.providers);
            case "session":
              return await sJ(s10, c2, l2);
            case "signin":
              return t11.signin(n10, i10);
            case "signout":
              return t11.signout();
            case "verify-request":
              return t11.verifyRequest();
            case "webauthn-options":
              return await sQ(e10, s10, c2, l2);
          }
        } else {
          let { csrfTokenVerified: t11 } = s10;
          switch (r10) {
            case "callback":
              return "credentials" === s10.provider.type && iy(r10, t11), await sV(e10, s10, c2, l2);
            case "session":
              return iy(r10, t11), await sJ(s10, c2, l2, true, e10.body?.data);
            case "signin":
              return iy(r10, t11), await sX(e10, l2, s10);
            case "signout":
              return iy(r10, t11), await sZ(l2, c2, s10);
          }
        }
        throw new tO(`Cannot handle action: ${r10}`);
      }
      function s1(e10, t10, r10, n10, i10) {
        let o10;
        let a10 = i10?.basePath, s10 = n10.AUTH_URL ?? n10.NEXTAUTH_URL;
        if (s10) o10 = new URL(s10), a10 && "/" !== a10 && "/" !== o10.pathname && (o10.pathname !== a10 && ia(i10).warn("env-url-basepath-mismatch"), o10.pathname = "/");
        else {
          let e11 = r10.get("x-forwarded-host") ?? r10.get("host"), n11 = r10.get("x-forwarded-proto") ?? t10 ?? "https", i11 = n11.endsWith(":") ? n11 : n11 + ":";
          o10 = new URL(`${i11}//${e11}`);
        }
        let l2 = o10.toString().replace(/\/$/, "");
        if (a10) {
          let t11 = a10?.replace(/(^\/|\/$)/g, "") ?? "";
          return new URL(`${l2}/${t11}/${e10}`);
        }
        return new URL(`${l2}/${e10}`);
      }
      async function s2(e10, t10) {
        let r10 = ia(t10), n10 = await id(e10, t10);
        if (!n10) return Response.json("Bad request.", { status: 400 });
        let i10 = function(e11, t11) {
          let { url: r11 } = e11, n11 = [];
          if (!tq && t11.debug && n11.push("debug-enabled"), !t11.trustHost) return new tN(`Host must be trusted. URL was: ${e11.url}`);
          if (!t11.secret?.length) return new tk("Please define a `secret`");
          let i11 = e11.query?.callbackUrl;
          if (i11 && !tK(i11, r11.origin)) return new tm(`Invalid callback URL. Received: ${i11}`);
          let { callbackUrl: o11 } = ta(t11.useSecureCookies ?? "https:" === r11.protocol), a11 = e11.cookies?.[t11.cookies?.callbackUrl?.name ?? o11.name];
          if (a11 && !tK(a11, r11.origin)) return new tm(`Invalid callback URL. Received: ${a11}`);
          let s10 = false;
          for (let e12 of t11.providers) {
            let t12 = "function" == typeof e12 ? e12() : e12;
            if (("oauth" === t12.type || "oidc" === t12.type) && !(t12.issuer ?? t12.options?.issuer)) {
              let e13;
              let { authorization: r12, token: n12, userinfo: i12 } = t12;
              if ("string" == typeof r12 || r12?.url ? "string" == typeof n12 || n12?.url ? "string" == typeof i12 || i12?.url || (e13 = "userinfo") : e13 = "token" : e13 = "authorization", e13) return new ty(`Provider "${t12.id}" is missing both \`issuer\` and \`${e13}\` endpoint config. At least one of them is required`);
            }
            if ("credentials" === t12.type) tV = true;
            else if ("email" === t12.type) tz = true;
            else if ("webauthn" === t12.type) {
              var l2;
              if (tJ = true, t12.simpleWebAuthnBrowserVersion && (l2 = t12.simpleWebAuthnBrowserVersion, !/^v\d+(?:\.\d+){0,2}$/.test(l2))) return new tl(`Invalid provider config for "${t12.id}": simpleWebAuthnBrowserVersion "${t12.simpleWebAuthnBrowserVersion}" must be a valid semver string.`);
              if (t12.enableConditionalUI) {
                if (s10) return new tD("Multiple webauthn providers have 'enableConditionalUI' set to True. Only one provider can have this option enabled at a time");
                if (s10 = true, !Object.values(t12.formFields).some((e13) => e13.autocomplete && e13.autocomplete.toString().indexOf("webauthn") > -1)) return new tM(`Provider "${t12.id}" has 'enableConditionalUI' set to True, but none of its formFields have 'webauthn' in their autocomplete param`);
              }
            }
          }
          if (tV) {
            let e12 = t11.session?.strategy === "database", r12 = !t11.providers.some((e13) => "credentials" !== ("function" == typeof e13 ? e13() : e13).type);
            if (e12 && r12) return new tI("Signing in with credentials only supported if JWT strategy is enabled");
            if (t11.providers.some((e13) => {
              let t12 = "function" == typeof e13 ? e13() : e13;
              return "credentials" === t12.type && !t12.authorize;
            })) return new tS("Must define an authorize() handler to use credentials authentication provider");
          }
          let { adapter: c2, session: u2 } = t11, d2 = [];
          if (tz || u2?.strategy === "database" || !u2?.strategy && c2) {
            if (tz) {
              if (!c2) return new tv("Email login requires an adapter");
              d2.push(...tF);
            } else {
              if (!c2) return new tv("Database session requires an adapter");
              d2.push(...tG);
            }
          }
          if (tJ) {
            if (!t11.experimental?.enableWebAuthn) return new tB("WebAuthn is an experimental feature. To enable it, set `experimental.enableWebAuthn` to `true` in your config");
            if (n11.push("experimental-webauthn"), !c2) return new tv("WebAuthn requires an adapter");
            d2.push(...tX);
          }
          if (c2) {
            let e12 = d2.filter((e13) => !(e13 in c2));
            if (e12.length) return new t_(`Required adapter methods were missing: ${e12.join(", ")}`);
          }
          return tq || (tq = true), n11;
        }(n10, t10);
        if (Array.isArray(i10)) i10.forEach(r10.warn);
        else if (i10) {
          if (r10.error(i10), !(/* @__PURE__ */ new Set(["signin", "signout", "error", "verify-request"])).has(n10.action) || "GET" !== n10.method) return Response.json({ message: "There was a problem with the server configuration. Check the server logs for more information." }, { status: 500 });
          let { pages: e11, theme: o11 } = t10, a11 = e11?.error && n10.url.searchParams.get("callbackUrl")?.startsWith(e11.error);
          if (!e11?.error || a11) return a11 && r10.error(new th(`The error page ${e11?.error} should not require authentication`)), ip(oO({ theme: o11 }).error("Configuration"));
          let s10 = `${n10.url.origin}${e11.error}?error=Configuration`;
          return Response.redirect(s10);
        }
        let o10 = e10.headers?.has("X-Auth-Return-Redirect"), a10 = t10.raw === i_;
        try {
          let e11 = await s0(n10, t10);
          if (a10) return e11;
          let r11 = ip(e11), i11 = r11.headers.get("Location");
          if (!o10 || !i11) return r11;
          return Response.json({ url: i11 }, { headers: r11.headers });
        } catch (d2) {
          r10.error(d2);
          let i11 = d2 instanceof tl;
          if (i11 && a10 && !o10) throw d2;
          if ("POST" === e10.method && "session" === n10.action) return Response.json(null, { status: 400 });
          let s10 = new URLSearchParams({ error: d2 instanceof tl && tL.has(d2.type) ? d2.type : "Configuration" });
          d2 instanceof tg && s10.set("code", d2.code);
          let l2 = i11 && d2.kind || "error", c2 = t10.pages?.[l2] ?? `${t10.basePath}/${l2.toLowerCase()}`, u2 = `${n10.url.origin}${c2}?${s10}`;
          if (o10) return Response.json({ url: u2 });
          return Response.redirect(u2);
        }
      }
      r(455), "undefined" == typeof URLPattern || URLPattern;
      var s3 = r(400);
      class s5 extends Error {
        constructor(e10) {
          super("Dynamic server usage: " + e10), this.description = e10, this.digest = "DYNAMIC_SERVER_USAGE";
        }
      }
      class s6 extends Error {
        constructor(...e10) {
          super(...e10), this.code = "NEXT_STATIC_GEN_BAILOUT";
        }
      }
      let s4 = "function" == typeof s3.unstable_postpone;
      function s8(e10, t10, r10) {
        let n10 = new s5(`Route ${t10.route} couldn't be rendered statically because it used \`${e10}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`);
        throw r10.revalidate = 0, t10.dynamicUsageDescription = e10, t10.dynamicUsageStack = n10.stack, n10;
      }
      function s9(e10, t10) {
        t10 && "cache" !== t10.type && "unstable-cache" !== t10.type && ("prerender" === t10.type || "prerender-legacy" === t10.type) && (t10.revalidate = 0);
      }
      function s7(e10, t10, r10, n10) {
        let i10 = n10.dynamicTracking;
        throw i10 && null === i10.syncDynamicErrorWithStack && (i10.syncDynamicExpression = t10, i10.syncDynamicErrorWithStack = r10, true === n10.validating && (i10.syncDynamicLogged = true)), function(e11, t11, r11) {
          let n11 = lr(`Route ${e11} needs to bail out of prerendering at this point because it used ${t11}.`);
          r11.controller.abort(n11);
          let i11 = r11.dynamicTracking;
          i11 && i11.dynamicAccesses.push({ stack: i11.isDebugDynamicAccesses ? Error().stack : void 0, expression: t11 });
        }(e10, t10, n10), lr(`Route ${e10} needs to bail out of prerendering at this point because it used ${t10}.`);
      }
      function le(e10, t10, r10) {
        (function() {
          if (!s4) throw Error("Invariant: React.unstable_postpone is not defined. This suggests the wrong version of React was loaded. This is a bug in Next.js");
        })(), r10 && r10.dynamicAccesses.push({ stack: r10.isDebugDynamicAccesses ? Error().stack : void 0, expression: t10 }), s3.unstable_postpone(lt(e10, t10));
      }
      function lt(e10, t10) {
        return `Route ${e10} needs to bail out of prerendering at this point because it used ${t10}. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error`;
      }
      if (false === function(e10) {
        return e10.includes("needs to bail out of prerendering at this point because it used") && e10.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error");
      }(lt("%%%", "^^^"))) throw Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js");
      function lr(e10) {
        let t10 = Error(e10);
        return t10.digest = "NEXT_PRERENDER_INTERRUPTED", t10;
      }
      function ln() {
        let e10 = e3.getStore();
        return (null == e10 ? void 0 : e10.rootTaskSpawnPhase) === "action";
      }
      function li(e10) {
        let t10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
        if (!t10) return e10;
        let { origin: r10 } = new URL(t10), { href: n10, origin: i10 } = e10.nextUrl;
        return new q(n10.replace(i10, r10), e10);
      }
      function lo(e10) {
        try {
          e10.secret ?? (e10.secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);
          let t10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
          if (!t10) return;
          let { pathname: r10 } = new URL(t10);
          if ("/" === r10) return;
          e10.basePath || (e10.basePath = r10);
        } catch {
        } finally {
          e10.basePath || (e10.basePath = "/api/auth"), function(e11, t10, r10 = false) {
            try {
              let n10 = e11.AUTH_URL;
              n10 && (t10.basePath ? r10 || ia(t10).warn("env-url-basepath-redundant") : t10.basePath = new URL(n10).pathname);
            } catch {
            } finally {
              t10.basePath ?? (t10.basePath = "/auth");
            }
            if (!t10.secret?.length) {
              t10.secret = [];
              let r11 = e11.AUTH_SECRET;
              for (let n10 of (r11 && t10.secret.push(r11), [1, 2, 3])) {
                let r12 = e11[`AUTH_SECRET_${n10}`];
                r12 && t10.secret.unshift(r12);
              }
            }
            t10.redirectProxyUrl ?? (t10.redirectProxyUrl = e11.AUTH_REDIRECT_PROXY_URL), t10.trustHost ?? (t10.trustHost = !!(e11.AUTH_URL ?? e11.AUTH_TRUST_HOST ?? e11.VERCEL ?? e11.CF_PAGES ?? "production" !== e11.NODE_ENV)), t10.providers = t10.providers.map((t11) => {
              let { id: r11 } = "function" == typeof t11 ? t11({}) : t11, n10 = r11.toUpperCase().replace(/-/g, "_"), i10 = e11[`AUTH_${n10}_ID`], o10 = e11[`AUTH_${n10}_SECRET`], a10 = e11[`AUTH_${n10}_ISSUER`], s10 = e11[`AUTH_${n10}_KEY`], l2 = "function" == typeof t11 ? t11({ clientId: i10, clientSecret: o10, issuer: a10, apiKey: s10 }) : t11;
              return "oauth" === l2.type || "oidc" === l2.type ? (l2.clientId ?? (l2.clientId = i10), l2.clientSecret ?? (l2.clientSecret = o10), l2.issuer ?? (l2.issuer = a10)) : "email" === l2.type && (l2.apiKey ?? (l2.apiKey = s10)), l2;
            });
          }(process.env, e10, true);
        }
      }
      function la(e10, t10) {
        let r10 = new Promise((r11, n10) => {
          e10.addEventListener("abort", () => {
            n10(Error(`During prerendering, ${t10} rejects when the prerender is complete. Typically these errors are handled by React but if you move ${t10} to a different context by using \`setTimeout\`, \`after\`, or similar functions you may observe this error and you should handle it in that context.`));
          }, { once: true });
        });
        return r10.catch(ls), r10;
      }
      function ls() {
      }
      RegExp(`\\n\\s+at __next_metadata_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_viewport_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_outlet_boundary__[\\n\\s]`);
      let ll = { current: null }, lc = "function" == typeof s3.cache ? s3.cache : (e10) => e10, lu = console.warn;
      function ld(e10) {
        return function(...t10) {
          lu(e10(...t10));
        };
      }
      function lp() {
        let e10 = "cookies", t10 = ea.getStore(), r10 = es.getStore();
        if (t10) {
          if (r10 && "after" === r10.phase && !ln()) throw Error(`Route ${t10.route} used "cookies" inside "after(...)". This is not supported. If you need this data inside an "after" callback, use "cookies" outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`);
          if (t10.forceStatic) return lf(eu.seal(new W.RequestCookies(new Headers({}))));
          if (r10) {
            if ("cache" === r10.type) throw Error(`Route ${t10.route} used "cookies" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "cookies" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`);
            if ("unstable-cache" === r10.type) throw Error(`Route ${t10.route} used "cookies" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "cookies" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`);
          }
          if (t10.dynamicShouldError) throw new s6(`Route ${t10.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`cookies\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`);
          if (r10) {
            if ("prerender" === r10.type) return function(e11, t11) {
              let r11 = lh.get(t11);
              if (r11) return r11;
              let n11 = la(t11.renderSignal, "`cookies()`");
              return lh.set(t11, n11), Object.defineProperties(n11, { [Symbol.iterator]: { value: function() {
                let r12 = "`cookies()[Symbol.iterator]()`", n12 = lg(e11, r12);
                s7(e11, r12, n12, t11);
              } }, size: { get() {
                let r12 = "`cookies().size`", n12 = lg(e11, r12);
                s7(e11, r12, n12, t11);
              } }, get: { value: function() {
                let r12;
                r12 = 0 == arguments.length ? "`cookies().get()`" : `\`cookies().get(${lm(arguments[0])})\``;
                let n12 = lg(e11, r12);
                s7(e11, r12, n12, t11);
              } }, getAll: { value: function() {
                let r12;
                r12 = 0 == arguments.length ? "`cookies().getAll()`" : `\`cookies().getAll(${lm(arguments[0])})\``;
                let n12 = lg(e11, r12);
                s7(e11, r12, n12, t11);
              } }, has: { value: function() {
                let r12;
                r12 = 0 == arguments.length ? "`cookies().has()`" : `\`cookies().has(${lm(arguments[0])})\``;
                let n12 = lg(e11, r12);
                s7(e11, r12, n12, t11);
              } }, set: { value: function() {
                let r12;
                if (0 == arguments.length) r12 = "`cookies().set()`";
                else {
                  let e12 = arguments[0];
                  r12 = e12 ? `\`cookies().set(${lm(e12)}, ...)\`` : "`cookies().set(...)`";
                }
                let n12 = lg(e11, r12);
                s7(e11, r12, n12, t11);
              } }, delete: { value: function() {
                let r12;
                r12 = 0 == arguments.length ? "`cookies().delete()`" : 1 == arguments.length ? `\`cookies().delete(${lm(arguments[0])})\`` : `\`cookies().delete(${lm(arguments[0])}, ...)\``;
                let n12 = lg(e11, r12);
                s7(e11, r12, n12, t11);
              } }, clear: { value: function() {
                let r12 = "`cookies().clear()`", n12 = lg(e11, r12);
                s7(e11, r12, n12, t11);
              } }, toString: { value: function() {
                let r12 = "`cookies().toString()`", n12 = lg(e11, r12);
                s7(e11, r12, n12, t11);
              } } }), n11;
            }(t10.route, r10);
            "prerender-ppr" === r10.type ? le(t10.route, e10, r10.dynamicTracking) : "prerender-legacy" === r10.type && s8(e10, t10, r10);
          }
          s9(t10, r10);
        }
        let n10 = el(e10);
        return lf(eh(n10) ? n10.userspaceMutableCookies : n10.cookies);
      }
      lc((e10) => {
        try {
          lu(ll.current);
        } finally {
          ll.current = null;
        }
      });
      let lh = /* @__PURE__ */ new WeakMap();
      function lf(e10) {
        let t10 = lh.get(e10);
        if (t10) return t10;
        let r10 = Promise.resolve(e10);
        return lh.set(e10, r10), Object.defineProperties(r10, { [Symbol.iterator]: { value: e10[Symbol.iterator] ? e10[Symbol.iterator].bind(e10) : ly.bind(e10) }, size: { get: () => e10.size }, get: { value: e10.get.bind(e10) }, getAll: { value: e10.getAll.bind(e10) }, has: { value: e10.has.bind(e10) }, set: { value: e10.set.bind(e10) }, delete: { value: e10.delete.bind(e10) }, clear: { value: "function" == typeof e10.clear ? e10.clear.bind(e10) : lw.bind(e10, r10) }, toString: { value: e10.toString.bind(e10) } }), r10;
      }
      function lm(e10) {
        return "object" == typeof e10 && null !== e10 && "string" == typeof e10.name ? `'${e10.name}'` : "string" == typeof e10 ? `'${e10}'` : "...";
      }
      function lg(e10, t10) {
        let r10 = e10 ? `Route "${e10}" ` : "This route ";
        return Error(`${r10}used ${t10}. \`cookies()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`);
      }
      function ly() {
        return this.getAll().map((e10) => [e10.name, e10]).values();
      }
      function lw(e10) {
        for (let e11 of this.getAll()) this.delete(e11.name);
        return e10;
      }
      function lb() {
        let e10 = ea.getStore(), t10 = es.getStore();
        if (e10) {
          if (t10 && "after" === t10.phase && !ln()) throw Error(`Route ${e10.route} used "headers" inside "after(...)". This is not supported. If you need this data inside an "after" callback, use "headers" outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`);
          if (e10.forceStatic) return l_(et.seal(new Headers({})));
          if (t10) {
            if ("cache" === t10.type) throw Error(`Route ${e10.route} used "headers" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`);
            if ("unstable-cache" === t10.type) throw Error(`Route ${e10.route} used "headers" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`);
          }
          if (e10.dynamicShouldError) throw new s6(`Route ${e10.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`headers\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`);
          if (t10) {
            if ("prerender" === t10.type) return function(e11, t11) {
              let r10 = lv.get(t11);
              if (r10) return r10;
              let n10 = la(t11.renderSignal, "`headers()`");
              return lv.set(t11, n10), Object.defineProperties(n10, { append: { value: function() {
                let r11 = `\`headers().append(${lS(arguments[0])}, ...)\``, n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, delete: { value: function() {
                let r11 = `\`headers().delete(${lS(arguments[0])})\``, n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, get: { value: function() {
                let r11 = `\`headers().get(${lS(arguments[0])})\``, n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, has: { value: function() {
                let r11 = `\`headers().has(${lS(arguments[0])})\``, n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, set: { value: function() {
                let r11 = `\`headers().set(${lS(arguments[0])}, ...)\``, n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, getSetCookie: { value: function() {
                let r11 = "`headers().getSetCookie()`", n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, forEach: { value: function() {
                let r11 = "`headers().forEach(...)`", n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, keys: { value: function() {
                let r11 = "`headers().keys()`", n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, values: { value: function() {
                let r11 = "`headers().values()`", n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, entries: { value: function() {
                let r11 = "`headers().entries()`", n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } }, [Symbol.iterator]: { value: function() {
                let r11 = "`headers()[Symbol.iterator]()`", n11 = lk(e11, r11);
                s7(e11, r11, n11, t11);
              } } }), n10;
            }(e10.route, t10);
            "prerender-ppr" === t10.type ? le(e10.route, "headers", t10.dynamicTracking) : "prerender-legacy" === t10.type && s8("headers", e10, t10);
          }
          s9(e10, t10);
        }
        return l_(el("headers").headers);
      }
      ld(lg);
      let lv = /* @__PURE__ */ new WeakMap();
      function l_(e10) {
        let t10 = lv.get(e10);
        if (t10) return t10;
        let r10 = Promise.resolve(e10);
        return lv.set(e10, r10), Object.defineProperties(r10, { append: { value: e10.append.bind(e10) }, delete: { value: e10.delete.bind(e10) }, get: { value: e10.get.bind(e10) }, has: { value: e10.has.bind(e10) }, set: { value: e10.set.bind(e10) }, getSetCookie: { value: e10.getSetCookie.bind(e10) }, forEach: { value: e10.forEach.bind(e10) }, keys: { value: e10.keys.bind(e10) }, values: { value: e10.values.bind(e10) }, entries: { value: e10.entries.bind(e10) }, [Symbol.iterator]: { value: e10[Symbol.iterator].bind(e10) } }), r10;
      }
      function lS(e10) {
        return "string" == typeof e10 ? `'${e10}'` : "...";
      }
      function lk(e10, t10) {
        let r10 = e10 ? `Route "${e10}" ` : "This route ";
        return Error(`${r10}used ${t10}. \`headers()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`);
      }
      ld(lk), /* @__PURE__ */ new WeakMap();
      function lx(e10) {
        let t10 = workAsyncStorage.getStore(), r10 = workUnitAsyncStorage.getStore();
        if (t10) {
          if (r10) {
            if ("cache" === r10.type) throw Error(`Route ${t10.route} used "${e10}" inside "use cache". The enabled status of draftMode can be read in caches but you must not enable or disable draftMode inside a cache. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`);
            if ("unstable-cache" === r10.type) throw Error(`Route ${t10.route} used "${e10}" inside a function cached with "unstable_cache(...)". The enabled status of draftMode can be read in caches but you must not enable or disable draftMode inside a cache. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`);
            if ("after" === r10.phase) throw Error(`Route ${t10.route} used "${e10}" inside \`after\`. The enabled status of draftMode can be read inside \`after\` but you cannot enable or disable draftMode. See more info here: https://nextjs.org/docs/app/api-reference/functions/after`);
          }
          if (t10.dynamicShouldError) throw new StaticGenBailoutError(`Route ${t10.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`${e10}\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`);
          if (r10) {
            if ("prerender" === r10.type) {
              let n10 = Error(`Route ${t10.route} used ${e10} without first calling \`await connection()\`. See more info here: https://nextjs.org/docs/messages/next-prerender-sync-headers`);
              abortAndThrowOnSynchronousRequestDataAccess(t10.route, e10, n10, r10);
            } else if ("prerender-ppr" === r10.type) postponeWithTracking(t10.route, e10, r10.dynamicTracking);
            else if ("prerender-legacy" === r10.type) {
              r10.revalidate = 0;
              let n10 = new DynamicServerError(`Route ${t10.route} couldn't be rendered statically because it used \`${e10}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`);
              throw t10.dynamicUsageDescription = e10, t10.dynamicUsageStack = n10.stack, n10;
            }
          }
        }
      }
      async function lE(e10, t10) {
        return s2(new Request(s1("session", e10.get("x-forwarded-proto"), e10, process.env, t10), { headers: { cookie: e10.get("cookie") ?? "" } }), { ...t10, callbacks: { ...t10.callbacks, async session(...e11) {
          let r10 = await t10.callbacks?.session?.(...e11) ?? { ...e11[0].session, expires: e11[0].session.expires?.toISOString?.() ?? e11[0].session.expires };
          return { user: e11[0].user ?? e11[0].token, ...r10 };
        } } });
      }
      async function lA(e10) {
        return e10.ok ? await e10.json() : null;
      }
      function lT(e10) {
        return "function" == typeof e10;
      }
      function lP(e10, t10) {
        return "function" == typeof e10 ? async (...r10) => {
          if (!r10.length) {
            let r11 = await lb(), n11 = await e10(void 0);
            return t10?.(n11), lE(r11, n11).then(lA);
          }
          if (r10[0] instanceof Request) {
            let n11 = r10[0], i11 = r10[1], o11 = await e10(n11);
            return t10?.(o11), lC([n11, i11], o11);
          }
          if (lT(r10[0])) {
            let n11 = r10[0];
            return async (...r11) => {
              let i11 = await e10(r11[0]);
              return t10?.(i11), lC(r11, i11, n11);
            };
          }
          let n10 = "req" in r10[0] ? r10[0].req : r10[0], i10 = "res" in r10[0] ? r10[0].res : r10[1], o10 = await e10(n10);
          return t10?.(o10), lE(new Headers(n10.headers), o10).then(async (e11) => {
            let t11 = await lA(e11);
            for (let t12 of e11.headers.getSetCookie()) "headers" in i10 ? i10.headers.append("set-cookie", t12) : i10.appendHeader("set-cookie", t12);
            return t11;
          });
        } : (...t11) => {
          if (!t11.length) return Promise.resolve(lb()).then((t12) => lE(t12, e10).then(lA));
          if (t11[0] instanceof Request) return lC([t11[0], t11[1]], e10);
          if (lT(t11[0])) {
            let r11 = t11[0];
            return async (...t12) => lC(t12, e10, r11).then((e11) => e11);
          }
          let r10 = "req" in t11[0] ? t11[0].req : t11[0], n10 = "res" in t11[0] ? t11[0].res : t11[1];
          return lE(new Headers(r10.headers), e10).then(async (e11) => {
            let t12 = await lA(e11);
            for (let t13 of e11.headers.getSetCookie()) "headers" in n10 ? n10.headers.append("set-cookie", t13) : n10.appendHeader("set-cookie", t13);
            return t12;
          });
        };
      }
      async function lC(e10, t10, r10) {
        let n10 = li(e10[0]), i10 = await lE(n10.headers, t10), o10 = await lA(i10), a10 = true;
        t10.callbacks?.authorized && (a10 = await t10.callbacks.authorized({ request: n10, auth: o10 }));
        let s10 = F.next?.();
        if (a10 instanceof Response) {
          s10 = a10;
          let e11 = a10.headers.get("Location"), { pathname: r11 } = n10.nextUrl;
          e11 && function(e12, t11, r12) {
            let n11 = t11.replace(`${e12}/`, ""), i11 = Object.values(r12.pages ?? {});
            return (lR.has(n11) || i11.includes(t11)) && t11 === e12;
          }(r11, new URL(e11).pathname, t10) && (a10 = true);
        } else if (r10) n10.auth = o10, s10 = await r10(n10, e10[1]) ?? F.next();
        else if (!a10) {
          let e11 = t10.pages?.signIn ?? `${t10.basePath}/signin`;
          if (n10.nextUrl.pathname !== e11) {
            let t11 = n10.nextUrl.clone();
            t11.pathname = e11, t11.searchParams.set("callbackUrl", n10.nextUrl.href), s10 = F.redirect(t11);
          }
        }
        let l2 = new Response(s10?.body, s10);
        for (let e11 of i10.headers.getSetCookie()) l2.headers.append("set-cookie", e11);
        return l2;
      }
      ld(function(e10, t10) {
        let r10 = e10 ? `Route "${e10}" ` : "This route ";
        return Error(`${r10}used ${t10}. \`draftMode()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`);
      });
      let lR = /* @__PURE__ */ new Set(["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error"]), lO = eo();
      var lI = function(e10) {
        return e10[e10.SeeOther = 303] = "SeeOther", e10[e10.TemporaryRedirect = 307] = "TemporaryRedirect", e10[e10.PermanentRedirect = 308] = "PermanentRedirect", e10;
      }({});
      let lU = "NEXT_REDIRECT";
      var lN = function(e10) {
        return e10.push = "push", e10.replace = "replace", e10;
      }({});
      function l$(e10, t10) {
        let r10 = lO.getStore();
        throw function(e11, t11, r11) {
          void 0 === r11 && (r11 = lI.TemporaryRedirect);
          let n10 = Error(lU);
          return n10.digest = lU + ";" + t11 + ";" + e11 + ";" + r11 + ";", n10;
        }(e10, t10 || ((null == r10 ? void 0 : r10.isAction) ? lN.push : lN.replace), lI.TemporaryRedirect);
      }
      async function lj(e10, t10 = {}, r10, n10) {
        let i10 = new Headers(await lb()), { redirect: o10 = true, redirectTo: a10, ...s10 } = t10 instanceof FormData ? Object.fromEntries(t10) : t10, l2 = a10?.toString() ?? i10.get("Referer") ?? "/", c2 = s1("signin", i10.get("x-forwarded-proto"), i10, process.env, n10);
        if (!e10) return c2.searchParams.append("callbackUrl", l2), o10 && l$(c2.toString()), c2.toString();
        let u2 = `${c2}/${e10}?${new URLSearchParams(r10)}`, d2 = {};
        for (let t11 of n10.providers) {
          let { options: r11, ...n11 } = "function" == typeof t11 ? t11() : t11, i11 = r11?.id ?? n11.id;
          if (i11 === e10) {
            d2 = { id: i11, type: r11?.type ?? n11.type };
            break;
          }
        }
        if (!d2.id) {
          let e11 = `${c2}?${new URLSearchParams({ callbackUrl: l2 })}`;
          return o10 && l$(e11), e11;
        }
        "credentials" === d2.type && (u2 = u2.replace("signin", "callback")), i10.set("Content-Type", "application/x-www-form-urlencoded");
        let p2 = new Request(u2, { method: "POST", headers: i10, body: new URLSearchParams({ ...s10, callbackUrl: l2 }) }), h2 = await s2(p2, { ...n10, raw: i_, skipCSRFCheck: iv }), f2 = await lp();
        for (let e11 of h2?.cookies ?? []) f2.set(e11.name, e11.value, e11.options);
        let m2 = (h2 instanceof Response ? h2.headers.get("Location") : h2.redirect) ?? u2;
        return o10 ? l$(m2) : m2;
      }
      async function lL(e10, t10) {
        let r10 = new Headers(await lb());
        r10.set("Content-Type", "application/x-www-form-urlencoded");
        let n10 = s1("signout", r10.get("x-forwarded-proto"), r10, process.env, t10), i10 = new URLSearchParams({ callbackUrl: e10?.redirectTo ?? r10.get("Referer") ?? "/" }), o10 = new Request(n10, { method: "POST", headers: r10, body: i10 }), a10 = await s2(o10, { ...t10, raw: i_, skipCSRFCheck: iv }), s10 = await lp();
        for (let e11 of a10?.cookies ?? []) s10.set(e11.name, e11.value, e11.options);
        return e10?.redirect ?? true ? l$(a10.redirect) : a10;
      }
      async function lD(e10, t10) {
        let r10 = new Headers(await lb());
        r10.set("Content-Type", "application/json");
        let n10 = new Request(s1("session", r10.get("x-forwarded-proto"), r10, process.env, t10), { method: "POST", headers: r10, body: JSON.stringify({ data: e10 }) }), i10 = await s2(n10, { ...t10, raw: i_, skipCSRFCheck: iv }), o10 = await lp();
        for (let e11 of i10?.cookies ?? []) o10.set(e11.name, e11.value, e11.options);
        return i10.body;
      }
      Object.values({ NOT_FOUND: 404, FORBIDDEN: 403, UNAUTHORIZED: 401 }), Symbol.for("react.postpone");
      let lM = { TYPE_COLLABORATOR: "COL" }, { handlers: lH, signIn: lW, signOut: lB, auth: lq } = function(e10) {
        if ("function" == typeof e10) {
          let t11 = async (t12) => {
            let r10 = await e10(t12);
            return lo(r10), s2(li(t12), r10);
          };
          return { handlers: { GET: t11, POST: t11 }, auth: lP(e10, (e11) => lo(e11)), signIn: async (t12, r10, n10) => {
            let i10 = await e10(void 0);
            return lo(i10), lj(t12, r10, n10, i10);
          }, signOut: async (t12) => {
            let r10 = await e10(void 0);
            return lo(r10), lL(t12, r10);
          }, unstable_update: async (t12) => {
            let r10 = await e10(void 0);
            return lo(r10), lD(t12, r10);
          } };
        }
        lo(e10);
        let t10 = (t11) => s2(li(t11), e10);
        return { handlers: { GET: t10, POST: t10 }, auth: lP(e10), signIn: (t11, r10, n10) => lj(t11, r10, n10, e10), signOut: (t11) => lL(t11, e10), unstable_update: (t11) => lD(t11, e10) };
      }({ providers: [{ id: "zitadel", name: "ZITADEL", type: "oidc", options: { issuer: process.env.ZITADEL_ISSUER || "https://api-dev-local.kplian.com", clientId: process.env.ZITADEL_CLIENT_ID || "", clientSecret: process.env.ZITADEL_CLIENT_SECRET || "", authorization: { params: { scope: "openid email profile offline_access urn:zitadel:iam:org:project:id:zitadel:aud" } }, async profile(e10, t10) {
        try {
          let e11 = await fetch(`${process.env.ZITADEL_ISSUER}/oidc/v1/userinfo`, { headers: { Authorization: `Bearer ${t10.access_token}` } });
          if (e11.ok) {
            let t11 = await e11.json();
            return { id: t11.sub, name: t11.name || t11.preferred_username || t11.email || "Zitadel User", email: t11.email, image: t11.picture, username: t11.preferred_username };
          }
        } catch (e11) {
          console.error("Manual userinfo fetch failed", e11);
        }
        return { id: e10.sub, name: e10.name || e10.preferred_username || "User", email: e10.email, image: e10.picture, username: e10.preferred_username };
      } } }], secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "fallback_secret_for_development_only", trustHost: true, callbacks: { async signIn({ user: e10, account: t10, profile: r10 }) {
        let n10 = e10.username || r10?.preferred_username;
        if (t10?.provider === "zitadel" && n10) {
          let i10 = process.env.NEXT_PUBLIC_API_URL || process.env.API_GATEWAY_URL || "https://api-dev-local.kplian.com", o10 = t10.access_token;
          try {
            let t11 = `${i10}/crm/api/v1/persons/by-code/${n10}`, a10 = await fetch(t11, { headers: { Authorization: `Bearer ${o10}` } }), s10 = await a10.text();
            if (console.log("verdes"), 404 === a10.status || a10.ok && 0 === s10.length) {
              let t12 = (await lb()).get("cookie") || "", a11 = t12.match(/invitation_id=([^;]+)/), s11 = a11 ? a11[1] : void 0;
              if (!s11) {
                let e11 = t12.match(/(?:next-auth\.callback-url|__Secure-next-auth\.callback-url|authjs\.callback-url)=([^;]+)/);
                if (e11) {
                  let t13 = decodeURIComponent(e11[1]), r11 = t13.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{4}-[0-9a-f]{12}/i) || t13.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
                  s11 = r11 ? r11[0] : void 0;
                }
              }
              let l3 = (e10.name || "").split(" "), c2 = { code: n10, vendorCode: n10, name1: r10?.given_name || l3[0] || "Unknown", name2: l3.length > 2 ? l3[1] : "", name3: "", surname1: r10?.family_name || (l3.length > 1 ? l3[l3.length - 1] : "Unknown"), surname2: "", surname3: "", birthdate: r10?.birthdate || "2024-01-01T00:00:00.000Z", gender: r10?.gender || null, type: "nat", cityOrigin: null, completeName: e10.name || n10 };
              e10.vendorPersonName = e10.name || n10, e10.vendorPersonCode = n10;
              let u2 = s11 ? `${i10}/crm/api/v1/persons/invitation/${s11}` : `${i10}/crm/api/v1/persons`, d2 = await fetch(u2, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${o10}` }, body: JSON.stringify(c2) });
              if (d2.ok) {
                let t13 = await d2.json();
                e10.vendorPersonId = t13?.id || null, e10.vendorPersonCode = t13?.vendorCode || t13?.code || n10, e10.vendorPersonName = t13?.completeName || (t13?.name1 ? `${t13.name1} ${t13.surname1 || ""}`.trim() : null) || e10.name || n10;
              }
            } else if (a10.ok && s10.length > 0) try {
              let t12 = JSON.parse(s10);
              e10.vendorPersonId = t12?.id || null, e10.vendorPersonCode = t12?.vendorCode || t12?.code || n10, e10.vendorPersonName = t12?.completeName || (t12?.name1 ? `${t12.name1} ${t12.surname1 || ""}`.trim() : null) || e10.name || n10;
            } catch {
            }
            let l2 = e10.vendorPersonId;
            if (l2) {
              let t12 = `${i10}/crm/api/v1/persons/${l2}/contacts-as-comp?type=${lM.TYPE_COLLABORATOR}`, r11 = await fetch(t12, { headers: { Authorization: `Bearer ${o10}` } });
              if (r11.ok) {
                let t13 = await r11.json();
                if (Array.isArray(t13) && t13.length > 0) {
                  let r12 = t13.map((e11) => {
                    let t14 = e11.personComp || e11.person, r13 = t14?.completeName || (t14?.name1 ? `${t14.name1} ${t14.surname1 || ""}`.trim() : null) || e11.personCompName || e11.personCompCode || e11.personCompId;
                    return { id: e11.personCompId, name: r13, code: t14?.vendorCode || t14?.code || e11.personCompCode || e11.personCompId };
                  });
                  e10.relatedVendors = [{ id: e10.vendorPersonId, name: e10.vendorPersonName, code: e10.vendorPersonCode || n10, isSelf: true }, ...r12];
                }
              }
            }
          } catch (e11) {
            console.error("NextAuth: Error during JIT provisioning:", e11);
          }
        }
        return true;
      }, async jwt({ token: e10, profile: t10, account: r10, user: n10, trigger: i10, session: o10 }) {
        if (r10 && (e10.accessToken = r10.access_token, e10.idToken = r10.id_token), n10 && (e10.username = n10.username, e10.roles = n10.roles || [], n10.vendorPersonId && (e10.vendorPersonId = n10.vendorPersonId, e10.vendorPersonName = n10.vendorPersonName, e10.vendorPersonCode = n10.vendorPersonCode || n10.username || n10.email), n10.relatedVendors && (e10.relatedVendors = n10.relatedVendors)), "update" === i10 && o10?.vendor && (e10.vendorPersonId = o10.vendor, o10.vendorName && (e10.vendorPersonName = o10.vendorName), o10.vendorCode && (e10.vendorPersonCode = o10.vendorCode)), t10) {
          let r11 = t10["urn:zitadel:iam:org:project:roles"] || {};
          e10.roles = Object.keys(r11);
        }
        return e10;
      }, session: async ({ session: e10, token: t10 }) => (e10.user = { id: t10.sub, name: t10.name, email: t10.email, username: t10.username, roles: t10.roles }, e10.accessToken = t10.accessToken, e10.idToken = t10.idToken, e10.vendor = t10.vendorPersonId || null, e10.vendorName = t10.vendorPersonName || null, e10.vendorCode = t10.vendorPersonCode || t10.username || t10.email || null, e10.relatedVendors = t10.relatedVendors || [], e10) }, pages: { signIn: "/login" } }), lK = lq((e10) => {
        let t10 = !!e10.auth, r10 = "/login" === e10.nextUrl.pathname, n10 = e10.nextUrl.search, i10 = e10.nextUrl.searchParams.get("invitationId");
        !i10 && n10.startsWith("?") && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(n10.substring(1)) && (i10 = n10.substring(1));
        let o10 = F.next();
        if (r10) o10 = t10 ? F.redirect(new URL("/", e10.nextUrl)) : F.next();
        else if (!t10) {
          let t11 = e10.nextUrl.pathname;
          e10.nextUrl.search && (t11 += e10.nextUrl.search), o10 = F.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(t11)}`, e10.nextUrl));
        }
        return i10 && o10.cookies.set("invitation_id", i10, { maxAge: 3600, path: "/", sameSite: "lax", secure: true }), o10;
      }), lV = { matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"] }, lz = { ...d }, lJ = lz.middleware || lz.default, lF = "/src/middleware";
      if ("function" != typeof lJ) throw Error(`The Middleware "${lF}" must export a \`middleware\` or a \`default\` function`);
      function lG(e10) {
        return tn({ ...e10, page: lF, handler: async (...e11) => {
          try {
            return await lJ(...e11);
          } catch (i10) {
            let t10 = e11[0], r10 = new URL(t10.url), n10 = r10.pathname + r10.search;
            throw await m(i10, { path: n10, method: t10.method, headers: Object.fromEntries(t10.headers.entries()) }, { routerKind: "Pages Router", routePath: "/middleware", routeType: "middleware", revalidateReason: void 0 }), i10;
          }
        } });
      }
    } }, (e) => {
      var t = e(e.s = 394);
      (_ENTRIES = "undefined" == typeof _ENTRIES ? {} : _ENTRIES)["middleware_src/middleware"] = t;
    }]);
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(path3);
  } catch {
  }
  const correspondingRoute = routes.find((route) => route.regex.some((r) => {
    const regex = new RegExp(r);
    return regex.test(path3) || decodedPath !== void 0 && regex.test(decodedPath);
  }));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "src/middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!api\\/auth|_next\\/static|_next\\/image|favicon.ico).*))(\\.json)?[\\/#\\?]?$"] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/requestCache.js
var RequestCache = class {
  _caches = /* @__PURE__ */ new Map();
  /**
   * Returns the Map registered under `key`.
   * If no Map exists yet for that key, a new empty Map is created, stored, and returned.
   * Repeated calls with the same key always return the **same** Map instance.
   */
  getOrCreate(key) {
    let cache = this._caches.get(key);
    if (!cache) {
      cache = /* @__PURE__ */ new Map();
      this._caches.set(key, cache);
    }
    return cache;
  }
};

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/promise.js
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set(),
    requestCache: new RequestCache()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "eslint": { "ignoreDuringBuilds": true }, "typescript": { "ignoreBuildErrors": true, "tsconfigPath": "tsconfig.json" }, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.ts", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/webp"], "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "remotePatterns": [], "unoptimized": false }, "devIndicators": { "appIsrStatus": true, "buildActivity": true, "buildActivityPosition": "bottom-right" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "/Users/admin/DevelopmentRCM/KPLIAN/FRONTEND/WEBAPP", "experimental": { "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 0, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 4294967294 } }, "cacheHandlers": {}, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientSegmentCache": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 7, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "turbo": { "root": "/Users/admin/DevelopmentRCM/KPLIAN/FRONTEND/WEBAPP" }, "typedRoutes": false, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "reactOwnerStack": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "useEarlyImport": false, "staleTimes": { "dynamic": 0, "static": 300 }, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "dynamicIO": false, "inlineCss": false, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-squlite-node", "@effect/sql-squlite-bun", "@effect/sql-squlite-wasm", "@effect/sql-squlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "bundlePagesRouterDependencies": false, "configFileName": "next.config.ts", "serverExternalPackages": ["lightningcss"] };
var BuildId = "yXBheieXOFy_Y2qm1NhFi";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/crm/address/new", "regex": "^/crm/address/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/address/new(?:/)?$" }, { "page": "/crm/commercial/campaign/custom", "regex": "^/crm/commercial/campaign/custom(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/commercial/campaign/custom(?:/)?$" }, { "page": "/crm/commercial/campaign/custom/new", "regex": "^/crm/commercial/campaign/custom/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/commercial/campaign/custom/new(?:/)?$" }, { "page": "/crm/commercial/campaign/general", "regex": "^/crm/commercial/campaign/general(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/commercial/campaign/general(?:/)?$" }, { "page": "/crm/commercial/campaign/general/new", "regex": "^/crm/commercial/campaign/general/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/commercial/campaign/general/new(?:/)?$" }, { "page": "/crm/commercial/collaborator", "regex": "^/crm/commercial/collaborator(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/commercial/collaborator(?:/)?$" }, { "page": "/crm/commercial/collaborator/new", "regex": "^/crm/commercial/collaborator/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/commercial/collaborator/new(?:/)?$" }, { "page": "/crm/commercial/schedule", "regex": "^/crm/commercial/schedule(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/commercial/schedule(?:/)?$" }, { "page": "/crm/commercial/schedule/new", "regex": "^/crm/commercial/schedule/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/commercial/schedule/new(?:/)?$" }, { "page": "/crm/communication-channel/new", "regex": "^/crm/communication\\-channel/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/communication\\-channel/new(?:/)?$" }, { "page": "/crm/contact/new", "regex": "^/crm/contact/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/contact/new(?:/)?$" }, { "page": "/crm/economic-activity/new", "regex": "^/crm/economic\\-activity/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/economic\\-activity/new(?:/)?$" }, { "page": "/crm/identification/new", "regex": "^/crm/identification/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/identification/new(?:/)?$" }, { "page": "/crm/organization", "regex": "^/crm/organization(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/organization(?:/)?$" }, { "page": "/crm/organization/new", "regex": "^/crm/organization/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/organization/new(?:/)?$" }, { "page": "/crm/organization/tree", "regex": "^/crm/organization/tree(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/organization/tree(?:/)?$" }, { "page": "/crm/payment-method/new", "regex": "^/crm/payment\\-method/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/payment\\-method/new(?:/)?$" }, { "page": "/crm/person", "regex": "^/crm/person(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/person(?:/)?$" }, { "page": "/crm/person/invitation", "regex": "^/crm/person/invitation(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/person/invitation(?:/)?$" }, { "page": "/crm/person/invitation/new", "regex": "^/crm/person/invitation/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/person/invitation/new(?:/)?$" }, { "page": "/crm/person/new", "regex": "^/crm/person/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/person/new(?:/)?$" }, { "page": "/crm/person/profile", "regex": "^/crm/person/profile(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/person/profile(?:/)?$" }, { "page": "/crm/person-digital-content/new", "regex": "^/crm/person\\-digital\\-content/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/person\\-digital\\-content/new(?:/)?$" }, { "page": "/crm/person-skill/new", "regex": "^/crm/person\\-skill/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/person\\-skill/new(?:/)?$" }, { "page": "/crm/sales", "regex": "^/crm/sales(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/sales(?:/)?$" }, { "page": "/crm/sales/new", "regex": "^/crm/sales/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/sales/new(?:/)?$" }, { "page": "/crm/work-experience/new", "regex": "^/crm/work\\-experience/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/crm/work\\-experience/new(?:/)?$" }, { "page": "/login", "regex": "^/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/login(?:/)?$" }, { "page": "/parameter/secrets", "regex": "^/parameter/secrets(?:/)?$", "routeKeys": {}, "namedRegex": "^/parameter/secrets(?:/)?$" }, { "page": "/parameter/structure", "regex": "^/parameter/structure(?:/)?$", "routeKeys": {}, "namedRegex": "^/parameter/structure(?:/)?$" }, { "page": "/parameter/vendor", "regex": "^/parameter/vendor(?:/)?$", "routeKeys": {}, "namedRegex": "^/parameter/vendor(?:/)?$" }, { "page": "/select-vendor", "regex": "^/select\\-vendor(?:/)?$", "routeKeys": {}, "namedRegex": "^/select\\-vendor(?:/)?$" }, { "page": "/warehouse/inventory", "regex": "^/warehouse/inventory(?:/)?$", "routeKeys": {}, "namedRegex": "^/warehouse/inventory(?:/)?$" }, { "page": "/warehouse/movement/in", "regex": "^/warehouse/movement/in(?:/)?$", "routeKeys": {}, "namedRegex": "^/warehouse/movement/in(?:/)?$" }, { "page": "/warehouse/movement/out", "regex": "^/warehouse/movement/out(?:/)?$", "routeKeys": {}, "namedRegex": "^/warehouse/movement/out(?:/)?$" }, { "page": "/warehouse/rep_daily", "regex": "^/warehouse/rep_daily(?:/)?$", "routeKeys": {}, "namedRegex": "^/warehouse/rep_daily(?:/)?$" }, { "page": "/warehouse/rep_kardex", "regex": "^/warehouse/rep_kardex(?:/)?$", "routeKeys": {}, "namedRegex": "^/warehouse/rep_kardex(?:/)?$" }, { "page": "/warehouse/rep_stock", "regex": "^/warehouse/rep_stock(?:/)?$", "routeKeys": {}, "namedRegex": "^/warehouse/rep_stock(?:/)?$" }, { "page": "/warehouse/warehouse", "regex": "^/warehouse/warehouse(?:/)?$", "routeKeys": {}, "namedRegex": "^/warehouse/warehouse(?:/)?$" }, { "page": "/warehouse/warehouse/new", "regex": "^/warehouse/warehouse/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/warehouse/warehouse/new(?:/)?$" }, { "page": "/workflow/fields", "regex": "^/workflow/fields(?:/)?$", "routeKeys": {}, "namedRegex": "^/workflow/fields(?:/)?$" }, { "page": "/workflow/fields/edit/%5Bid%5D", "regex": "^/workflow/fields/edit/%5Bid%5D(?:/)?$", "routeKeys": {}, "namedRegex": "^/workflow/fields/edit/%5Bid%5D(?:/)?$" }, { "page": "/workflow/fields/new", "regex": "^/workflow/fields/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/workflow/fields/new(?:/)?$" }, { "page": "/workflow/inbox", "regex": "^/workflow/inbox(?:/)?$", "routeKeys": {}, "namedRegex": "^/workflow/inbox(?:/)?$" }, { "page": "/workflow/inbox/new", "regex": "^/workflow/inbox/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/workflow/inbox/new(?:/)?$" }, { "page": "/workflow/process", "regex": "^/workflow/process(?:/)?$", "routeKeys": {}, "namedRegex": "^/workflow/process(?:/)?$" }, { "page": "/workflow/process/new", "regex": "^/workflow/process/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/workflow/process/new(?:/)?$" }, { "page": "/workflow/tasks", "regex": "^/workflow/tasks(?:/)?$", "routeKeys": {}, "namedRegex": "^/workflow/tasks(?:/)?$" }, { "page": "/workflow/tasks/new", "regex": "^/workflow/tasks/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/workflow/tasks/new(?:/)?$" }], "dynamic": [{ "page": "/api/auth/[...nextauth]", "regex": "^/api/auth/(.+?)(?:/)?$", "routeKeys": { "nxtPnextauth": "nxtPnextauth" }, "namedRegex": "^/api/auth/(?<nxtPnextauth>.+?)(?:/)?$" }, { "page": "/crm/address/edit/[id]", "regex": "^/crm/address/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/address/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/campaign/custom/edit/[id]", "regex": "^/crm/commercial/campaign/custom/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/commercial/campaign/custom/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/campaign/general/edit/[id]", "regex": "^/crm/commercial/campaign/general/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/commercial/campaign/general/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/campaign-product/[commercialProductId]", "regex": "^/crm/commercial/campaign\\-product/([^/]+?)(?:/)?$", "routeKeys": { "nxtPcommercialProductId": "nxtPcommercialProductId" }, "namedRegex": "^/crm/commercial/campaign\\-product/(?<nxtPcommercialProductId>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/campaign-product/[commercialProductId]/edit/[id]", "regex": "^/crm/commercial/campaign\\-product/([^/]+?)/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPcommercialProductId": "nxtPcommercialProductId", "nxtPid": "nxtPid" }, "namedRegex": "^/crm/commercial/campaign\\-product/(?<nxtPcommercialProductId>[^/]+?)/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/campaign-product/[commercialProductId]/new", "regex": "^/crm/commercial/campaign\\-product/([^/]+?)/new(?:/)?$", "routeKeys": { "nxtPcommercialProductId": "nxtPcommercialProductId" }, "namedRegex": "^/crm/commercial/campaign\\-product/(?<nxtPcommercialProductId>[^/]+?)/new(?:/)?$" }, { "page": "/crm/commercial/collaborator/edit/[id]", "regex": "^/crm/commercial/collaborator/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/commercial/collaborator/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/commercial-product/[campaignId]", "regex": "^/crm/commercial/commercial\\-product/([^/]+?)(?:/)?$", "routeKeys": { "nxtPcampaignId": "nxtPcampaignId" }, "namedRegex": "^/crm/commercial/commercial\\-product/(?<nxtPcampaignId>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/commercial-product/[campaignId]/edit/[productId]", "regex": "^/crm/commercial/commercial\\-product/([^/]+?)/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPcampaignId": "nxtPcampaignId", "nxtPproductId": "nxtPproductId" }, "namedRegex": "^/crm/commercial/commercial\\-product/(?<nxtPcampaignId>[^/]+?)/edit/(?<nxtPproductId>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/commercial-product/[campaignId]/new", "regex": "^/crm/commercial/commercial\\-product/([^/]+?)/new(?:/)?$", "routeKeys": { "nxtPcampaignId": "nxtPcampaignId" }, "namedRegex": "^/crm/commercial/commercial\\-product/(?<nxtPcampaignId>[^/]+?)/new(?:/)?$" }, { "page": "/crm/commercial/commercial-product-picture/[commercialProductId]", "regex": "^/crm/commercial/commercial\\-product\\-picture/([^/]+?)(?:/)?$", "routeKeys": { "nxtPcommercialProductId": "nxtPcommercialProductId" }, "namedRegex": "^/crm/commercial/commercial\\-product\\-picture/(?<nxtPcommercialProductId>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/commercial-product-price/[campaignId]", "regex": "^/crm/commercial/commercial\\-product\\-price/([^/]+?)(?:/)?$", "routeKeys": { "nxtPcampaignId": "nxtPcampaignId" }, "namedRegex": "^/crm/commercial/commercial\\-product\\-price/(?<nxtPcampaignId>[^/]+?)(?:/)?$" }, { "page": "/crm/commercial/schedule/edit/[id]", "regex": "^/crm/commercial/schedule/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/commercial/schedule/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/communication-channel/edit/[id]", "regex": "^/crm/communication\\-channel/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/communication\\-channel/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/contact/edit/[id]", "regex": "^/crm/contact/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/contact/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/economic-activity/edit/[id]", "regex": "^/crm/economic\\-activity/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/economic\\-activity/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/identification/edit/[id]", "regex": "^/crm/identification/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/identification/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/organization/edit/[id]", "regex": "^/crm/organization/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/organization/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/payment-method/edit/[id]", "regex": "^/crm/payment\\-method/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/payment\\-method/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/person/detail/[id]", "regex": "^/crm/person/detail/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/person/detail/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/person/edit/[id]", "regex": "^/crm/person/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/person/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/person/invitation/detail/[id]", "regex": "^/crm/person/invitation/detail/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/person/invitation/detail/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/person/invitation/edit/[id]", "regex": "^/crm/person/invitation/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/person/invitation/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/person-digital-content/edit/[id]", "regex": "^/crm/person\\-digital\\-content/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/person\\-digital\\-content/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/person-skill/edit/[id]", "regex": "^/crm/person\\-skill/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/person\\-skill/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/sales/edit/[id]", "regex": "^/crm/sales/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/sales/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/crm/work-experience/edit/[id]", "regex": "^/crm/work\\-experience/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/crm/work\\-experience/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/warehouse/warehouse/edit/[id]", "regex": "^/warehouse/warehouse/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/warehouse/warehouse/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/workflow/fields/edit/[id]", "regex": "^/workflow/fields/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/workflow/fields/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/workflow/forms/[processId]", "regex": "^/workflow/forms/([^/]+?)(?:/)?$", "routeKeys": { "nxtPprocessId": "nxtPprocessId" }, "namedRegex": "^/workflow/forms/(?<nxtPprocessId>[^/]+?)(?:/)?$" }, { "page": "/workflow/forms/[processId]/edit/[id]", "regex": "^/workflow/forms/([^/]+?)/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPprocessId": "nxtPprocessId", "nxtPid": "nxtPid" }, "namedRegex": "^/workflow/forms/(?<nxtPprocessId>[^/]+?)/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/workflow/forms/[processId]/new", "regex": "^/workflow/forms/([^/]+?)/new(?:/)?$", "routeKeys": { "nxtPprocessId": "nxtPprocessId" }, "namedRegex": "^/workflow/forms/(?<nxtPprocessId>[^/]+?)/new(?:/)?$" }, { "page": "/workflow/inbox/edit/[id]", "regex": "^/workflow/inbox/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/workflow/inbox/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/workflow/process/edit/[id]", "regex": "^/workflow/process/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/workflow/process/edit/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/workflow/tasks/edit/[id]", "regex": "^/workflow/tasks/edit/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/workflow/tasks/edit/(?<nxtPid>[^/]+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/crm/commercial/campaign/custom/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/commercial/campaign/custom/new", "dataRoute": "/crm/commercial/campaign/custom/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/commercial/campaign/custom": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/commercial/campaign/custom", "dataRoute": "/crm/commercial/campaign/custom.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/address/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/address/new", "dataRoute": "/crm/address/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/commercial/campaign/general/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/commercial/campaign/general/new", "dataRoute": "/crm/commercial/campaign/general/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/commercial/campaign/general": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/commercial/campaign/general", "dataRoute": "/crm/commercial/campaign/general.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/commercial/collaborator/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/commercial/collaborator/new", "dataRoute": "/crm/commercial/collaborator/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/commercial/collaborator": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/commercial/collaborator", "dataRoute": "/crm/commercial/collaborator.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/commercial/schedule/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/commercial/schedule/new", "dataRoute": "/crm/commercial/schedule/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/commercial/schedule": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/commercial/schedule", "dataRoute": "/crm/commercial/schedule.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/communication-channel/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/communication-channel/new", "dataRoute": "/crm/communication-channel/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/identification/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/identification/new", "dataRoute": "/crm/identification/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/economic-activity/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/economic-activity/new", "dataRoute": "/crm/economic-activity/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/payment-method/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/payment-method/new", "dataRoute": "/crm/payment-method/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/organization/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/organization/new", "dataRoute": "/crm/organization/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/person-digital-content/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/person-digital-content/new", "dataRoute": "/crm/person-digital-content/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/person-skill/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/person-skill/new", "dataRoute": "/crm/person-skill/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/person/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/person/new", "dataRoute": "/crm/person/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/person": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/person", "dataRoute": "/crm/person.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/person/profile": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/person/profile", "dataRoute": "/crm/person/profile.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/sales/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/sales/new", "dataRoute": "/crm/sales/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/sales": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/sales", "dataRoute": "/crm/sales.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/work-experience/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/work-experience/new", "dataRoute": "/crm/work-experience/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/login": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/login", "dataRoute": "/login.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/", "dataRoute": "/index.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/parameter/structure": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/parameter/structure", "dataRoute": "/parameter/structure.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/parameter/secrets": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/parameter/secrets", "dataRoute": "/parameter/secrets.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/select-vendor": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/select-vendor", "dataRoute": "/select-vendor.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/contact/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/contact/new", "dataRoute": "/crm/contact/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/crm/person/invitation": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/crm/person/invitation", "dataRoute": "/crm/person/invitation.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/warehouse/inventory": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/warehouse/inventory", "dataRoute": "/warehouse/inventory.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/parameter/vendor": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/parameter/vendor", "dataRoute": "/parameter/vendor.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/warehouse/rep_daily": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/warehouse/rep_daily", "dataRoute": "/warehouse/rep_daily.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/warehouse/movement/in": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/warehouse/movement/in", "dataRoute": "/warehouse/movement/in.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/warehouse/rep_kardex": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/warehouse/rep_kardex", "dataRoute": "/warehouse/rep_kardex.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/warehouse/rep_stock": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/warehouse/rep_stock", "dataRoute": "/warehouse/rep_stock.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/warehouse/movement/out": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/warehouse/movement/out", "dataRoute": "/warehouse/movement/out.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/warehouse/warehouse": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/warehouse/warehouse", "dataRoute": "/warehouse/warehouse.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/warehouse/warehouse/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/warehouse/warehouse/new", "dataRoute": "/warehouse/warehouse/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/workflow/fields/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/workflow/fields/new", "dataRoute": "/workflow/fields/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/workflow/fields/edit/%5Bid%5D": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/workflow/fields/edit/%5Bid%5D", "dataRoute": "/workflow/fields/edit/%5Bid%5D.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/workflow/fields": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/workflow/fields", "dataRoute": "/workflow/fields.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/workflow/inbox": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/workflow/inbox", "dataRoute": "/workflow/inbox.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/workflow/inbox/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/workflow/inbox/new", "dataRoute": "/workflow/inbox/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/workflow/process": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/workflow/process", "dataRoute": "/workflow/process.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/workflow/process/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/workflow/process/new", "dataRoute": "/workflow/process/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/workflow/tasks/new": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/workflow/tasks/new", "dataRoute": "/workflow/tasks/new.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/workflow/tasks": { "experimentalBypassFor": [{ "type": "header", "key": "Next-Action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/workflow/tasks", "dataRoute": "/workflow/tasks.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "4ab83ca9963ca15f5987a33688242530", "previewModeSigningKey": "2ee3a8f49655e47444a93b114a7173581d1cde42efc5a0e4fd17f0e599d652cd", "previewModeEncryptionKey": "dc0a2a4dd93404df05ecd0658ac655b053978297dd52a631ef10b36928c8b24e" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/src/middleware.js"], "name": "src/middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!api\\/auth|_next\\/static|_next\\/image|favicon.ico).*))(\\.json)?[\\/#\\?]?$", "originalSource": "/((?!api/auth|_next/static|_next/image|favicon.ico).*)" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "yXBheieXOFy_Y2qm1NhFi", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "vMib2BZqrJQnMn7sNrp9DbPAnp51K/+AC6VXAgMkCIw=", "__NEXT_PREVIEW_MODE_ID": "4ab83ca9963ca15f5987a33688242530", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "dc0a2a4dd93404df05ecd0658ac655b053978297dd52a631ef10b36928c8b24e", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "2ee3a8f49655e47444a93b114a7173581d1cde42efc5a0e4fd17f0e599d652cd" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/api/auth/[...nextauth]/route": "/api/auth/[...nextauth]", "/crm/address/new/page": "/crm/address/new", "/crm/commercial/campaign/custom/edit/[id]/page": "/crm/commercial/campaign/custom/edit/[id]", "/_not-found/page": "/_not-found", "/crm/commercial/campaign/custom/new/page": "/crm/commercial/campaign/custom/new", "/crm/commercial/campaign-product/[commercialProductId]/new/page": "/crm/commercial/campaign-product/[commercialProductId]/new", "/crm/commercial/campaign/general/edit/[id]/page": "/crm/commercial/campaign/general/edit/[id]", "/crm/commercial/campaign-product/[commercialProductId]/page": "/crm/commercial/campaign-product/[commercialProductId]", "/crm/commercial/campaign/general/new/page": "/crm/commercial/campaign/general/new", "/crm/address/edit/[id]/page": "/crm/address/edit/[id]", "/crm/commercial/campaign/custom/page": "/crm/commercial/campaign/custom", "/crm/commercial/commercial-product-picture/[commercialProductId]/page": "/crm/commercial/commercial-product-picture/[commercialProductId]", "/crm/commercial/collaborator/new/page": "/crm/commercial/collaborator/new", "/crm/commercial/collaborator/edit/[id]/page": "/crm/commercial/collaborator/edit/[id]", "/crm/commercial/schedule/edit/[id]/page": "/crm/commercial/schedule/edit/[id]", "/crm/commercial/commercial-product/[campaignId]/edit/[productId]/page": "/crm/commercial/commercial-product/[campaignId]/edit/[productId]", "/crm/communication-channel/edit/[id]/page": "/crm/communication-channel/edit/[id]", "/crm/communication-channel/new/page": "/crm/communication-channel/new", "/crm/commercial/commercial-product/[campaignId]/new/page": "/crm/commercial/commercial-product/[campaignId]/new", "/crm/contact/new/page": "/crm/contact/new", "/crm/commercial/campaign/general/page": "/crm/commercial/campaign/general", "/crm/contact/edit/[id]/page": "/crm/contact/edit/[id]", "/crm/commercial/collaborator/page": "/crm/commercial/collaborator", "/crm/identification/new/page": "/crm/identification/new", "/crm/economic-activity/edit/[id]/page": "/crm/economic-activity/edit/[id]", "/crm/commercial/schedule/new/page": "/crm/commercial/schedule/new", "/crm/economic-activity/new/page": "/crm/economic-activity/new", "/crm/organization/edit/[id]/page": "/crm/organization/edit/[id]", "/crm/commercial/commercial-product/[campaignId]/page": "/crm/commercial/commercial-product/[campaignId]", "/crm/identification/edit/[id]/page": "/crm/identification/edit/[id]", "/crm/organization/page": "/crm/organization", "/crm/organization/tree/page": "/crm/organization/tree", "/crm/payment-method/edit/[id]/page": "/crm/payment-method/edit/[id]", "/crm/payment-method/new/page": "/crm/payment-method/new", "/crm/person-skill/edit/[id]/page": "/crm/person-skill/edit/[id]", "/crm/organization/new/page": "/crm/organization/new", "/crm/person-digital-content/new/page": "/crm/person-digital-content/new", "/crm/person-skill/new/page": "/crm/person-skill/new", "/crm/person/detail/[id]/page": "/crm/person/detail/[id]", "/crm/person/invitation/new/page": "/crm/person/invitation/new", "/crm/person/edit/[id]/page": "/crm/person/edit/[id]", "/crm/person/invitation/detail/[id]/page": "/crm/person/invitation/detail/[id]", "/crm/person/new/page": "/crm/person/new", "/crm/person/invitation/page": "/crm/person/invitation", "/crm/person/page": "/crm/person", "/crm/person/profile/page": "/crm/person/profile", "/crm/sales/edit/[id]/page": "/crm/sales/edit/[id]", "/crm/sales/new/page": "/crm/sales/new", "/crm/work-experience/edit/[id]/page": "/crm/work-experience/edit/[id]", "/crm/sales/page": "/crm/sales", "/crm/work-experience/new/page": "/crm/work-experience/new", "/page": "/", "/login/page": "/login", "/parameter/secrets/page": "/parameter/secrets", "/crm/person/invitation/edit/[id]/page": "/crm/person/invitation/edit/[id]", "/select-vendor/page": "/select-vendor", "/warehouse/movement/in/page": "/warehouse/movement/in", "/warehouse/inventory/page": "/warehouse/inventory", "/parameter/structure/page": "/parameter/structure", "/crm/person-digital-content/edit/[id]/page": "/crm/person-digital-content/edit/[id]", "/warehouse/rep_stock/page": "/warehouse/rep_stock", "/crm/commercial/campaign-product/[commercialProductId]/edit/[id]/page": "/crm/commercial/campaign-product/[commercialProductId]/edit/[id]", "/warehouse/rep_daily/page": "/warehouse/rep_daily", "/warehouse/warehouse/new/page": "/warehouse/warehouse/new", "/warehouse/warehouse/edit/[id]/page": "/warehouse/warehouse/edit/[id]", "/warehouse/movement/out/page": "/warehouse/movement/out", "/warehouse/rep_kardex/page": "/warehouse/rep_kardex", "/warehouse/warehouse/page": "/warehouse/warehouse", "/workflow/fields/new/page": "/workflow/fields/new", "/workflow/fields/edit/[id]/page": "/workflow/fields/edit/[id]", "/workflow/fields/edit/%5Bid%5D/page": "/workflow/fields/edit/%5Bid%5D", "/workflow/forms/[processId]/page": "/workflow/forms/[processId]", "/workflow/fields/page": "/workflow/fields", "/workflow/forms/[processId]/edit/[id]/page": "/workflow/forms/[processId]/edit/[id]", "/workflow/forms/[processId]/new/page": "/workflow/forms/[processId]/new", "/workflow/inbox/page": "/workflow/inbox", "/workflow/inbox/edit/[id]/page": "/workflow/inbox/edit/[id]", "/workflow/process/page": "/workflow/process", "/workflow/inbox/new/page": "/workflow/inbox/new", "/workflow/tasks/page": "/workflow/tasks", "/parameter/vendor/page": "/parameter/vendor", "/crm/commercial/schedule/page": "/crm/commercial/schedule", "/workflow/process/edit/[id]/page": "/workflow/process/edit/[id]", "/crm/commercial/commercial-product-price/[campaignId]/page": "/crm/commercial/commercial-product-price/[campaignId]", "/workflow/process/new/page": "/workflow/process/new", "/workflow/tasks/edit/[id]/page": "/workflow/tasks/edit/[id]", "/workflow/tasks/new/page": "/workflow/tasks/new" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js", "/404": "pages/404.html" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.OPEN_NEXT_BUILD_ID = NextConfig.deploymentId ?? BuildId;
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();
import { ReadableStream as ReadableStream3 } from "node:stream/web";

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    const nextUrl = constructNextUrl(internalEvent.url, `/${detectedLocale}${NextConfig.trailingSlash ? "/" : ""}`);
    const queryString = convertToQueryString(internalEvent.query);
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: `${nextUrl}${queryString}`
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream3({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/semver.js
function compareSemver(v1, operator, v2) {
  let versionDiff = 0;
  if (v1 === "latest") {
    versionDiff = 1;
  } else {
    if (/^[^\d]/.test(v1)) {
      v1 = v1.substring(1);
    }
    if (/^[^\d]/.test(v2)) {
      v2 = v2.substring(1);
    }
    const [major1, minor1 = 0, patch1 = 0] = v1.split(".").map(Number);
    const [major2, minor2 = 0, patch2 = 0] = v2.split(".").map(Number);
    if (Number.isNaN(major1) || Number.isNaN(major2)) {
      throw new Error("The major version is required.");
    }
    if (major1 !== major2) {
      versionDiff = major1 - major2;
    } else if (minor1 !== minor2) {
      versionDiff = minor1 - minor2;
    } else if (patch1 !== patch2) {
      versionDiff = patch1 - patch2;
    }
  }
  switch (operator) {
    case "=":
      return versionDiff === 0;
    case ">=":
      return versionDiff >= 0;
    case "<=":
      return versionDiff <= 0;
    case ">":
      return versionDiff > 0;
    case "<":
      return versionDiff < 0;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/cache.js
async function isStale(key, tags, lastModified) {
  if (!compareSemver(globalThis.nextVersion, ">=", "16.0.0")) {
    return false;
  }
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.isStale?.(tags, lastModified) ?? false;
  }
  return await globalThis.tagCache.isStale?.(key, lastModified) ?? false;
}
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
async function computeCacheControl(path3, body, host, revalidate, lastModified, isStaleFromTagCache = false) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  const isSSG = finalRevalidate === CACHE_ONE_YEAR;
  const remainingTtl = Math.max(finalRevalidate - age, 1);
  const isStaleFromTime = !isSSG && remainingTtl === 1;
  const isStale2 = isStaleFromTime || isStaleFromTagCache;
  if (!isSSG || isStaleFromTagCache) {
    const sMaxAge = isStaleFromTagCache ? 1 : remainingTtl;
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate,
      isStaleFromTagCache
    });
    if (isStale2) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale2 ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  try {
    const segmentHeader = `${event.headers[NEXT_SEGMENT_PREFETCH_HEADER]}`;
    const isSegmentResponse = Boolean(segmentHeader) && segmentHeader in (cachedValue.segmentData || {}) && !NextConfig.experimental?.prefetchInlining;
    const body = isSegmentResponse ? cachedValue.segmentData[segmentHeader] : cachedValue.rsc;
    return {
      body,
      additionalHeaders: isSegmentResponse ? { [NEXT_PRERENDER_HEADER]: "1", [NEXT_POSTPONED_HEADER]: "2" } : {}
    };
  } catch (e) {
    error("Error while getting body for app router from cache:", e);
    return { body: cachedValue.rsc, additionalHeaders: {} };
  }
}
async function generateResult(event, localizedPath, cachedValue, lastModified, isStaleFromTagCache = false) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = event.headers.rsc === "1";
    if (isDataRequest) {
      const { body: appRouterBody, additionalHeaders: appHeaders } = getBodyForAppRouter(event, cachedValue);
      body = appRouterBody;
      additionalHeaders = appHeaders;
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified, isStaleFromTagCache);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER,
      ...additionalHeaders
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => escapePathDelimiters(decodeURIComponent(segment), true)).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  try {
    localizedPath = decodePathParams(localizedPath) || "/";
  } catch {
    return event;
  }
  const cacheKey = localizedPath === "/" ? "/index" : localizedPath;
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath) || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(cacheKey);
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      const tags = getTagsFromValue(cachedData.value);
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(cacheKey, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const _isStale = cachedData.shouldBypassTagCache ? false : await isStale(cacheKey, tags, cachedData.lastModified ?? Date.now());
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified, _isStale);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified, _isStale);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified, _isStale);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !(event.query.__nextDataReq === "1") && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      headers: {
        ...internalEvent.headers,
        "x-nextjs-data": "1"
      },
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(normalizedPath);
  } catch {
  }
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath) || decodedPath !== void 0 && r.test(decodedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
var NEXT_INTERNAL_HEADERS = [
  "x-middleware-rewrite",
  "x-middleware-redirect",
  "x-middleware-set-cookie",
  "x-middleware-skip",
  "x-middleware-override-headers",
  "x-middleware-next",
  "x-now-route-matches",
  "x-matched-path",
  "x-nextjs-data",
  "x-next-resume-state-length"
];
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      const lowerCaseKey = key.toLowerCase();
      if (lowerCaseKey.startsWith(INTERNAL_HEADER_PREFIX) || lowerCaseKey.startsWith(MIDDLEWARE_HEADER_PREFIX) || NEXT_INTERNAL_HEADERS.includes(lowerCaseKey)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// ../../../../../../.npm/_npx/72a7346bab235e2f/node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
