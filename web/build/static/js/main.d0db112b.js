/*! For license information please see main.d0db112b.js.LICENSE.txt */
(() => {
  var e = {
      43: (e, t, n) => {
        "use strict";
        e.exports = n(202);
      },
      153: (e, t, n) => {
        "use strict";
        var r = n(43),
          i = Symbol.for("react.element"),
          o = Symbol.for("react.fragment"),
          a = Object.prototype.hasOwnProperty,
          s =
            r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
              .ReactCurrentOwner,
          l = { key: !0, ref: !0, __self: !0, __source: !0 };
        function c(e, t, n) {
          var r,
            o = {},
            c = null,
            u = null;
          for (r in (void 0 !== n && (c = "" + n),
          void 0 !== t.key && (c = "" + t.key),
          void 0 !== t.ref && (u = t.ref),
          t))
            a.call(t, r) && !l.hasOwnProperty(r) && (o[r] = t[r]);
          if (e && e.defaultProps)
            for (r in (t = e.defaultProps)) void 0 === o[r] && (o[r] = t[r]);
          return {
            $$typeof: i,
            type: e,
            key: c,
            ref: u,
            props: o,
            _owner: s.current,
          };
        }
        (t.jsx = c), (t.jsxs = c);
      },
      202: (e, t) => {
        "use strict";
        var n = Symbol.for("react.element"),
          r = Symbol.for("react.portal"),
          i = Symbol.for("react.fragment"),
          o = Symbol.for("react.strict_mode"),
          a = Symbol.for("react.profiler"),
          s = Symbol.for("react.provider"),
          l = Symbol.for("react.context"),
          c = Symbol.for("react.forward_ref"),
          u = Symbol.for("react.suspense"),
          d = Symbol.for("react.memo"),
          h = Symbol.for("react.lazy"),
          f = Symbol.iterator;
        var p = {
            isMounted: function () {
              return !1;
            },
            enqueueForceUpdate: function () {},
            enqueueReplaceState: function () {},
            enqueueSetState: function () {},
          },
          m = Object.assign,
          g = {};
        function v(e, t, n) {
          (this.props = e),
            (this.context = t),
            (this.refs = g),
            (this.updater = n || p);
        }
        function y() {}
        function x(e, t, n) {
          (this.props = e),
            (this.context = t),
            (this.refs = g),
            (this.updater = n || p);
        }
        (v.prototype.isReactComponent = {}),
          (v.prototype.setState = function (e, t) {
            if ("object" !== typeof e && "function" !== typeof e && null != e)
              throw Error(
                "setState(...): takes an object of state variables to update or a function which returns an object of state variables."
              );
            this.updater.enqueueSetState(this, e, t, "setState");
          }),
          (v.prototype.forceUpdate = function (e) {
            this.updater.enqueueForceUpdate(this, e, "forceUpdate");
          }),
          (y.prototype = v.prototype);
        var b = (x.prototype = new y());
        (b.constructor = x), m(b, v.prototype), (b.isPureReactComponent = !0);
        var w = Array.isArray,
          S = Object.prototype.hasOwnProperty,
          k = { current: null },
          j = { key: !0, ref: !0, __self: !0, __source: !0 };
        function C(e, t, r) {
          var i,
            o = {},
            a = null,
            s = null;
          if (null != t)
            for (i in (void 0 !== t.ref && (s = t.ref),
            void 0 !== t.key && (a = "" + t.key),
            t))
              S.call(t, i) && !j.hasOwnProperty(i) && (o[i] = t[i]);
          var l = arguments.length - 2;
          if (1 === l) o.children = r;
          else if (1 < l) {
            for (var c = Array(l), u = 0; u < l; u++) c[u] = arguments[u + 2];
            o.children = c;
          }
          if (e && e.defaultProps)
            for (i in (l = e.defaultProps)) void 0 === o[i] && (o[i] = l[i]);
          return {
            $$typeof: n,
            type: e,
            key: a,
            ref: s,
            props: o,
            _owner: k.current,
          };
        }
        function P(e) {
          return "object" === typeof e && null !== e && e.$$typeof === n;
        }
        var E = /\/+/g;
        function T(e, t) {
          return "object" === typeof e && null !== e && null != e.key
            ? (function (e) {
                var t = { "=": "=0", ":": "=2" };
                return (
                  "$" +
                  e.replace(/[=:]/g, function (e) {
                    return t[e];
                  })
                );
              })("" + e.key)
            : t.toString(36);
        }
        function R(e, t, i, o, a) {
          var s = typeof e;
          ("undefined" !== s && "boolean" !== s) || (e = null);
          var l = !1;
          if (null === e) l = !0;
          else
            switch (s) {
              case "string":
              case "number":
                l = !0;
                break;
              case "object":
                switch (e.$$typeof) {
                  case n:
                  case r:
                    l = !0;
                }
            }
          if (l)
            return (
              (a = a((l = e))),
              (e = "" === o ? "." + T(l, 0) : o),
              w(a)
                ? ((i = ""),
                  null != e && (i = e.replace(E, "$&/") + "/"),
                  R(a, t, i, "", function (e) {
                    return e;
                  }))
                : null != a &&
                  (P(a) &&
                    (a = (function (e, t) {
                      return {
                        $$typeof: n,
                        type: e.type,
                        key: t,
                        ref: e.ref,
                        props: e.props,
                        _owner: e._owner,
                      };
                    })(
                      a,
                      i +
                        (!a.key || (l && l.key === a.key)
                          ? ""
                          : ("" + a.key).replace(E, "$&/") + "/") +
                        e
                    )),
                  t.push(a)),
              1
            );
          if (((l = 0), (o = "" === o ? "." : o + ":"), w(e)))
            for (var c = 0; c < e.length; c++) {
              var u = o + T((s = e[c]), c);
              l += R(s, t, i, u, a);
            }
          else if (
            ((u = (function (e) {
              return null === e || "object" !== typeof e
                ? null
                : "function" === typeof (e = (f && e[f]) || e["@@iterator"])
                ? e
                : null;
            })(e)),
            "function" === typeof u)
          )
            for (e = u.call(e), c = 0; !(s = e.next()).done; )
              l += R((s = s.value), t, i, (u = o + T(s, c++)), a);
          else if ("object" === s)
            throw (
              ((t = String(e)),
              Error(
                "Objects are not valid as a React child (found: " +
                  ("[object Object]" === t
                    ? "object with keys {" + Object.keys(e).join(", ") + "}"
                    : t) +
                  "). If you meant to render a collection of children, use an array instead."
              ))
            );
          return l;
        }
        function _(e, t, n) {
          if (null == e) return e;
          var r = [],
            i = 0;
          return (
            R(e, r, "", "", function (e) {
              return t.call(n, e, i++);
            }),
            r
          );
        }
        function O(e) {
          if (-1 === e._status) {
            var t = e._result;
            (t = t()).then(
              function (t) {
                (0 !== e._status && -1 !== e._status) ||
                  ((e._status = 1), (e._result = t));
              },
              function (t) {
                (0 !== e._status && -1 !== e._status) ||
                  ((e._status = 2), (e._result = t));
              }
            ),
              -1 === e._status && ((e._status = 0), (e._result = t));
          }
          if (1 === e._status) return e._result.default;
          throw e._result;
        }
        var A = { current: null },
          z = { transition: null },
          D = {
            ReactCurrentDispatcher: A,
            ReactCurrentBatchConfig: z,
            ReactCurrentOwner: k,
          };
        function N() {
          throw Error(
            "act(...) is not supported in production builds of React."
          );
        }
        (t.Children = {
          map: _,
          forEach: function (e, t, n) {
            _(
              e,
              function () {
                t.apply(this, arguments);
              },
              n
            );
          },
          count: function (e) {
            var t = 0;
            return (
              _(e, function () {
                t++;
              }),
              t
            );
          },
          toArray: function (e) {
            return (
              _(e, function (e) {
                return e;
              }) || []
            );
          },
          only: function (e) {
            if (!P(e))
              throw Error(
                "React.Children.only expected to receive a single React element child."
              );
            return e;
          },
        }),
          (t.Component = v),
          (t.Fragment = i),
          (t.Profiler = a),
          (t.PureComponent = x),
          (t.StrictMode = o),
          (t.Suspense = u),
          (t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = D),
          (t.act = N),
          (t.cloneElement = function (e, t, r) {
            if (null === e || void 0 === e)
              throw Error(
                "React.cloneElement(...): The argument must be a React element, but you passed " +
                  e +
                  "."
              );
            var i = m({}, e.props),
              o = e.key,
              a = e.ref,
              s = e._owner;
            if (null != t) {
              if (
                (void 0 !== t.ref && ((a = t.ref), (s = k.current)),
                void 0 !== t.key && (o = "" + t.key),
                e.type && e.type.defaultProps)
              )
                var l = e.type.defaultProps;
              for (c in t)
                S.call(t, c) &&
                  !j.hasOwnProperty(c) &&
                  (i[c] = void 0 === t[c] && void 0 !== l ? l[c] : t[c]);
            }
            var c = arguments.length - 2;
            if (1 === c) i.children = r;
            else if (1 < c) {
              l = Array(c);
              for (var u = 0; u < c; u++) l[u] = arguments[u + 2];
              i.children = l;
            }
            return {
              $$typeof: n,
              type: e.type,
              key: o,
              ref: a,
              props: i,
              _owner: s,
            };
          }),
          (t.createContext = function (e) {
            return (
              ((e = {
                $$typeof: l,
                _currentValue: e,
                _currentValue2: e,
                _threadCount: 0,
                Provider: null,
                Consumer: null,
                _defaultValue: null,
                _globalName: null,
              }).Provider = { $$typeof: s, _context: e }),
              (e.Consumer = e)
            );
          }),
          (t.createElement = C),
          (t.createFactory = function (e) {
            var t = C.bind(null, e);
            return (t.type = e), t;
          }),
          (t.createRef = function () {
            return { current: null };
          }),
          (t.forwardRef = function (e) {
            return { $$typeof: c, render: e };
          }),
          (t.isValidElement = P),
          (t.lazy = function (e) {
            return {
              $$typeof: h,
              _payload: { _status: -1, _result: e },
              _init: O,
            };
          }),
          (t.memo = function (e, t) {
            return { $$typeof: d, type: e, compare: void 0 === t ? null : t };
          }),
          (t.startTransition = function (e) {
            var t = z.transition;
            z.transition = {};
            try {
              e();
            } finally {
              z.transition = t;
            }
          }),
          (t.unstable_act = N),
          (t.useCallback = function (e, t) {
            return A.current.useCallback(e, t);
          }),
          (t.useContext = function (e) {
            return A.current.useContext(e);
          }),
          (t.useDebugValue = function () {}),
          (t.useDeferredValue = function (e) {
            return A.current.useDeferredValue(e);
          }),
          (t.useEffect = function (e, t) {
            return A.current.useEffect(e, t);
          }),
          (t.useId = function () {
            return A.current.useId();
          }),
          (t.useImperativeHandle = function (e, t, n) {
            return A.current.useImperativeHandle(e, t, n);
          }),
          (t.useInsertionEffect = function (e, t) {
            return A.current.useInsertionEffect(e, t);
          }),
          (t.useLayoutEffect = function (e, t) {
            return A.current.useLayoutEffect(e, t);
          }),
          (t.useMemo = function (e, t) {
            return A.current.useMemo(e, t);
          }),
          (t.useReducer = function (e, t, n) {
            return A.current.useReducer(e, t, n);
          }),
          (t.useRef = function (e) {
            return A.current.useRef(e);
          }),
          (t.useState = function (e) {
            return A.current.useState(e);
          }),
          (t.useSyncExternalStore = function (e, t, n) {
            return A.current.useSyncExternalStore(e, t, n);
          }),
          (t.useTransition = function () {
            return A.current.useTransition();
          }),
          (t.version = "18.3.1");
      },
      234: (e, t) => {
        "use strict";
        function n(e, t) {
          var n = e.length;
          e.push(t);
          e: for (; 0 < n; ) {
            var r = (n - 1) >>> 1,
              i = e[r];
            if (!(0 < o(i, t))) break e;
            (e[r] = t), (e[n] = i), (n = r);
          }
        }
        function r(e) {
          return 0 === e.length ? null : e[0];
        }
        function i(e) {
          if (0 === e.length) return null;
          var t = e[0],
            n = e.pop();
          if (n !== t) {
            e[0] = n;
            e: for (var r = 0, i = e.length, a = i >>> 1; r < a; ) {
              var s = 2 * (r + 1) - 1,
                l = e[s],
                c = s + 1,
                u = e[c];
              if (0 > o(l, n))
                c < i && 0 > o(u, l)
                  ? ((e[r] = u), (e[c] = n), (r = c))
                  : ((e[r] = l), (e[s] = n), (r = s));
              else {
                if (!(c < i && 0 > o(u, n))) break e;
                (e[r] = u), (e[c] = n), (r = c);
              }
            }
          }
          return t;
        }
        function o(e, t) {
          var n = e.sortIndex - t.sortIndex;
          return 0 !== n ? n : e.id - t.id;
        }
        if (
          "object" === typeof performance &&
          "function" === typeof performance.now
        ) {
          var a = performance;
          t.unstable_now = function () {
            return a.now();
          };
        } else {
          var s = Date,
            l = s.now();
          t.unstable_now = function () {
            return s.now() - l;
          };
        }
        var c = [],
          u = [],
          d = 1,
          h = null,
          f = 3,
          p = !1,
          m = !1,
          g = !1,
          v = "function" === typeof setTimeout ? setTimeout : null,
          y = "function" === typeof clearTimeout ? clearTimeout : null,
          x = "undefined" !== typeof setImmediate ? setImmediate : null;
        function b(e) {
          for (var t = r(u); null !== t; ) {
            if (null === t.callback) i(u);
            else {
              if (!(t.startTime <= e)) break;
              i(u), (t.sortIndex = t.expirationTime), n(c, t);
            }
            t = r(u);
          }
        }
        function w(e) {
          if (((g = !1), b(e), !m))
            if (null !== r(c)) (m = !0), z(S);
            else {
              var t = r(u);
              null !== t && D(w, t.startTime - e);
            }
        }
        function S(e, n) {
          (m = !1), g && ((g = !1), y(P), (P = -1)), (p = !0);
          var o = f;
          try {
            for (
              b(n), h = r(c);
              null !== h && (!(h.expirationTime > n) || (e && !R()));

            ) {
              var a = h.callback;
              if ("function" === typeof a) {
                (h.callback = null), (f = h.priorityLevel);
                var s = a(h.expirationTime <= n);
                (n = t.unstable_now()),
                  "function" === typeof s
                    ? (h.callback = s)
                    : h === r(c) && i(c),
                  b(n);
              } else i(c);
              h = r(c);
            }
            if (null !== h) var l = !0;
            else {
              var d = r(u);
              null !== d && D(w, d.startTime - n), (l = !1);
            }
            return l;
          } finally {
            (h = null), (f = o), (p = !1);
          }
        }
        "undefined" !== typeof navigator &&
          void 0 !== navigator.scheduling &&
          void 0 !== navigator.scheduling.isInputPending &&
          navigator.scheduling.isInputPending.bind(navigator.scheduling);
        var k,
          j = !1,
          C = null,
          P = -1,
          E = 5,
          T = -1;
        function R() {
          return !(t.unstable_now() - T < E);
        }
        function _() {
          if (null !== C) {
            var e = t.unstable_now();
            T = e;
            var n = !0;
            try {
              n = C(!0, e);
            } finally {
              n ? k() : ((j = !1), (C = null));
            }
          } else j = !1;
        }
        if ("function" === typeof x)
          k = function () {
            x(_);
          };
        else if ("undefined" !== typeof MessageChannel) {
          var O = new MessageChannel(),
            A = O.port2;
          (O.port1.onmessage = _),
            (k = function () {
              A.postMessage(null);
            });
        } else
          k = function () {
            v(_, 0);
          };
        function z(e) {
          (C = e), j || ((j = !0), k());
        }
        function D(e, n) {
          P = v(function () {
            e(t.unstable_now());
          }, n);
        }
        (t.unstable_IdlePriority = 5),
          (t.unstable_ImmediatePriority = 1),
          (t.unstable_LowPriority = 4),
          (t.unstable_NormalPriority = 3),
          (t.unstable_Profiling = null),
          (t.unstable_UserBlockingPriority = 2),
          (t.unstable_cancelCallback = function (e) {
            e.callback = null;
          }),
          (t.unstable_continueExecution = function () {
            m || p || ((m = !0), z(S));
          }),
          (t.unstable_forceFrameRate = function (e) {
            0 > e || 125 < e
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
                )
              : (E = 0 < e ? Math.floor(1e3 / e) : 5);
          }),
          (t.unstable_getCurrentPriorityLevel = function () {
            return f;
          }),
          (t.unstable_getFirstCallbackNode = function () {
            return r(c);
          }),
          (t.unstable_next = function (e) {
            switch (f) {
              case 1:
              case 2:
              case 3:
                var t = 3;
                break;
              default:
                t = f;
            }
            var n = f;
            f = t;
            try {
              return e();
            } finally {
              f = n;
            }
          }),
          (t.unstable_pauseExecution = function () {}),
          (t.unstable_requestPaint = function () {}),
          (t.unstable_runWithPriority = function (e, t) {
            switch (e) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                e = 3;
            }
            var n = f;
            f = e;
            try {
              return t();
            } finally {
              f = n;
            }
          }),
          (t.unstable_scheduleCallback = function (e, i, o) {
            var a = t.unstable_now();
            switch (
              ("object" === typeof o && null !== o
                ? (o = "number" === typeof (o = o.delay) && 0 < o ? a + o : a)
                : (o = a),
              e)
            ) {
              case 1:
                var s = -1;
                break;
              case 2:
                s = 250;
                break;
              case 5:
                s = 1073741823;
                break;
              case 4:
                s = 1e4;
                break;
              default:
                s = 5e3;
            }
            return (
              (e = {
                id: d++,
                callback: i,
                priorityLevel: e,
                startTime: o,
                expirationTime: (s = o + s),
                sortIndex: -1,
              }),
              o > a
                ? ((e.sortIndex = o),
                  n(u, e),
                  null === r(c) &&
                    e === r(u) &&
                    (g ? (y(P), (P = -1)) : (g = !0), D(w, o - a)))
                : ((e.sortIndex = s), n(c, e), m || p || ((m = !0), z(S))),
              e
            );
          }),
          (t.unstable_shouldYield = R),
          (t.unstable_wrapCallback = function (e) {
            var t = f;
            return function () {
              var n = f;
              f = t;
              try {
                return e.apply(this, arguments);
              } finally {
                f = n;
              }
            };
          });
      },
      324: (e) => {
        e.exports = function (e, t, n, r) {
          var i = n ? n.call(r, e, t) : void 0;
          if (void 0 !== i) return !!i;
          if (e === t) return !0;
          if ("object" !== typeof e || !e || "object" !== typeof t || !t)
            return !1;
          var o = Object.keys(e),
            a = Object.keys(t);
          if (o.length !== a.length) return !1;
          for (
            var s = Object.prototype.hasOwnProperty.bind(t), l = 0;
            l < o.length;
            l++
          ) {
            var c = o[l];
            if (!s(c)) return !1;
            var u = e[c],
              d = t[c];
            if (
              !1 === (i = n ? n.call(r, u, d, c) : void 0) ||
              (void 0 === i && u !== d)
            )
              return !1;
          }
          return !0;
        };
      },
      391: (e, t, n) => {
        "use strict";
        var r = n(950);
        (t.createRoot = r.createRoot), (t.hydrateRoot = r.hydrateRoot);
      },
      579: (e, t, n) => {
        "use strict";
        e.exports = n(153);
      },
      730: (e, t, n) => {
        "use strict";
        var r = n(43),
          i = n(853);
        function o(e) {
          for (
            var t =
                "https://reactjs.org/docs/error-decoder.html?invariant=" + e,
              n = 1;
            n < arguments.length;
            n++
          )
            t += "&args[]=" + encodeURIComponent(arguments[n]);
          return (
            "Minified React error #" +
            e +
            "; visit " +
            t +
            " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
          );
        }
        var a = new Set(),
          s = {};
        function l(e, t) {
          c(e, t), c(e + "Capture", t);
        }
        function c(e, t) {
          for (s[e] = t, e = 0; e < t.length; e++) a.add(t[e]);
        }
        var u = !(
            "undefined" === typeof window ||
            "undefined" === typeof window.document ||
            "undefined" === typeof window.document.createElement
          ),
          d = Object.prototype.hasOwnProperty,
          h =
            /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
          f = {},
          p = {};
        function m(e, t, n, r, i, o, a) {
          (this.acceptsBooleans = 2 === t || 3 === t || 4 === t),
            (this.attributeName = r),
            (this.attributeNamespace = i),
            (this.mustUseProperty = n),
            (this.propertyName = e),
            (this.type = t),
            (this.sanitizeURL = o),
            (this.removeEmptyString = a);
        }
        var g = {};
        "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
          .split(" ")
          .forEach(function (e) {
            g[e] = new m(e, 0, !1, e, null, !1, !1);
          }),
          [
            ["acceptCharset", "accept-charset"],
            ["className", "class"],
            ["htmlFor", "for"],
            ["httpEquiv", "http-equiv"],
          ].forEach(function (e) {
            var t = e[0];
            g[t] = new m(t, 1, !1, e[1], null, !1, !1);
          }),
          ["contentEditable", "draggable", "spellCheck", "value"].forEach(
            function (e) {
              g[e] = new m(e, 2, !1, e.toLowerCase(), null, !1, !1);
            }
          ),
          [
            "autoReverse",
            "externalResourcesRequired",
            "focusable",
            "preserveAlpha",
          ].forEach(function (e) {
            g[e] = new m(e, 2, !1, e, null, !1, !1);
          }),
          "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
            .split(" ")
            .forEach(function (e) {
              g[e] = new m(e, 3, !1, e.toLowerCase(), null, !1, !1);
            }),
          ["checked", "multiple", "muted", "selected"].forEach(function (e) {
            g[e] = new m(e, 3, !0, e, null, !1, !1);
          }),
          ["capture", "download"].forEach(function (e) {
            g[e] = new m(e, 4, !1, e, null, !1, !1);
          }),
          ["cols", "rows", "size", "span"].forEach(function (e) {
            g[e] = new m(e, 6, !1, e, null, !1, !1);
          }),
          ["rowSpan", "start"].forEach(function (e) {
            g[e] = new m(e, 5, !1, e.toLowerCase(), null, !1, !1);
          });
        var v = /[\-:]([a-z])/g;
        function y(e) {
          return e[1].toUpperCase();
        }
        function x(e, t, n, r) {
          var i = g.hasOwnProperty(t) ? g[t] : null;
          (null !== i
            ? 0 !== i.type
            : r ||
              !(2 < t.length) ||
              ("o" !== t[0] && "O" !== t[0]) ||
              ("n" !== t[1] && "N" !== t[1])) &&
            ((function (e, t, n, r) {
              if (
                null === t ||
                "undefined" === typeof t ||
                (function (e, t, n, r) {
                  if (null !== n && 0 === n.type) return !1;
                  switch (typeof t) {
                    case "function":
                    case "symbol":
                      return !0;
                    case "boolean":
                      return (
                        !r &&
                        (null !== n
                          ? !n.acceptsBooleans
                          : "data-" !== (e = e.toLowerCase().slice(0, 5)) &&
                            "aria-" !== e)
                      );
                    default:
                      return !1;
                  }
                })(e, t, n, r)
              )
                return !0;
              if (r) return !1;
              if (null !== n)
                switch (n.type) {
                  case 3:
                    return !t;
                  case 4:
                    return !1 === t;
                  case 5:
                    return isNaN(t);
                  case 6:
                    return isNaN(t) || 1 > t;
                }
              return !1;
            })(t, n, i, r) && (n = null),
            r || null === i
              ? (function (e) {
                  return (
                    !!d.call(p, e) ||
                    (!d.call(f, e) &&
                      (h.test(e) ? (p[e] = !0) : ((f[e] = !0), !1)))
                  );
                })(t) &&
                (null === n ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
              : i.mustUseProperty
              ? (e[i.propertyName] = null === n ? 3 !== i.type && "" : n)
              : ((t = i.attributeName),
                (r = i.attributeNamespace),
                null === n
                  ? e.removeAttribute(t)
                  : ((n =
                      3 === (i = i.type) || (4 === i && !0 === n)
                        ? ""
                        : "" + n),
                    r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
        }
        "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
          .split(" ")
          .forEach(function (e) {
            var t = e.replace(v, y);
            g[t] = new m(t, 1, !1, e, null, !1, !1);
          }),
          "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
            .split(" ")
            .forEach(function (e) {
              var t = e.replace(v, y);
              g[t] = new m(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
            }),
          ["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
            var t = e.replace(v, y);
            g[t] = new m(
              t,
              1,
              !1,
              e,
              "http://www.w3.org/XML/1998/namespace",
              !1,
              !1
            );
          }),
          ["tabIndex", "crossOrigin"].forEach(function (e) {
            g[e] = new m(e, 1, !1, e.toLowerCase(), null, !1, !1);
          }),
          (g.xlinkHref = new m(
            "xlinkHref",
            1,
            !1,
            "xlink:href",
            "http://www.w3.org/1999/xlink",
            !0,
            !1
          )),
          ["src", "href", "action", "formAction"].forEach(function (e) {
            g[e] = new m(e, 1, !1, e.toLowerCase(), null, !0, !0);
          });
        var b = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
          w = Symbol.for("react.element"),
          S = Symbol.for("react.portal"),
          k = Symbol.for("react.fragment"),
          j = Symbol.for("react.strict_mode"),
          C = Symbol.for("react.profiler"),
          P = Symbol.for("react.provider"),
          E = Symbol.for("react.context"),
          T = Symbol.for("react.forward_ref"),
          R = Symbol.for("react.suspense"),
          _ = Symbol.for("react.suspense_list"),
          O = Symbol.for("react.memo"),
          A = Symbol.for("react.lazy");
        Symbol.for("react.scope"), Symbol.for("react.debug_trace_mode");
        var z = Symbol.for("react.offscreen");
        Symbol.for("react.legacy_hidden"),
          Symbol.for("react.cache"),
          Symbol.for("react.tracing_marker");
        var D = Symbol.iterator;
        function N(e) {
          return null === e || "object" !== typeof e
            ? null
            : "function" === typeof (e = (D && e[D]) || e["@@iterator"])
            ? e
            : null;
        }
        var L,
          M = Object.assign;
        function F(e) {
          if (void 0 === L)
            try {
              throw Error();
            } catch (n) {
              var t = n.stack.trim().match(/\n( *(at )?)/);
              L = (t && t[1]) || "";
            }
          return "\n" + L + e;
        }
        var I = !1;
        function V(e, t) {
          if (!e || I) return "";
          I = !0;
          var n = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          try {
            if (t)
              if (
                ((t = function () {
                  throw Error();
                }),
                Object.defineProperty(t.prototype, "props", {
                  set: function () {
                    throw Error();
                  },
                }),
                "object" === typeof Reflect && Reflect.construct)
              ) {
                try {
                  Reflect.construct(t, []);
                } catch (c) {
                  var r = c;
                }
                Reflect.construct(e, [], t);
              } else {
                try {
                  t.call();
                } catch (c) {
                  r = c;
                }
                e.call(t.prototype);
              }
            else {
              try {
                throw Error();
              } catch (c) {
                r = c;
              }
              e();
            }
          } catch (c) {
            if (c && r && "string" === typeof c.stack) {
              for (
                var i = c.stack.split("\n"),
                  o = r.stack.split("\n"),
                  a = i.length - 1,
                  s = o.length - 1;
                1 <= a && 0 <= s && i[a] !== o[s];

              )
                s--;
              for (; 1 <= a && 0 <= s; a--, s--)
                if (i[a] !== o[s]) {
                  if (1 !== a || 1 !== s)
                    do {
                      if ((a--, 0 > --s || i[a] !== o[s])) {
                        var l = "\n" + i[a].replace(" at new ", " at ");
                        return (
                          e.displayName &&
                            l.includes("<anonymous>") &&
                            (l = l.replace("<anonymous>", e.displayName)),
                          l
                        );
                      }
                    } while (1 <= a && 0 <= s);
                  break;
                }
            }
          } finally {
            (I = !1), (Error.prepareStackTrace = n);
          }
          return (e = e ? e.displayName || e.name : "") ? F(e) : "";
        }
        function B(e) {
          switch (e.tag) {
            case 5:
              return F(e.type);
            case 16:
              return F("Lazy");
            case 13:
              return F("Suspense");
            case 19:
              return F("SuspenseList");
            case 0:
            case 2:
            case 15:
              return (e = V(e.type, !1));
            case 11:
              return (e = V(e.type.render, !1));
            case 1:
              return (e = V(e.type, !0));
            default:
              return "";
          }
        }
        function U(e) {
          if (null == e) return null;
          if ("function" === typeof e) return e.displayName || e.name || null;
          if ("string" === typeof e) return e;
          switch (e) {
            case k:
              return "Fragment";
            case S:
              return "Portal";
            case C:
              return "Profiler";
            case j:
              return "StrictMode";
            case R:
              return "Suspense";
            case _:
              return "SuspenseList";
          }
          if ("object" === typeof e)
            switch (e.$$typeof) {
              case E:
                return (e.displayName || "Context") + ".Consumer";
              case P:
                return (e._context.displayName || "Context") + ".Provider";
              case T:
                var t = e.render;
                return (
                  (e = e.displayName) ||
                    (e =
                      "" !== (e = t.displayName || t.name || "")
                        ? "ForwardRef(" + e + ")"
                        : "ForwardRef"),
                  e
                );
              case O:
                return null !== (t = e.displayName || null)
                  ? t
                  : U(e.type) || "Memo";
              case A:
                (t = e._payload), (e = e._init);
                try {
                  return U(e(t));
                } catch (n) {}
            }
          return null;
        }
        function W(e) {
          var t = e.type;
          switch (e.tag) {
            case 24:
              return "Cache";
            case 9:
              return (t.displayName || "Context") + ".Consumer";
            case 10:
              return (t._context.displayName || "Context") + ".Provider";
            case 18:
              return "DehydratedFragment";
            case 11:
              return (
                (e = (e = t.render).displayName || e.name || ""),
                t.displayName ||
                  ("" !== e ? "ForwardRef(" + e + ")" : "ForwardRef")
              );
            case 7:
              return "Fragment";
            case 5:
              return t;
            case 4:
              return "Portal";
            case 3:
              return "Root";
            case 6:
              return "Text";
            case 16:
              return U(t);
            case 8:
              return t === j ? "StrictMode" : "Mode";
            case 22:
              return "Offscreen";
            case 12:
              return "Profiler";
            case 21:
              return "Scope";
            case 13:
              return "Suspense";
            case 19:
              return "SuspenseList";
            case 25:
              return "TracingMarker";
            case 1:
            case 0:
            case 17:
            case 2:
            case 14:
            case 15:
              if ("function" === typeof t)
                return t.displayName || t.name || null;
              if ("string" === typeof t) return t;
          }
          return null;
        }
        function $(e) {
          switch (typeof e) {
            case "boolean":
            case "number":
            case "string":
            case "undefined":
            case "object":
              return e;
            default:
              return "";
          }
        }
        function H(e) {
          var t = e.type;
          return (
            (e = e.nodeName) &&
            "input" === e.toLowerCase() &&
            ("checkbox" === t || "radio" === t)
          );
        }
        function Y(e) {
          e._valueTracker ||
            (e._valueTracker = (function (e) {
              var t = H(e) ? "checked" : "value",
                n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
                r = "" + e[t];
              if (
                !e.hasOwnProperty(t) &&
                "undefined" !== typeof n &&
                "function" === typeof n.get &&
                "function" === typeof n.set
              ) {
                var i = n.get,
                  o = n.set;
                return (
                  Object.defineProperty(e, t, {
                    configurable: !0,
                    get: function () {
                      return i.call(this);
                    },
                    set: function (e) {
                      (r = "" + e), o.call(this, e);
                    },
                  }),
                  Object.defineProperty(e, t, { enumerable: n.enumerable }),
                  {
                    getValue: function () {
                      return r;
                    },
                    setValue: function (e) {
                      r = "" + e;
                    },
                    stopTracking: function () {
                      (e._valueTracker = null), delete e[t];
                    },
                  }
                );
              }
            })(e));
        }
        function q(e) {
          if (!e) return !1;
          var t = e._valueTracker;
          if (!t) return !0;
          var n = t.getValue(),
            r = "";
          return (
            e && (r = H(e) ? (e.checked ? "true" : "false") : e.value),
            (e = r) !== n && (t.setValue(e), !0)
          );
        }
        function G(e) {
          if (
            "undefined" ===
            typeof (e =
              e || ("undefined" !== typeof document ? document : void 0))
          )
            return null;
          try {
            return e.activeElement || e.body;
          } catch (t) {
            return e.body;
          }
        }
        function K(e, t) {
          var n = t.checked;
          return M({}, t, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: void 0,
            checked: null != n ? n : e._wrapperState.initialChecked,
          });
        }
        function Q(e, t) {
          var n = null == t.defaultValue ? "" : t.defaultValue,
            r = null != t.checked ? t.checked : t.defaultChecked;
          (n = $(null != t.value ? t.value : n)),
            (e._wrapperState = {
              initialChecked: r,
              initialValue: n,
              controlled:
                "checkbox" === t.type || "radio" === t.type
                  ? null != t.checked
                  : null != t.value,
            });
        }
        function X(e, t) {
          null != (t = t.checked) && x(e, "checked", t, !1);
        }
        function J(e, t) {
          X(e, t);
          var n = $(t.value),
            r = t.type;
          if (null != n)
            "number" === r
              ? ((0 === n && "" === e.value) || e.value != n) &&
                (e.value = "" + n)
              : e.value !== "" + n && (e.value = "" + n);
          else if ("submit" === r || "reset" === r)
            return void e.removeAttribute("value");
          t.hasOwnProperty("value")
            ? ee(e, t.type, n)
            : t.hasOwnProperty("defaultValue") &&
              ee(e, t.type, $(t.defaultValue)),
            null == t.checked &&
              null != t.defaultChecked &&
              (e.defaultChecked = !!t.defaultChecked);
        }
        function Z(e, t, n) {
          if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
            var r = t.type;
            if (
              !(
                ("submit" !== r && "reset" !== r) ||
                (void 0 !== t.value && null !== t.value)
              )
            )
              return;
            (t = "" + e._wrapperState.initialValue),
              n || t === e.value || (e.value = t),
              (e.defaultValue = t);
          }
          "" !== (n = e.name) && (e.name = ""),
            (e.defaultChecked = !!e._wrapperState.initialChecked),
            "" !== n && (e.name = n);
        }
        function ee(e, t, n) {
          ("number" === t && G(e.ownerDocument) === e) ||
            (null == n
              ? (e.defaultValue = "" + e._wrapperState.initialValue)
              : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
        }
        var te = Array.isArray;
        function ne(e, t, n, r) {
          if (((e = e.options), t)) {
            t = {};
            for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
            for (n = 0; n < e.length; n++)
              (i = t.hasOwnProperty("$" + e[n].value)),
                e[n].selected !== i && (e[n].selected = i),
                i && r && (e[n].defaultSelected = !0);
          } else {
            for (n = "" + $(n), t = null, i = 0; i < e.length; i++) {
              if (e[i].value === n)
                return (
                  (e[i].selected = !0), void (r && (e[i].defaultSelected = !0))
                );
              null !== t || e[i].disabled || (t = e[i]);
            }
            null !== t && (t.selected = !0);
          }
        }
        function re(e, t) {
          if (null != t.dangerouslySetInnerHTML) throw Error(o(91));
          return M({}, t, {
            value: void 0,
            defaultValue: void 0,
            children: "" + e._wrapperState.initialValue,
          });
        }
        function ie(e, t) {
          var n = t.value;
          if (null == n) {
            if (((n = t.children), (t = t.defaultValue), null != n)) {
              if (null != t) throw Error(o(92));
              if (te(n)) {
                if (1 < n.length) throw Error(o(93));
                n = n[0];
              }
              t = n;
            }
            null == t && (t = ""), (n = t);
          }
          e._wrapperState = { initialValue: $(n) };
        }
        function oe(e, t) {
          var n = $(t.value),
            r = $(t.defaultValue);
          null != n &&
            ((n = "" + n) !== e.value && (e.value = n),
            null == t.defaultValue &&
              e.defaultValue !== n &&
              (e.defaultValue = n)),
            null != r && (e.defaultValue = "" + r);
        }
        function ae(e) {
          var t = e.textContent;
          t === e._wrapperState.initialValue &&
            "" !== t &&
            null !== t &&
            (e.value = t);
        }
        function se(e) {
          switch (e) {
            case "svg":
              return "http://www.w3.org/2000/svg";
            case "math":
              return "http://www.w3.org/1998/Math/MathML";
            default:
              return "http://www.w3.org/1999/xhtml";
          }
        }
        function le(e, t) {
          return null == e || "http://www.w3.org/1999/xhtml" === e
            ? se(t)
            : "http://www.w3.org/2000/svg" === e && "foreignObject" === t
            ? "http://www.w3.org/1999/xhtml"
            : e;
        }
        var ce,
          ue,
          de =
            ((ue = function (e, t) {
              if (
                "http://www.w3.org/2000/svg" !== e.namespaceURI ||
                "innerHTML" in e
              )
                e.innerHTML = t;
              else {
                for (
                  (ce = ce || document.createElement("div")).innerHTML =
                    "<svg>" + t.valueOf().toString() + "</svg>",
                    t = ce.firstChild;
                  e.firstChild;

                )
                  e.removeChild(e.firstChild);
                for (; t.firstChild; ) e.appendChild(t.firstChild);
              }
            }),
            "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction
              ? function (e, t, n, r) {
                  MSApp.execUnsafeLocalFunction(function () {
                    return ue(e, t);
                  });
                }
              : ue);
        function he(e, t) {
          if (t) {
            var n = e.firstChild;
            if (n && n === e.lastChild && 3 === n.nodeType)
              return void (n.nodeValue = t);
          }
          e.textContent = t;
        }
        var fe = {
            animationIterationCount: !0,
            aspectRatio: !0,
            borderImageOutset: !0,
            borderImageSlice: !0,
            borderImageWidth: !0,
            boxFlex: !0,
            boxFlexGroup: !0,
            boxOrdinalGroup: !0,
            columnCount: !0,
            columns: !0,
            flex: !0,
            flexGrow: !0,
            flexPositive: !0,
            flexShrink: !0,
            flexNegative: !0,
            flexOrder: !0,
            gridArea: !0,
            gridRow: !0,
            gridRowEnd: !0,
            gridRowSpan: !0,
            gridRowStart: !0,
            gridColumn: !0,
            gridColumnEnd: !0,
            gridColumnSpan: !0,
            gridColumnStart: !0,
            fontWeight: !0,
            lineClamp: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            tabSize: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0,
            fillOpacity: !0,
            floodOpacity: !0,
            stopOpacity: !0,
            strokeDasharray: !0,
            strokeDashoffset: !0,
            strokeMiterlimit: !0,
            strokeOpacity: !0,
            strokeWidth: !0,
          },
          pe = ["Webkit", "ms", "Moz", "O"];
        function me(e, t, n) {
          return null == t || "boolean" === typeof t || "" === t
            ? ""
            : n ||
              "number" !== typeof t ||
              0 === t ||
              (fe.hasOwnProperty(e) && fe[e])
            ? ("" + t).trim()
            : t + "px";
        }
        function ge(e, t) {
          for (var n in ((e = e.style), t))
            if (t.hasOwnProperty(n)) {
              var r = 0 === n.indexOf("--"),
                i = me(n, t[n], r);
              "float" === n && (n = "cssFloat"),
                r ? e.setProperty(n, i) : (e[n] = i);
            }
        }
        Object.keys(fe).forEach(function (e) {
          pe.forEach(function (t) {
            (t = t + e.charAt(0).toUpperCase() + e.substring(1)),
              (fe[t] = fe[e]);
          });
        });
        var ve = M(
          { menuitem: !0 },
          {
            area: !0,
            base: !0,
            br: !0,
            col: !0,
            embed: !0,
            hr: !0,
            img: !0,
            input: !0,
            keygen: !0,
            link: !0,
            meta: !0,
            param: !0,
            source: !0,
            track: !0,
            wbr: !0,
          }
        );
        function ye(e, t) {
          if (t) {
            if (
              ve[e] &&
              (null != t.children || null != t.dangerouslySetInnerHTML)
            )
              throw Error(o(137, e));
            if (null != t.dangerouslySetInnerHTML) {
              if (null != t.children) throw Error(o(60));
              if (
                "object" !== typeof t.dangerouslySetInnerHTML ||
                !("__html" in t.dangerouslySetInnerHTML)
              )
                throw Error(o(61));
            }
            if (null != t.style && "object" !== typeof t.style)
              throw Error(o(62));
          }
        }
        function xe(e, t) {
          if (-1 === e.indexOf("-")) return "string" === typeof t.is;
          switch (e) {
            case "annotation-xml":
            case "color-profile":
            case "font-face":
            case "font-face-src":
            case "font-face-uri":
            case "font-face-format":
            case "font-face-name":
            case "missing-glyph":
              return !1;
            default:
              return !0;
          }
        }
        var be = null;
        function we(e) {
          return (
            (e = e.target || e.srcElement || window).correspondingUseElement &&
              (e = e.correspondingUseElement),
            3 === e.nodeType ? e.parentNode : e
          );
        }
        var Se = null,
          ke = null,
          je = null;
        function Ce(e) {
          if ((e = xi(e))) {
            if ("function" !== typeof Se) throw Error(o(280));
            var t = e.stateNode;
            t && ((t = wi(t)), Se(e.stateNode, e.type, t));
          }
        }
        function Pe(e) {
          ke ? (je ? je.push(e) : (je = [e])) : (ke = e);
        }
        function Ee() {
          if (ke) {
            var e = ke,
              t = je;
            if (((je = ke = null), Ce(e), t))
              for (e = 0; e < t.length; e++) Ce(t[e]);
          }
        }
        function Te(e, t) {
          return e(t);
        }
        function Re() {}
        var _e = !1;
        function Oe(e, t, n) {
          if (_e) return e(t, n);
          _e = !0;
          try {
            return Te(e, t, n);
          } finally {
            (_e = !1), (null !== ke || null !== je) && (Re(), Ee());
          }
        }
        function Ae(e, t) {
          var n = e.stateNode;
          if (null === n) return null;
          var r = wi(n);
          if (null === r) return null;
          n = r[t];
          e: switch (t) {
            case "onClick":
            case "onClickCapture":
            case "onDoubleClick":
            case "onDoubleClickCapture":
            case "onMouseDown":
            case "onMouseDownCapture":
            case "onMouseMove":
            case "onMouseMoveCapture":
            case "onMouseUp":
            case "onMouseUpCapture":
            case "onMouseEnter":
              (r = !r.disabled) ||
                (r = !(
                  "button" === (e = e.type) ||
                  "input" === e ||
                  "select" === e ||
                  "textarea" === e
                )),
                (e = !r);
              break e;
            default:
              e = !1;
          }
          if (e) return null;
          if (n && "function" !== typeof n) throw Error(o(231, t, typeof n));
          return n;
        }
        var ze = !1;
        if (u)
          try {
            var De = {};
            Object.defineProperty(De, "passive", {
              get: function () {
                ze = !0;
              },
            }),
              window.addEventListener("test", De, De),
              window.removeEventListener("test", De, De);
          } catch (ue) {
            ze = !1;
          }
        function Ne(e, t, n, r, i, o, a, s, l) {
          var c = Array.prototype.slice.call(arguments, 3);
          try {
            t.apply(n, c);
          } catch (u) {
            this.onError(u);
          }
        }
        var Le = !1,
          Me = null,
          Fe = !1,
          Ie = null,
          Ve = {
            onError: function (e) {
              (Le = !0), (Me = e);
            },
          };
        function Be(e, t, n, r, i, o, a, s, l) {
          (Le = !1), (Me = null), Ne.apply(Ve, arguments);
        }
        function Ue(e) {
          var t = e,
            n = e;
          if (e.alternate) for (; t.return; ) t = t.return;
          else {
            e = t;
            do {
              0 !== (4098 & (t = e).flags) && (n = t.return), (e = t.return);
            } while (e);
          }
          return 3 === t.tag ? n : null;
        }
        function We(e) {
          if (13 === e.tag) {
            var t = e.memoizedState;
            if (
              (null === t &&
                null !== (e = e.alternate) &&
                (t = e.memoizedState),
              null !== t)
            )
              return t.dehydrated;
          }
          return null;
        }
        function $e(e) {
          if (Ue(e) !== e) throw Error(o(188));
        }
        function He(e) {
          return null !==
            (e = (function (e) {
              var t = e.alternate;
              if (!t) {
                if (null === (t = Ue(e))) throw Error(o(188));
                return t !== e ? null : e;
              }
              for (var n = e, r = t; ; ) {
                var i = n.return;
                if (null === i) break;
                var a = i.alternate;
                if (null === a) {
                  if (null !== (r = i.return)) {
                    n = r;
                    continue;
                  }
                  break;
                }
                if (i.child === a.child) {
                  for (a = i.child; a; ) {
                    if (a === n) return $e(i), e;
                    if (a === r) return $e(i), t;
                    a = a.sibling;
                  }
                  throw Error(o(188));
                }
                if (n.return !== r.return) (n = i), (r = a);
                else {
                  for (var s = !1, l = i.child; l; ) {
                    if (l === n) {
                      (s = !0), (n = i), (r = a);
                      break;
                    }
                    if (l === r) {
                      (s = !0), (r = i), (n = a);
                      break;
                    }
                    l = l.sibling;
                  }
                  if (!s) {
                    for (l = a.child; l; ) {
                      if (l === n) {
                        (s = !0), (n = a), (r = i);
                        break;
                      }
                      if (l === r) {
                        (s = !0), (r = a), (n = i);
                        break;
                      }
                      l = l.sibling;
                    }
                    if (!s) throw Error(o(189));
                  }
                }
                if (n.alternate !== r) throw Error(o(190));
              }
              if (3 !== n.tag) throw Error(o(188));
              return n.stateNode.current === n ? e : t;
            })(e))
            ? Ye(e)
            : null;
        }
        function Ye(e) {
          if (5 === e.tag || 6 === e.tag) return e;
          for (e = e.child; null !== e; ) {
            var t = Ye(e);
            if (null !== t) return t;
            e = e.sibling;
          }
          return null;
        }
        var qe = i.unstable_scheduleCallback,
          Ge = i.unstable_cancelCallback,
          Ke = i.unstable_shouldYield,
          Qe = i.unstable_requestPaint,
          Xe = i.unstable_now,
          Je = i.unstable_getCurrentPriorityLevel,
          Ze = i.unstable_ImmediatePriority,
          et = i.unstable_UserBlockingPriority,
          tt = i.unstable_NormalPriority,
          nt = i.unstable_LowPriority,
          rt = i.unstable_IdlePriority,
          it = null,
          ot = null;
        var at = Math.clz32
            ? Math.clz32
            : function (e) {
                return (e >>>= 0), 0 === e ? 32 : (31 - ((st(e) / lt) | 0)) | 0;
              },
          st = Math.log,
          lt = Math.LN2;
        var ct = 64,
          ut = 4194304;
        function dt(e) {
          switch (e & -e) {
            case 1:
              return 1;
            case 2:
              return 2;
            case 4:
              return 4;
            case 8:
              return 8;
            case 16:
              return 16;
            case 32:
              return 32;
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
              return 4194240 & e;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
              return 130023424 & e;
            case 134217728:
              return 134217728;
            case 268435456:
              return 268435456;
            case 536870912:
              return 536870912;
            case 1073741824:
              return 1073741824;
            default:
              return e;
          }
        }
        function ht(e, t) {
          var n = e.pendingLanes;
          if (0 === n) return 0;
          var r = 0,
            i = e.suspendedLanes,
            o = e.pingedLanes,
            a = 268435455 & n;
          if (0 !== a) {
            var s = a & ~i;
            0 !== s ? (r = dt(s)) : 0 !== (o &= a) && (r = dt(o));
          } else 0 !== (a = n & ~i) ? (r = dt(a)) : 0 !== o && (r = dt(o));
          if (0 === r) return 0;
          if (
            0 !== t &&
            t !== r &&
            0 === (t & i) &&
            ((i = r & -r) >= (o = t & -t) || (16 === i && 0 !== (4194240 & o)))
          )
            return t;
          if ((0 !== (4 & r) && (r |= 16 & n), 0 !== (t = e.entangledLanes)))
            for (e = e.entanglements, t &= r; 0 < t; )
              (i = 1 << (n = 31 - at(t))), (r |= e[n]), (t &= ~i);
          return r;
        }
        function ft(e, t) {
          switch (e) {
            case 1:
            case 2:
            case 4:
              return t + 250;
            case 8:
            case 16:
            case 32:
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
              return t + 5e3;
            default:
              return -1;
          }
        }
        function pt(e) {
          return 0 !== (e = -1073741825 & e.pendingLanes)
            ? e
            : 1073741824 & e
            ? 1073741824
            : 0;
        }
        function mt() {
          var e = ct;
          return 0 === (4194240 & (ct <<= 1)) && (ct = 64), e;
        }
        function gt(e) {
          for (var t = [], n = 0; 31 > n; n++) t.push(e);
          return t;
        }
        function vt(e, t, n) {
          (e.pendingLanes |= t),
            536870912 !== t && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
            ((e = e.eventTimes)[(t = 31 - at(t))] = n);
        }
        function yt(e, t) {
          var n = (e.entangledLanes |= t);
          for (e = e.entanglements; n; ) {
            var r = 31 - at(n),
              i = 1 << r;
            (i & t) | (e[r] & t) && (e[r] |= t), (n &= ~i);
          }
        }
        var xt = 0;
        function bt(e) {
          return 1 < (e &= -e)
            ? 4 < e
              ? 0 !== (268435455 & e)
                ? 16
                : 536870912
              : 4
            : 1;
        }
        var wt,
          St,
          kt,
          jt,
          Ct,
          Pt = !1,
          Et = [],
          Tt = null,
          Rt = null,
          _t = null,
          Ot = new Map(),
          At = new Map(),
          zt = [],
          Dt =
            "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
              " "
            );
        function Nt(e, t) {
          switch (e) {
            case "focusin":
            case "focusout":
              Tt = null;
              break;
            case "dragenter":
            case "dragleave":
              Rt = null;
              break;
            case "mouseover":
            case "mouseout":
              _t = null;
              break;
            case "pointerover":
            case "pointerout":
              Ot.delete(t.pointerId);
              break;
            case "gotpointercapture":
            case "lostpointercapture":
              At.delete(t.pointerId);
          }
        }
        function Lt(e, t, n, r, i, o) {
          return null === e || e.nativeEvent !== o
            ? ((e = {
                blockedOn: t,
                domEventName: n,
                eventSystemFlags: r,
                nativeEvent: o,
                targetContainers: [i],
              }),
              null !== t && null !== (t = xi(t)) && St(t),
              e)
            : ((e.eventSystemFlags |= r),
              (t = e.targetContainers),
              null !== i && -1 === t.indexOf(i) && t.push(i),
              e);
        }
        function Mt(e) {
          var t = yi(e.target);
          if (null !== t) {
            var n = Ue(t);
            if (null !== n)
              if (13 === (t = n.tag)) {
                if (null !== (t = We(n)))
                  return (
                    (e.blockedOn = t),
                    void Ct(e.priority, function () {
                      kt(n);
                    })
                  );
              } else if (
                3 === t &&
                n.stateNode.current.memoizedState.isDehydrated
              )
                return void (e.blockedOn =
                  3 === n.tag ? n.stateNode.containerInfo : null);
          }
          e.blockedOn = null;
        }
        function Ft(e) {
          if (null !== e.blockedOn) return !1;
          for (var t = e.targetContainers; 0 < t.length; ) {
            var n = Kt(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
            if (null !== n)
              return null !== (t = xi(n)) && St(t), (e.blockedOn = n), !1;
            var r = new (n = e.nativeEvent).constructor(n.type, n);
            (be = r), n.target.dispatchEvent(r), (be = null), t.shift();
          }
          return !0;
        }
        function It(e, t, n) {
          Ft(e) && n.delete(t);
        }
        function Vt() {
          (Pt = !1),
            null !== Tt && Ft(Tt) && (Tt = null),
            null !== Rt && Ft(Rt) && (Rt = null),
            null !== _t && Ft(_t) && (_t = null),
            Ot.forEach(It),
            At.forEach(It);
        }
        function Bt(e, t) {
          e.blockedOn === t &&
            ((e.blockedOn = null),
            Pt ||
              ((Pt = !0),
              i.unstable_scheduleCallback(i.unstable_NormalPriority, Vt)));
        }
        function Ut(e) {
          function t(t) {
            return Bt(t, e);
          }
          if (0 < Et.length) {
            Bt(Et[0], e);
            for (var n = 1; n < Et.length; n++) {
              var r = Et[n];
              r.blockedOn === e && (r.blockedOn = null);
            }
          }
          for (
            null !== Tt && Bt(Tt, e),
              null !== Rt && Bt(Rt, e),
              null !== _t && Bt(_t, e),
              Ot.forEach(t),
              At.forEach(t),
              n = 0;
            n < zt.length;
            n++
          )
            (r = zt[n]).blockedOn === e && (r.blockedOn = null);
          for (; 0 < zt.length && null === (n = zt[0]).blockedOn; )
            Mt(n), null === n.blockedOn && zt.shift();
        }
        var Wt = b.ReactCurrentBatchConfig,
          $t = !0;
        function Ht(e, t, n, r) {
          var i = xt,
            o = Wt.transition;
          Wt.transition = null;
          try {
            (xt = 1), qt(e, t, n, r);
          } finally {
            (xt = i), (Wt.transition = o);
          }
        }
        function Yt(e, t, n, r) {
          var i = xt,
            o = Wt.transition;
          Wt.transition = null;
          try {
            (xt = 4), qt(e, t, n, r);
          } finally {
            (xt = i), (Wt.transition = o);
          }
        }
        function qt(e, t, n, r) {
          if ($t) {
            var i = Kt(e, t, n, r);
            if (null === i) $r(e, t, r, Gt, n), Nt(e, r);
            else if (
              (function (e, t, n, r, i) {
                switch (t) {
                  case "focusin":
                    return (Tt = Lt(Tt, e, t, n, r, i)), !0;
                  case "dragenter":
                    return (Rt = Lt(Rt, e, t, n, r, i)), !0;
                  case "mouseover":
                    return (_t = Lt(_t, e, t, n, r, i)), !0;
                  case "pointerover":
                    var o = i.pointerId;
                    return Ot.set(o, Lt(Ot.get(o) || null, e, t, n, r, i)), !0;
                  case "gotpointercapture":
                    return (
                      (o = i.pointerId),
                      At.set(o, Lt(At.get(o) || null, e, t, n, r, i)),
                      !0
                    );
                }
                return !1;
              })(i, e, t, n, r)
            )
              r.stopPropagation();
            else if ((Nt(e, r), 4 & t && -1 < Dt.indexOf(e))) {
              for (; null !== i; ) {
                var o = xi(i);
                if (
                  (null !== o && wt(o),
                  null === (o = Kt(e, t, n, r)) && $r(e, t, r, Gt, n),
                  o === i)
                )
                  break;
                i = o;
              }
              null !== i && r.stopPropagation();
            } else $r(e, t, r, null, n);
          }
        }
        var Gt = null;
        function Kt(e, t, n, r) {
          if (((Gt = null), null !== (e = yi((e = we(r))))))
            if (null === (t = Ue(e))) e = null;
            else if (13 === (n = t.tag)) {
              if (null !== (e = We(t))) return e;
              e = null;
            } else if (3 === n) {
              if (t.stateNode.current.memoizedState.isDehydrated)
                return 3 === t.tag ? t.stateNode.containerInfo : null;
              e = null;
            } else t !== e && (e = null);
          return (Gt = e), null;
        }
        function Qt(e) {
          switch (e) {
            case "cancel":
            case "click":
            case "close":
            case "contextmenu":
            case "copy":
            case "cut":
            case "auxclick":
            case "dblclick":
            case "dragend":
            case "dragstart":
            case "drop":
            case "focusin":
            case "focusout":
            case "input":
            case "invalid":
            case "keydown":
            case "keypress":
            case "keyup":
            case "mousedown":
            case "mouseup":
            case "paste":
            case "pause":
            case "play":
            case "pointercancel":
            case "pointerdown":
            case "pointerup":
            case "ratechange":
            case "reset":
            case "resize":
            case "seeked":
            case "submit":
            case "touchcancel":
            case "touchend":
            case "touchstart":
            case "volumechange":
            case "change":
            case "selectionchange":
            case "textInput":
            case "compositionstart":
            case "compositionend":
            case "compositionupdate":
            case "beforeblur":
            case "afterblur":
            case "beforeinput":
            case "blur":
            case "fullscreenchange":
            case "focus":
            case "hashchange":
            case "popstate":
            case "select":
            case "selectstart":
              return 1;
            case "drag":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "mousemove":
            case "mouseout":
            case "mouseover":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "scroll":
            case "toggle":
            case "touchmove":
            case "wheel":
            case "mouseenter":
            case "mouseleave":
            case "pointerenter":
            case "pointerleave":
              return 4;
            case "message":
              switch (Je()) {
                case Ze:
                  return 1;
                case et:
                  return 4;
                case tt:
                case nt:
                  return 16;
                case rt:
                  return 536870912;
                default:
                  return 16;
              }
            default:
              return 16;
          }
        }
        var Xt = null,
          Jt = null,
          Zt = null;
        function en() {
          if (Zt) return Zt;
          var e,
            t,
            n = Jt,
            r = n.length,
            i = "value" in Xt ? Xt.value : Xt.textContent,
            o = i.length;
          for (e = 0; e < r && n[e] === i[e]; e++);
          var a = r - e;
          for (t = 1; t <= a && n[r - t] === i[o - t]; t++);
          return (Zt = i.slice(e, 1 < t ? 1 - t : void 0));
        }
        function tn(e) {
          var t = e.keyCode;
          return (
            "charCode" in e
              ? 0 === (e = e.charCode) && 13 === t && (e = 13)
              : (e = t),
            10 === e && (e = 13),
            32 <= e || 13 === e ? e : 0
          );
        }
        function nn() {
          return !0;
        }
        function rn() {
          return !1;
        }
        function on(e) {
          function t(t, n, r, i, o) {
            for (var a in ((this._reactName = t),
            (this._targetInst = r),
            (this.type = n),
            (this.nativeEvent = i),
            (this.target = o),
            (this.currentTarget = null),
            e))
              e.hasOwnProperty(a) && ((t = e[a]), (this[a] = t ? t(i) : i[a]));
            return (
              (this.isDefaultPrevented = (
                null != i.defaultPrevented
                  ? i.defaultPrevented
                  : !1 === i.returnValue
              )
                ? nn
                : rn),
              (this.isPropagationStopped = rn),
              this
            );
          }
          return (
            M(t.prototype, {
              preventDefault: function () {
                this.defaultPrevented = !0;
                var e = this.nativeEvent;
                e &&
                  (e.preventDefault
                    ? e.preventDefault()
                    : "unknown" !== typeof e.returnValue &&
                      (e.returnValue = !1),
                  (this.isDefaultPrevented = nn));
              },
              stopPropagation: function () {
                var e = this.nativeEvent;
                e &&
                  (e.stopPropagation
                    ? e.stopPropagation()
                    : "unknown" !== typeof e.cancelBubble &&
                      (e.cancelBubble = !0),
                  (this.isPropagationStopped = nn));
              },
              persist: function () {},
              isPersistent: nn,
            }),
            t
          );
        }
        var an,
          sn,
          ln,
          cn = {
            eventPhase: 0,
            bubbles: 0,
            cancelable: 0,
            timeStamp: function (e) {
              return e.timeStamp || Date.now();
            },
            defaultPrevented: 0,
            isTrusted: 0,
          },
          un = on(cn),
          dn = M({}, cn, { view: 0, detail: 0 }),
          hn = on(dn),
          fn = M({}, dn, {
            screenX: 0,
            screenY: 0,
            clientX: 0,
            clientY: 0,
            pageX: 0,
            pageY: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            getModifierState: Cn,
            button: 0,
            buttons: 0,
            relatedTarget: function (e) {
              return void 0 === e.relatedTarget
                ? e.fromElement === e.srcElement
                  ? e.toElement
                  : e.fromElement
                : e.relatedTarget;
            },
            movementX: function (e) {
              return "movementX" in e
                ? e.movementX
                : (e !== ln &&
                    (ln && "mousemove" === e.type
                      ? ((an = e.screenX - ln.screenX),
                        (sn = e.screenY - ln.screenY))
                      : (sn = an = 0),
                    (ln = e)),
                  an);
            },
            movementY: function (e) {
              return "movementY" in e ? e.movementY : sn;
            },
          }),
          pn = on(fn),
          mn = on(M({}, fn, { dataTransfer: 0 })),
          gn = on(M({}, dn, { relatedTarget: 0 })),
          vn = on(
            M({}, cn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 })
          ),
          yn = M({}, cn, {
            clipboardData: function (e) {
              return "clipboardData" in e
                ? e.clipboardData
                : window.clipboardData;
            },
          }),
          xn = on(yn),
          bn = on(M({}, cn, { data: 0 })),
          wn = {
            Esc: "Escape",
            Spacebar: " ",
            Left: "ArrowLeft",
            Up: "ArrowUp",
            Right: "ArrowRight",
            Down: "ArrowDown",
            Del: "Delete",
            Win: "OS",
            Menu: "ContextMenu",
            Apps: "ContextMenu",
            Scroll: "ScrollLock",
            MozPrintableKey: "Unidentified",
          },
          Sn = {
            8: "Backspace",
            9: "Tab",
            12: "Clear",
            13: "Enter",
            16: "Shift",
            17: "Control",
            18: "Alt",
            19: "Pause",
            20: "CapsLock",
            27: "Escape",
            32: " ",
            33: "PageUp",
            34: "PageDown",
            35: "End",
            36: "Home",
            37: "ArrowLeft",
            38: "ArrowUp",
            39: "ArrowRight",
            40: "ArrowDown",
            45: "Insert",
            46: "Delete",
            112: "F1",
            113: "F2",
            114: "F3",
            115: "F4",
            116: "F5",
            117: "F6",
            118: "F7",
            119: "F8",
            120: "F9",
            121: "F10",
            122: "F11",
            123: "F12",
            144: "NumLock",
            145: "ScrollLock",
            224: "Meta",
          },
          kn = {
            Alt: "altKey",
            Control: "ctrlKey",
            Meta: "metaKey",
            Shift: "shiftKey",
          };
        function jn(e) {
          var t = this.nativeEvent;
          return t.getModifierState
            ? t.getModifierState(e)
            : !!(e = kn[e]) && !!t[e];
        }
        function Cn() {
          return jn;
        }
        var Pn = M({}, dn, {
            key: function (e) {
              if (e.key) {
                var t = wn[e.key] || e.key;
                if ("Unidentified" !== t) return t;
              }
              return "keypress" === e.type
                ? 13 === (e = tn(e))
                  ? "Enter"
                  : String.fromCharCode(e)
                : "keydown" === e.type || "keyup" === e.type
                ? Sn[e.keyCode] || "Unidentified"
                : "";
            },
            code: 0,
            location: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            repeat: 0,
            locale: 0,
            getModifierState: Cn,
            charCode: function (e) {
              return "keypress" === e.type ? tn(e) : 0;
            },
            keyCode: function (e) {
              return "keydown" === e.type || "keyup" === e.type ? e.keyCode : 0;
            },
            which: function (e) {
              return "keypress" === e.type
                ? tn(e)
                : "keydown" === e.type || "keyup" === e.type
                ? e.keyCode
                : 0;
            },
          }),
          En = on(Pn),
          Tn = on(
            M({}, fn, {
              pointerId: 0,
              width: 0,
              height: 0,
              pressure: 0,
              tangentialPressure: 0,
              tiltX: 0,
              tiltY: 0,
              twist: 0,
              pointerType: 0,
              isPrimary: 0,
            })
          ),
          Rn = on(
            M({}, dn, {
              touches: 0,
              targetTouches: 0,
              changedTouches: 0,
              altKey: 0,
              metaKey: 0,
              ctrlKey: 0,
              shiftKey: 0,
              getModifierState: Cn,
            })
          ),
          _n = on(
            M({}, cn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 })
          ),
          On = M({}, fn, {
            deltaX: function (e) {
              return "deltaX" in e
                ? e.deltaX
                : "wheelDeltaX" in e
                ? -e.wheelDeltaX
                : 0;
            },
            deltaY: function (e) {
              return "deltaY" in e
                ? e.deltaY
                : "wheelDeltaY" in e
                ? -e.wheelDeltaY
                : "wheelDelta" in e
                ? -e.wheelDelta
                : 0;
            },
            deltaZ: 0,
            deltaMode: 0,
          }),
          An = on(On),
          zn = [9, 13, 27, 32],
          Dn = u && "CompositionEvent" in window,
          Nn = null;
        u && "documentMode" in document && (Nn = document.documentMode);
        var Ln = u && "TextEvent" in window && !Nn,
          Mn = u && (!Dn || (Nn && 8 < Nn && 11 >= Nn)),
          Fn = String.fromCharCode(32),
          In = !1;
        function Vn(e, t) {
          switch (e) {
            case "keyup":
              return -1 !== zn.indexOf(t.keyCode);
            case "keydown":
              return 229 !== t.keyCode;
            case "keypress":
            case "mousedown":
            case "focusout":
              return !0;
            default:
              return !1;
          }
        }
        function Bn(e) {
          return "object" === typeof (e = e.detail) && "data" in e
            ? e.data
            : null;
        }
        var Un = !1;
        var Wn = {
          color: !0,
          date: !0,
          datetime: !0,
          "datetime-local": !0,
          email: !0,
          month: !0,
          number: !0,
          password: !0,
          range: !0,
          search: !0,
          tel: !0,
          text: !0,
          time: !0,
          url: !0,
          week: !0,
        };
        function $n(e) {
          var t = e && e.nodeName && e.nodeName.toLowerCase();
          return "input" === t ? !!Wn[e.type] : "textarea" === t;
        }
        function Hn(e, t, n, r) {
          Pe(r),
            0 < (t = Yr(t, "onChange")).length &&
              ((n = new un("onChange", "change", null, n, r)),
              e.push({ event: n, listeners: t }));
        }
        var Yn = null,
          qn = null;
        function Gn(e) {
          Fr(e, 0);
        }
        function Kn(e) {
          if (q(bi(e))) return e;
        }
        function Qn(e, t) {
          if ("change" === e) return t;
        }
        var Xn = !1;
        if (u) {
          var Jn;
          if (u) {
            var Zn = "oninput" in document;
            if (!Zn) {
              var er = document.createElement("div");
              er.setAttribute("oninput", "return;"),
                (Zn = "function" === typeof er.oninput);
            }
            Jn = Zn;
          } else Jn = !1;
          Xn = Jn && (!document.documentMode || 9 < document.documentMode);
        }
        function tr() {
          Yn && (Yn.detachEvent("onpropertychange", nr), (qn = Yn = null));
        }
        function nr(e) {
          if ("value" === e.propertyName && Kn(qn)) {
            var t = [];
            Hn(t, qn, e, we(e)), Oe(Gn, t);
          }
        }
        function rr(e, t, n) {
          "focusin" === e
            ? (tr(), (qn = n), (Yn = t).attachEvent("onpropertychange", nr))
            : "focusout" === e && tr();
        }
        function ir(e) {
          if ("selectionchange" === e || "keyup" === e || "keydown" === e)
            return Kn(qn);
        }
        function or(e, t) {
          if ("click" === e) return Kn(t);
        }
        function ar(e, t) {
          if ("input" === e || "change" === e) return Kn(t);
        }
        var sr =
          "function" === typeof Object.is
            ? Object.is
            : function (e, t) {
                return (
                  (e === t && (0 !== e || 1 / e === 1 / t)) ||
                  (e !== e && t !== t)
                );
              };
        function lr(e, t) {
          if (sr(e, t)) return !0;
          if (
            "object" !== typeof e ||
            null === e ||
            "object" !== typeof t ||
            null === t
          )
            return !1;
          var n = Object.keys(e),
            r = Object.keys(t);
          if (n.length !== r.length) return !1;
          for (r = 0; r < n.length; r++) {
            var i = n[r];
            if (!d.call(t, i) || !sr(e[i], t[i])) return !1;
          }
          return !0;
        }
        function cr(e) {
          for (; e && e.firstChild; ) e = e.firstChild;
          return e;
        }
        function ur(e, t) {
          var n,
            r = cr(e);
          for (e = 0; r; ) {
            if (3 === r.nodeType) {
              if (((n = e + r.textContent.length), e <= t && n >= t))
                return { node: r, offset: t - e };
              e = n;
            }
            e: {
              for (; r; ) {
                if (r.nextSibling) {
                  r = r.nextSibling;
                  break e;
                }
                r = r.parentNode;
              }
              r = void 0;
            }
            r = cr(r);
          }
        }
        function dr(e, t) {
          return (
            !(!e || !t) &&
            (e === t ||
              ((!e || 3 !== e.nodeType) &&
                (t && 3 === t.nodeType
                  ? dr(e, t.parentNode)
                  : "contains" in e
                  ? e.contains(t)
                  : !!e.compareDocumentPosition &&
                    !!(16 & e.compareDocumentPosition(t)))))
          );
        }
        function hr() {
          for (var e = window, t = G(); t instanceof e.HTMLIFrameElement; ) {
            try {
              var n = "string" === typeof t.contentWindow.location.href;
            } catch (r) {
              n = !1;
            }
            if (!n) break;
            t = G((e = t.contentWindow).document);
          }
          return t;
        }
        function fr(e) {
          var t = e && e.nodeName && e.nodeName.toLowerCase();
          return (
            t &&
            (("input" === t &&
              ("text" === e.type ||
                "search" === e.type ||
                "tel" === e.type ||
                "url" === e.type ||
                "password" === e.type)) ||
              "textarea" === t ||
              "true" === e.contentEditable)
          );
        }
        function pr(e) {
          var t = hr(),
            n = e.focusedElem,
            r = e.selectionRange;
          if (
            t !== n &&
            n &&
            n.ownerDocument &&
            dr(n.ownerDocument.documentElement, n)
          ) {
            if (null !== r && fr(n))
              if (
                ((t = r.start),
                void 0 === (e = r.end) && (e = t),
                "selectionStart" in n)
              )
                (n.selectionStart = t),
                  (n.selectionEnd = Math.min(e, n.value.length));
              else if (
                (e =
                  ((t = n.ownerDocument || document) && t.defaultView) ||
                  window).getSelection
              ) {
                e = e.getSelection();
                var i = n.textContent.length,
                  o = Math.min(r.start, i);
                (r = void 0 === r.end ? o : Math.min(r.end, i)),
                  !e.extend && o > r && ((i = r), (r = o), (o = i)),
                  (i = ur(n, o));
                var a = ur(n, r);
                i &&
                  a &&
                  (1 !== e.rangeCount ||
                    e.anchorNode !== i.node ||
                    e.anchorOffset !== i.offset ||
                    e.focusNode !== a.node ||
                    e.focusOffset !== a.offset) &&
                  ((t = t.createRange()).setStart(i.node, i.offset),
                  e.removeAllRanges(),
                  o > r
                    ? (e.addRange(t), e.extend(a.node, a.offset))
                    : (t.setEnd(a.node, a.offset), e.addRange(t)));
              }
            for (t = [], e = n; (e = e.parentNode); )
              1 === e.nodeType &&
                t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
            for (
              "function" === typeof n.focus && n.focus(), n = 0;
              n < t.length;
              n++
            )
              ((e = t[n]).element.scrollLeft = e.left),
                (e.element.scrollTop = e.top);
          }
        }
        var mr = u && "documentMode" in document && 11 >= document.documentMode,
          gr = null,
          vr = null,
          yr = null,
          xr = !1;
        function br(e, t, n) {
          var r =
            n.window === n
              ? n.document
              : 9 === n.nodeType
              ? n
              : n.ownerDocument;
          xr ||
            null == gr ||
            gr !== G(r) ||
            ("selectionStart" in (r = gr) && fr(r)
              ? (r = { start: r.selectionStart, end: r.selectionEnd })
              : (r = {
                  anchorNode: (r = (
                    (r.ownerDocument && r.ownerDocument.defaultView) ||
                    window
                  ).getSelection()).anchorNode,
                  anchorOffset: r.anchorOffset,
                  focusNode: r.focusNode,
                  focusOffset: r.focusOffset,
                }),
            (yr && lr(yr, r)) ||
              ((yr = r),
              0 < (r = Yr(vr, "onSelect")).length &&
                ((t = new un("onSelect", "select", null, t, n)),
                e.push({ event: t, listeners: r }),
                (t.target = gr))));
        }
        function wr(e, t) {
          var n = {};
          return (
            (n[e.toLowerCase()] = t.toLowerCase()),
            (n["Webkit" + e] = "webkit" + t),
            (n["Moz" + e] = "moz" + t),
            n
          );
        }
        var Sr = {
            animationend: wr("Animation", "AnimationEnd"),
            animationiteration: wr("Animation", "AnimationIteration"),
            animationstart: wr("Animation", "AnimationStart"),
            transitionend: wr("Transition", "TransitionEnd"),
          },
          kr = {},
          jr = {};
        function Cr(e) {
          if (kr[e]) return kr[e];
          if (!Sr[e]) return e;
          var t,
            n = Sr[e];
          for (t in n)
            if (n.hasOwnProperty(t) && t in jr) return (kr[e] = n[t]);
          return e;
        }
        u &&
          ((jr = document.createElement("div").style),
          "AnimationEvent" in window ||
            (delete Sr.animationend.animation,
            delete Sr.animationiteration.animation,
            delete Sr.animationstart.animation),
          "TransitionEvent" in window || delete Sr.transitionend.transition);
        var Pr = Cr("animationend"),
          Er = Cr("animationiteration"),
          Tr = Cr("animationstart"),
          Rr = Cr("transitionend"),
          _r = new Map(),
          Or =
            "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
              " "
            );
        function Ar(e, t) {
          _r.set(e, t), l(t, [e]);
        }
        for (var zr = 0; zr < Or.length; zr++) {
          var Dr = Or[zr];
          Ar(Dr.toLowerCase(), "on" + (Dr[0].toUpperCase() + Dr.slice(1)));
        }
        Ar(Pr, "onAnimationEnd"),
          Ar(Er, "onAnimationIteration"),
          Ar(Tr, "onAnimationStart"),
          Ar("dblclick", "onDoubleClick"),
          Ar("focusin", "onFocus"),
          Ar("focusout", "onBlur"),
          Ar(Rr, "onTransitionEnd"),
          c("onMouseEnter", ["mouseout", "mouseover"]),
          c("onMouseLeave", ["mouseout", "mouseover"]),
          c("onPointerEnter", ["pointerout", "pointerover"]),
          c("onPointerLeave", ["pointerout", "pointerover"]),
          l(
            "onChange",
            "change click focusin focusout input keydown keyup selectionchange".split(
              " "
            )
          ),
          l(
            "onSelect",
            "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
              " "
            )
          ),
          l("onBeforeInput", [
            "compositionend",
            "keypress",
            "textInput",
            "paste",
          ]),
          l(
            "onCompositionEnd",
            "compositionend focusout keydown keypress keyup mousedown".split(
              " "
            )
          ),
          l(
            "onCompositionStart",
            "compositionstart focusout keydown keypress keyup mousedown".split(
              " "
            )
          ),
          l(
            "onCompositionUpdate",
            "compositionupdate focusout keydown keypress keyup mousedown".split(
              " "
            )
          );
        var Nr =
            "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
              " "
            ),
          Lr = new Set(
            "cancel close invalid load scroll toggle".split(" ").concat(Nr)
          );
        function Mr(e, t, n) {
          var r = e.type || "unknown-event";
          (e.currentTarget = n),
            (function (e, t, n, r, i, a, s, l, c) {
              if ((Be.apply(this, arguments), Le)) {
                if (!Le) throw Error(o(198));
                var u = Me;
                (Le = !1), (Me = null), Fe || ((Fe = !0), (Ie = u));
              }
            })(r, t, void 0, e),
            (e.currentTarget = null);
        }
        function Fr(e, t) {
          t = 0 !== (4 & t);
          for (var n = 0; n < e.length; n++) {
            var r = e[n],
              i = r.event;
            r = r.listeners;
            e: {
              var o = void 0;
              if (t)
                for (var a = r.length - 1; 0 <= a; a--) {
                  var s = r[a],
                    l = s.instance,
                    c = s.currentTarget;
                  if (((s = s.listener), l !== o && i.isPropagationStopped()))
                    break e;
                  Mr(i, s, c), (o = l);
                }
              else
                for (a = 0; a < r.length; a++) {
                  if (
                    ((l = (s = r[a]).instance),
                    (c = s.currentTarget),
                    (s = s.listener),
                    l !== o && i.isPropagationStopped())
                  )
                    break e;
                  Mr(i, s, c), (o = l);
                }
            }
          }
          if (Fe) throw ((e = Ie), (Fe = !1), (Ie = null), e);
        }
        function Ir(e, t) {
          var n = t[mi];
          void 0 === n && (n = t[mi] = new Set());
          var r = e + "__bubble";
          n.has(r) || (Wr(t, e, 2, !1), n.add(r));
        }
        function Vr(e, t, n) {
          var r = 0;
          t && (r |= 4), Wr(n, e, r, t);
        }
        var Br = "_reactListening" + Math.random().toString(36).slice(2);
        function Ur(e) {
          if (!e[Br]) {
            (e[Br] = !0),
              a.forEach(function (t) {
                "selectionchange" !== t &&
                  (Lr.has(t) || Vr(t, !1, e), Vr(t, !0, e));
              });
            var t = 9 === e.nodeType ? e : e.ownerDocument;
            null === t || t[Br] || ((t[Br] = !0), Vr("selectionchange", !1, t));
          }
        }
        function Wr(e, t, n, r) {
          switch (Qt(t)) {
            case 1:
              var i = Ht;
              break;
            case 4:
              i = Yt;
              break;
            default:
              i = qt;
          }
          (n = i.bind(null, t, n, e)),
            (i = void 0),
            !ze ||
              ("touchstart" !== t && "touchmove" !== t && "wheel" !== t) ||
              (i = !0),
            r
              ? void 0 !== i
                ? e.addEventListener(t, n, { capture: !0, passive: i })
                : e.addEventListener(t, n, !0)
              : void 0 !== i
              ? e.addEventListener(t, n, { passive: i })
              : e.addEventListener(t, n, !1);
        }
        function $r(e, t, n, r, i) {
          var o = r;
          if (0 === (1 & t) && 0 === (2 & t) && null !== r)
            e: for (;;) {
              if (null === r) return;
              var a = r.tag;
              if (3 === a || 4 === a) {
                var s = r.stateNode.containerInfo;
                if (s === i || (8 === s.nodeType && s.parentNode === i)) break;
                if (4 === a)
                  for (a = r.return; null !== a; ) {
                    var l = a.tag;
                    if (
                      (3 === l || 4 === l) &&
                      ((l = a.stateNode.containerInfo) === i ||
                        (8 === l.nodeType && l.parentNode === i))
                    )
                      return;
                    a = a.return;
                  }
                for (; null !== s; ) {
                  if (null === (a = yi(s))) return;
                  if (5 === (l = a.tag) || 6 === l) {
                    r = o = a;
                    continue e;
                  }
                  s = s.parentNode;
                }
              }
              r = r.return;
            }
          Oe(function () {
            var r = o,
              i = we(n),
              a = [];
            e: {
              var s = _r.get(e);
              if (void 0 !== s) {
                var l = un,
                  c = e;
                switch (e) {
                  case "keypress":
                    if (0 === tn(n)) break e;
                  case "keydown":
                  case "keyup":
                    l = En;
                    break;
                  case "focusin":
                    (c = "focus"), (l = gn);
                    break;
                  case "focusout":
                    (c = "blur"), (l = gn);
                    break;
                  case "beforeblur":
                  case "afterblur":
                    l = gn;
                    break;
                  case "click":
                    if (2 === n.button) break e;
                  case "auxclick":
                  case "dblclick":
                  case "mousedown":
                  case "mousemove":
                  case "mouseup":
                  case "mouseout":
                  case "mouseover":
                  case "contextmenu":
                    l = pn;
                    break;
                  case "drag":
                  case "dragend":
                  case "dragenter":
                  case "dragexit":
                  case "dragleave":
                  case "dragover":
                  case "dragstart":
                  case "drop":
                    l = mn;
                    break;
                  case "touchcancel":
                  case "touchend":
                  case "touchmove":
                  case "touchstart":
                    l = Rn;
                    break;
                  case Pr:
                  case Er:
                  case Tr:
                    l = vn;
                    break;
                  case Rr:
                    l = _n;
                    break;
                  case "scroll":
                    l = hn;
                    break;
                  case "wheel":
                    l = An;
                    break;
                  case "copy":
                  case "cut":
                  case "paste":
                    l = xn;
                    break;
                  case "gotpointercapture":
                  case "lostpointercapture":
                  case "pointercancel":
                  case "pointerdown":
                  case "pointermove":
                  case "pointerout":
                  case "pointerover":
                  case "pointerup":
                    l = Tn;
                }
                var u = 0 !== (4 & t),
                  d = !u && "scroll" === e,
                  h = u ? (null !== s ? s + "Capture" : null) : s;
                u = [];
                for (var f, p = r; null !== p; ) {
                  var m = (f = p).stateNode;
                  if (
                    (5 === f.tag &&
                      null !== m &&
                      ((f = m),
                      null !== h &&
                        null != (m = Ae(p, h)) &&
                        u.push(Hr(p, m, f))),
                    d)
                  )
                    break;
                  p = p.return;
                }
                0 < u.length &&
                  ((s = new l(s, c, null, n, i)),
                  a.push({ event: s, listeners: u }));
              }
            }
            if (0 === (7 & t)) {
              if (
                ((l = "mouseout" === e || "pointerout" === e),
                (!(s = "mouseover" === e || "pointerover" === e) ||
                  n === be ||
                  !(c = n.relatedTarget || n.fromElement) ||
                  (!yi(c) && !c[pi])) &&
                  (l || s) &&
                  ((s =
                    i.window === i
                      ? i
                      : (s = i.ownerDocument)
                      ? s.defaultView || s.parentWindow
                      : window),
                  l
                    ? ((l = r),
                      null !==
                        (c = (c = n.relatedTarget || n.toElement)
                          ? yi(c)
                          : null) &&
                        (c !== (d = Ue(c)) || (5 !== c.tag && 6 !== c.tag)) &&
                        (c = null))
                    : ((l = null), (c = r)),
                  l !== c))
              ) {
                if (
                  ((u = pn),
                  (m = "onMouseLeave"),
                  (h = "onMouseEnter"),
                  (p = "mouse"),
                  ("pointerout" !== e && "pointerover" !== e) ||
                    ((u = Tn),
                    (m = "onPointerLeave"),
                    (h = "onPointerEnter"),
                    (p = "pointer")),
                  (d = null == l ? s : bi(l)),
                  (f = null == c ? s : bi(c)),
                  ((s = new u(m, p + "leave", l, n, i)).target = d),
                  (s.relatedTarget = f),
                  (m = null),
                  yi(i) === r &&
                    (((u = new u(h, p + "enter", c, n, i)).target = f),
                    (u.relatedTarget = d),
                    (m = u)),
                  (d = m),
                  l && c)
                )
                  e: {
                    for (h = c, p = 0, f = u = l; f; f = qr(f)) p++;
                    for (f = 0, m = h; m; m = qr(m)) f++;
                    for (; 0 < p - f; ) (u = qr(u)), p--;
                    for (; 0 < f - p; ) (h = qr(h)), f--;
                    for (; p--; ) {
                      if (u === h || (null !== h && u === h.alternate)) break e;
                      (u = qr(u)), (h = qr(h));
                    }
                    u = null;
                  }
                else u = null;
                null !== l && Gr(a, s, l, u, !1),
                  null !== c && null !== d && Gr(a, d, c, u, !0);
              }
              if (
                "select" ===
                  (l =
                    (s = r ? bi(r) : window).nodeName &&
                    s.nodeName.toLowerCase()) ||
                ("input" === l && "file" === s.type)
              )
                var g = Qn;
              else if ($n(s))
                if (Xn) g = ar;
                else {
                  g = ir;
                  var v = rr;
                }
              else
                (l = s.nodeName) &&
                  "input" === l.toLowerCase() &&
                  ("checkbox" === s.type || "radio" === s.type) &&
                  (g = or);
              switch (
                (g && (g = g(e, r))
                  ? Hn(a, g, n, i)
                  : (v && v(e, s, r),
                    "focusout" === e &&
                      (v = s._wrapperState) &&
                      v.controlled &&
                      "number" === s.type &&
                      ee(s, "number", s.value)),
                (v = r ? bi(r) : window),
                e)
              ) {
                case "focusin":
                  ($n(v) || "true" === v.contentEditable) &&
                    ((gr = v), (vr = r), (yr = null));
                  break;
                case "focusout":
                  yr = vr = gr = null;
                  break;
                case "mousedown":
                  xr = !0;
                  break;
                case "contextmenu":
                case "mouseup":
                case "dragend":
                  (xr = !1), br(a, n, i);
                  break;
                case "selectionchange":
                  if (mr) break;
                case "keydown":
                case "keyup":
                  br(a, n, i);
              }
              var y;
              if (Dn)
                e: {
                  switch (e) {
                    case "compositionstart":
                      var x = "onCompositionStart";
                      break e;
                    case "compositionend":
                      x = "onCompositionEnd";
                      break e;
                    case "compositionupdate":
                      x = "onCompositionUpdate";
                      break e;
                  }
                  x = void 0;
                }
              else
                Un
                  ? Vn(e, n) && (x = "onCompositionEnd")
                  : "keydown" === e &&
                    229 === n.keyCode &&
                    (x = "onCompositionStart");
              x &&
                (Mn &&
                  "ko" !== n.locale &&
                  (Un || "onCompositionStart" !== x
                    ? "onCompositionEnd" === x && Un && (y = en())
                    : ((Jt = "value" in (Xt = i) ? Xt.value : Xt.textContent),
                      (Un = !0))),
                0 < (v = Yr(r, x)).length &&
                  ((x = new bn(x, e, null, n, i)),
                  a.push({ event: x, listeners: v }),
                  y ? (x.data = y) : null !== (y = Bn(n)) && (x.data = y))),
                (y = Ln
                  ? (function (e, t) {
                      switch (e) {
                        case "compositionend":
                          return Bn(t);
                        case "keypress":
                          return 32 !== t.which ? null : ((In = !0), Fn);
                        case "textInput":
                          return (e = t.data) === Fn && In ? null : e;
                        default:
                          return null;
                      }
                    })(e, n)
                  : (function (e, t) {
                      if (Un)
                        return "compositionend" === e || (!Dn && Vn(e, t))
                          ? ((e = en()), (Zt = Jt = Xt = null), (Un = !1), e)
                          : null;
                      switch (e) {
                        case "paste":
                        default:
                          return null;
                        case "keypress":
                          if (
                            !(t.ctrlKey || t.altKey || t.metaKey) ||
                            (t.ctrlKey && t.altKey)
                          ) {
                            if (t.char && 1 < t.char.length) return t.char;
                            if (t.which) return String.fromCharCode(t.which);
                          }
                          return null;
                        case "compositionend":
                          return Mn && "ko" !== t.locale ? null : t.data;
                      }
                    })(e, n)) &&
                  0 < (r = Yr(r, "onBeforeInput")).length &&
                  ((i = new bn("onBeforeInput", "beforeinput", null, n, i)),
                  a.push({ event: i, listeners: r }),
                  (i.data = y));
            }
            Fr(a, t);
          });
        }
        function Hr(e, t, n) {
          return { instance: e, listener: t, currentTarget: n };
        }
        function Yr(e, t) {
          for (var n = t + "Capture", r = []; null !== e; ) {
            var i = e,
              o = i.stateNode;
            5 === i.tag &&
              null !== o &&
              ((i = o),
              null != (o = Ae(e, n)) && r.unshift(Hr(e, o, i)),
              null != (o = Ae(e, t)) && r.push(Hr(e, o, i))),
              (e = e.return);
          }
          return r;
        }
        function qr(e) {
          if (null === e) return null;
          do {
            e = e.return;
          } while (e && 5 !== e.tag);
          return e || null;
        }
        function Gr(e, t, n, r, i) {
          for (var o = t._reactName, a = []; null !== n && n !== r; ) {
            var s = n,
              l = s.alternate,
              c = s.stateNode;
            if (null !== l && l === r) break;
            5 === s.tag &&
              null !== c &&
              ((s = c),
              i
                ? null != (l = Ae(n, o)) && a.unshift(Hr(n, l, s))
                : i || (null != (l = Ae(n, o)) && a.push(Hr(n, l, s)))),
              (n = n.return);
          }
          0 !== a.length && e.push({ event: t, listeners: a });
        }
        var Kr = /\r\n?/g,
          Qr = /\u0000|\uFFFD/g;
        function Xr(e) {
          return ("string" === typeof e ? e : "" + e)
            .replace(Kr, "\n")
            .replace(Qr, "");
        }
        function Jr(e, t, n) {
          if (((t = Xr(t)), Xr(e) !== t && n)) throw Error(o(425));
        }
        function Zr() {}
        var ei = null,
          ti = null;
        function ni(e, t) {
          return (
            "textarea" === e ||
            "noscript" === e ||
            "string" === typeof t.children ||
            "number" === typeof t.children ||
            ("object" === typeof t.dangerouslySetInnerHTML &&
              null !== t.dangerouslySetInnerHTML &&
              null != t.dangerouslySetInnerHTML.__html)
          );
        }
        var ri = "function" === typeof setTimeout ? setTimeout : void 0,
          ii = "function" === typeof clearTimeout ? clearTimeout : void 0,
          oi = "function" === typeof Promise ? Promise : void 0,
          ai =
            "function" === typeof queueMicrotask
              ? queueMicrotask
              : "undefined" !== typeof oi
              ? function (e) {
                  return oi.resolve(null).then(e).catch(si);
                }
              : ri;
        function si(e) {
          setTimeout(function () {
            throw e;
          });
        }
        function li(e, t) {
          var n = t,
            r = 0;
          do {
            var i = n.nextSibling;
            if ((e.removeChild(n), i && 8 === i.nodeType))
              if ("/$" === (n = i.data)) {
                if (0 === r) return e.removeChild(i), void Ut(t);
                r--;
              } else ("$" !== n && "$?" !== n && "$!" !== n) || r++;
            n = i;
          } while (n);
          Ut(t);
        }
        function ci(e) {
          for (; null != e; e = e.nextSibling) {
            var t = e.nodeType;
            if (1 === t || 3 === t) break;
            if (8 === t) {
              if ("$" === (t = e.data) || "$!" === t || "$?" === t) break;
              if ("/$" === t) return null;
            }
          }
          return e;
        }
        function ui(e) {
          e = e.previousSibling;
          for (var t = 0; e; ) {
            if (8 === e.nodeType) {
              var n = e.data;
              if ("$" === n || "$!" === n || "$?" === n) {
                if (0 === t) return e;
                t--;
              } else "/$" === n && t++;
            }
            e = e.previousSibling;
          }
          return null;
        }
        var di = Math.random().toString(36).slice(2),
          hi = "__reactFiber$" + di,
          fi = "__reactProps$" + di,
          pi = "__reactContainer$" + di,
          mi = "__reactEvents$" + di,
          gi = "__reactListeners$" + di,
          vi = "__reactHandles$" + di;
        function yi(e) {
          var t = e[hi];
          if (t) return t;
          for (var n = e.parentNode; n; ) {
            if ((t = n[pi] || n[hi])) {
              if (
                ((n = t.alternate),
                null !== t.child || (null !== n && null !== n.child))
              )
                for (e = ui(e); null !== e; ) {
                  if ((n = e[hi])) return n;
                  e = ui(e);
                }
              return t;
            }
            n = (e = n).parentNode;
          }
          return null;
        }
        function xi(e) {
          return !(e = e[hi] || e[pi]) ||
            (5 !== e.tag && 6 !== e.tag && 13 !== e.tag && 3 !== e.tag)
            ? null
            : e;
        }
        function bi(e) {
          if (5 === e.tag || 6 === e.tag) return e.stateNode;
          throw Error(o(33));
        }
        function wi(e) {
          return e[fi] || null;
        }
        var Si = [],
          ki = -1;
        function ji(e) {
          return { current: e };
        }
        function Ci(e) {
          0 > ki || ((e.current = Si[ki]), (Si[ki] = null), ki--);
        }
        function Pi(e, t) {
          ki++, (Si[ki] = e.current), (e.current = t);
        }
        var Ei = {},
          Ti = ji(Ei),
          Ri = ji(!1),
          _i = Ei;
        function Oi(e, t) {
          var n = e.type.contextTypes;
          if (!n) return Ei;
          var r = e.stateNode;
          if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
            return r.__reactInternalMemoizedMaskedChildContext;
          var i,
            o = {};
          for (i in n) o[i] = t[i];
          return (
            r &&
              (((e = e.stateNode).__reactInternalMemoizedUnmaskedChildContext =
                t),
              (e.__reactInternalMemoizedMaskedChildContext = o)),
            o
          );
        }
        function Ai(e) {
          return null !== (e = e.childContextTypes) && void 0 !== e;
        }
        function zi() {
          Ci(Ri), Ci(Ti);
        }
        function Di(e, t, n) {
          if (Ti.current !== Ei) throw Error(o(168));
          Pi(Ti, t), Pi(Ri, n);
        }
        function Ni(e, t, n) {
          var r = e.stateNode;
          if (
            ((t = t.childContextTypes), "function" !== typeof r.getChildContext)
          )
            return n;
          for (var i in (r = r.getChildContext()))
            if (!(i in t)) throw Error(o(108, W(e) || "Unknown", i));
          return M({}, n, r);
        }
        function Li(e) {
          return (
            (e =
              ((e = e.stateNode) &&
                e.__reactInternalMemoizedMergedChildContext) ||
              Ei),
            (_i = Ti.current),
            Pi(Ti, e),
            Pi(Ri, Ri.current),
            !0
          );
        }
        function Mi(e, t, n) {
          var r = e.stateNode;
          if (!r) throw Error(o(169));
          n
            ? ((e = Ni(e, t, _i)),
              (r.__reactInternalMemoizedMergedChildContext = e),
              Ci(Ri),
              Ci(Ti),
              Pi(Ti, e))
            : Ci(Ri),
            Pi(Ri, n);
        }
        var Fi = null,
          Ii = !1,
          Vi = !1;
        function Bi(e) {
          null === Fi ? (Fi = [e]) : Fi.push(e);
        }
        function Ui() {
          if (!Vi && null !== Fi) {
            Vi = !0;
            var e = 0,
              t = xt;
            try {
              var n = Fi;
              for (xt = 1; e < n.length; e++) {
                var r = n[e];
                do {
                  r = r(!0);
                } while (null !== r);
              }
              (Fi = null), (Ii = !1);
            } catch (i) {
              throw (null !== Fi && (Fi = Fi.slice(e + 1)), qe(Ze, Ui), i);
            } finally {
              (xt = t), (Vi = !1);
            }
          }
          return null;
        }
        var Wi = [],
          $i = 0,
          Hi = null,
          Yi = 0,
          qi = [],
          Gi = 0,
          Ki = null,
          Qi = 1,
          Xi = "";
        function Ji(e, t) {
          (Wi[$i++] = Yi), (Wi[$i++] = Hi), (Hi = e), (Yi = t);
        }
        function Zi(e, t, n) {
          (qi[Gi++] = Qi), (qi[Gi++] = Xi), (qi[Gi++] = Ki), (Ki = e);
          var r = Qi;
          e = Xi;
          var i = 32 - at(r) - 1;
          (r &= ~(1 << i)), (n += 1);
          var o = 32 - at(t) + i;
          if (30 < o) {
            var a = i - (i % 5);
            (o = (r & ((1 << a) - 1)).toString(32)),
              (r >>= a),
              (i -= a),
              (Qi = (1 << (32 - at(t) + i)) | (n << i) | r),
              (Xi = o + e);
          } else (Qi = (1 << o) | (n << i) | r), (Xi = e);
        }
        function eo(e) {
          null !== e.return && (Ji(e, 1), Zi(e, 1, 0));
        }
        function to(e) {
          for (; e === Hi; )
            (Hi = Wi[--$i]), (Wi[$i] = null), (Yi = Wi[--$i]), (Wi[$i] = null);
          for (; e === Ki; )
            (Ki = qi[--Gi]),
              (qi[Gi] = null),
              (Xi = qi[--Gi]),
              (qi[Gi] = null),
              (Qi = qi[--Gi]),
              (qi[Gi] = null);
        }
        var no = null,
          ro = null,
          io = !1,
          oo = null;
        function ao(e, t) {
          var n = Oc(5, null, null, 0);
          (n.elementType = "DELETED"),
            (n.stateNode = t),
            (n.return = e),
            null === (t = e.deletions)
              ? ((e.deletions = [n]), (e.flags |= 16))
              : t.push(n);
        }
        function so(e, t) {
          switch (e.tag) {
            case 5:
              var n = e.type;
              return (
                null !==
                  (t =
                    1 !== t.nodeType ||
                    n.toLowerCase() !== t.nodeName.toLowerCase()
                      ? null
                      : t) &&
                ((e.stateNode = t), (no = e), (ro = ci(t.firstChild)), !0)
              );
            case 6:
              return (
                null !==
                  (t = "" === e.pendingProps || 3 !== t.nodeType ? null : t) &&
                ((e.stateNode = t), (no = e), (ro = null), !0)
              );
            case 13:
              return (
                null !== (t = 8 !== t.nodeType ? null : t) &&
                ((n = null !== Ki ? { id: Qi, overflow: Xi } : null),
                (e.memoizedState = {
                  dehydrated: t,
                  treeContext: n,
                  retryLane: 1073741824,
                }),
                ((n = Oc(18, null, null, 0)).stateNode = t),
                (n.return = e),
                (e.child = n),
                (no = e),
                (ro = null),
                !0)
              );
            default:
              return !1;
          }
        }
        function lo(e) {
          return 0 !== (1 & e.mode) && 0 === (128 & e.flags);
        }
        function co(e) {
          if (io) {
            var t = ro;
            if (t) {
              var n = t;
              if (!so(e, t)) {
                if (lo(e)) throw Error(o(418));
                t = ci(n.nextSibling);
                var r = no;
                t && so(e, t)
                  ? ao(r, n)
                  : ((e.flags = (-4097 & e.flags) | 2), (io = !1), (no = e));
              }
            } else {
              if (lo(e)) throw Error(o(418));
              (e.flags = (-4097 & e.flags) | 2), (io = !1), (no = e);
            }
          }
        }
        function uo(e) {
          for (
            e = e.return;
            null !== e && 5 !== e.tag && 3 !== e.tag && 13 !== e.tag;

          )
            e = e.return;
          no = e;
        }
        function ho(e) {
          if (e !== no) return !1;
          if (!io) return uo(e), (io = !0), !1;
          var t;
          if (
            ((t = 3 !== e.tag) &&
              !(t = 5 !== e.tag) &&
              (t =
                "head" !== (t = e.type) &&
                "body" !== t &&
                !ni(e.type, e.memoizedProps)),
            t && (t = ro))
          ) {
            if (lo(e)) throw (fo(), Error(o(418)));
            for (; t; ) ao(e, t), (t = ci(t.nextSibling));
          }
          if ((uo(e), 13 === e.tag)) {
            if (!(e = null !== (e = e.memoizedState) ? e.dehydrated : null))
              throw Error(o(317));
            e: {
              for (e = e.nextSibling, t = 0; e; ) {
                if (8 === e.nodeType) {
                  var n = e.data;
                  if ("/$" === n) {
                    if (0 === t) {
                      ro = ci(e.nextSibling);
                      break e;
                    }
                    t--;
                  } else ("$" !== n && "$!" !== n && "$?" !== n) || t++;
                }
                e = e.nextSibling;
              }
              ro = null;
            }
          } else ro = no ? ci(e.stateNode.nextSibling) : null;
          return !0;
        }
        function fo() {
          for (var e = ro; e; ) e = ci(e.nextSibling);
        }
        function po() {
          (ro = no = null), (io = !1);
        }
        function mo(e) {
          null === oo ? (oo = [e]) : oo.push(e);
        }
        var go = b.ReactCurrentBatchConfig;
        function vo(e, t, n) {
          if (
            null !== (e = n.ref) &&
            "function" !== typeof e &&
            "object" !== typeof e
          ) {
            if (n._owner) {
              if ((n = n._owner)) {
                if (1 !== n.tag) throw Error(o(309));
                var r = n.stateNode;
              }
              if (!r) throw Error(o(147, e));
              var i = r,
                a = "" + e;
              return null !== t &&
                null !== t.ref &&
                "function" === typeof t.ref &&
                t.ref._stringRef === a
                ? t.ref
                : ((t = function (e) {
                    var t = i.refs;
                    null === e ? delete t[a] : (t[a] = e);
                  }),
                  (t._stringRef = a),
                  t);
            }
            if ("string" !== typeof e) throw Error(o(284));
            if (!n._owner) throw Error(o(290, e));
          }
          return e;
        }
        function yo(e, t) {
          throw (
            ((e = Object.prototype.toString.call(t)),
            Error(
              o(
                31,
                "[object Object]" === e
                  ? "object with keys {" + Object.keys(t).join(", ") + "}"
                  : e
              )
            ))
          );
        }
        function xo(e) {
          return (0, e._init)(e._payload);
        }
        function bo(e) {
          function t(t, n) {
            if (e) {
              var r = t.deletions;
              null === r ? ((t.deletions = [n]), (t.flags |= 16)) : r.push(n);
            }
          }
          function n(n, r) {
            if (!e) return null;
            for (; null !== r; ) t(n, r), (r = r.sibling);
            return null;
          }
          function r(e, t) {
            for (e = new Map(); null !== t; )
              null !== t.key ? e.set(t.key, t) : e.set(t.index, t),
                (t = t.sibling);
            return e;
          }
          function i(e, t) {
            return ((e = zc(e, t)).index = 0), (e.sibling = null), e;
          }
          function a(t, n, r) {
            return (
              (t.index = r),
              e
                ? null !== (r = t.alternate)
                  ? (r = r.index) < n
                    ? ((t.flags |= 2), n)
                    : r
                  : ((t.flags |= 2), n)
                : ((t.flags |= 1048576), n)
            );
          }
          function s(t) {
            return e && null === t.alternate && (t.flags |= 2), t;
          }
          function l(e, t, n, r) {
            return null === t || 6 !== t.tag
              ? (((t = Mc(n, e.mode, r)).return = e), t)
              : (((t = i(t, n)).return = e), t);
          }
          function c(e, t, n, r) {
            var o = n.type;
            return o === k
              ? d(e, t, n.props.children, r, n.key)
              : null !== t &&
                (t.elementType === o ||
                  ("object" === typeof o &&
                    null !== o &&
                    o.$$typeof === A &&
                    xo(o) === t.type))
              ? (((r = i(t, n.props)).ref = vo(e, t, n)), (r.return = e), r)
              : (((r = Dc(n.type, n.key, n.props, null, e.mode, r)).ref = vo(
                  e,
                  t,
                  n
                )),
                (r.return = e),
                r);
          }
          function u(e, t, n, r) {
            return null === t ||
              4 !== t.tag ||
              t.stateNode.containerInfo !== n.containerInfo ||
              t.stateNode.implementation !== n.implementation
              ? (((t = Fc(n, e.mode, r)).return = e), t)
              : (((t = i(t, n.children || [])).return = e), t);
          }
          function d(e, t, n, r, o) {
            return null === t || 7 !== t.tag
              ? (((t = Nc(n, e.mode, r, o)).return = e), t)
              : (((t = i(t, n)).return = e), t);
          }
          function h(e, t, n) {
            if (("string" === typeof t && "" !== t) || "number" === typeof t)
              return ((t = Mc("" + t, e.mode, n)).return = e), t;
            if ("object" === typeof t && null !== t) {
              switch (t.$$typeof) {
                case w:
                  return (
                    ((n = Dc(t.type, t.key, t.props, null, e.mode, n)).ref = vo(
                      e,
                      null,
                      t
                    )),
                    (n.return = e),
                    n
                  );
                case S:
                  return ((t = Fc(t, e.mode, n)).return = e), t;
                case A:
                  return h(e, (0, t._init)(t._payload), n);
              }
              if (te(t) || N(t))
                return ((t = Nc(t, e.mode, n, null)).return = e), t;
              yo(e, t);
            }
            return null;
          }
          function f(e, t, n, r) {
            var i = null !== t ? t.key : null;
            if (("string" === typeof n && "" !== n) || "number" === typeof n)
              return null !== i ? null : l(e, t, "" + n, r);
            if ("object" === typeof n && null !== n) {
              switch (n.$$typeof) {
                case w:
                  return n.key === i ? c(e, t, n, r) : null;
                case S:
                  return n.key === i ? u(e, t, n, r) : null;
                case A:
                  return f(e, t, (i = n._init)(n._payload), r);
              }
              if (te(n) || N(n)) return null !== i ? null : d(e, t, n, r, null);
              yo(e, n);
            }
            return null;
          }
          function p(e, t, n, r, i) {
            if (("string" === typeof r && "" !== r) || "number" === typeof r)
              return l(t, (e = e.get(n) || null), "" + r, i);
            if ("object" === typeof r && null !== r) {
              switch (r.$$typeof) {
                case w:
                  return c(
                    t,
                    (e = e.get(null === r.key ? n : r.key) || null),
                    r,
                    i
                  );
                case S:
                  return u(
                    t,
                    (e = e.get(null === r.key ? n : r.key) || null),
                    r,
                    i
                  );
                case A:
                  return p(e, t, n, (0, r._init)(r._payload), i);
              }
              if (te(r) || N(r))
                return d(t, (e = e.get(n) || null), r, i, null);
              yo(t, r);
            }
            return null;
          }
          function m(i, o, s, l) {
            for (
              var c = null, u = null, d = o, m = (o = 0), g = null;
              null !== d && m < s.length;
              m++
            ) {
              d.index > m ? ((g = d), (d = null)) : (g = d.sibling);
              var v = f(i, d, s[m], l);
              if (null === v) {
                null === d && (d = g);
                break;
              }
              e && d && null === v.alternate && t(i, d),
                (o = a(v, o, m)),
                null === u ? (c = v) : (u.sibling = v),
                (u = v),
                (d = g);
            }
            if (m === s.length) return n(i, d), io && Ji(i, m), c;
            if (null === d) {
              for (; m < s.length; m++)
                null !== (d = h(i, s[m], l)) &&
                  ((o = a(d, o, m)),
                  null === u ? (c = d) : (u.sibling = d),
                  (u = d));
              return io && Ji(i, m), c;
            }
            for (d = r(i, d); m < s.length; m++)
              null !== (g = p(d, i, m, s[m], l)) &&
                (e &&
                  null !== g.alternate &&
                  d.delete(null === g.key ? m : g.key),
                (o = a(g, o, m)),
                null === u ? (c = g) : (u.sibling = g),
                (u = g));
            return (
              e &&
                d.forEach(function (e) {
                  return t(i, e);
                }),
              io && Ji(i, m),
              c
            );
          }
          function g(i, s, l, c) {
            var u = N(l);
            if ("function" !== typeof u) throw Error(o(150));
            if (null == (l = u.call(l))) throw Error(o(151));
            for (
              var d = (u = null), m = s, g = (s = 0), v = null, y = l.next();
              null !== m && !y.done;
              g++, y = l.next()
            ) {
              m.index > g ? ((v = m), (m = null)) : (v = m.sibling);
              var x = f(i, m, y.value, c);
              if (null === x) {
                null === m && (m = v);
                break;
              }
              e && m && null === x.alternate && t(i, m),
                (s = a(x, s, g)),
                null === d ? (u = x) : (d.sibling = x),
                (d = x),
                (m = v);
            }
            if (y.done) return n(i, m), io && Ji(i, g), u;
            if (null === m) {
              for (; !y.done; g++, y = l.next())
                null !== (y = h(i, y.value, c)) &&
                  ((s = a(y, s, g)),
                  null === d ? (u = y) : (d.sibling = y),
                  (d = y));
              return io && Ji(i, g), u;
            }
            for (m = r(i, m); !y.done; g++, y = l.next())
              null !== (y = p(m, i, g, y.value, c)) &&
                (e &&
                  null !== y.alternate &&
                  m.delete(null === y.key ? g : y.key),
                (s = a(y, s, g)),
                null === d ? (u = y) : (d.sibling = y),
                (d = y));
            return (
              e &&
                m.forEach(function (e) {
                  return t(i, e);
                }),
              io && Ji(i, g),
              u
            );
          }
          return function e(r, o, a, l) {
            if (
              ("object" === typeof a &&
                null !== a &&
                a.type === k &&
                null === a.key &&
                (a = a.props.children),
              "object" === typeof a && null !== a)
            ) {
              switch (a.$$typeof) {
                case w:
                  e: {
                    for (var c = a.key, u = o; null !== u; ) {
                      if (u.key === c) {
                        if ((c = a.type) === k) {
                          if (7 === u.tag) {
                            n(r, u.sibling),
                              ((o = i(u, a.props.children)).return = r),
                              (r = o);
                            break e;
                          }
                        } else if (
                          u.elementType === c ||
                          ("object" === typeof c &&
                            null !== c &&
                            c.$$typeof === A &&
                            xo(c) === u.type)
                        ) {
                          n(r, u.sibling),
                            ((o = i(u, a.props)).ref = vo(r, u, a)),
                            (o.return = r),
                            (r = o);
                          break e;
                        }
                        n(r, u);
                        break;
                      }
                      t(r, u), (u = u.sibling);
                    }
                    a.type === k
                      ? (((o = Nc(a.props.children, r.mode, l, a.key)).return =
                          r),
                        (r = o))
                      : (((l = Dc(
                          a.type,
                          a.key,
                          a.props,
                          null,
                          r.mode,
                          l
                        )).ref = vo(r, o, a)),
                        (l.return = r),
                        (r = l));
                  }
                  return s(r);
                case S:
                  e: {
                    for (u = a.key; null !== o; ) {
                      if (o.key === u) {
                        if (
                          4 === o.tag &&
                          o.stateNode.containerInfo === a.containerInfo &&
                          o.stateNode.implementation === a.implementation
                        ) {
                          n(r, o.sibling),
                            ((o = i(o, a.children || [])).return = r),
                            (r = o);
                          break e;
                        }
                        n(r, o);
                        break;
                      }
                      t(r, o), (o = o.sibling);
                    }
                    ((o = Fc(a, r.mode, l)).return = r), (r = o);
                  }
                  return s(r);
                case A:
                  return e(r, o, (u = a._init)(a._payload), l);
              }
              if (te(a)) return m(r, o, a, l);
              if (N(a)) return g(r, o, a, l);
              yo(r, a);
            }
            return ("string" === typeof a && "" !== a) || "number" === typeof a
              ? ((a = "" + a),
                null !== o && 6 === o.tag
                  ? (n(r, o.sibling), ((o = i(o, a)).return = r), (r = o))
                  : (n(r, o), ((o = Mc(a, r.mode, l)).return = r), (r = o)),
                s(r))
              : n(r, o);
          };
        }
        var wo = bo(!0),
          So = bo(!1),
          ko = ji(null),
          jo = null,
          Co = null,
          Po = null;
        function Eo() {
          Po = Co = jo = null;
        }
        function To(e) {
          var t = ko.current;
          Ci(ko), (e._currentValue = t);
        }
        function Ro(e, t, n) {
          for (; null !== e; ) {
            var r = e.alternate;
            if (
              ((e.childLanes & t) !== t
                ? ((e.childLanes |= t), null !== r && (r.childLanes |= t))
                : null !== r && (r.childLanes & t) !== t && (r.childLanes |= t),
              e === n)
            )
              break;
            e = e.return;
          }
        }
        function _o(e, t) {
          (jo = e),
            (Po = Co = null),
            null !== (e = e.dependencies) &&
              null !== e.firstContext &&
              (0 !== (e.lanes & t) && (xs = !0), (e.firstContext = null));
        }
        function Oo(e) {
          var t = e._currentValue;
          if (Po !== e)
            if (
              ((e = { context: e, memoizedValue: t, next: null }), null === Co)
            ) {
              if (null === jo) throw Error(o(308));
              (Co = e), (jo.dependencies = { lanes: 0, firstContext: e });
            } else Co = Co.next = e;
          return t;
        }
        var Ao = null;
        function zo(e) {
          null === Ao ? (Ao = [e]) : Ao.push(e);
        }
        function Do(e, t, n, r) {
          var i = t.interleaved;
          return (
            null === i
              ? ((n.next = n), zo(t))
              : ((n.next = i.next), (i.next = n)),
            (t.interleaved = n),
            No(e, r)
          );
        }
        function No(e, t) {
          e.lanes |= t;
          var n = e.alternate;
          for (null !== n && (n.lanes |= t), n = e, e = e.return; null !== e; )
            (e.childLanes |= t),
              null !== (n = e.alternate) && (n.childLanes |= t),
              (n = e),
              (e = e.return);
          return 3 === n.tag ? n.stateNode : null;
        }
        var Lo = !1;
        function Mo(e) {
          e.updateQueue = {
            baseState: e.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: { pending: null, interleaved: null, lanes: 0 },
            effects: null,
          };
        }
        function Fo(e, t) {
          (e = e.updateQueue),
            t.updateQueue === e &&
              (t.updateQueue = {
                baseState: e.baseState,
                firstBaseUpdate: e.firstBaseUpdate,
                lastBaseUpdate: e.lastBaseUpdate,
                shared: e.shared,
                effects: e.effects,
              });
        }
        function Io(e, t) {
          return {
            eventTime: e,
            lane: t,
            tag: 0,
            payload: null,
            callback: null,
            next: null,
          };
        }
        function Vo(e, t, n) {
          var r = e.updateQueue;
          if (null === r) return null;
          if (((r = r.shared), 0 !== (2 & Tl))) {
            var i = r.pending;
            return (
              null === i ? (t.next = t) : ((t.next = i.next), (i.next = t)),
              (r.pending = t),
              No(e, n)
            );
          }
          return (
            null === (i = r.interleaved)
              ? ((t.next = t), zo(r))
              : ((t.next = i.next), (i.next = t)),
            (r.interleaved = t),
            No(e, n)
          );
        }
        function Bo(e, t, n) {
          if (
            null !== (t = t.updateQueue) &&
            ((t = t.shared), 0 !== (4194240 & n))
          ) {
            var r = t.lanes;
            (n |= r &= e.pendingLanes), (t.lanes = n), yt(e, n);
          }
        }
        function Uo(e, t) {
          var n = e.updateQueue,
            r = e.alternate;
          if (null !== r && n === (r = r.updateQueue)) {
            var i = null,
              o = null;
            if (null !== (n = n.firstBaseUpdate)) {
              do {
                var a = {
                  eventTime: n.eventTime,
                  lane: n.lane,
                  tag: n.tag,
                  payload: n.payload,
                  callback: n.callback,
                  next: null,
                };
                null === o ? (i = o = a) : (o = o.next = a), (n = n.next);
              } while (null !== n);
              null === o ? (i = o = t) : (o = o.next = t);
            } else i = o = t;
            return (
              (n = {
                baseState: r.baseState,
                firstBaseUpdate: i,
                lastBaseUpdate: o,
                shared: r.shared,
                effects: r.effects,
              }),
              void (e.updateQueue = n)
            );
          }
          null === (e = n.lastBaseUpdate)
            ? (n.firstBaseUpdate = t)
            : (e.next = t),
            (n.lastBaseUpdate = t);
        }
        function Wo(e, t, n, r) {
          var i = e.updateQueue;
          Lo = !1;
          var o = i.firstBaseUpdate,
            a = i.lastBaseUpdate,
            s = i.shared.pending;
          if (null !== s) {
            i.shared.pending = null;
            var l = s,
              c = l.next;
            (l.next = null), null === a ? (o = c) : (a.next = c), (a = l);
            var u = e.alternate;
            null !== u &&
              (s = (u = u.updateQueue).lastBaseUpdate) !== a &&
              (null === s ? (u.firstBaseUpdate = c) : (s.next = c),
              (u.lastBaseUpdate = l));
          }
          if (null !== o) {
            var d = i.baseState;
            for (a = 0, u = c = l = null, s = o; ; ) {
              var h = s.lane,
                f = s.eventTime;
              if ((r & h) === h) {
                null !== u &&
                  (u = u.next =
                    {
                      eventTime: f,
                      lane: 0,
                      tag: s.tag,
                      payload: s.payload,
                      callback: s.callback,
                      next: null,
                    });
                e: {
                  var p = e,
                    m = s;
                  switch (((h = t), (f = n), m.tag)) {
                    case 1:
                      if ("function" === typeof (p = m.payload)) {
                        d = p.call(f, d, h);
                        break e;
                      }
                      d = p;
                      break e;
                    case 3:
                      p.flags = (-65537 & p.flags) | 128;
                    case 0:
                      if (
                        null ===
                          (h =
                            "function" === typeof (p = m.payload)
                              ? p.call(f, d, h)
                              : p) ||
                        void 0 === h
                      )
                        break e;
                      d = M({}, d, h);
                      break e;
                    case 2:
                      Lo = !0;
                  }
                }
                null !== s.callback &&
                  0 !== s.lane &&
                  ((e.flags |= 64),
                  null === (h = i.effects) ? (i.effects = [s]) : h.push(s));
              } else
                (f = {
                  eventTime: f,
                  lane: h,
                  tag: s.tag,
                  payload: s.payload,
                  callback: s.callback,
                  next: null,
                }),
                  null === u ? ((c = u = f), (l = d)) : (u = u.next = f),
                  (a |= h);
              if (null === (s = s.next)) {
                if (null === (s = i.shared.pending)) break;
                (s = (h = s).next),
                  (h.next = null),
                  (i.lastBaseUpdate = h),
                  (i.shared.pending = null);
              }
            }
            if (
              (null === u && (l = d),
              (i.baseState = l),
              (i.firstBaseUpdate = c),
              (i.lastBaseUpdate = u),
              null !== (t = i.shared.interleaved))
            ) {
              i = t;
              do {
                (a |= i.lane), (i = i.next);
              } while (i !== t);
            } else null === o && (i.shared.lanes = 0);
            (Ll |= a), (e.lanes = a), (e.memoizedState = d);
          }
        }
        function $o(e, t, n) {
          if (((e = t.effects), (t.effects = null), null !== e))
            for (t = 0; t < e.length; t++) {
              var r = e[t],
                i = r.callback;
              if (null !== i) {
                if (((r.callback = null), (r = n), "function" !== typeof i))
                  throw Error(o(191, i));
                i.call(r);
              }
            }
        }
        var Ho = {},
          Yo = ji(Ho),
          qo = ji(Ho),
          Go = ji(Ho);
        function Ko(e) {
          if (e === Ho) throw Error(o(174));
          return e;
        }
        function Qo(e, t) {
          switch ((Pi(Go, t), Pi(qo, e), Pi(Yo, Ho), (e = t.nodeType))) {
            case 9:
            case 11:
              t = (t = t.documentElement) ? t.namespaceURI : le(null, "");
              break;
            default:
              t = le(
                (t = (e = 8 === e ? t.parentNode : t).namespaceURI || null),
                (e = e.tagName)
              );
          }
          Ci(Yo), Pi(Yo, t);
        }
        function Xo() {
          Ci(Yo), Ci(qo), Ci(Go);
        }
        function Jo(e) {
          Ko(Go.current);
          var t = Ko(Yo.current),
            n = le(t, e.type);
          t !== n && (Pi(qo, e), Pi(Yo, n));
        }
        function Zo(e) {
          qo.current === e && (Ci(Yo), Ci(qo));
        }
        var ea = ji(0);
        function ta(e) {
          for (var t = e; null !== t; ) {
            if (13 === t.tag) {
              var n = t.memoizedState;
              if (
                null !== n &&
                (null === (n = n.dehydrated) ||
                  "$?" === n.data ||
                  "$!" === n.data)
              )
                return t;
            } else if (19 === t.tag && void 0 !== t.memoizedProps.revealOrder) {
              if (0 !== (128 & t.flags)) return t;
            } else if (null !== t.child) {
              (t.child.return = t), (t = t.child);
              continue;
            }
            if (t === e) break;
            for (; null === t.sibling; ) {
              if (null === t.return || t.return === e) return null;
              t = t.return;
            }
            (t.sibling.return = t.return), (t = t.sibling);
          }
          return null;
        }
        var na = [];
        function ra() {
          for (var e = 0; e < na.length; e++)
            na[e]._workInProgressVersionPrimary = null;
          na.length = 0;
        }
        var ia = b.ReactCurrentDispatcher,
          oa = b.ReactCurrentBatchConfig,
          aa = 0,
          sa = null,
          la = null,
          ca = null,
          ua = !1,
          da = !1,
          ha = 0,
          fa = 0;
        function pa() {
          throw Error(o(321));
        }
        function ma(e, t) {
          if (null === t) return !1;
          for (var n = 0; n < t.length && n < e.length; n++)
            if (!sr(e[n], t[n])) return !1;
          return !0;
        }
        function ga(e, t, n, r, i, a) {
          if (
            ((aa = a),
            (sa = t),
            (t.memoizedState = null),
            (t.updateQueue = null),
            (t.lanes = 0),
            (ia.current = null === e || null === e.memoizedState ? Za : es),
            (e = n(r, i)),
            da)
          ) {
            a = 0;
            do {
              if (((da = !1), (ha = 0), 25 <= a)) throw Error(o(301));
              (a += 1),
                (ca = la = null),
                (t.updateQueue = null),
                (ia.current = ts),
                (e = n(r, i));
            } while (da);
          }
          if (
            ((ia.current = Ja),
            (t = null !== la && null !== la.next),
            (aa = 0),
            (ca = la = sa = null),
            (ua = !1),
            t)
          )
            throw Error(o(300));
          return e;
        }
        function va() {
          var e = 0 !== ha;
          return (ha = 0), e;
        }
        function ya() {
          var e = {
            memoizedState: null,
            baseState: null,
            baseQueue: null,
            queue: null,
            next: null,
          };
          return (
            null === ca ? (sa.memoizedState = ca = e) : (ca = ca.next = e), ca
          );
        }
        function xa() {
          if (null === la) {
            var e = sa.alternate;
            e = null !== e ? e.memoizedState : null;
          } else e = la.next;
          var t = null === ca ? sa.memoizedState : ca.next;
          if (null !== t) (ca = t), (la = e);
          else {
            if (null === e) throw Error(o(310));
            (e = {
              memoizedState: (la = e).memoizedState,
              baseState: la.baseState,
              baseQueue: la.baseQueue,
              queue: la.queue,
              next: null,
            }),
              null === ca ? (sa.memoizedState = ca = e) : (ca = ca.next = e);
          }
          return ca;
        }
        function ba(e, t) {
          return "function" === typeof t ? t(e) : t;
        }
        function wa(e) {
          var t = xa(),
            n = t.queue;
          if (null === n) throw Error(o(311));
          n.lastRenderedReducer = e;
          var r = la,
            i = r.baseQueue,
            a = n.pending;
          if (null !== a) {
            if (null !== i) {
              var s = i.next;
              (i.next = a.next), (a.next = s);
            }
            (r.baseQueue = i = a), (n.pending = null);
          }
          if (null !== i) {
            (a = i.next), (r = r.baseState);
            var l = (s = null),
              c = null,
              u = a;
            do {
              var d = u.lane;
              if ((aa & d) === d)
                null !== c &&
                  (c = c.next =
                    {
                      lane: 0,
                      action: u.action,
                      hasEagerState: u.hasEagerState,
                      eagerState: u.eagerState,
                      next: null,
                    }),
                  (r = u.hasEagerState ? u.eagerState : e(r, u.action));
              else {
                var h = {
                  lane: d,
                  action: u.action,
                  hasEagerState: u.hasEagerState,
                  eagerState: u.eagerState,
                  next: null,
                };
                null === c ? ((l = c = h), (s = r)) : (c = c.next = h),
                  (sa.lanes |= d),
                  (Ll |= d);
              }
              u = u.next;
            } while (null !== u && u !== a);
            null === c ? (s = r) : (c.next = l),
              sr(r, t.memoizedState) || (xs = !0),
              (t.memoizedState = r),
              (t.baseState = s),
              (t.baseQueue = c),
              (n.lastRenderedState = r);
          }
          if (null !== (e = n.interleaved)) {
            i = e;
            do {
              (a = i.lane), (sa.lanes |= a), (Ll |= a), (i = i.next);
            } while (i !== e);
          } else null === i && (n.lanes = 0);
          return [t.memoizedState, n.dispatch];
        }
        function Sa(e) {
          var t = xa(),
            n = t.queue;
          if (null === n) throw Error(o(311));
          n.lastRenderedReducer = e;
          var r = n.dispatch,
            i = n.pending,
            a = t.memoizedState;
          if (null !== i) {
            n.pending = null;
            var s = (i = i.next);
            do {
              (a = e(a, s.action)), (s = s.next);
            } while (s !== i);
            sr(a, t.memoizedState) || (xs = !0),
              (t.memoizedState = a),
              null === t.baseQueue && (t.baseState = a),
              (n.lastRenderedState = a);
          }
          return [a, r];
        }
        function ka() {}
        function ja(e, t) {
          var n = sa,
            r = xa(),
            i = t(),
            a = !sr(r.memoizedState, i);
          if (
            (a && ((r.memoizedState = i), (xs = !0)),
            (r = r.queue),
            La(Ea.bind(null, n, r, e), [e]),
            r.getSnapshot !== t ||
              a ||
              (null !== ca && 1 & ca.memoizedState.tag))
          ) {
            if (
              ((n.flags |= 2048),
              Oa(9, Pa.bind(null, n, r, i, t), void 0, null),
              null === Rl)
            )
              throw Error(o(349));
            0 !== (30 & aa) || Ca(n, t, i);
          }
          return i;
        }
        function Ca(e, t, n) {
          (e.flags |= 16384),
            (e = { getSnapshot: t, value: n }),
            null === (t = sa.updateQueue)
              ? ((t = { lastEffect: null, stores: null }),
                (sa.updateQueue = t),
                (t.stores = [e]))
              : null === (n = t.stores)
              ? (t.stores = [e])
              : n.push(e);
        }
        function Pa(e, t, n, r) {
          (t.value = n), (t.getSnapshot = r), Ta(t) && Ra(e);
        }
        function Ea(e, t, n) {
          return n(function () {
            Ta(t) && Ra(e);
          });
        }
        function Ta(e) {
          var t = e.getSnapshot;
          e = e.value;
          try {
            var n = t();
            return !sr(e, n);
          } catch (r) {
            return !0;
          }
        }
        function Ra(e) {
          var t = No(e, 1);
          null !== t && nc(t, e, 1, -1);
        }
        function _a(e) {
          var t = ya();
          return (
            "function" === typeof e && (e = e()),
            (t.memoizedState = t.baseState = e),
            (e = {
              pending: null,
              interleaved: null,
              lanes: 0,
              dispatch: null,
              lastRenderedReducer: ba,
              lastRenderedState: e,
            }),
            (t.queue = e),
            (e = e.dispatch = Ga.bind(null, sa, e)),
            [t.memoizedState, e]
          );
        }
        function Oa(e, t, n, r) {
          return (
            (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
            null === (t = sa.updateQueue)
              ? ((t = { lastEffect: null, stores: null }),
                (sa.updateQueue = t),
                (t.lastEffect = e.next = e))
              : null === (n = t.lastEffect)
              ? (t.lastEffect = e.next = e)
              : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e)),
            e
          );
        }
        function Aa() {
          return xa().memoizedState;
        }
        function za(e, t, n, r) {
          var i = ya();
          (sa.flags |= e),
            (i.memoizedState = Oa(1 | t, n, void 0, void 0 === r ? null : r));
        }
        function Da(e, t, n, r) {
          var i = xa();
          r = void 0 === r ? null : r;
          var o = void 0;
          if (null !== la) {
            var a = la.memoizedState;
            if (((o = a.destroy), null !== r && ma(r, a.deps)))
              return void (i.memoizedState = Oa(t, n, o, r));
          }
          (sa.flags |= e), (i.memoizedState = Oa(1 | t, n, o, r));
        }
        function Na(e, t) {
          return za(8390656, 8, e, t);
        }
        function La(e, t) {
          return Da(2048, 8, e, t);
        }
        function Ma(e, t) {
          return Da(4, 2, e, t);
        }
        function Fa(e, t) {
          return Da(4, 4, e, t);
        }
        function Ia(e, t) {
          return "function" === typeof t
            ? ((e = e()),
              t(e),
              function () {
                t(null);
              })
            : null !== t && void 0 !== t
            ? ((e = e()),
              (t.current = e),
              function () {
                t.current = null;
              })
            : void 0;
        }
        function Va(e, t, n) {
          return (
            (n = null !== n && void 0 !== n ? n.concat([e]) : null),
            Da(4, 4, Ia.bind(null, t, e), n)
          );
        }
        function Ba() {}
        function Ua(e, t) {
          var n = xa();
          t = void 0 === t ? null : t;
          var r = n.memoizedState;
          return null !== r && null !== t && ma(t, r[1])
            ? r[0]
            : ((n.memoizedState = [e, t]), e);
        }
        function Wa(e, t) {
          var n = xa();
          t = void 0 === t ? null : t;
          var r = n.memoizedState;
          return null !== r && null !== t && ma(t, r[1])
            ? r[0]
            : ((e = e()), (n.memoizedState = [e, t]), e);
        }
        function $a(e, t, n) {
          return 0 === (21 & aa)
            ? (e.baseState && ((e.baseState = !1), (xs = !0)),
              (e.memoizedState = n))
            : (sr(n, t) ||
                ((n = mt()), (sa.lanes |= n), (Ll |= n), (e.baseState = !0)),
              t);
        }
        function Ha(e, t) {
          var n = xt;
          (xt = 0 !== n && 4 > n ? n : 4), e(!0);
          var r = oa.transition;
          oa.transition = {};
          try {
            e(!1), t();
          } finally {
            (xt = n), (oa.transition = r);
          }
        }
        function Ya() {
          return xa().memoizedState;
        }
        function qa(e, t, n) {
          var r = tc(e);
          if (
            ((n = {
              lane: r,
              action: n,
              hasEagerState: !1,
              eagerState: null,
              next: null,
            }),
            Ka(e))
          )
            Qa(t, n);
          else if (null !== (n = Do(e, t, n, r))) {
            nc(n, e, r, ec()), Xa(n, t, r);
          }
        }
        function Ga(e, t, n) {
          var r = tc(e),
            i = {
              lane: r,
              action: n,
              hasEagerState: !1,
              eagerState: null,
              next: null,
            };
          if (Ka(e)) Qa(t, i);
          else {
            var o = e.alternate;
            if (
              0 === e.lanes &&
              (null === o || 0 === o.lanes) &&
              null !== (o = t.lastRenderedReducer)
            )
              try {
                var a = t.lastRenderedState,
                  s = o(a, n);
                if (((i.hasEagerState = !0), (i.eagerState = s), sr(s, a))) {
                  var l = t.interleaved;
                  return (
                    null === l
                      ? ((i.next = i), zo(t))
                      : ((i.next = l.next), (l.next = i)),
                    void (t.interleaved = i)
                  );
                }
              } catch (c) {}
            null !== (n = Do(e, t, i, r)) &&
              (nc(n, e, r, (i = ec())), Xa(n, t, r));
          }
        }
        function Ka(e) {
          var t = e.alternate;
          return e === sa || (null !== t && t === sa);
        }
        function Qa(e, t) {
          da = ua = !0;
          var n = e.pending;
          null === n ? (t.next = t) : ((t.next = n.next), (n.next = t)),
            (e.pending = t);
        }
        function Xa(e, t, n) {
          if (0 !== (4194240 & n)) {
            var r = t.lanes;
            (n |= r &= e.pendingLanes), (t.lanes = n), yt(e, n);
          }
        }
        var Ja = {
            readContext: Oo,
            useCallback: pa,
            useContext: pa,
            useEffect: pa,
            useImperativeHandle: pa,
            useInsertionEffect: pa,
            useLayoutEffect: pa,
            useMemo: pa,
            useReducer: pa,
            useRef: pa,
            useState: pa,
            useDebugValue: pa,
            useDeferredValue: pa,
            useTransition: pa,
            useMutableSource: pa,
            useSyncExternalStore: pa,
            useId: pa,
            unstable_isNewReconciler: !1,
          },
          Za = {
            readContext: Oo,
            useCallback: function (e, t) {
              return (ya().memoizedState = [e, void 0 === t ? null : t]), e;
            },
            useContext: Oo,
            useEffect: Na,
            useImperativeHandle: function (e, t, n) {
              return (
                (n = null !== n && void 0 !== n ? n.concat([e]) : null),
                za(4194308, 4, Ia.bind(null, t, e), n)
              );
            },
            useLayoutEffect: function (e, t) {
              return za(4194308, 4, e, t);
            },
            useInsertionEffect: function (e, t) {
              return za(4, 2, e, t);
            },
            useMemo: function (e, t) {
              var n = ya();
              return (
                (t = void 0 === t ? null : t),
                (e = e()),
                (n.memoizedState = [e, t]),
                e
              );
            },
            useReducer: function (e, t, n) {
              var r = ya();
              return (
                (t = void 0 !== n ? n(t) : t),
                (r.memoizedState = r.baseState = t),
                (e = {
                  pending: null,
                  interleaved: null,
                  lanes: 0,
                  dispatch: null,
                  lastRenderedReducer: e,
                  lastRenderedState: t,
                }),
                (r.queue = e),
                (e = e.dispatch = qa.bind(null, sa, e)),
                [r.memoizedState, e]
              );
            },
            useRef: function (e) {
              return (e = { current: e }), (ya().memoizedState = e);
            },
            useState: _a,
            useDebugValue: Ba,
            useDeferredValue: function (e) {
              return (ya().memoizedState = e);
            },
            useTransition: function () {
              var e = _a(!1),
                t = e[0];
              return (
                (e = Ha.bind(null, e[1])), (ya().memoizedState = e), [t, e]
              );
            },
            useMutableSource: function () {},
            useSyncExternalStore: function (e, t, n) {
              var r = sa,
                i = ya();
              if (io) {
                if (void 0 === n) throw Error(o(407));
                n = n();
              } else {
                if (((n = t()), null === Rl)) throw Error(o(349));
                0 !== (30 & aa) || Ca(r, t, n);
              }
              i.memoizedState = n;
              var a = { value: n, getSnapshot: t };
              return (
                (i.queue = a),
                Na(Ea.bind(null, r, a, e), [e]),
                (r.flags |= 2048),
                Oa(9, Pa.bind(null, r, a, n, t), void 0, null),
                n
              );
            },
            useId: function () {
              var e = ya(),
                t = Rl.identifierPrefix;
              if (io) {
                var n = Xi;
                (t =
                  ":" +
                  t +
                  "R" +
                  (n = (Qi & ~(1 << (32 - at(Qi) - 1))).toString(32) + n)),
                  0 < (n = ha++) && (t += "H" + n.toString(32)),
                  (t += ":");
              } else t = ":" + t + "r" + (n = fa++).toString(32) + ":";
              return (e.memoizedState = t);
            },
            unstable_isNewReconciler: !1,
          },
          es = {
            readContext: Oo,
            useCallback: Ua,
            useContext: Oo,
            useEffect: La,
            useImperativeHandle: Va,
            useInsertionEffect: Ma,
            useLayoutEffect: Fa,
            useMemo: Wa,
            useReducer: wa,
            useRef: Aa,
            useState: function () {
              return wa(ba);
            },
            useDebugValue: Ba,
            useDeferredValue: function (e) {
              return $a(xa(), la.memoizedState, e);
            },
            useTransition: function () {
              return [wa(ba)[0], xa().memoizedState];
            },
            useMutableSource: ka,
            useSyncExternalStore: ja,
            useId: Ya,
            unstable_isNewReconciler: !1,
          },
          ts = {
            readContext: Oo,
            useCallback: Ua,
            useContext: Oo,
            useEffect: La,
            useImperativeHandle: Va,
            useInsertionEffect: Ma,
            useLayoutEffect: Fa,
            useMemo: Wa,
            useReducer: Sa,
            useRef: Aa,
            useState: function () {
              return Sa(ba);
            },
            useDebugValue: Ba,
            useDeferredValue: function (e) {
              var t = xa();
              return null === la
                ? (t.memoizedState = e)
                : $a(t, la.memoizedState, e);
            },
            useTransition: function () {
              return [Sa(ba)[0], xa().memoizedState];
            },
            useMutableSource: ka,
            useSyncExternalStore: ja,
            useId: Ya,
            unstable_isNewReconciler: !1,
          };
        function ns(e, t) {
          if (e && e.defaultProps) {
            for (var n in ((t = M({}, t)), (e = e.defaultProps)))
              void 0 === t[n] && (t[n] = e[n]);
            return t;
          }
          return t;
        }
        function rs(e, t, n, r) {
          (n =
            null === (n = n(r, (t = e.memoizedState))) || void 0 === n
              ? t
              : M({}, t, n)),
            (e.memoizedState = n),
            0 === e.lanes && (e.updateQueue.baseState = n);
        }
        var is = {
          isMounted: function (e) {
            return !!(e = e._reactInternals) && Ue(e) === e;
          },
          enqueueSetState: function (e, t, n) {
            e = e._reactInternals;
            var r = ec(),
              i = tc(e),
              o = Io(r, i);
            (o.payload = t),
              void 0 !== n && null !== n && (o.callback = n),
              null !== (t = Vo(e, o, i)) && (nc(t, e, i, r), Bo(t, e, i));
          },
          enqueueReplaceState: function (e, t, n) {
            e = e._reactInternals;
            var r = ec(),
              i = tc(e),
              o = Io(r, i);
            (o.tag = 1),
              (o.payload = t),
              void 0 !== n && null !== n && (o.callback = n),
              null !== (t = Vo(e, o, i)) && (nc(t, e, i, r), Bo(t, e, i));
          },
          enqueueForceUpdate: function (e, t) {
            e = e._reactInternals;
            var n = ec(),
              r = tc(e),
              i = Io(n, r);
            (i.tag = 2),
              void 0 !== t && null !== t && (i.callback = t),
              null !== (t = Vo(e, i, r)) && (nc(t, e, r, n), Bo(t, e, r));
          },
        };
        function os(e, t, n, r, i, o, a) {
          return "function" === typeof (e = e.stateNode).shouldComponentUpdate
            ? e.shouldComponentUpdate(r, o, a)
            : !t.prototype ||
                !t.prototype.isPureReactComponent ||
                !lr(n, r) ||
                !lr(i, o);
        }
        function as(e, t, n) {
          var r = !1,
            i = Ei,
            o = t.contextType;
          return (
            "object" === typeof o && null !== o
              ? (o = Oo(o))
              : ((i = Ai(t) ? _i : Ti.current),
                (o = (r = null !== (r = t.contextTypes) && void 0 !== r)
                  ? Oi(e, i)
                  : Ei)),
            (t = new t(n, o)),
            (e.memoizedState =
              null !== t.state && void 0 !== t.state ? t.state : null),
            (t.updater = is),
            (e.stateNode = t),
            (t._reactInternals = e),
            r &&
              (((e = e.stateNode).__reactInternalMemoizedUnmaskedChildContext =
                i),
              (e.__reactInternalMemoizedMaskedChildContext = o)),
            t
          );
        }
        function ss(e, t, n, r) {
          (e = t.state),
            "function" === typeof t.componentWillReceiveProps &&
              t.componentWillReceiveProps(n, r),
            "function" === typeof t.UNSAFE_componentWillReceiveProps &&
              t.UNSAFE_componentWillReceiveProps(n, r),
            t.state !== e && is.enqueueReplaceState(t, t.state, null);
        }
        function ls(e, t, n, r) {
          var i = e.stateNode;
          (i.props = n), (i.state = e.memoizedState), (i.refs = {}), Mo(e);
          var o = t.contextType;
          "object" === typeof o && null !== o
            ? (i.context = Oo(o))
            : ((o = Ai(t) ? _i : Ti.current), (i.context = Oi(e, o))),
            (i.state = e.memoizedState),
            "function" === typeof (o = t.getDerivedStateFromProps) &&
              (rs(e, t, o, n), (i.state = e.memoizedState)),
            "function" === typeof t.getDerivedStateFromProps ||
              "function" === typeof i.getSnapshotBeforeUpdate ||
              ("function" !== typeof i.UNSAFE_componentWillMount &&
                "function" !== typeof i.componentWillMount) ||
              ((t = i.state),
              "function" === typeof i.componentWillMount &&
                i.componentWillMount(),
              "function" === typeof i.UNSAFE_componentWillMount &&
                i.UNSAFE_componentWillMount(),
              t !== i.state && is.enqueueReplaceState(i, i.state, null),
              Wo(e, n, i, r),
              (i.state = e.memoizedState)),
            "function" === typeof i.componentDidMount && (e.flags |= 4194308);
        }
        function cs(e, t) {
          try {
            var n = "",
              r = t;
            do {
              (n += B(r)), (r = r.return);
            } while (r);
            var i = n;
          } catch (o) {
            i = "\nError generating stack: " + o.message + "\n" + o.stack;
          }
          return { value: e, source: t, stack: i, digest: null };
        }
        function us(e, t, n) {
          return {
            value: e,
            source: null,
            stack: null != n ? n : null,
            digest: null != t ? t : null,
          };
        }
        function ds(e, t) {
          try {
            console.error(t.value);
          } catch (n) {
            setTimeout(function () {
              throw n;
            });
          }
        }
        var hs = "function" === typeof WeakMap ? WeakMap : Map;
        function fs(e, t, n) {
          ((n = Io(-1, n)).tag = 3), (n.payload = { element: null });
          var r = t.value;
          return (
            (n.callback = function () {
              $l || (($l = !0), (Hl = r)), ds(0, t);
            }),
            n
          );
        }
        function ps(e, t, n) {
          (n = Io(-1, n)).tag = 3;
          var r = e.type.getDerivedStateFromError;
          if ("function" === typeof r) {
            var i = t.value;
            (n.payload = function () {
              return r(i);
            }),
              (n.callback = function () {
                ds(0, t);
              });
          }
          var o = e.stateNode;
          return (
            null !== o &&
              "function" === typeof o.componentDidCatch &&
              (n.callback = function () {
                ds(0, t),
                  "function" !== typeof r &&
                    (null === Yl ? (Yl = new Set([this])) : Yl.add(this));
                var e = t.stack;
                this.componentDidCatch(t.value, {
                  componentStack: null !== e ? e : "",
                });
              }),
            n
          );
        }
        function ms(e, t, n) {
          var r = e.pingCache;
          if (null === r) {
            r = e.pingCache = new hs();
            var i = new Set();
            r.set(t, i);
          } else void 0 === (i = r.get(t)) && ((i = new Set()), r.set(t, i));
          i.has(n) || (i.add(n), (e = Cc.bind(null, e, t, n)), t.then(e, e));
        }
        function gs(e) {
          do {
            var t;
            if (
              ((t = 13 === e.tag) &&
                (t = null === (t = e.memoizedState) || null !== t.dehydrated),
              t)
            )
              return e;
            e = e.return;
          } while (null !== e);
          return null;
        }
        function vs(e, t, n, r, i) {
          return 0 === (1 & e.mode)
            ? (e === t
                ? (e.flags |= 65536)
                : ((e.flags |= 128),
                  (n.flags |= 131072),
                  (n.flags &= -52805),
                  1 === n.tag &&
                    (null === n.alternate
                      ? (n.tag = 17)
                      : (((t = Io(-1, 1)).tag = 2), Vo(n, t, 1))),
                  (n.lanes |= 1)),
              e)
            : ((e.flags |= 65536), (e.lanes = i), e);
        }
        var ys = b.ReactCurrentOwner,
          xs = !1;
        function bs(e, t, n, r) {
          t.child = null === e ? So(t, null, n, r) : wo(t, e.child, n, r);
        }
        function ws(e, t, n, r, i) {
          n = n.render;
          var o = t.ref;
          return (
            _o(t, i),
            (r = ga(e, t, n, r, o, i)),
            (n = va()),
            null === e || xs
              ? (io && n && eo(t), (t.flags |= 1), bs(e, t, r, i), t.child)
              : ((t.updateQueue = e.updateQueue),
                (t.flags &= -2053),
                (e.lanes &= ~i),
                $s(e, t, i))
          );
        }
        function Ss(e, t, n, r, i) {
          if (null === e) {
            var o = n.type;
            return "function" !== typeof o ||
              Ac(o) ||
              void 0 !== o.defaultProps ||
              null !== n.compare ||
              void 0 !== n.defaultProps
              ? (((e = Dc(n.type, null, r, t, t.mode, i)).ref = t.ref),
                (e.return = t),
                (t.child = e))
              : ((t.tag = 15), (t.type = o), ks(e, t, o, r, i));
          }
          if (((o = e.child), 0 === (e.lanes & i))) {
            var a = o.memoizedProps;
            if (
              (n = null !== (n = n.compare) ? n : lr)(a, r) &&
              e.ref === t.ref
            )
              return $s(e, t, i);
          }
          return (
            (t.flags |= 1),
            ((e = zc(o, r)).ref = t.ref),
            (e.return = t),
            (t.child = e)
          );
        }
        function ks(e, t, n, r, i) {
          if (null !== e) {
            var o = e.memoizedProps;
            if (lr(o, r) && e.ref === t.ref) {
              if (((xs = !1), (t.pendingProps = r = o), 0 === (e.lanes & i)))
                return (t.lanes = e.lanes), $s(e, t, i);
              0 !== (131072 & e.flags) && (xs = !0);
            }
          }
          return Ps(e, t, n, r, i);
        }
        function js(e, t, n) {
          var r = t.pendingProps,
            i = r.children,
            o = null !== e ? e.memoizedState : null;
          if ("hidden" === r.mode)
            if (0 === (1 & t.mode))
              (t.memoizedState = {
                baseLanes: 0,
                cachePool: null,
                transitions: null,
              }),
                Pi(zl, Al),
                (Al |= n);
            else {
              if (0 === (1073741824 & n))
                return (
                  (e = null !== o ? o.baseLanes | n : n),
                  (t.lanes = t.childLanes = 1073741824),
                  (t.memoizedState = {
                    baseLanes: e,
                    cachePool: null,
                    transitions: null,
                  }),
                  (t.updateQueue = null),
                  Pi(zl, Al),
                  (Al |= e),
                  null
                );
              (t.memoizedState = {
                baseLanes: 0,
                cachePool: null,
                transitions: null,
              }),
                (r = null !== o ? o.baseLanes : n),
                Pi(zl, Al),
                (Al |= r);
            }
          else
            null !== o
              ? ((r = o.baseLanes | n), (t.memoizedState = null))
              : (r = n),
              Pi(zl, Al),
              (Al |= r);
          return bs(e, t, i, n), t.child;
        }
        function Cs(e, t) {
          var n = t.ref;
          ((null === e && null !== n) || (null !== e && e.ref !== n)) &&
            ((t.flags |= 512), (t.flags |= 2097152));
        }
        function Ps(e, t, n, r, i) {
          var o = Ai(n) ? _i : Ti.current;
          return (
            (o = Oi(t, o)),
            _o(t, i),
            (n = ga(e, t, n, r, o, i)),
            (r = va()),
            null === e || xs
              ? (io && r && eo(t), (t.flags |= 1), bs(e, t, n, i), t.child)
              : ((t.updateQueue = e.updateQueue),
                (t.flags &= -2053),
                (e.lanes &= ~i),
                $s(e, t, i))
          );
        }
        function Es(e, t, n, r, i) {
          if (Ai(n)) {
            var o = !0;
            Li(t);
          } else o = !1;
          if ((_o(t, i), null === t.stateNode))
            Ws(e, t), as(t, n, r), ls(t, n, r, i), (r = !0);
          else if (null === e) {
            var a = t.stateNode,
              s = t.memoizedProps;
            a.props = s;
            var l = a.context,
              c = n.contextType;
            "object" === typeof c && null !== c
              ? (c = Oo(c))
              : (c = Oi(t, (c = Ai(n) ? _i : Ti.current)));
            var u = n.getDerivedStateFromProps,
              d =
                "function" === typeof u ||
                "function" === typeof a.getSnapshotBeforeUpdate;
            d ||
              ("function" !== typeof a.UNSAFE_componentWillReceiveProps &&
                "function" !== typeof a.componentWillReceiveProps) ||
              ((s !== r || l !== c) && ss(t, a, r, c)),
              (Lo = !1);
            var h = t.memoizedState;
            (a.state = h),
              Wo(t, r, a, i),
              (l = t.memoizedState),
              s !== r || h !== l || Ri.current || Lo
                ? ("function" === typeof u &&
                    (rs(t, n, u, r), (l = t.memoizedState)),
                  (s = Lo || os(t, n, s, r, h, l, c))
                    ? (d ||
                        ("function" !== typeof a.UNSAFE_componentWillMount &&
                          "function" !== typeof a.componentWillMount) ||
                        ("function" === typeof a.componentWillMount &&
                          a.componentWillMount(),
                        "function" === typeof a.UNSAFE_componentWillMount &&
                          a.UNSAFE_componentWillMount()),
                      "function" === typeof a.componentDidMount &&
                        (t.flags |= 4194308))
                    : ("function" === typeof a.componentDidMount &&
                        (t.flags |= 4194308),
                      (t.memoizedProps = r),
                      (t.memoizedState = l)),
                  (a.props = r),
                  (a.state = l),
                  (a.context = c),
                  (r = s))
                : ("function" === typeof a.componentDidMount &&
                    (t.flags |= 4194308),
                  (r = !1));
          } else {
            (a = t.stateNode),
              Fo(e, t),
              (s = t.memoizedProps),
              (c = t.type === t.elementType ? s : ns(t.type, s)),
              (a.props = c),
              (d = t.pendingProps),
              (h = a.context),
              "object" === typeof (l = n.contextType) && null !== l
                ? (l = Oo(l))
                : (l = Oi(t, (l = Ai(n) ? _i : Ti.current)));
            var f = n.getDerivedStateFromProps;
            (u =
              "function" === typeof f ||
              "function" === typeof a.getSnapshotBeforeUpdate) ||
              ("function" !== typeof a.UNSAFE_componentWillReceiveProps &&
                "function" !== typeof a.componentWillReceiveProps) ||
              ((s !== d || h !== l) && ss(t, a, r, l)),
              (Lo = !1),
              (h = t.memoizedState),
              (a.state = h),
              Wo(t, r, a, i);
            var p = t.memoizedState;
            s !== d || h !== p || Ri.current || Lo
              ? ("function" === typeof f &&
                  (rs(t, n, f, r), (p = t.memoizedState)),
                (c = Lo || os(t, n, c, r, h, p, l) || !1)
                  ? (u ||
                      ("function" !== typeof a.UNSAFE_componentWillUpdate &&
                        "function" !== typeof a.componentWillUpdate) ||
                      ("function" === typeof a.componentWillUpdate &&
                        a.componentWillUpdate(r, p, l),
                      "function" === typeof a.UNSAFE_componentWillUpdate &&
                        a.UNSAFE_componentWillUpdate(r, p, l)),
                    "function" === typeof a.componentDidUpdate &&
                      (t.flags |= 4),
                    "function" === typeof a.getSnapshotBeforeUpdate &&
                      (t.flags |= 1024))
                  : ("function" !== typeof a.componentDidUpdate ||
                      (s === e.memoizedProps && h === e.memoizedState) ||
                      (t.flags |= 4),
                    "function" !== typeof a.getSnapshotBeforeUpdate ||
                      (s === e.memoizedProps && h === e.memoizedState) ||
                      (t.flags |= 1024),
                    (t.memoizedProps = r),
                    (t.memoizedState = p)),
                (a.props = r),
                (a.state = p),
                (a.context = l),
                (r = c))
              : ("function" !== typeof a.componentDidUpdate ||
                  (s === e.memoizedProps && h === e.memoizedState) ||
                  (t.flags |= 4),
                "function" !== typeof a.getSnapshotBeforeUpdate ||
                  (s === e.memoizedProps && h === e.memoizedState) ||
                  (t.flags |= 1024),
                (r = !1));
          }
          return Ts(e, t, n, r, o, i);
        }
        function Ts(e, t, n, r, i, o) {
          Cs(e, t);
          var a = 0 !== (128 & t.flags);
          if (!r && !a) return i && Mi(t, n, !1), $s(e, t, o);
          (r = t.stateNode), (ys.current = t);
          var s =
            a && "function" !== typeof n.getDerivedStateFromError
              ? null
              : r.render();
          return (
            (t.flags |= 1),
            null !== e && a
              ? ((t.child = wo(t, e.child, null, o)),
                (t.child = wo(t, null, s, o)))
              : bs(e, t, s, o),
            (t.memoizedState = r.state),
            i && Mi(t, n, !0),
            t.child
          );
        }
        function Rs(e) {
          var t = e.stateNode;
          t.pendingContext
            ? Di(0, t.pendingContext, t.pendingContext !== t.context)
            : t.context && Di(0, t.context, !1),
            Qo(e, t.containerInfo);
        }
        function _s(e, t, n, r, i) {
          return po(), mo(i), (t.flags |= 256), bs(e, t, n, r), t.child;
        }
        var Os,
          As,
          zs,
          Ds,
          Ns = { dehydrated: null, treeContext: null, retryLane: 0 };
        function Ls(e) {
          return { baseLanes: e, cachePool: null, transitions: null };
        }
        function Ms(e, t, n) {
          var r,
            i = t.pendingProps,
            a = ea.current,
            s = !1,
            l = 0 !== (128 & t.flags);
          if (
            ((r = l) ||
              (r = (null === e || null !== e.memoizedState) && 0 !== (2 & a)),
            r
              ? ((s = !0), (t.flags &= -129))
              : (null !== e && null === e.memoizedState) || (a |= 1),
            Pi(ea, 1 & a),
            null === e)
          )
            return (
              co(t),
              null !== (e = t.memoizedState) && null !== (e = e.dehydrated)
                ? (0 === (1 & t.mode)
                    ? (t.lanes = 1)
                    : "$!" === e.data
                    ? (t.lanes = 8)
                    : (t.lanes = 1073741824),
                  null)
                : ((l = i.children),
                  (e = i.fallback),
                  s
                    ? ((i = t.mode),
                      (s = t.child),
                      (l = { mode: "hidden", children: l }),
                      0 === (1 & i) && null !== s
                        ? ((s.childLanes = 0), (s.pendingProps = l))
                        : (s = Lc(l, i, 0, null)),
                      (e = Nc(e, i, n, null)),
                      (s.return = t),
                      (e.return = t),
                      (s.sibling = e),
                      (t.child = s),
                      (t.child.memoizedState = Ls(n)),
                      (t.memoizedState = Ns),
                      e)
                    : Fs(t, l))
            );
          if (null !== (a = e.memoizedState) && null !== (r = a.dehydrated))
            return (function (e, t, n, r, i, a, s) {
              if (n)
                return 256 & t.flags
                  ? ((t.flags &= -257), Is(e, t, s, (r = us(Error(o(422))))))
                  : null !== t.memoizedState
                  ? ((t.child = e.child), (t.flags |= 128), null)
                  : ((a = r.fallback),
                    (i = t.mode),
                    (r = Lc(
                      { mode: "visible", children: r.children },
                      i,
                      0,
                      null
                    )),
                    ((a = Nc(a, i, s, null)).flags |= 2),
                    (r.return = t),
                    (a.return = t),
                    (r.sibling = a),
                    (t.child = r),
                    0 !== (1 & t.mode) && wo(t, e.child, null, s),
                    (t.child.memoizedState = Ls(s)),
                    (t.memoizedState = Ns),
                    a);
              if (0 === (1 & t.mode)) return Is(e, t, s, null);
              if ("$!" === i.data) {
                if ((r = i.nextSibling && i.nextSibling.dataset))
                  var l = r.dgst;
                return (
                  (r = l), Is(e, t, s, (r = us((a = Error(o(419))), r, void 0)))
                );
              }
              if (((l = 0 !== (s & e.childLanes)), xs || l)) {
                if (null !== (r = Rl)) {
                  switch (s & -s) {
                    case 4:
                      i = 2;
                      break;
                    case 16:
                      i = 8;
                      break;
                    case 64:
                    case 128:
                    case 256:
                    case 512:
                    case 1024:
                    case 2048:
                    case 4096:
                    case 8192:
                    case 16384:
                    case 32768:
                    case 65536:
                    case 131072:
                    case 262144:
                    case 524288:
                    case 1048576:
                    case 2097152:
                    case 4194304:
                    case 8388608:
                    case 16777216:
                    case 33554432:
                    case 67108864:
                      i = 32;
                      break;
                    case 536870912:
                      i = 268435456;
                      break;
                    default:
                      i = 0;
                  }
                  0 !== (i = 0 !== (i & (r.suspendedLanes | s)) ? 0 : i) &&
                    i !== a.retryLane &&
                    ((a.retryLane = i), No(e, i), nc(r, e, i, -1));
                }
                return mc(), Is(e, t, s, (r = us(Error(o(421)))));
              }
              return "$?" === i.data
                ? ((t.flags |= 128),
                  (t.child = e.child),
                  (t = Ec.bind(null, e)),
                  (i._reactRetry = t),
                  null)
                : ((e = a.treeContext),
                  (ro = ci(i.nextSibling)),
                  (no = t),
                  (io = !0),
                  (oo = null),
                  null !== e &&
                    ((qi[Gi++] = Qi),
                    (qi[Gi++] = Xi),
                    (qi[Gi++] = Ki),
                    (Qi = e.id),
                    (Xi = e.overflow),
                    (Ki = t)),
                  (t = Fs(t, r.children)),
                  (t.flags |= 4096),
                  t);
            })(e, t, l, i, r, a, n);
          if (s) {
            (s = i.fallback), (l = t.mode), (r = (a = e.child).sibling);
            var c = { mode: "hidden", children: i.children };
            return (
              0 === (1 & l) && t.child !== a
                ? (((i = t.child).childLanes = 0),
                  (i.pendingProps = c),
                  (t.deletions = null))
                : ((i = zc(a, c)).subtreeFlags = 14680064 & a.subtreeFlags),
              null !== r
                ? (s = zc(r, s))
                : ((s = Nc(s, l, n, null)).flags |= 2),
              (s.return = t),
              (i.return = t),
              (i.sibling = s),
              (t.child = i),
              (i = s),
              (s = t.child),
              (l =
                null === (l = e.child.memoizedState)
                  ? Ls(n)
                  : {
                      baseLanes: l.baseLanes | n,
                      cachePool: null,
                      transitions: l.transitions,
                    }),
              (s.memoizedState = l),
              (s.childLanes = e.childLanes & ~n),
              (t.memoizedState = Ns),
              i
            );
          }
          return (
            (e = (s = e.child).sibling),
            (i = zc(s, { mode: "visible", children: i.children })),
            0 === (1 & t.mode) && (i.lanes = n),
            (i.return = t),
            (i.sibling = null),
            null !== e &&
              (null === (n = t.deletions)
                ? ((t.deletions = [e]), (t.flags |= 16))
                : n.push(e)),
            (t.child = i),
            (t.memoizedState = null),
            i
          );
        }
        function Fs(e, t) {
          return (
            ((t = Lc(
              { mode: "visible", children: t },
              e.mode,
              0,
              null
            )).return = e),
            (e.child = t)
          );
        }
        function Is(e, t, n, r) {
          return (
            null !== r && mo(r),
            wo(t, e.child, null, n),
            ((e = Fs(t, t.pendingProps.children)).flags |= 2),
            (t.memoizedState = null),
            e
          );
        }
        function Vs(e, t, n) {
          e.lanes |= t;
          var r = e.alternate;
          null !== r && (r.lanes |= t), Ro(e.return, t, n);
        }
        function Bs(e, t, n, r, i) {
          var o = e.memoizedState;
          null === o
            ? (e.memoizedState = {
                isBackwards: t,
                rendering: null,
                renderingStartTime: 0,
                last: r,
                tail: n,
                tailMode: i,
              })
            : ((o.isBackwards = t),
              (o.rendering = null),
              (o.renderingStartTime = 0),
              (o.last = r),
              (o.tail = n),
              (o.tailMode = i));
        }
        function Us(e, t, n) {
          var r = t.pendingProps,
            i = r.revealOrder,
            o = r.tail;
          if ((bs(e, t, r.children, n), 0 !== (2 & (r = ea.current))))
            (r = (1 & r) | 2), (t.flags |= 128);
          else {
            if (null !== e && 0 !== (128 & e.flags))
              e: for (e = t.child; null !== e; ) {
                if (13 === e.tag) null !== e.memoizedState && Vs(e, n, t);
                else if (19 === e.tag) Vs(e, n, t);
                else if (null !== e.child) {
                  (e.child.return = e), (e = e.child);
                  continue;
                }
                if (e === t) break e;
                for (; null === e.sibling; ) {
                  if (null === e.return || e.return === t) break e;
                  e = e.return;
                }
                (e.sibling.return = e.return), (e = e.sibling);
              }
            r &= 1;
          }
          if ((Pi(ea, r), 0 === (1 & t.mode))) t.memoizedState = null;
          else
            switch (i) {
              case "forwards":
                for (n = t.child, i = null; null !== n; )
                  null !== (e = n.alternate) && null === ta(e) && (i = n),
                    (n = n.sibling);
                null === (n = i)
                  ? ((i = t.child), (t.child = null))
                  : ((i = n.sibling), (n.sibling = null)),
                  Bs(t, !1, i, n, o);
                break;
              case "backwards":
                for (n = null, i = t.child, t.child = null; null !== i; ) {
                  if (null !== (e = i.alternate) && null === ta(e)) {
                    t.child = i;
                    break;
                  }
                  (e = i.sibling), (i.sibling = n), (n = i), (i = e);
                }
                Bs(t, !0, n, null, o);
                break;
              case "together":
                Bs(t, !1, null, null, void 0);
                break;
              default:
                t.memoizedState = null;
            }
          return t.child;
        }
        function Ws(e, t) {
          0 === (1 & t.mode) &&
            null !== e &&
            ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
        }
        function $s(e, t, n) {
          if (
            (null !== e && (t.dependencies = e.dependencies),
            (Ll |= t.lanes),
            0 === (n & t.childLanes))
          )
            return null;
          if (null !== e && t.child !== e.child) throw Error(o(153));
          if (null !== t.child) {
            for (
              n = zc((e = t.child), e.pendingProps), t.child = n, n.return = t;
              null !== e.sibling;

            )
              (e = e.sibling),
                ((n = n.sibling = zc(e, e.pendingProps)).return = t);
            n.sibling = null;
          }
          return t.child;
        }
        function Hs(e, t) {
          if (!io)
            switch (e.tailMode) {
              case "hidden":
                t = e.tail;
                for (var n = null; null !== t; )
                  null !== t.alternate && (n = t), (t = t.sibling);
                null === n ? (e.tail = null) : (n.sibling = null);
                break;
              case "collapsed":
                n = e.tail;
                for (var r = null; null !== n; )
                  null !== n.alternate && (r = n), (n = n.sibling);
                null === r
                  ? t || null === e.tail
                    ? (e.tail = null)
                    : (e.tail.sibling = null)
                  : (r.sibling = null);
            }
        }
        function Ys(e) {
          var t = null !== e.alternate && e.alternate.child === e.child,
            n = 0,
            r = 0;
          if (t)
            for (var i = e.child; null !== i; )
              (n |= i.lanes | i.childLanes),
                (r |= 14680064 & i.subtreeFlags),
                (r |= 14680064 & i.flags),
                (i.return = e),
                (i = i.sibling);
          else
            for (i = e.child; null !== i; )
              (n |= i.lanes | i.childLanes),
                (r |= i.subtreeFlags),
                (r |= i.flags),
                (i.return = e),
                (i = i.sibling);
          return (e.subtreeFlags |= r), (e.childLanes = n), t;
        }
        function qs(e, t, n) {
          var r = t.pendingProps;
          switch ((to(t), t.tag)) {
            case 2:
            case 16:
            case 15:
            case 0:
            case 11:
            case 7:
            case 8:
            case 12:
            case 9:
            case 14:
              return Ys(t), null;
            case 1:
            case 17:
              return Ai(t.type) && zi(), Ys(t), null;
            case 3:
              return (
                (r = t.stateNode),
                Xo(),
                Ci(Ri),
                Ci(Ti),
                ra(),
                r.pendingContext &&
                  ((r.context = r.pendingContext), (r.pendingContext = null)),
                (null !== e && null !== e.child) ||
                  (ho(t)
                    ? (t.flags |= 4)
                    : null === e ||
                      (e.memoizedState.isDehydrated && 0 === (256 & t.flags)) ||
                      ((t.flags |= 1024),
                      null !== oo && (ac(oo), (oo = null)))),
                As(e, t),
                Ys(t),
                null
              );
            case 5:
              Zo(t);
              var i = Ko(Go.current);
              if (((n = t.type), null !== e && null != t.stateNode))
                zs(e, t, n, r, i),
                  e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152));
              else {
                if (!r) {
                  if (null === t.stateNode) throw Error(o(166));
                  return Ys(t), null;
                }
                if (((e = Ko(Yo.current)), ho(t))) {
                  (r = t.stateNode), (n = t.type);
                  var a = t.memoizedProps;
                  switch (
                    ((r[hi] = t), (r[fi] = a), (e = 0 !== (1 & t.mode)), n)
                  ) {
                    case "dialog":
                      Ir("cancel", r), Ir("close", r);
                      break;
                    case "iframe":
                    case "object":
                    case "embed":
                      Ir("load", r);
                      break;
                    case "video":
                    case "audio":
                      for (i = 0; i < Nr.length; i++) Ir(Nr[i], r);
                      break;
                    case "source":
                      Ir("error", r);
                      break;
                    case "img":
                    case "image":
                    case "link":
                      Ir("error", r), Ir("load", r);
                      break;
                    case "details":
                      Ir("toggle", r);
                      break;
                    case "input":
                      Q(r, a), Ir("invalid", r);
                      break;
                    case "select":
                      (r._wrapperState = { wasMultiple: !!a.multiple }),
                        Ir("invalid", r);
                      break;
                    case "textarea":
                      ie(r, a), Ir("invalid", r);
                  }
                  for (var l in (ye(n, a), (i = null), a))
                    if (a.hasOwnProperty(l)) {
                      var c = a[l];
                      "children" === l
                        ? "string" === typeof c
                          ? r.textContent !== c &&
                            (!0 !== a.suppressHydrationWarning &&
                              Jr(r.textContent, c, e),
                            (i = ["children", c]))
                          : "number" === typeof c &&
                            r.textContent !== "" + c &&
                            (!0 !== a.suppressHydrationWarning &&
                              Jr(r.textContent, c, e),
                            (i = ["children", "" + c]))
                        : s.hasOwnProperty(l) &&
                          null != c &&
                          "onScroll" === l &&
                          Ir("scroll", r);
                    }
                  switch (n) {
                    case "input":
                      Y(r), Z(r, a, !0);
                      break;
                    case "textarea":
                      Y(r), ae(r);
                      break;
                    case "select":
                    case "option":
                      break;
                    default:
                      "function" === typeof a.onClick && (r.onclick = Zr);
                  }
                  (r = i), (t.updateQueue = r), null !== r && (t.flags |= 4);
                } else {
                  (l = 9 === i.nodeType ? i : i.ownerDocument),
                    "http://www.w3.org/1999/xhtml" === e && (e = se(n)),
                    "http://www.w3.org/1999/xhtml" === e
                      ? "script" === n
                        ? (((e = l.createElement("div")).innerHTML =
                            "<script></script>"),
                          (e = e.removeChild(e.firstChild)))
                        : "string" === typeof r.is
                        ? (e = l.createElement(n, { is: r.is }))
                        : ((e = l.createElement(n)),
                          "select" === n &&
                            ((l = e),
                            r.multiple
                              ? (l.multiple = !0)
                              : r.size && (l.size = r.size)))
                      : (e = l.createElementNS(e, n)),
                    (e[hi] = t),
                    (e[fi] = r),
                    Os(e, t, !1, !1),
                    (t.stateNode = e);
                  e: {
                    switch (((l = xe(n, r)), n)) {
                      case "dialog":
                        Ir("cancel", e), Ir("close", e), (i = r);
                        break;
                      case "iframe":
                      case "object":
                      case "embed":
                        Ir("load", e), (i = r);
                        break;
                      case "video":
                      case "audio":
                        for (i = 0; i < Nr.length; i++) Ir(Nr[i], e);
                        i = r;
                        break;
                      case "source":
                        Ir("error", e), (i = r);
                        break;
                      case "img":
                      case "image":
                      case "link":
                        Ir("error", e), Ir("load", e), (i = r);
                        break;
                      case "details":
                        Ir("toggle", e), (i = r);
                        break;
                      case "input":
                        Q(e, r), (i = K(e, r)), Ir("invalid", e);
                        break;
                      case "option":
                      default:
                        i = r;
                        break;
                      case "select":
                        (e._wrapperState = { wasMultiple: !!r.multiple }),
                          (i = M({}, r, { value: void 0 })),
                          Ir("invalid", e);
                        break;
                      case "textarea":
                        ie(e, r), (i = re(e, r)), Ir("invalid", e);
                    }
                    for (a in (ye(n, i), (c = i)))
                      if (c.hasOwnProperty(a)) {
                        var u = c[a];
                        "style" === a
                          ? ge(e, u)
                          : "dangerouslySetInnerHTML" === a
                          ? null != (u = u ? u.__html : void 0) && de(e, u)
                          : "children" === a
                          ? "string" === typeof u
                            ? ("textarea" !== n || "" !== u) && he(e, u)
                            : "number" === typeof u && he(e, "" + u)
                          : "suppressContentEditableWarning" !== a &&
                            "suppressHydrationWarning" !== a &&
                            "autoFocus" !== a &&
                            (s.hasOwnProperty(a)
                              ? null != u && "onScroll" === a && Ir("scroll", e)
                              : null != u && x(e, a, u, l));
                      }
                    switch (n) {
                      case "input":
                        Y(e), Z(e, r, !1);
                        break;
                      case "textarea":
                        Y(e), ae(e);
                        break;
                      case "option":
                        null != r.value &&
                          e.setAttribute("value", "" + $(r.value));
                        break;
                      case "select":
                        (e.multiple = !!r.multiple),
                          null != (a = r.value)
                            ? ne(e, !!r.multiple, a, !1)
                            : null != r.defaultValue &&
                              ne(e, !!r.multiple, r.defaultValue, !0);
                        break;
                      default:
                        "function" === typeof i.onClick && (e.onclick = Zr);
                    }
                    switch (n) {
                      case "button":
                      case "input":
                      case "select":
                      case "textarea":
                        r = !!r.autoFocus;
                        break e;
                      case "img":
                        r = !0;
                        break e;
                      default:
                        r = !1;
                    }
                  }
                  r && (t.flags |= 4);
                }
                null !== t.ref && ((t.flags |= 512), (t.flags |= 2097152));
              }
              return Ys(t), null;
            case 6:
              if (e && null != t.stateNode) Ds(e, t, e.memoizedProps, r);
              else {
                if ("string" !== typeof r && null === t.stateNode)
                  throw Error(o(166));
                if (((n = Ko(Go.current)), Ko(Yo.current), ho(t))) {
                  if (
                    ((r = t.stateNode),
                    (n = t.memoizedProps),
                    (r[hi] = t),
                    (a = r.nodeValue !== n) && null !== (e = no))
                  )
                    switch (e.tag) {
                      case 3:
                        Jr(r.nodeValue, n, 0 !== (1 & e.mode));
                        break;
                      case 5:
                        !0 !== e.memoizedProps.suppressHydrationWarning &&
                          Jr(r.nodeValue, n, 0 !== (1 & e.mode));
                    }
                  a && (t.flags |= 4);
                } else
                  ((r = (9 === n.nodeType ? n : n.ownerDocument).createTextNode(
                    r
                  ))[hi] = t),
                    (t.stateNode = r);
              }
              return Ys(t), null;
            case 13:
              if (
                (Ci(ea),
                (r = t.memoizedState),
                null === e ||
                  (null !== e.memoizedState &&
                    null !== e.memoizedState.dehydrated))
              ) {
                if (
                  io &&
                  null !== ro &&
                  0 !== (1 & t.mode) &&
                  0 === (128 & t.flags)
                )
                  fo(), po(), (t.flags |= 98560), (a = !1);
                else if (((a = ho(t)), null !== r && null !== r.dehydrated)) {
                  if (null === e) {
                    if (!a) throw Error(o(318));
                    if (
                      !(a =
                        null !== (a = t.memoizedState) ? a.dehydrated : null)
                    )
                      throw Error(o(317));
                    a[hi] = t;
                  } else
                    po(),
                      0 === (128 & t.flags) && (t.memoizedState = null),
                      (t.flags |= 4);
                  Ys(t), (a = !1);
                } else null !== oo && (ac(oo), (oo = null)), (a = !0);
                if (!a) return 65536 & t.flags ? t : null;
              }
              return 0 !== (128 & t.flags)
                ? ((t.lanes = n), t)
                : ((r = null !== r) !==
                    (null !== e && null !== e.memoizedState) &&
                    r &&
                    ((t.child.flags |= 8192),
                    0 !== (1 & t.mode) &&
                      (null === e || 0 !== (1 & ea.current)
                        ? 0 === Dl && (Dl = 3)
                        : mc())),
                  null !== t.updateQueue && (t.flags |= 4),
                  Ys(t),
                  null);
            case 4:
              return (
                Xo(),
                As(e, t),
                null === e && Ur(t.stateNode.containerInfo),
                Ys(t),
                null
              );
            case 10:
              return To(t.type._context), Ys(t), null;
            case 19:
              if ((Ci(ea), null === (a = t.memoizedState))) return Ys(t), null;
              if (((r = 0 !== (128 & t.flags)), null === (l = a.rendering)))
                if (r) Hs(a, !1);
                else {
                  if (0 !== Dl || (null !== e && 0 !== (128 & e.flags)))
                    for (e = t.child; null !== e; ) {
                      if (null !== (l = ta(e))) {
                        for (
                          t.flags |= 128,
                            Hs(a, !1),
                            null !== (r = l.updateQueue) &&
                              ((t.updateQueue = r), (t.flags |= 4)),
                            t.subtreeFlags = 0,
                            r = n,
                            n = t.child;
                          null !== n;

                        )
                          (e = r),
                            ((a = n).flags &= 14680066),
                            null === (l = a.alternate)
                              ? ((a.childLanes = 0),
                                (a.lanes = e),
                                (a.child = null),
                                (a.subtreeFlags = 0),
                                (a.memoizedProps = null),
                                (a.memoizedState = null),
                                (a.updateQueue = null),
                                (a.dependencies = null),
                                (a.stateNode = null))
                              : ((a.childLanes = l.childLanes),
                                (a.lanes = l.lanes),
                                (a.child = l.child),
                                (a.subtreeFlags = 0),
                                (a.deletions = null),
                                (a.memoizedProps = l.memoizedProps),
                                (a.memoizedState = l.memoizedState),
                                (a.updateQueue = l.updateQueue),
                                (a.type = l.type),
                                (e = l.dependencies),
                                (a.dependencies =
                                  null === e
                                    ? null
                                    : {
                                        lanes: e.lanes,
                                        firstContext: e.firstContext,
                                      })),
                            (n = n.sibling);
                        return Pi(ea, (1 & ea.current) | 2), t.child;
                      }
                      e = e.sibling;
                    }
                  null !== a.tail &&
                    Xe() > Ul &&
                    ((t.flags |= 128),
                    (r = !0),
                    Hs(a, !1),
                    (t.lanes = 4194304));
                }
              else {
                if (!r)
                  if (null !== (e = ta(l))) {
                    if (
                      ((t.flags |= 128),
                      (r = !0),
                      null !== (n = e.updateQueue) &&
                        ((t.updateQueue = n), (t.flags |= 4)),
                      Hs(a, !0),
                      null === a.tail &&
                        "hidden" === a.tailMode &&
                        !l.alternate &&
                        !io)
                    )
                      return Ys(t), null;
                  } else
                    2 * Xe() - a.renderingStartTime > Ul &&
                      1073741824 !== n &&
                      ((t.flags |= 128),
                      (r = !0),
                      Hs(a, !1),
                      (t.lanes = 4194304));
                a.isBackwards
                  ? ((l.sibling = t.child), (t.child = l))
                  : (null !== (n = a.last) ? (n.sibling = l) : (t.child = l),
                    (a.last = l));
              }
              return null !== a.tail
                ? ((t = a.tail),
                  (a.rendering = t),
                  (a.tail = t.sibling),
                  (a.renderingStartTime = Xe()),
                  (t.sibling = null),
                  (n = ea.current),
                  Pi(ea, r ? (1 & n) | 2 : 1 & n),
                  t)
                : (Ys(t), null);
            case 22:
            case 23:
              return (
                dc(),
                (r = null !== t.memoizedState),
                null !== e &&
                  (null !== e.memoizedState) !== r &&
                  (t.flags |= 8192),
                r && 0 !== (1 & t.mode)
                  ? 0 !== (1073741824 & Al) &&
                    (Ys(t), 6 & t.subtreeFlags && (t.flags |= 8192))
                  : Ys(t),
                null
              );
            case 24:
            case 25:
              return null;
          }
          throw Error(o(156, t.tag));
        }
        function Gs(e, t) {
          switch ((to(t), t.tag)) {
            case 1:
              return (
                Ai(t.type) && zi(),
                65536 & (e = t.flags)
                  ? ((t.flags = (-65537 & e) | 128), t)
                  : null
              );
            case 3:
              return (
                Xo(),
                Ci(Ri),
                Ci(Ti),
                ra(),
                0 !== (65536 & (e = t.flags)) && 0 === (128 & e)
                  ? ((t.flags = (-65537 & e) | 128), t)
                  : null
              );
            case 5:
              return Zo(t), null;
            case 13:
              if (
                (Ci(ea),
                null !== (e = t.memoizedState) && null !== e.dehydrated)
              ) {
                if (null === t.alternate) throw Error(o(340));
                po();
              }
              return 65536 & (e = t.flags)
                ? ((t.flags = (-65537 & e) | 128), t)
                : null;
            case 19:
              return Ci(ea), null;
            case 4:
              return Xo(), null;
            case 10:
              return To(t.type._context), null;
            case 22:
            case 23:
              return dc(), null;
            default:
              return null;
          }
        }
        (Os = function (e, t) {
          for (var n = t.child; null !== n; ) {
            if (5 === n.tag || 6 === n.tag) e.appendChild(n.stateNode);
            else if (4 !== n.tag && null !== n.child) {
              (n.child.return = n), (n = n.child);
              continue;
            }
            if (n === t) break;
            for (; null === n.sibling; ) {
              if (null === n.return || n.return === t) return;
              n = n.return;
            }
            (n.sibling.return = n.return), (n = n.sibling);
          }
        }),
          (As = function () {}),
          (zs = function (e, t, n, r) {
            var i = e.memoizedProps;
            if (i !== r) {
              (e = t.stateNode), Ko(Yo.current);
              var o,
                a = null;
              switch (n) {
                case "input":
                  (i = K(e, i)), (r = K(e, r)), (a = []);
                  break;
                case "select":
                  (i = M({}, i, { value: void 0 })),
                    (r = M({}, r, { value: void 0 })),
                    (a = []);
                  break;
                case "textarea":
                  (i = re(e, i)), (r = re(e, r)), (a = []);
                  break;
                default:
                  "function" !== typeof i.onClick &&
                    "function" === typeof r.onClick &&
                    (e.onclick = Zr);
              }
              for (u in (ye(n, r), (n = null), i))
                if (!r.hasOwnProperty(u) && i.hasOwnProperty(u) && null != i[u])
                  if ("style" === u) {
                    var l = i[u];
                    for (o in l)
                      l.hasOwnProperty(o) && (n || (n = {}), (n[o] = ""));
                  } else
                    "dangerouslySetInnerHTML" !== u &&
                      "children" !== u &&
                      "suppressContentEditableWarning" !== u &&
                      "suppressHydrationWarning" !== u &&
                      "autoFocus" !== u &&
                      (s.hasOwnProperty(u)
                        ? a || (a = [])
                        : (a = a || []).push(u, null));
              for (u in r) {
                var c = r[u];
                if (
                  ((l = null != i ? i[u] : void 0),
                  r.hasOwnProperty(u) && c !== l && (null != c || null != l))
                )
                  if ("style" === u)
                    if (l) {
                      for (o in l)
                        !l.hasOwnProperty(o) ||
                          (c && c.hasOwnProperty(o)) ||
                          (n || (n = {}), (n[o] = ""));
                      for (o in c)
                        c.hasOwnProperty(o) &&
                          l[o] !== c[o] &&
                          (n || (n = {}), (n[o] = c[o]));
                    } else n || (a || (a = []), a.push(u, n)), (n = c);
                  else
                    "dangerouslySetInnerHTML" === u
                      ? ((c = c ? c.__html : void 0),
                        (l = l ? l.__html : void 0),
                        null != c && l !== c && (a = a || []).push(u, c))
                      : "children" === u
                      ? ("string" !== typeof c && "number" !== typeof c) ||
                        (a = a || []).push(u, "" + c)
                      : "suppressContentEditableWarning" !== u &&
                        "suppressHydrationWarning" !== u &&
                        (s.hasOwnProperty(u)
                          ? (null != c && "onScroll" === u && Ir("scroll", e),
                            a || l === c || (a = []))
                          : (a = a || []).push(u, c));
              }
              n && (a = a || []).push("style", n);
              var u = a;
              (t.updateQueue = u) && (t.flags |= 4);
            }
          }),
          (Ds = function (e, t, n, r) {
            n !== r && (t.flags |= 4);
          });
        var Ks = !1,
          Qs = !1,
          Xs = "function" === typeof WeakSet ? WeakSet : Set,
          Js = null;
        function Zs(e, t) {
          var n = e.ref;
          if (null !== n)
            if ("function" === typeof n)
              try {
                n(null);
              } catch (r) {
                jc(e, t, r);
              }
            else n.current = null;
        }
        function el(e, t, n) {
          try {
            n();
          } catch (r) {
            jc(e, t, r);
          }
        }
        var tl = !1;
        function nl(e, t, n) {
          var r = t.updateQueue;
          if (null !== (r = null !== r ? r.lastEffect : null)) {
            var i = (r = r.next);
            do {
              if ((i.tag & e) === e) {
                var o = i.destroy;
                (i.destroy = void 0), void 0 !== o && el(t, n, o);
              }
              i = i.next;
            } while (i !== r);
          }
        }
        function rl(e, t) {
          if (
            null !== (t = null !== (t = t.updateQueue) ? t.lastEffect : null)
          ) {
            var n = (t = t.next);
            do {
              if ((n.tag & e) === e) {
                var r = n.create;
                n.destroy = r();
              }
              n = n.next;
            } while (n !== t);
          }
        }
        function il(e) {
          var t = e.ref;
          if (null !== t) {
            var n = e.stateNode;
            e.tag, (e = n), "function" === typeof t ? t(e) : (t.current = e);
          }
        }
        function ol(e) {
          var t = e.alternate;
          null !== t && ((e.alternate = null), ol(t)),
            (e.child = null),
            (e.deletions = null),
            (e.sibling = null),
            5 === e.tag &&
              null !== (t = e.stateNode) &&
              (delete t[hi],
              delete t[fi],
              delete t[mi],
              delete t[gi],
              delete t[vi]),
            (e.stateNode = null),
            (e.return = null),
            (e.dependencies = null),
            (e.memoizedProps = null),
            (e.memoizedState = null),
            (e.pendingProps = null),
            (e.stateNode = null),
            (e.updateQueue = null);
        }
        function al(e) {
          return 5 === e.tag || 3 === e.tag || 4 === e.tag;
        }
        function sl(e) {
          e: for (;;) {
            for (; null === e.sibling; ) {
              if (null === e.return || al(e.return)) return null;
              e = e.return;
            }
            for (
              e.sibling.return = e.return, e = e.sibling;
              5 !== e.tag && 6 !== e.tag && 18 !== e.tag;

            ) {
              if (2 & e.flags) continue e;
              if (null === e.child || 4 === e.tag) continue e;
              (e.child.return = e), (e = e.child);
            }
            if (!(2 & e.flags)) return e.stateNode;
          }
        }
        function ll(e, t, n) {
          var r = e.tag;
          if (5 === r || 6 === r)
            (e = e.stateNode),
              t
                ? 8 === n.nodeType
                  ? n.parentNode.insertBefore(e, t)
                  : n.insertBefore(e, t)
                : (8 === n.nodeType
                    ? (t = n.parentNode).insertBefore(e, n)
                    : (t = n).appendChild(e),
                  (null !== (n = n._reactRootContainer) && void 0 !== n) ||
                    null !== t.onclick ||
                    (t.onclick = Zr));
          else if (4 !== r && null !== (e = e.child))
            for (ll(e, t, n), e = e.sibling; null !== e; )
              ll(e, t, n), (e = e.sibling);
        }
        function cl(e, t, n) {
          var r = e.tag;
          if (5 === r || 6 === r)
            (e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e);
          else if (4 !== r && null !== (e = e.child))
            for (cl(e, t, n), e = e.sibling; null !== e; )
              cl(e, t, n), (e = e.sibling);
        }
        var ul = null,
          dl = !1;
        function hl(e, t, n) {
          for (n = n.child; null !== n; ) fl(e, t, n), (n = n.sibling);
        }
        function fl(e, t, n) {
          if (ot && "function" === typeof ot.onCommitFiberUnmount)
            try {
              ot.onCommitFiberUnmount(it, n);
            } catch (s) {}
          switch (n.tag) {
            case 5:
              Qs || Zs(n, t);
            case 6:
              var r = ul,
                i = dl;
              (ul = null),
                hl(e, t, n),
                (dl = i),
                null !== (ul = r) &&
                  (dl
                    ? ((e = ul),
                      (n = n.stateNode),
                      8 === e.nodeType
                        ? e.parentNode.removeChild(n)
                        : e.removeChild(n))
                    : ul.removeChild(n.stateNode));
              break;
            case 18:
              null !== ul &&
                (dl
                  ? ((e = ul),
                    (n = n.stateNode),
                    8 === e.nodeType
                      ? li(e.parentNode, n)
                      : 1 === e.nodeType && li(e, n),
                    Ut(e))
                  : li(ul, n.stateNode));
              break;
            case 4:
              (r = ul),
                (i = dl),
                (ul = n.stateNode.containerInfo),
                (dl = !0),
                hl(e, t, n),
                (ul = r),
                (dl = i);
              break;
            case 0:
            case 11:
            case 14:
            case 15:
              if (
                !Qs &&
                null !== (r = n.updateQueue) &&
                null !== (r = r.lastEffect)
              ) {
                i = r = r.next;
                do {
                  var o = i,
                    a = o.destroy;
                  (o = o.tag),
                    void 0 !== a &&
                      (0 !== (2 & o) || 0 !== (4 & o)) &&
                      el(n, t, a),
                    (i = i.next);
                } while (i !== r);
              }
              hl(e, t, n);
              break;
            case 1:
              if (
                !Qs &&
                (Zs(n, t),
                "function" === typeof (r = n.stateNode).componentWillUnmount)
              )
                try {
                  (r.props = n.memoizedProps),
                    (r.state = n.memoizedState),
                    r.componentWillUnmount();
                } catch (s) {
                  jc(n, t, s);
                }
              hl(e, t, n);
              break;
            case 21:
              hl(e, t, n);
              break;
            case 22:
              1 & n.mode
                ? ((Qs = (r = Qs) || null !== n.memoizedState),
                  hl(e, t, n),
                  (Qs = r))
                : hl(e, t, n);
              break;
            default:
              hl(e, t, n);
          }
        }
        function pl(e) {
          var t = e.updateQueue;
          if (null !== t) {
            e.updateQueue = null;
            var n = e.stateNode;
            null === n && (n = e.stateNode = new Xs()),
              t.forEach(function (t) {
                var r = Tc.bind(null, e, t);
                n.has(t) || (n.add(t), t.then(r, r));
              });
          }
        }
        function ml(e, t) {
          var n = t.deletions;
          if (null !== n)
            for (var r = 0; r < n.length; r++) {
              var i = n[r];
              try {
                var a = e,
                  s = t,
                  l = s;
                e: for (; null !== l; ) {
                  switch (l.tag) {
                    case 5:
                      (ul = l.stateNode), (dl = !1);
                      break e;
                    case 3:
                    case 4:
                      (ul = l.stateNode.containerInfo), (dl = !0);
                      break e;
                  }
                  l = l.return;
                }
                if (null === ul) throw Error(o(160));
                fl(a, s, i), (ul = null), (dl = !1);
                var c = i.alternate;
                null !== c && (c.return = null), (i.return = null);
              } catch (u) {
                jc(i, t, u);
              }
            }
          if (12854 & t.subtreeFlags)
            for (t = t.child; null !== t; ) gl(t, e), (t = t.sibling);
        }
        function gl(e, t) {
          var n = e.alternate,
            r = e.flags;
          switch (e.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
              if ((ml(t, e), vl(e), 4 & r)) {
                try {
                  nl(3, e, e.return), rl(3, e);
                } catch (g) {
                  jc(e, e.return, g);
                }
                try {
                  nl(5, e, e.return);
                } catch (g) {
                  jc(e, e.return, g);
                }
              }
              break;
            case 1:
              ml(t, e), vl(e), 512 & r && null !== n && Zs(n, n.return);
              break;
            case 5:
              if (
                (ml(t, e),
                vl(e),
                512 & r && null !== n && Zs(n, n.return),
                32 & e.flags)
              ) {
                var i = e.stateNode;
                try {
                  he(i, "");
                } catch (g) {
                  jc(e, e.return, g);
                }
              }
              if (4 & r && null != (i = e.stateNode)) {
                var a = e.memoizedProps,
                  s = null !== n ? n.memoizedProps : a,
                  l = e.type,
                  c = e.updateQueue;
                if (((e.updateQueue = null), null !== c))
                  try {
                    "input" === l &&
                      "radio" === a.type &&
                      null != a.name &&
                      X(i, a),
                      xe(l, s);
                    var u = xe(l, a);
                    for (s = 0; s < c.length; s += 2) {
                      var d = c[s],
                        h = c[s + 1];
                      "style" === d
                        ? ge(i, h)
                        : "dangerouslySetInnerHTML" === d
                        ? de(i, h)
                        : "children" === d
                        ? he(i, h)
                        : x(i, d, h, u);
                    }
                    switch (l) {
                      case "input":
                        J(i, a);
                        break;
                      case "textarea":
                        oe(i, a);
                        break;
                      case "select":
                        var f = i._wrapperState.wasMultiple;
                        i._wrapperState.wasMultiple = !!a.multiple;
                        var p = a.value;
                        null != p
                          ? ne(i, !!a.multiple, p, !1)
                          : f !== !!a.multiple &&
                            (null != a.defaultValue
                              ? ne(i, !!a.multiple, a.defaultValue, !0)
                              : ne(i, !!a.multiple, a.multiple ? [] : "", !1));
                    }
                    i[fi] = a;
                  } catch (g) {
                    jc(e, e.return, g);
                  }
              }
              break;
            case 6:
              if ((ml(t, e), vl(e), 4 & r)) {
                if (null === e.stateNode) throw Error(o(162));
                (i = e.stateNode), (a = e.memoizedProps);
                try {
                  i.nodeValue = a;
                } catch (g) {
                  jc(e, e.return, g);
                }
              }
              break;
            case 3:
              if (
                (ml(t, e),
                vl(e),
                4 & r && null !== n && n.memoizedState.isDehydrated)
              )
                try {
                  Ut(t.containerInfo);
                } catch (g) {
                  jc(e, e.return, g);
                }
              break;
            case 4:
            default:
              ml(t, e), vl(e);
              break;
            case 13:
              ml(t, e),
                vl(e),
                8192 & (i = e.child).flags &&
                  ((a = null !== i.memoizedState),
                  (i.stateNode.isHidden = a),
                  !a ||
                    (null !== i.alternate &&
                      null !== i.alternate.memoizedState) ||
                    (Bl = Xe())),
                4 & r && pl(e);
              break;
            case 22:
              if (
                ((d = null !== n && null !== n.memoizedState),
                1 & e.mode
                  ? ((Qs = (u = Qs) || d), ml(t, e), (Qs = u))
                  : ml(t, e),
                vl(e),
                8192 & r)
              ) {
                if (
                  ((u = null !== e.memoizedState),
                  (e.stateNode.isHidden = u) && !d && 0 !== (1 & e.mode))
                )
                  for (Js = e, d = e.child; null !== d; ) {
                    for (h = Js = d; null !== Js; ) {
                      switch (((p = (f = Js).child), f.tag)) {
                        case 0:
                        case 11:
                        case 14:
                        case 15:
                          nl(4, f, f.return);
                          break;
                        case 1:
                          Zs(f, f.return);
                          var m = f.stateNode;
                          if ("function" === typeof m.componentWillUnmount) {
                            (r = f), (n = f.return);
                            try {
                              (t = r),
                                (m.props = t.memoizedProps),
                                (m.state = t.memoizedState),
                                m.componentWillUnmount();
                            } catch (g) {
                              jc(r, n, g);
                            }
                          }
                          break;
                        case 5:
                          Zs(f, f.return);
                          break;
                        case 22:
                          if (null !== f.memoizedState) {
                            wl(h);
                            continue;
                          }
                      }
                      null !== p ? ((p.return = f), (Js = p)) : wl(h);
                    }
                    d = d.sibling;
                  }
                e: for (d = null, h = e; ; ) {
                  if (5 === h.tag) {
                    if (null === d) {
                      d = h;
                      try {
                        (i = h.stateNode),
                          u
                            ? "function" === typeof (a = i.style).setProperty
                              ? a.setProperty("display", "none", "important")
                              : (a.display = "none")
                            : ((l = h.stateNode),
                              (s =
                                void 0 !== (c = h.memoizedProps.style) &&
                                null !== c &&
                                c.hasOwnProperty("display")
                                  ? c.display
                                  : null),
                              (l.style.display = me("display", s)));
                      } catch (g) {
                        jc(e, e.return, g);
                      }
                    }
                  } else if (6 === h.tag) {
                    if (null === d)
                      try {
                        h.stateNode.nodeValue = u ? "" : h.memoizedProps;
                      } catch (g) {
                        jc(e, e.return, g);
                      }
                  } else if (
                    ((22 !== h.tag && 23 !== h.tag) ||
                      null === h.memoizedState ||
                      h === e) &&
                    null !== h.child
                  ) {
                    (h.child.return = h), (h = h.child);
                    continue;
                  }
                  if (h === e) break e;
                  for (; null === h.sibling; ) {
                    if (null === h.return || h.return === e) break e;
                    d === h && (d = null), (h = h.return);
                  }
                  d === h && (d = null),
                    (h.sibling.return = h.return),
                    (h = h.sibling);
                }
              }
              break;
            case 19:
              ml(t, e), vl(e), 4 & r && pl(e);
            case 21:
          }
        }
        function vl(e) {
          var t = e.flags;
          if (2 & t) {
            try {
              e: {
                for (var n = e.return; null !== n; ) {
                  if (al(n)) {
                    var r = n;
                    break e;
                  }
                  n = n.return;
                }
                throw Error(o(160));
              }
              switch (r.tag) {
                case 5:
                  var i = r.stateNode;
                  32 & r.flags && (he(i, ""), (r.flags &= -33)),
                    cl(e, sl(e), i);
                  break;
                case 3:
                case 4:
                  var a = r.stateNode.containerInfo;
                  ll(e, sl(e), a);
                  break;
                default:
                  throw Error(o(161));
              }
            } catch (s) {
              jc(e, e.return, s);
            }
            e.flags &= -3;
          }
          4096 & t && (e.flags &= -4097);
        }
        function yl(e, t, n) {
          (Js = e), xl(e, t, n);
        }
        function xl(e, t, n) {
          for (var r = 0 !== (1 & e.mode); null !== Js; ) {
            var i = Js,
              o = i.child;
            if (22 === i.tag && r) {
              var a = null !== i.memoizedState || Ks;
              if (!a) {
                var s = i.alternate,
                  l = (null !== s && null !== s.memoizedState) || Qs;
                s = Ks;
                var c = Qs;
                if (((Ks = a), (Qs = l) && !c))
                  for (Js = i; null !== Js; )
                    (l = (a = Js).child),
                      22 === a.tag && null !== a.memoizedState
                        ? Sl(i)
                        : null !== l
                        ? ((l.return = a), (Js = l))
                        : Sl(i);
                for (; null !== o; ) (Js = o), xl(o, t, n), (o = o.sibling);
                (Js = i), (Ks = s), (Qs = c);
              }
              bl(e);
            } else
              0 !== (8772 & i.subtreeFlags) && null !== o
                ? ((o.return = i), (Js = o))
                : bl(e);
          }
        }
        function bl(e) {
          for (; null !== Js; ) {
            var t = Js;
            if (0 !== (8772 & t.flags)) {
              var n = t.alternate;
              try {
                if (0 !== (8772 & t.flags))
                  switch (t.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Qs || rl(5, t);
                      break;
                    case 1:
                      var r = t.stateNode;
                      if (4 & t.flags && !Qs)
                        if (null === n) r.componentDidMount();
                        else {
                          var i =
                            t.elementType === t.type
                              ? n.memoizedProps
                              : ns(t.type, n.memoizedProps);
                          r.componentDidUpdate(
                            i,
                            n.memoizedState,
                            r.__reactInternalSnapshotBeforeUpdate
                          );
                        }
                      var a = t.updateQueue;
                      null !== a && $o(t, a, r);
                      break;
                    case 3:
                      var s = t.updateQueue;
                      if (null !== s) {
                        if (((n = null), null !== t.child))
                          switch (t.child.tag) {
                            case 5:
                            case 1:
                              n = t.child.stateNode;
                          }
                        $o(t, s, n);
                      }
                      break;
                    case 5:
                      var l = t.stateNode;
                      if (null === n && 4 & t.flags) {
                        n = l;
                        var c = t.memoizedProps;
                        switch (t.type) {
                          case "button":
                          case "input":
                          case "select":
                          case "textarea":
                            c.autoFocus && n.focus();
                            break;
                          case "img":
                            c.src && (n.src = c.src);
                        }
                      }
                      break;
                    case 6:
                    case 4:
                    case 12:
                    case 19:
                    case 17:
                    case 21:
                    case 22:
                    case 23:
                    case 25:
                      break;
                    case 13:
                      if (null === t.memoizedState) {
                        var u = t.alternate;
                        if (null !== u) {
                          var d = u.memoizedState;
                          if (null !== d) {
                            var h = d.dehydrated;
                            null !== h && Ut(h);
                          }
                        }
                      }
                      break;
                    default:
                      throw Error(o(163));
                  }
                Qs || (512 & t.flags && il(t));
              } catch (f) {
                jc(t, t.return, f);
              }
            }
            if (t === e) {
              Js = null;
              break;
            }
            if (null !== (n = t.sibling)) {
              (n.return = t.return), (Js = n);
              break;
            }
            Js = t.return;
          }
        }
        function wl(e) {
          for (; null !== Js; ) {
            var t = Js;
            if (t === e) {
              Js = null;
              break;
            }
            var n = t.sibling;
            if (null !== n) {
              (n.return = t.return), (Js = n);
              break;
            }
            Js = t.return;
          }
        }
        function Sl(e) {
          for (; null !== Js; ) {
            var t = Js;
            try {
              switch (t.tag) {
                case 0:
                case 11:
                case 15:
                  var n = t.return;
                  try {
                    rl(4, t);
                  } catch (l) {
                    jc(t, n, l);
                  }
                  break;
                case 1:
                  var r = t.stateNode;
                  if ("function" === typeof r.componentDidMount) {
                    var i = t.return;
                    try {
                      r.componentDidMount();
                    } catch (l) {
                      jc(t, i, l);
                    }
                  }
                  var o = t.return;
                  try {
                    il(t);
                  } catch (l) {
                    jc(t, o, l);
                  }
                  break;
                case 5:
                  var a = t.return;
                  try {
                    il(t);
                  } catch (l) {
                    jc(t, a, l);
                  }
              }
            } catch (l) {
              jc(t, t.return, l);
            }
            if (t === e) {
              Js = null;
              break;
            }
            var s = t.sibling;
            if (null !== s) {
              (s.return = t.return), (Js = s);
              break;
            }
            Js = t.return;
          }
        }
        var kl,
          jl = Math.ceil,
          Cl = b.ReactCurrentDispatcher,
          Pl = b.ReactCurrentOwner,
          El = b.ReactCurrentBatchConfig,
          Tl = 0,
          Rl = null,
          _l = null,
          Ol = 0,
          Al = 0,
          zl = ji(0),
          Dl = 0,
          Nl = null,
          Ll = 0,
          Ml = 0,
          Fl = 0,
          Il = null,
          Vl = null,
          Bl = 0,
          Ul = 1 / 0,
          Wl = null,
          $l = !1,
          Hl = null,
          Yl = null,
          ql = !1,
          Gl = null,
          Kl = 0,
          Ql = 0,
          Xl = null,
          Jl = -1,
          Zl = 0;
        function ec() {
          return 0 !== (6 & Tl) ? Xe() : -1 !== Jl ? Jl : (Jl = Xe());
        }
        function tc(e) {
          return 0 === (1 & e.mode)
            ? 1
            : 0 !== (2 & Tl) && 0 !== Ol
            ? Ol & -Ol
            : null !== go.transition
            ? (0 === Zl && (Zl = mt()), Zl)
            : 0 !== (e = xt)
            ? e
            : (e = void 0 === (e = window.event) ? 16 : Qt(e.type));
        }
        function nc(e, t, n, r) {
          if (50 < Ql) throw ((Ql = 0), (Xl = null), Error(o(185)));
          vt(e, n, r),
            (0 !== (2 & Tl) && e === Rl) ||
              (e === Rl && (0 === (2 & Tl) && (Ml |= n), 4 === Dl && sc(e, Ol)),
              rc(e, r),
              1 === n &&
                0 === Tl &&
                0 === (1 & t.mode) &&
                ((Ul = Xe() + 500), Ii && Ui()));
        }
        function rc(e, t) {
          var n = e.callbackNode;
          !(function (e, t) {
            for (
              var n = e.suspendedLanes,
                r = e.pingedLanes,
                i = e.expirationTimes,
                o = e.pendingLanes;
              0 < o;

            ) {
              var a = 31 - at(o),
                s = 1 << a,
                l = i[a];
              -1 === l
                ? (0 !== (s & n) && 0 === (s & r)) || (i[a] = ft(s, t))
                : l <= t && (e.expiredLanes |= s),
                (o &= ~s);
            }
          })(e, t);
          var r = ht(e, e === Rl ? Ol : 0);
          if (0 === r)
            null !== n && Ge(n),
              (e.callbackNode = null),
              (e.callbackPriority = 0);
          else if (((t = r & -r), e.callbackPriority !== t)) {
            if ((null != n && Ge(n), 1 === t))
              0 === e.tag
                ? (function (e) {
                    (Ii = !0), Bi(e);
                  })(lc.bind(null, e))
                : Bi(lc.bind(null, e)),
                ai(function () {
                  0 === (6 & Tl) && Ui();
                }),
                (n = null);
            else {
              switch (bt(r)) {
                case 1:
                  n = Ze;
                  break;
                case 4:
                  n = et;
                  break;
                case 16:
                default:
                  n = tt;
                  break;
                case 536870912:
                  n = rt;
              }
              n = Rc(n, ic.bind(null, e));
            }
            (e.callbackPriority = t), (e.callbackNode = n);
          }
        }
        function ic(e, t) {
          if (((Jl = -1), (Zl = 0), 0 !== (6 & Tl))) throw Error(o(327));
          var n = e.callbackNode;
          if (Sc() && e.callbackNode !== n) return null;
          var r = ht(e, e === Rl ? Ol : 0);
          if (0 === r) return null;
          if (0 !== (30 & r) || 0 !== (r & e.expiredLanes) || t) t = gc(e, r);
          else {
            t = r;
            var i = Tl;
            Tl |= 2;
            var a = pc();
            for (
              (Rl === e && Ol === t) ||
              ((Wl = null), (Ul = Xe() + 500), hc(e, t));
              ;

            )
              try {
                yc();
                break;
              } catch (l) {
                fc(e, l);
              }
            Eo(),
              (Cl.current = a),
              (Tl = i),
              null !== _l ? (t = 0) : ((Rl = null), (Ol = 0), (t = Dl));
          }
          if (0 !== t) {
            if (
              (2 === t && 0 !== (i = pt(e)) && ((r = i), (t = oc(e, i))),
              1 === t)
            )
              throw ((n = Nl), hc(e, 0), sc(e, r), rc(e, Xe()), n);
            if (6 === t) sc(e, r);
            else {
              if (
                ((i = e.current.alternate),
                0 === (30 & r) &&
                  !(function (e) {
                    for (var t = e; ; ) {
                      if (16384 & t.flags) {
                        var n = t.updateQueue;
                        if (null !== n && null !== (n = n.stores))
                          for (var r = 0; r < n.length; r++) {
                            var i = n[r],
                              o = i.getSnapshot;
                            i = i.value;
                            try {
                              if (!sr(o(), i)) return !1;
                            } catch (s) {
                              return !1;
                            }
                          }
                      }
                      if (((n = t.child), 16384 & t.subtreeFlags && null !== n))
                        (n.return = t), (t = n);
                      else {
                        if (t === e) break;
                        for (; null === t.sibling; ) {
                          if (null === t.return || t.return === e) return !0;
                          t = t.return;
                        }
                        (t.sibling.return = t.return), (t = t.sibling);
                      }
                    }
                    return !0;
                  })(i) &&
                  (2 === (t = gc(e, r)) &&
                    0 !== (a = pt(e)) &&
                    ((r = a), (t = oc(e, a))),
                  1 === t))
              )
                throw ((n = Nl), hc(e, 0), sc(e, r), rc(e, Xe()), n);
              switch (((e.finishedWork = i), (e.finishedLanes = r), t)) {
                case 0:
                case 1:
                  throw Error(o(345));
                case 2:
                case 5:
                  wc(e, Vl, Wl);
                  break;
                case 3:
                  if (
                    (sc(e, r),
                    (130023424 & r) === r && 10 < (t = Bl + 500 - Xe()))
                  ) {
                    if (0 !== ht(e, 0)) break;
                    if (((i = e.suspendedLanes) & r) !== r) {
                      ec(), (e.pingedLanes |= e.suspendedLanes & i);
                      break;
                    }
                    e.timeoutHandle = ri(wc.bind(null, e, Vl, Wl), t);
                    break;
                  }
                  wc(e, Vl, Wl);
                  break;
                case 4:
                  if ((sc(e, r), (4194240 & r) === r)) break;
                  for (t = e.eventTimes, i = -1; 0 < r; ) {
                    var s = 31 - at(r);
                    (a = 1 << s), (s = t[s]) > i && (i = s), (r &= ~a);
                  }
                  if (
                    ((r = i),
                    10 <
                      (r =
                        (120 > (r = Xe() - r)
                          ? 120
                          : 480 > r
                          ? 480
                          : 1080 > r
                          ? 1080
                          : 1920 > r
                          ? 1920
                          : 3e3 > r
                          ? 3e3
                          : 4320 > r
                          ? 4320
                          : 1960 * jl(r / 1960)) - r))
                  ) {
                    e.timeoutHandle = ri(wc.bind(null, e, Vl, Wl), r);
                    break;
                  }
                  wc(e, Vl, Wl);
                  break;
                default:
                  throw Error(o(329));
              }
            }
          }
          return rc(e, Xe()), e.callbackNode === n ? ic.bind(null, e) : null;
        }
        function oc(e, t) {
          var n = Il;
          return (
            e.current.memoizedState.isDehydrated && (hc(e, t).flags |= 256),
            2 !== (e = gc(e, t)) && ((t = Vl), (Vl = n), null !== t && ac(t)),
            e
          );
        }
        function ac(e) {
          null === Vl ? (Vl = e) : Vl.push.apply(Vl, e);
        }
        function sc(e, t) {
          for (
            t &= ~Fl,
              t &= ~Ml,
              e.suspendedLanes |= t,
              e.pingedLanes &= ~t,
              e = e.expirationTimes;
            0 < t;

          ) {
            var n = 31 - at(t),
              r = 1 << n;
            (e[n] = -1), (t &= ~r);
          }
        }
        function lc(e) {
          if (0 !== (6 & Tl)) throw Error(o(327));
          Sc();
          var t = ht(e, 0);
          if (0 === (1 & t)) return rc(e, Xe()), null;
          var n = gc(e, t);
          if (0 !== e.tag && 2 === n) {
            var r = pt(e);
            0 !== r && ((t = r), (n = oc(e, r)));
          }
          if (1 === n) throw ((n = Nl), hc(e, 0), sc(e, t), rc(e, Xe()), n);
          if (6 === n) throw Error(o(345));
          return (
            (e.finishedWork = e.current.alternate),
            (e.finishedLanes = t),
            wc(e, Vl, Wl),
            rc(e, Xe()),
            null
          );
        }
        function cc(e, t) {
          var n = Tl;
          Tl |= 1;
          try {
            return e(t);
          } finally {
            0 === (Tl = n) && ((Ul = Xe() + 500), Ii && Ui());
          }
        }
        function uc(e) {
          null !== Gl && 0 === Gl.tag && 0 === (6 & Tl) && Sc();
          var t = Tl;
          Tl |= 1;
          var n = El.transition,
            r = xt;
          try {
            if (((El.transition = null), (xt = 1), e)) return e();
          } finally {
            (xt = r), (El.transition = n), 0 === (6 & (Tl = t)) && Ui();
          }
        }
        function dc() {
          (Al = zl.current), Ci(zl);
        }
        function hc(e, t) {
          (e.finishedWork = null), (e.finishedLanes = 0);
          var n = e.timeoutHandle;
          if ((-1 !== n && ((e.timeoutHandle = -1), ii(n)), null !== _l))
            for (n = _l.return; null !== n; ) {
              var r = n;
              switch ((to(r), r.tag)) {
                case 1:
                  null !== (r = r.type.childContextTypes) &&
                    void 0 !== r &&
                    zi();
                  break;
                case 3:
                  Xo(), Ci(Ri), Ci(Ti), ra();
                  break;
                case 5:
                  Zo(r);
                  break;
                case 4:
                  Xo();
                  break;
                case 13:
                case 19:
                  Ci(ea);
                  break;
                case 10:
                  To(r.type._context);
                  break;
                case 22:
                case 23:
                  dc();
              }
              n = n.return;
            }
          if (
            ((Rl = e),
            (_l = e = zc(e.current, null)),
            (Ol = Al = t),
            (Dl = 0),
            (Nl = null),
            (Fl = Ml = Ll = 0),
            (Vl = Il = null),
            null !== Ao)
          ) {
            for (t = 0; t < Ao.length; t++)
              if (null !== (r = (n = Ao[t]).interleaved)) {
                n.interleaved = null;
                var i = r.next,
                  o = n.pending;
                if (null !== o) {
                  var a = o.next;
                  (o.next = i), (r.next = a);
                }
                n.pending = r;
              }
            Ao = null;
          }
          return e;
        }
        function fc(e, t) {
          for (;;) {
            var n = _l;
            try {
              if ((Eo(), (ia.current = Ja), ua)) {
                for (var r = sa.memoizedState; null !== r; ) {
                  var i = r.queue;
                  null !== i && (i.pending = null), (r = r.next);
                }
                ua = !1;
              }
              if (
                ((aa = 0),
                (ca = la = sa = null),
                (da = !1),
                (ha = 0),
                (Pl.current = null),
                null === n || null === n.return)
              ) {
                (Dl = 1), (Nl = t), (_l = null);
                break;
              }
              e: {
                var a = e,
                  s = n.return,
                  l = n,
                  c = t;
                if (
                  ((t = Ol),
                  (l.flags |= 32768),
                  null !== c &&
                    "object" === typeof c &&
                    "function" === typeof c.then)
                ) {
                  var u = c,
                    d = l,
                    h = d.tag;
                  if (0 === (1 & d.mode) && (0 === h || 11 === h || 15 === h)) {
                    var f = d.alternate;
                    f
                      ? ((d.updateQueue = f.updateQueue),
                        (d.memoizedState = f.memoizedState),
                        (d.lanes = f.lanes))
                      : ((d.updateQueue = null), (d.memoizedState = null));
                  }
                  var p = gs(s);
                  if (null !== p) {
                    (p.flags &= -257),
                      vs(p, s, l, 0, t),
                      1 & p.mode && ms(a, u, t),
                      (c = u);
                    var m = (t = p).updateQueue;
                    if (null === m) {
                      var g = new Set();
                      g.add(c), (t.updateQueue = g);
                    } else m.add(c);
                    break e;
                  }
                  if (0 === (1 & t)) {
                    ms(a, u, t), mc();
                    break e;
                  }
                  c = Error(o(426));
                } else if (io && 1 & l.mode) {
                  var v = gs(s);
                  if (null !== v) {
                    0 === (65536 & v.flags) && (v.flags |= 256),
                      vs(v, s, l, 0, t),
                      mo(cs(c, l));
                    break e;
                  }
                }
                (a = c = cs(c, l)),
                  4 !== Dl && (Dl = 2),
                  null === Il ? (Il = [a]) : Il.push(a),
                  (a = s);
                do {
                  switch (a.tag) {
                    case 3:
                      (a.flags |= 65536),
                        (t &= -t),
                        (a.lanes |= t),
                        Uo(a, fs(0, c, t));
                      break e;
                    case 1:
                      l = c;
                      var y = a.type,
                        x = a.stateNode;
                      if (
                        0 === (128 & a.flags) &&
                        ("function" === typeof y.getDerivedStateFromError ||
                          (null !== x &&
                            "function" === typeof x.componentDidCatch &&
                            (null === Yl || !Yl.has(x))))
                      ) {
                        (a.flags |= 65536),
                          (t &= -t),
                          (a.lanes |= t),
                          Uo(a, ps(a, l, t));
                        break e;
                      }
                  }
                  a = a.return;
                } while (null !== a);
              }
              bc(n);
            } catch (b) {
              (t = b), _l === n && null !== n && (_l = n = n.return);
              continue;
            }
            break;
          }
        }
        function pc() {
          var e = Cl.current;
          return (Cl.current = Ja), null === e ? Ja : e;
        }
        function mc() {
          (0 !== Dl && 3 !== Dl && 2 !== Dl) || (Dl = 4),
            null === Rl ||
              (0 === (268435455 & Ll) && 0 === (268435455 & Ml)) ||
              sc(Rl, Ol);
        }
        function gc(e, t) {
          var n = Tl;
          Tl |= 2;
          var r = pc();
          for ((Rl === e && Ol === t) || ((Wl = null), hc(e, t)); ; )
            try {
              vc();
              break;
            } catch (i) {
              fc(e, i);
            }
          if ((Eo(), (Tl = n), (Cl.current = r), null !== _l))
            throw Error(o(261));
          return (Rl = null), (Ol = 0), Dl;
        }
        function vc() {
          for (; null !== _l; ) xc(_l);
        }
        function yc() {
          for (; null !== _l && !Ke(); ) xc(_l);
        }
        function xc(e) {
          var t = kl(e.alternate, e, Al);
          (e.memoizedProps = e.pendingProps),
            null === t ? bc(e) : (_l = t),
            (Pl.current = null);
        }
        function bc(e) {
          var t = e;
          do {
            var n = t.alternate;
            if (((e = t.return), 0 === (32768 & t.flags))) {
              if (null !== (n = qs(n, t, Al))) return void (_l = n);
            } else {
              if (null !== (n = Gs(n, t)))
                return (n.flags &= 32767), void (_l = n);
              if (null === e) return (Dl = 6), void (_l = null);
              (e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null);
            }
            if (null !== (t = t.sibling)) return void (_l = t);
            _l = t = e;
          } while (null !== t);
          0 === Dl && (Dl = 5);
        }
        function wc(e, t, n) {
          var r = xt,
            i = El.transition;
          try {
            (El.transition = null),
              (xt = 1),
              (function (e, t, n, r) {
                do {
                  Sc();
                } while (null !== Gl);
                if (0 !== (6 & Tl)) throw Error(o(327));
                n = e.finishedWork;
                var i = e.finishedLanes;
                if (null === n) return null;
                if (
                  ((e.finishedWork = null),
                  (e.finishedLanes = 0),
                  n === e.current)
                )
                  throw Error(o(177));
                (e.callbackNode = null), (e.callbackPriority = 0);
                var a = n.lanes | n.childLanes;
                if (
                  ((function (e, t) {
                    var n = e.pendingLanes & ~t;
                    (e.pendingLanes = t),
                      (e.suspendedLanes = 0),
                      (e.pingedLanes = 0),
                      (e.expiredLanes &= t),
                      (e.mutableReadLanes &= t),
                      (e.entangledLanes &= t),
                      (t = e.entanglements);
                    var r = e.eventTimes;
                    for (e = e.expirationTimes; 0 < n; ) {
                      var i = 31 - at(n),
                        o = 1 << i;
                      (t[i] = 0), (r[i] = -1), (e[i] = -1), (n &= ~o);
                    }
                  })(e, a),
                  e === Rl && ((_l = Rl = null), (Ol = 0)),
                  (0 === (2064 & n.subtreeFlags) && 0 === (2064 & n.flags)) ||
                    ql ||
                    ((ql = !0),
                    Rc(tt, function () {
                      return Sc(), null;
                    })),
                  (a = 0 !== (15990 & n.flags)),
                  0 !== (15990 & n.subtreeFlags) || a)
                ) {
                  (a = El.transition), (El.transition = null);
                  var s = xt;
                  xt = 1;
                  var l = Tl;
                  (Tl |= 4),
                    (Pl.current = null),
                    (function (e, t) {
                      if (((ei = $t), fr((e = hr())))) {
                        if ("selectionStart" in e)
                          var n = {
                            start: e.selectionStart,
                            end: e.selectionEnd,
                          };
                        else
                          e: {
                            var r =
                              (n =
                                ((n = e.ownerDocument) && n.defaultView) ||
                                window).getSelection && n.getSelection();
                            if (r && 0 !== r.rangeCount) {
                              n = r.anchorNode;
                              var i = r.anchorOffset,
                                a = r.focusNode;
                              r = r.focusOffset;
                              try {
                                n.nodeType, a.nodeType;
                              } catch (w) {
                                n = null;
                                break e;
                              }
                              var s = 0,
                                l = -1,
                                c = -1,
                                u = 0,
                                d = 0,
                                h = e,
                                f = null;
                              t: for (;;) {
                                for (
                                  var p;
                                  h !== n ||
                                    (0 !== i && 3 !== h.nodeType) ||
                                    (l = s + i),
                                    h !== a ||
                                      (0 !== r && 3 !== h.nodeType) ||
                                      (c = s + r),
                                    3 === h.nodeType &&
                                      (s += h.nodeValue.length),
                                    null !== (p = h.firstChild);

                                )
                                  (f = h), (h = p);
                                for (;;) {
                                  if (h === e) break t;
                                  if (
                                    (f === n && ++u === i && (l = s),
                                    f === a && ++d === r && (c = s),
                                    null !== (p = h.nextSibling))
                                  )
                                    break;
                                  f = (h = f).parentNode;
                                }
                                h = p;
                              }
                              n =
                                -1 === l || -1 === c
                                  ? null
                                  : { start: l, end: c };
                            } else n = null;
                          }
                        n = n || { start: 0, end: 0 };
                      } else n = null;
                      for (
                        ti = { focusedElem: e, selectionRange: n },
                          $t = !1,
                          Js = t;
                        null !== Js;

                      )
                        if (
                          ((e = (t = Js).child),
                          0 !== (1028 & t.subtreeFlags) && null !== e)
                        )
                          (e.return = t), (Js = e);
                        else
                          for (; null !== Js; ) {
                            t = Js;
                            try {
                              var m = t.alternate;
                              if (0 !== (1024 & t.flags))
                                switch (t.tag) {
                                  case 0:
                                  case 11:
                                  case 15:
                                  case 5:
                                  case 6:
                                  case 4:
                                  case 17:
                                    break;
                                  case 1:
                                    if (null !== m) {
                                      var g = m.memoizedProps,
                                        v = m.memoizedState,
                                        y = t.stateNode,
                                        x = y.getSnapshotBeforeUpdate(
                                          t.elementType === t.type
                                            ? g
                                            : ns(t.type, g),
                                          v
                                        );
                                      y.__reactInternalSnapshotBeforeUpdate = x;
                                    }
                                    break;
                                  case 3:
                                    var b = t.stateNode.containerInfo;
                                    1 === b.nodeType
                                      ? (b.textContent = "")
                                      : 9 === b.nodeType &&
                                        b.documentElement &&
                                        b.removeChild(b.documentElement);
                                    break;
                                  default:
                                    throw Error(o(163));
                                }
                            } catch (w) {
                              jc(t, t.return, w);
                            }
                            if (null !== (e = t.sibling)) {
                              (e.return = t.return), (Js = e);
                              break;
                            }
                            Js = t.return;
                          }
                      (m = tl), (tl = !1);
                    })(e, n),
                    gl(n, e),
                    pr(ti),
                    ($t = !!ei),
                    (ti = ei = null),
                    (e.current = n),
                    yl(n, e, i),
                    Qe(),
                    (Tl = l),
                    (xt = s),
                    (El.transition = a);
                } else e.current = n;
                if (
                  (ql && ((ql = !1), (Gl = e), (Kl = i)),
                  (a = e.pendingLanes),
                  0 === a && (Yl = null),
                  (function (e) {
                    if (ot && "function" === typeof ot.onCommitFiberRoot)
                      try {
                        ot.onCommitFiberRoot(
                          it,
                          e,
                          void 0,
                          128 === (128 & e.current.flags)
                        );
                      } catch (t) {}
                  })(n.stateNode),
                  rc(e, Xe()),
                  null !== t)
                )
                  for (r = e.onRecoverableError, n = 0; n < t.length; n++)
                    (i = t[n]),
                      r(i.value, { componentStack: i.stack, digest: i.digest });
                if ($l) throw (($l = !1), (e = Hl), (Hl = null), e);
                0 !== (1 & Kl) && 0 !== e.tag && Sc(),
                  (a = e.pendingLanes),
                  0 !== (1 & a)
                    ? e === Xl
                      ? Ql++
                      : ((Ql = 0), (Xl = e))
                    : (Ql = 0),
                  Ui();
              })(e, t, n, r);
          } finally {
            (El.transition = i), (xt = r);
          }
          return null;
        }
        function Sc() {
          if (null !== Gl) {
            var e = bt(Kl),
              t = El.transition,
              n = xt;
            try {
              if (((El.transition = null), (xt = 16 > e ? 16 : e), null === Gl))
                var r = !1;
              else {
                if (((e = Gl), (Gl = null), (Kl = 0), 0 !== (6 & Tl)))
                  throw Error(o(331));
                var i = Tl;
                for (Tl |= 4, Js = e.current; null !== Js; ) {
                  var a = Js,
                    s = a.child;
                  if (0 !== (16 & Js.flags)) {
                    var l = a.deletions;
                    if (null !== l) {
                      for (var c = 0; c < l.length; c++) {
                        var u = l[c];
                        for (Js = u; null !== Js; ) {
                          var d = Js;
                          switch (d.tag) {
                            case 0:
                            case 11:
                            case 15:
                              nl(8, d, a);
                          }
                          var h = d.child;
                          if (null !== h) (h.return = d), (Js = h);
                          else
                            for (; null !== Js; ) {
                              var f = (d = Js).sibling,
                                p = d.return;
                              if ((ol(d), d === u)) {
                                Js = null;
                                break;
                              }
                              if (null !== f) {
                                (f.return = p), (Js = f);
                                break;
                              }
                              Js = p;
                            }
                        }
                      }
                      var m = a.alternate;
                      if (null !== m) {
                        var g = m.child;
                        if (null !== g) {
                          m.child = null;
                          do {
                            var v = g.sibling;
                            (g.sibling = null), (g = v);
                          } while (null !== g);
                        }
                      }
                      Js = a;
                    }
                  }
                  if (0 !== (2064 & a.subtreeFlags) && null !== s)
                    (s.return = a), (Js = s);
                  else
                    e: for (; null !== Js; ) {
                      if (0 !== (2048 & (a = Js).flags))
                        switch (a.tag) {
                          case 0:
                          case 11:
                          case 15:
                            nl(9, a, a.return);
                        }
                      var y = a.sibling;
                      if (null !== y) {
                        (y.return = a.return), (Js = y);
                        break e;
                      }
                      Js = a.return;
                    }
                }
                var x = e.current;
                for (Js = x; null !== Js; ) {
                  var b = (s = Js).child;
                  if (0 !== (2064 & s.subtreeFlags) && null !== b)
                    (b.return = s), (Js = b);
                  else
                    e: for (s = x; null !== Js; ) {
                      if (0 !== (2048 & (l = Js).flags))
                        try {
                          switch (l.tag) {
                            case 0:
                            case 11:
                            case 15:
                              rl(9, l);
                          }
                        } catch (S) {
                          jc(l, l.return, S);
                        }
                      if (l === s) {
                        Js = null;
                        break e;
                      }
                      var w = l.sibling;
                      if (null !== w) {
                        (w.return = l.return), (Js = w);
                        break e;
                      }
                      Js = l.return;
                    }
                }
                if (
                  ((Tl = i),
                  Ui(),
                  ot && "function" === typeof ot.onPostCommitFiberRoot)
                )
                  try {
                    ot.onPostCommitFiberRoot(it, e);
                  } catch (S) {}
                r = !0;
              }
              return r;
            } finally {
              (xt = n), (El.transition = t);
            }
          }
          return !1;
        }
        function kc(e, t, n) {
          (e = Vo(e, (t = fs(0, (t = cs(n, t)), 1)), 1)),
            (t = ec()),
            null !== e && (vt(e, 1, t), rc(e, t));
        }
        function jc(e, t, n) {
          if (3 === e.tag) kc(e, e, n);
          else
            for (; null !== t; ) {
              if (3 === t.tag) {
                kc(t, e, n);
                break;
              }
              if (1 === t.tag) {
                var r = t.stateNode;
                if (
                  "function" === typeof t.type.getDerivedStateFromError ||
                  ("function" === typeof r.componentDidCatch &&
                    (null === Yl || !Yl.has(r)))
                ) {
                  (t = Vo(t, (e = ps(t, (e = cs(n, e)), 1)), 1)),
                    (e = ec()),
                    null !== t && (vt(t, 1, e), rc(t, e));
                  break;
                }
              }
              t = t.return;
            }
        }
        function Cc(e, t, n) {
          var r = e.pingCache;
          null !== r && r.delete(t),
            (t = ec()),
            (e.pingedLanes |= e.suspendedLanes & n),
            Rl === e &&
              (Ol & n) === n &&
              (4 === Dl ||
              (3 === Dl && (130023424 & Ol) === Ol && 500 > Xe() - Bl)
                ? hc(e, 0)
                : (Fl |= n)),
            rc(e, t);
        }
        function Pc(e, t) {
          0 === t &&
            (0 === (1 & e.mode)
              ? (t = 1)
              : ((t = ut), 0 === (130023424 & (ut <<= 1)) && (ut = 4194304)));
          var n = ec();
          null !== (e = No(e, t)) && (vt(e, t, n), rc(e, n));
        }
        function Ec(e) {
          var t = e.memoizedState,
            n = 0;
          null !== t && (n = t.retryLane), Pc(e, n);
        }
        function Tc(e, t) {
          var n = 0;
          switch (e.tag) {
            case 13:
              var r = e.stateNode,
                i = e.memoizedState;
              null !== i && (n = i.retryLane);
              break;
            case 19:
              r = e.stateNode;
              break;
            default:
              throw Error(o(314));
          }
          null !== r && r.delete(t), Pc(e, n);
        }
        function Rc(e, t) {
          return qe(e, t);
        }
        function _c(e, t, n, r) {
          (this.tag = e),
            (this.key = n),
            (this.sibling =
              this.child =
              this.return =
              this.stateNode =
              this.type =
              this.elementType =
                null),
            (this.index = 0),
            (this.ref = null),
            (this.pendingProps = t),
            (this.dependencies =
              this.memoizedState =
              this.updateQueue =
              this.memoizedProps =
                null),
            (this.mode = r),
            (this.subtreeFlags = this.flags = 0),
            (this.deletions = null),
            (this.childLanes = this.lanes = 0),
            (this.alternate = null);
        }
        function Oc(e, t, n, r) {
          return new _c(e, t, n, r);
        }
        function Ac(e) {
          return !(!(e = e.prototype) || !e.isReactComponent);
        }
        function zc(e, t) {
          var n = e.alternate;
          return (
            null === n
              ? (((n = Oc(e.tag, t, e.key, e.mode)).elementType =
                  e.elementType),
                (n.type = e.type),
                (n.stateNode = e.stateNode),
                (n.alternate = e),
                (e.alternate = n))
              : ((n.pendingProps = t),
                (n.type = e.type),
                (n.flags = 0),
                (n.subtreeFlags = 0),
                (n.deletions = null)),
            (n.flags = 14680064 & e.flags),
            (n.childLanes = e.childLanes),
            (n.lanes = e.lanes),
            (n.child = e.child),
            (n.memoizedProps = e.memoizedProps),
            (n.memoizedState = e.memoizedState),
            (n.updateQueue = e.updateQueue),
            (t = e.dependencies),
            (n.dependencies =
              null === t
                ? null
                : { lanes: t.lanes, firstContext: t.firstContext }),
            (n.sibling = e.sibling),
            (n.index = e.index),
            (n.ref = e.ref),
            n
          );
        }
        function Dc(e, t, n, r, i, a) {
          var s = 2;
          if (((r = e), "function" === typeof e)) Ac(e) && (s = 1);
          else if ("string" === typeof e) s = 5;
          else
            e: switch (e) {
              case k:
                return Nc(n.children, i, a, t);
              case j:
                (s = 8), (i |= 8);
                break;
              case C:
                return (
                  ((e = Oc(12, n, t, 2 | i)).elementType = C), (e.lanes = a), e
                );
              case R:
                return (
                  ((e = Oc(13, n, t, i)).elementType = R), (e.lanes = a), e
                );
              case _:
                return (
                  ((e = Oc(19, n, t, i)).elementType = _), (e.lanes = a), e
                );
              case z:
                return Lc(n, i, a, t);
              default:
                if ("object" === typeof e && null !== e)
                  switch (e.$$typeof) {
                    case P:
                      s = 10;
                      break e;
                    case E:
                      s = 9;
                      break e;
                    case T:
                      s = 11;
                      break e;
                    case O:
                      s = 14;
                      break e;
                    case A:
                      (s = 16), (r = null);
                      break e;
                  }
                throw Error(o(130, null == e ? e : typeof e, ""));
            }
          return (
            ((t = Oc(s, n, t, i)).elementType = e),
            (t.type = r),
            (t.lanes = a),
            t
          );
        }
        function Nc(e, t, n, r) {
          return ((e = Oc(7, e, r, t)).lanes = n), e;
        }
        function Lc(e, t, n, r) {
          return (
            ((e = Oc(22, e, r, t)).elementType = z),
            (e.lanes = n),
            (e.stateNode = { isHidden: !1 }),
            e
          );
        }
        function Mc(e, t, n) {
          return ((e = Oc(6, e, null, t)).lanes = n), e;
        }
        function Fc(e, t, n) {
          return (
            ((t = Oc(
              4,
              null !== e.children ? e.children : [],
              e.key,
              t
            )).lanes = n),
            (t.stateNode = {
              containerInfo: e.containerInfo,
              pendingChildren: null,
              implementation: e.implementation,
            }),
            t
          );
        }
        function Ic(e, t, n, r, i) {
          (this.tag = t),
            (this.containerInfo = e),
            (this.finishedWork =
              this.pingCache =
              this.current =
              this.pendingChildren =
                null),
            (this.timeoutHandle = -1),
            (this.callbackNode = this.pendingContext = this.context = null),
            (this.callbackPriority = 0),
            (this.eventTimes = gt(0)),
            (this.expirationTimes = gt(-1)),
            (this.entangledLanes =
              this.finishedLanes =
              this.mutableReadLanes =
              this.expiredLanes =
              this.pingedLanes =
              this.suspendedLanes =
              this.pendingLanes =
                0),
            (this.entanglements = gt(0)),
            (this.identifierPrefix = r),
            (this.onRecoverableError = i),
            (this.mutableSourceEagerHydrationData = null);
        }
        function Vc(e, t, n, r, i, o, a, s, l) {
          return (
            (e = new Ic(e, t, n, s, l)),
            1 === t ? ((t = 1), !0 === o && (t |= 8)) : (t = 0),
            (o = Oc(3, null, null, t)),
            (e.current = o),
            (o.stateNode = e),
            (o.memoizedState = {
              element: r,
              isDehydrated: n,
              cache: null,
              transitions: null,
              pendingSuspenseBoundaries: null,
            }),
            Mo(o),
            e
          );
        }
        function Bc(e) {
          if (!e) return Ei;
          e: {
            if (Ue((e = e._reactInternals)) !== e || 1 !== e.tag)
              throw Error(o(170));
            var t = e;
            do {
              switch (t.tag) {
                case 3:
                  t = t.stateNode.context;
                  break e;
                case 1:
                  if (Ai(t.type)) {
                    t = t.stateNode.__reactInternalMemoizedMergedChildContext;
                    break e;
                  }
              }
              t = t.return;
            } while (null !== t);
            throw Error(o(171));
          }
          if (1 === e.tag) {
            var n = e.type;
            if (Ai(n)) return Ni(e, n, t);
          }
          return t;
        }
        function Uc(e, t, n, r, i, o, a, s, l) {
          return (
            ((e = Vc(n, r, !0, e, 0, o, 0, s, l)).context = Bc(null)),
            (n = e.current),
            ((o = Io((r = ec()), (i = tc(n)))).callback =
              void 0 !== t && null !== t ? t : null),
            Vo(n, o, i),
            (e.current.lanes = i),
            vt(e, i, r),
            rc(e, r),
            e
          );
        }
        function Wc(e, t, n, r) {
          var i = t.current,
            o = ec(),
            a = tc(i);
          return (
            (n = Bc(n)),
            null === t.context ? (t.context = n) : (t.pendingContext = n),
            ((t = Io(o, a)).payload = { element: e }),
            null !== (r = void 0 === r ? null : r) && (t.callback = r),
            null !== (e = Vo(i, t, a)) && (nc(e, i, a, o), Bo(e, i, a)),
            a
          );
        }
        function $c(e) {
          return (e = e.current).child
            ? (e.child.tag, e.child.stateNode)
            : null;
        }
        function Hc(e, t) {
          if (null !== (e = e.memoizedState) && null !== e.dehydrated) {
            var n = e.retryLane;
            e.retryLane = 0 !== n && n < t ? n : t;
          }
        }
        function Yc(e, t) {
          Hc(e, t), (e = e.alternate) && Hc(e, t);
        }
        kl = function (e, t, n) {
          if (null !== e)
            if (e.memoizedProps !== t.pendingProps || Ri.current) xs = !0;
            else {
              if (0 === (e.lanes & n) && 0 === (128 & t.flags))
                return (
                  (xs = !1),
                  (function (e, t, n) {
                    switch (t.tag) {
                      case 3:
                        Rs(t), po();
                        break;
                      case 5:
                        Jo(t);
                        break;
                      case 1:
                        Ai(t.type) && Li(t);
                        break;
                      case 4:
                        Qo(t, t.stateNode.containerInfo);
                        break;
                      case 10:
                        var r = t.type._context,
                          i = t.memoizedProps.value;
                        Pi(ko, r._currentValue), (r._currentValue = i);
                        break;
                      case 13:
                        if (null !== (r = t.memoizedState))
                          return null !== r.dehydrated
                            ? (Pi(ea, 1 & ea.current), (t.flags |= 128), null)
                            : 0 !== (n & t.child.childLanes)
                            ? Ms(e, t, n)
                            : (Pi(ea, 1 & ea.current),
                              null !== (e = $s(e, t, n)) ? e.sibling : null);
                        Pi(ea, 1 & ea.current);
                        break;
                      case 19:
                        if (
                          ((r = 0 !== (n & t.childLanes)),
                          0 !== (128 & e.flags))
                        ) {
                          if (r) return Us(e, t, n);
                          t.flags |= 128;
                        }
                        if (
                          (null !== (i = t.memoizedState) &&
                            ((i.rendering = null),
                            (i.tail = null),
                            (i.lastEffect = null)),
                          Pi(ea, ea.current),
                          r)
                        )
                          break;
                        return null;
                      case 22:
                      case 23:
                        return (t.lanes = 0), js(e, t, n);
                    }
                    return $s(e, t, n);
                  })(e, t, n)
                );
              xs = 0 !== (131072 & e.flags);
            }
          else (xs = !1), io && 0 !== (1048576 & t.flags) && Zi(t, Yi, t.index);
          switch (((t.lanes = 0), t.tag)) {
            case 2:
              var r = t.type;
              Ws(e, t), (e = t.pendingProps);
              var i = Oi(t, Ti.current);
              _o(t, n), (i = ga(null, t, r, e, i, n));
              var a = va();
              return (
                (t.flags |= 1),
                "object" === typeof i &&
                null !== i &&
                "function" === typeof i.render &&
                void 0 === i.$$typeof
                  ? ((t.tag = 1),
                    (t.memoizedState = null),
                    (t.updateQueue = null),
                    Ai(r) ? ((a = !0), Li(t)) : (a = !1),
                    (t.memoizedState =
                      null !== i.state && void 0 !== i.state ? i.state : null),
                    Mo(t),
                    (i.updater = is),
                    (t.stateNode = i),
                    (i._reactInternals = t),
                    ls(t, r, e, n),
                    (t = Ts(null, t, r, !0, a, n)))
                  : ((t.tag = 0),
                    io && a && eo(t),
                    bs(null, t, i, n),
                    (t = t.child)),
                t
              );
            case 16:
              r = t.elementType;
              e: {
                switch (
                  (Ws(e, t),
                  (e = t.pendingProps),
                  (r = (i = r._init)(r._payload)),
                  (t.type = r),
                  (i = t.tag =
                    (function (e) {
                      if ("function" === typeof e) return Ac(e) ? 1 : 0;
                      if (void 0 !== e && null !== e) {
                        if ((e = e.$$typeof) === T) return 11;
                        if (e === O) return 14;
                      }
                      return 2;
                    })(r)),
                  (e = ns(r, e)),
                  i)
                ) {
                  case 0:
                    t = Ps(null, t, r, e, n);
                    break e;
                  case 1:
                    t = Es(null, t, r, e, n);
                    break e;
                  case 11:
                    t = ws(null, t, r, e, n);
                    break e;
                  case 14:
                    t = Ss(null, t, r, ns(r.type, e), n);
                    break e;
                }
                throw Error(o(306, r, ""));
              }
              return t;
            case 0:
              return (
                (r = t.type),
                (i = t.pendingProps),
                Ps(e, t, r, (i = t.elementType === r ? i : ns(r, i)), n)
              );
            case 1:
              return (
                (r = t.type),
                (i = t.pendingProps),
                Es(e, t, r, (i = t.elementType === r ? i : ns(r, i)), n)
              );
            case 3:
              e: {
                if ((Rs(t), null === e)) throw Error(o(387));
                (r = t.pendingProps),
                  (i = (a = t.memoizedState).element),
                  Fo(e, t),
                  Wo(t, r, null, n);
                var s = t.memoizedState;
                if (((r = s.element), a.isDehydrated)) {
                  if (
                    ((a = {
                      element: r,
                      isDehydrated: !1,
                      cache: s.cache,
                      pendingSuspenseBoundaries: s.pendingSuspenseBoundaries,
                      transitions: s.transitions,
                    }),
                    (t.updateQueue.baseState = a),
                    (t.memoizedState = a),
                    256 & t.flags)
                  ) {
                    t = _s(e, t, r, n, (i = cs(Error(o(423)), t)));
                    break e;
                  }
                  if (r !== i) {
                    t = _s(e, t, r, n, (i = cs(Error(o(424)), t)));
                    break e;
                  }
                  for (
                    ro = ci(t.stateNode.containerInfo.firstChild),
                      no = t,
                      io = !0,
                      oo = null,
                      n = So(t, null, r, n),
                      t.child = n;
                    n;

                  )
                    (n.flags = (-3 & n.flags) | 4096), (n = n.sibling);
                } else {
                  if ((po(), r === i)) {
                    t = $s(e, t, n);
                    break e;
                  }
                  bs(e, t, r, n);
                }
                t = t.child;
              }
              return t;
            case 5:
              return (
                Jo(t),
                null === e && co(t),
                (r = t.type),
                (i = t.pendingProps),
                (a = null !== e ? e.memoizedProps : null),
                (s = i.children),
                ni(r, i)
                  ? (s = null)
                  : null !== a && ni(r, a) && (t.flags |= 32),
                Cs(e, t),
                bs(e, t, s, n),
                t.child
              );
            case 6:
              return null === e && co(t), null;
            case 13:
              return Ms(e, t, n);
            case 4:
              return (
                Qo(t, t.stateNode.containerInfo),
                (r = t.pendingProps),
                null === e ? (t.child = wo(t, null, r, n)) : bs(e, t, r, n),
                t.child
              );
            case 11:
              return (
                (r = t.type),
                (i = t.pendingProps),
                ws(e, t, r, (i = t.elementType === r ? i : ns(r, i)), n)
              );
            case 7:
              return bs(e, t, t.pendingProps, n), t.child;
            case 8:
            case 12:
              return bs(e, t, t.pendingProps.children, n), t.child;
            case 10:
              e: {
                if (
                  ((r = t.type._context),
                  (i = t.pendingProps),
                  (a = t.memoizedProps),
                  (s = i.value),
                  Pi(ko, r._currentValue),
                  (r._currentValue = s),
                  null !== a)
                )
                  if (sr(a.value, s)) {
                    if (a.children === i.children && !Ri.current) {
                      t = $s(e, t, n);
                      break e;
                    }
                  } else
                    for (
                      null !== (a = t.child) && (a.return = t);
                      null !== a;

                    ) {
                      var l = a.dependencies;
                      if (null !== l) {
                        s = a.child;
                        for (var c = l.firstContext; null !== c; ) {
                          if (c.context === r) {
                            if (1 === a.tag) {
                              (c = Io(-1, n & -n)).tag = 2;
                              var u = a.updateQueue;
                              if (null !== u) {
                                var d = (u = u.shared).pending;
                                null === d
                                  ? (c.next = c)
                                  : ((c.next = d.next), (d.next = c)),
                                  (u.pending = c);
                              }
                            }
                            (a.lanes |= n),
                              null !== (c = a.alternate) && (c.lanes |= n),
                              Ro(a.return, n, t),
                              (l.lanes |= n);
                            break;
                          }
                          c = c.next;
                        }
                      } else if (10 === a.tag)
                        s = a.type === t.type ? null : a.child;
                      else if (18 === a.tag) {
                        if (null === (s = a.return)) throw Error(o(341));
                        (s.lanes |= n),
                          null !== (l = s.alternate) && (l.lanes |= n),
                          Ro(s, n, t),
                          (s = a.sibling);
                      } else s = a.child;
                      if (null !== s) s.return = a;
                      else
                        for (s = a; null !== s; ) {
                          if (s === t) {
                            s = null;
                            break;
                          }
                          if (null !== (a = s.sibling)) {
                            (a.return = s.return), (s = a);
                            break;
                          }
                          s = s.return;
                        }
                      a = s;
                    }
                bs(e, t, i.children, n), (t = t.child);
              }
              return t;
            case 9:
              return (
                (i = t.type),
                (r = t.pendingProps.children),
                _o(t, n),
                (r = r((i = Oo(i)))),
                (t.flags |= 1),
                bs(e, t, r, n),
                t.child
              );
            case 14:
              return (
                (i = ns((r = t.type), t.pendingProps)),
                Ss(e, t, r, (i = ns(r.type, i)), n)
              );
            case 15:
              return ks(e, t, t.type, t.pendingProps, n);
            case 17:
              return (
                (r = t.type),
                (i = t.pendingProps),
                (i = t.elementType === r ? i : ns(r, i)),
                Ws(e, t),
                (t.tag = 1),
                Ai(r) ? ((e = !0), Li(t)) : (e = !1),
                _o(t, n),
                as(t, r, i),
                ls(t, r, i, n),
                Ts(null, t, r, !0, e, n)
              );
            case 19:
              return Us(e, t, n);
            case 22:
              return js(e, t, n);
          }
          throw Error(o(156, t.tag));
        };
        var qc =
          "function" === typeof reportError
            ? reportError
            : function (e) {
                console.error(e);
              };
        function Gc(e) {
          this._internalRoot = e;
        }
        function Kc(e) {
          this._internalRoot = e;
        }
        function Qc(e) {
          return !(
            !e ||
            (1 !== e.nodeType && 9 !== e.nodeType && 11 !== e.nodeType)
          );
        }
        function Xc(e) {
          return !(
            !e ||
            (1 !== e.nodeType &&
              9 !== e.nodeType &&
              11 !== e.nodeType &&
              (8 !== e.nodeType ||
                " react-mount-point-unstable " !== e.nodeValue))
          );
        }
        function Jc() {}
        function Zc(e, t, n, r, i) {
          var o = n._reactRootContainer;
          if (o) {
            var a = o;
            if ("function" === typeof i) {
              var s = i;
              i = function () {
                var e = $c(a);
                s.call(e);
              };
            }
            Wc(t, a, e, i);
          } else
            a = (function (e, t, n, r, i) {
              if (i) {
                if ("function" === typeof r) {
                  var o = r;
                  r = function () {
                    var e = $c(a);
                    o.call(e);
                  };
                }
                var a = Uc(t, r, e, 0, null, !1, 0, "", Jc);
                return (
                  (e._reactRootContainer = a),
                  (e[pi] = a.current),
                  Ur(8 === e.nodeType ? e.parentNode : e),
                  uc(),
                  a
                );
              }
              for (; (i = e.lastChild); ) e.removeChild(i);
              if ("function" === typeof r) {
                var s = r;
                r = function () {
                  var e = $c(l);
                  s.call(e);
                };
              }
              var l = Vc(e, 0, !1, null, 0, !1, 0, "", Jc);
              return (
                (e._reactRootContainer = l),
                (e[pi] = l.current),
                Ur(8 === e.nodeType ? e.parentNode : e),
                uc(function () {
                  Wc(t, l, n, r);
                }),
                l
              );
            })(n, t, e, i, r);
          return $c(a);
        }
        (Kc.prototype.render = Gc.prototype.render =
          function (e) {
            var t = this._internalRoot;
            if (null === t) throw Error(o(409));
            Wc(e, t, null, null);
          }),
          (Kc.prototype.unmount = Gc.prototype.unmount =
            function () {
              var e = this._internalRoot;
              if (null !== e) {
                this._internalRoot = null;
                var t = e.containerInfo;
                uc(function () {
                  Wc(null, e, null, null);
                }),
                  (t[pi] = null);
              }
            }),
          (Kc.prototype.unstable_scheduleHydration = function (e) {
            if (e) {
              var t = jt();
              e = { blockedOn: null, target: e, priority: t };
              for (
                var n = 0;
                n < zt.length && 0 !== t && t < zt[n].priority;
                n++
              );
              zt.splice(n, 0, e), 0 === n && Mt(e);
            }
          }),
          (wt = function (e) {
            switch (e.tag) {
              case 3:
                var t = e.stateNode;
                if (t.current.memoizedState.isDehydrated) {
                  var n = dt(t.pendingLanes);
                  0 !== n &&
                    (yt(t, 1 | n),
                    rc(t, Xe()),
                    0 === (6 & Tl) && ((Ul = Xe() + 500), Ui()));
                }
                break;
              case 13:
                uc(function () {
                  var t = No(e, 1);
                  if (null !== t) {
                    var n = ec();
                    nc(t, e, 1, n);
                  }
                }),
                  Yc(e, 1);
            }
          }),
          (St = function (e) {
            if (13 === e.tag) {
              var t = No(e, 134217728);
              if (null !== t) nc(t, e, 134217728, ec());
              Yc(e, 134217728);
            }
          }),
          (kt = function (e) {
            if (13 === e.tag) {
              var t = tc(e),
                n = No(e, t);
              if (null !== n) nc(n, e, t, ec());
              Yc(e, t);
            }
          }),
          (jt = function () {
            return xt;
          }),
          (Ct = function (e, t) {
            var n = xt;
            try {
              return (xt = e), t();
            } finally {
              xt = n;
            }
          }),
          (Se = function (e, t, n) {
            switch (t) {
              case "input":
                if ((J(e, n), (t = n.name), "radio" === n.type && null != t)) {
                  for (n = e; n.parentNode; ) n = n.parentNode;
                  for (
                    n = n.querySelectorAll(
                      "input[name=" + JSON.stringify("" + t) + '][type="radio"]'
                    ),
                      t = 0;
                    t < n.length;
                    t++
                  ) {
                    var r = n[t];
                    if (r !== e && r.form === e.form) {
                      var i = wi(r);
                      if (!i) throw Error(o(90));
                      q(r), J(r, i);
                    }
                  }
                }
                break;
              case "textarea":
                oe(e, n);
                break;
              case "select":
                null != (t = n.value) && ne(e, !!n.multiple, t, !1);
            }
          }),
          (Te = cc),
          (Re = uc);
        var eu = {
            usingClientEntryPoint: !1,
            Events: [xi, bi, wi, Pe, Ee, cc],
          },
          tu = {
            findFiberByHostInstance: yi,
            bundleType: 0,
            version: "18.3.1",
            rendererPackageName: "react-dom",
          },
          nu = {
            bundleType: tu.bundleType,
            version: tu.version,
            rendererPackageName: tu.rendererPackageName,
            rendererConfig: tu.rendererConfig,
            overrideHookState: null,
            overrideHookStateDeletePath: null,
            overrideHookStateRenamePath: null,
            overrideProps: null,
            overridePropsDeletePath: null,
            overridePropsRenamePath: null,
            setErrorHandler: null,
            setSuspenseHandler: null,
            scheduleUpdate: null,
            currentDispatcherRef: b.ReactCurrentDispatcher,
            findHostInstanceByFiber: function (e) {
              return null === (e = He(e)) ? null : e.stateNode;
            },
            findFiberByHostInstance:
              tu.findFiberByHostInstance ||
              function () {
                return null;
              },
            findHostInstancesForRefresh: null,
            scheduleRefresh: null,
            scheduleRoot: null,
            setRefreshHandler: null,
            getCurrentFiber: null,
            reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
          };
        if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
          var ru = __REACT_DEVTOOLS_GLOBAL_HOOK__;
          if (!ru.isDisabled && ru.supportsFiber)
            try {
              (it = ru.inject(nu)), (ot = ru);
            } catch (ue) {}
        }
        (t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = eu),
          (t.createPortal = function (e, t) {
            var n =
              2 < arguments.length && void 0 !== arguments[2]
                ? arguments[2]
                : null;
            if (!Qc(t)) throw Error(o(200));
            return (function (e, t, n) {
              var r =
                3 < arguments.length && void 0 !== arguments[3]
                  ? arguments[3]
                  : null;
              return {
                $$typeof: S,
                key: null == r ? null : "" + r,
                children: e,
                containerInfo: t,
                implementation: n,
              };
            })(e, t, null, n);
          }),
          (t.createRoot = function (e, t) {
            if (!Qc(e)) throw Error(o(299));
            var n = !1,
              r = "",
              i = qc;
            return (
              null !== t &&
                void 0 !== t &&
                (!0 === t.unstable_strictMode && (n = !0),
                void 0 !== t.identifierPrefix && (r = t.identifierPrefix),
                void 0 !== t.onRecoverableError && (i = t.onRecoverableError)),
              (t = Vc(e, 1, !1, null, 0, n, 0, r, i)),
              (e[pi] = t.current),
              Ur(8 === e.nodeType ? e.parentNode : e),
              new Gc(t)
            );
          }),
          (t.findDOMNode = function (e) {
            if (null == e) return null;
            if (1 === e.nodeType) return e;
            var t = e._reactInternals;
            if (void 0 === t) {
              if ("function" === typeof e.render) throw Error(o(188));
              throw ((e = Object.keys(e).join(",")), Error(o(268, e)));
            }
            return (e = null === (e = He(t)) ? null : e.stateNode);
          }),
          (t.flushSync = function (e) {
            return uc(e);
          }),
          (t.hydrate = function (e, t, n) {
            if (!Xc(t)) throw Error(o(200));
            return Zc(null, e, t, !0, n);
          }),
          (t.hydrateRoot = function (e, t, n) {
            if (!Qc(e)) throw Error(o(405));
            var r = (null != n && n.hydratedSources) || null,
              i = !1,
              a = "",
              s = qc;
            if (
              (null !== n &&
                void 0 !== n &&
                (!0 === n.unstable_strictMode && (i = !0),
                void 0 !== n.identifierPrefix && (a = n.identifierPrefix),
                void 0 !== n.onRecoverableError && (s = n.onRecoverableError)),
              (t = Uc(t, null, e, 1, null != n ? n : null, i, 0, a, s)),
              (e[pi] = t.current),
              Ur(e),
              r)
            )
              for (e = 0; e < r.length; e++)
                (i = (i = (n = r[e])._getVersion)(n._source)),
                  null == t.mutableSourceEagerHydrationData
                    ? (t.mutableSourceEagerHydrationData = [n, i])
                    : t.mutableSourceEagerHydrationData.push(n, i);
            return new Kc(t);
          }),
          (t.render = function (e, t, n) {
            if (!Xc(t)) throw Error(o(200));
            return Zc(null, e, t, !1, n);
          }),
          (t.unmountComponentAtNode = function (e) {
            if (!Xc(e)) throw Error(o(40));
            return (
              !!e._reactRootContainer &&
              (uc(function () {
                Zc(null, null, e, !1, function () {
                  (e._reactRootContainer = null), (e[pi] = null);
                });
              }),
              !0)
            );
          }),
          (t.unstable_batchedUpdates = cc),
          (t.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
            if (!Xc(n)) throw Error(o(200));
            if (null == e || void 0 === e._reactInternals) throw Error(o(38));
            return Zc(e, t, n, !1, r);
          }),
          (t.version = "18.3.1-next-f1338f8080-20240426");
      },
      853: (e, t, n) => {
        "use strict";
        e.exports = n(234);
      },
      950: (e, t, n) => {
        "use strict";
        !(function e() {
          if (
            "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
            "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE
          )
            try {
              __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
            } catch (t) {
              console.error(t);
            }
        })(),
          (e.exports = n(730));
      },
    },
    t = {};
  function n(r) {
    var i = t[r];
    if (void 0 !== i) return i.exports;
    var o = (t[r] = { exports: {} });
    return e[r](o, o.exports, n), o.exports;
  }
  (n.m = e),
    (n.n = (e) => {
      var t = e && e.__esModule ? () => e.default : () => e;
      return n.d(t, { a: t }), t;
    }),
    (() => {
      var e,
        t = Object.getPrototypeOf
          ? (e) => Object.getPrototypeOf(e)
          : (e) => e.__proto__;
      n.t = function (r, i) {
        if ((1 & i && (r = this(r)), 8 & i)) return r;
        if ("object" === typeof r && r) {
          if (4 & i && r.__esModule) return r;
          if (16 & i && "function" === typeof r.then) return r;
        }
        var o = Object.create(null);
        n.r(o);
        var a = {};
        e = e || [null, t({}), t([]), t(t)];
        for (
          var s = 2 & i && r;
          "object" == typeof s && !~e.indexOf(s);
          s = t(s)
        )
          Object.getOwnPropertyNames(s).forEach((e) => (a[e] = () => r[e]));
        return (a.default = () => r), n.d(o, a), o;
      };
    })(),
    (n.d = (e, t) => {
      for (var r in t)
        n.o(t, r) &&
          !n.o(e, r) &&
          Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
    }),
    (n.f = {}),
    (n.e = (e) =>
      Promise.all(Object.keys(n.f).reduce((t, r) => (n.f[r](e, t), t), []))),
    (n.u = (e) => "static/js/" + e + ".d50722c5.chunk.js"),
    (n.miniCssF = (e) => {}),
    (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (() => {
      var e = {},
        t = "recovery-connect-website:";
      n.l = (r, i, o, a) => {
        if (e[r]) e[r].push(i);
        else {
          var s, l;
          if (void 0 !== o)
            for (
              var c = document.getElementsByTagName("script"), u = 0;
              u < c.length;
              u++
            ) {
              var d = c[u];
              if (
                d.getAttribute("src") == r ||
                d.getAttribute("data-webpack") == t + o
              ) {
                s = d;
                break;
              }
            }
          s ||
            ((l = !0),
            ((s = document.createElement("script")).charset = "utf-8"),
            (s.timeout = 120),
            n.nc && s.setAttribute("nonce", n.nc),
            s.setAttribute("data-webpack", t + o),
            (s.src = r)),
            (e[r] = [i]);
          var h = (t, n) => {
              (s.onerror = s.onload = null), clearTimeout(f);
              var i = e[r];
              if (
                (delete e[r],
                s.parentNode && s.parentNode.removeChild(s),
                i && i.forEach((e) => e(n)),
                t)
              )
                return t(n);
            },
            f = setTimeout(
              h.bind(null, void 0, { type: "timeout", target: s }),
              12e4
            );
          (s.onerror = h.bind(null, s.onerror)),
            (s.onload = h.bind(null, s.onload)),
            l && document.head.appendChild(s);
        }
      };
    })(),
    (n.r = (e) => {
      "undefined" !== typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (n.p = "/"),
    (() => {
      var e = { 792: 0 };
      n.f.j = (t, r) => {
        var i = n.o(e, t) ? e[t] : void 0;
        if (0 !== i)
          if (i) r.push(i[2]);
          else {
            var o = new Promise((n, r) => (i = e[t] = [n, r]));
            r.push((i[2] = o));
            var a = n.p + n.u(t),
              s = new Error();
            n.l(
              a,
              (r) => {
                if (n.o(e, t) && (0 !== (i = e[t]) && (e[t] = void 0), i)) {
                  var o = r && ("load" === r.type ? "missing" : r.type),
                    a = r && r.target && r.target.src;
                  (s.message =
                    "Loading chunk " + t + " failed.\n(" + o + ": " + a + ")"),
                    (s.name = "ChunkLoadError"),
                    (s.type = o),
                    (s.request = a),
                    i[1](s);
                }
              },
              "chunk-" + t,
              t
            );
          }
      };
      var t = (t, r) => {
          var i,
            o,
            a = r[0],
            s = r[1],
            l = r[2],
            c = 0;
          if (a.some((t) => 0 !== e[t])) {
            for (i in s) n.o(s, i) && (n.m[i] = s[i]);
            if (l) l(n);
          }
          for (t && t(r); c < a.length; c++)
            (o = a[c]), n.o(e, o) && e[o] && e[o][0](), (e[o] = 0);
        },
        r = (self.webpackChunkrecovery_connect_website =
          self.webpackChunkrecovery_connect_website || []);
      r.forEach(t.bind(null, 0)), (r.push = t.bind(null, r.push.bind(r)));
    })(),
    (n.nc = void 0),
    (() => {
      "use strict";
      var e,
        t = n(43),
        r = n.t(t, 2),
        i = n(391),
        o = n(950),
        a = n.t(o, 2);
      function s() {
        return (
          (s = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var r in n)
                    Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
              }),
          s.apply(this, arguments)
        );
      }
      !(function (e) {
        (e.Pop = "POP"), (e.Push = "PUSH"), (e.Replace = "REPLACE");
      })(e || (e = {}));
      const l = "popstate";
      function c(e, t) {
        if (!1 === e || null === e || "undefined" === typeof e)
          throw new Error(t);
      }
      function u(e, t) {
        if (!e) {
          "undefined" !== typeof console && console.warn(t);
          try {
            throw new Error(t);
          } catch (n) {}
        }
      }
      function d(e, t) {
        return { usr: e.state, key: e.key, idx: t };
      }
      function h(e, t, n, r) {
        return (
          void 0 === n && (n = null),
          s(
            {
              pathname: "string" === typeof e ? e : e.pathname,
              search: "",
              hash: "",
            },
            "string" === typeof t ? p(t) : t,
            {
              state: n,
              key: (t && t.key) || r || Math.random().toString(36).substr(2, 8),
            }
          )
        );
      }
      function f(e) {
        let { pathname: t = "/", search: n = "", hash: r = "" } = e;
        return (
          n && "?" !== n && (t += "?" === n.charAt(0) ? n : "?" + n),
          r && "#" !== r && (t += "#" === r.charAt(0) ? r : "#" + r),
          t
        );
      }
      function p(e) {
        let t = {};
        if (e) {
          let n = e.indexOf("#");
          n >= 0 && ((t.hash = e.substr(n)), (e = e.substr(0, n)));
          let r = e.indexOf("?");
          r >= 0 && ((t.search = e.substr(r)), (e = e.substr(0, r))),
            e && (t.pathname = e);
        }
        return t;
      }
      function m(t, n, r, i) {
        void 0 === i && (i = {});
        let { window: o = document.defaultView, v5Compat: a = !1 } = i,
          u = o.history,
          p = e.Pop,
          m = null,
          g = v();
        function v() {
          return (u.state || { idx: null }).idx;
        }
        function y() {
          p = e.Pop;
          let t = v(),
            n = null == t ? null : t - g;
          (g = t), m && m({ action: p, location: b.location, delta: n });
        }
        function x(e) {
          let t =
              "null" !== o.location.origin
                ? o.location.origin
                : o.location.href,
            n = "string" === typeof e ? e : f(e);
          return (
            (n = n.replace(/ $/, "%20")),
            c(
              t,
              "No window.location.(origin|href) available to create URL for href: " +
                n
            ),
            new URL(n, t)
          );
        }
        null == g && ((g = 0), u.replaceState(s({}, u.state, { idx: g }), ""));
        let b = {
          get action() {
            return p;
          },
          get location() {
            return t(o, u);
          },
          listen(e) {
            if (m)
              throw new Error("A history only accepts one active listener");
            return (
              o.addEventListener(l, y),
              (m = e),
              () => {
                o.removeEventListener(l, y), (m = null);
              }
            );
          },
          createHref: (e) => n(o, e),
          createURL: x,
          encodeLocation(e) {
            let t = x(e);
            return { pathname: t.pathname, search: t.search, hash: t.hash };
          },
          push: function (t, n) {
            p = e.Push;
            let i = h(b.location, t, n);
            r && r(i, t), (g = v() + 1);
            let s = d(i, g),
              l = b.createHref(i);
            try {
              u.pushState(s, "", l);
            } catch (c) {
              if (c instanceof DOMException && "DataCloneError" === c.name)
                throw c;
              o.location.assign(l);
            }
            a && m && m({ action: p, location: b.location, delta: 1 });
          },
          replace: function (t, n) {
            p = e.Replace;
            let i = h(b.location, t, n);
            r && r(i, t), (g = v());
            let o = d(i, g),
              s = b.createHref(i);
            u.replaceState(o, "", s),
              a && m && m({ action: p, location: b.location, delta: 0 });
          },
          go: (e) => u.go(e),
        };
        return b;
      }
      var g;
      !(function (e) {
        (e.data = "data"),
          (e.deferred = "deferred"),
          (e.redirect = "redirect"),
          (e.error = "error");
      })(g || (g = {}));
      new Set(["lazy", "caseSensitive", "path", "id", "index", "children"]);
      function v(e, t, n) {
        return void 0 === n && (n = "/"), y(e, t, n, !1);
      }
      function y(e, t, n, r) {
        let i = A(("string" === typeof t ? p(t) : t).pathname || "/", n);
        if (null == i) return null;
        let o = x(e);
        !(function (e) {
          e.sort((e, t) =>
            e.score !== t.score
              ? t.score - e.score
              : (function (e, t) {
                  let n =
                    e.length === t.length &&
                    e.slice(0, -1).every((e, n) => e === t[n]);
                  return n ? e[e.length - 1] - t[t.length - 1] : 0;
                })(
                  e.routesMeta.map((e) => e.childrenIndex),
                  t.routesMeta.map((e) => e.childrenIndex)
                )
          );
        })(o);
        let a = null;
        for (let s = 0; null == a && s < o.length; ++s) {
          let e = O(i);
          a = R(o[s], e, r);
        }
        return a;
      }
      function x(e, t, n, r) {
        void 0 === t && (t = []),
          void 0 === n && (n = []),
          void 0 === r && (r = "");
        let i = (e, i, o) => {
          let a = {
            relativePath: void 0 === o ? e.path || "" : o,
            caseSensitive: !0 === e.caseSensitive,
            childrenIndex: i,
            route: e,
          };
          a.relativePath.startsWith("/") &&
            (c(
              a.relativePath.startsWith(r),
              'Absolute route path "' +
                a.relativePath +
                '" nested under path "' +
                r +
                '" is not valid. An absolute child route path must start with the combined path of all its parent routes.'
            ),
            (a.relativePath = a.relativePath.slice(r.length)));
          let s = M([r, a.relativePath]),
            l = n.concat(a);
          e.children &&
            e.children.length > 0 &&
            (c(
              !0 !== e.index,
              'Index routes must not have child routes. Please remove all child routes from route path "' +
                s +
                '".'
            ),
            x(e.children, t, l, s)),
            (null != e.path || e.index) &&
              t.push({ path: s, score: T(s, e.index), routesMeta: l });
        };
        return (
          e.forEach((e, t) => {
            var n;
            if ("" !== e.path && null != (n = e.path) && n.includes("?"))
              for (let r of b(e.path)) i(e, t, r);
            else i(e, t);
          }),
          t
        );
      }
      function b(e) {
        let t = e.split("/");
        if (0 === t.length) return [];
        let [n, ...r] = t,
          i = n.endsWith("?"),
          o = n.replace(/\?$/, "");
        if (0 === r.length) return i ? [o, ""] : [o];
        let a = b(r.join("/")),
          s = [];
        return (
          s.push(...a.map((e) => ("" === e ? o : [o, e].join("/")))),
          i && s.push(...a),
          s.map((t) => (e.startsWith("/") && "" === t ? "/" : t))
        );
      }
      const w = /^:[\w-]+$/,
        S = 3,
        k = 2,
        j = 1,
        C = 10,
        P = -2,
        E = (e) => "*" === e;
      function T(e, t) {
        let n = e.split("/"),
          r = n.length;
        return (
          n.some(E) && (r += P),
          t && (r += k),
          n
            .filter((e) => !E(e))
            .reduce((e, t) => e + (w.test(t) ? S : "" === t ? j : C), r)
        );
      }
      function R(e, t, n) {
        void 0 === n && (n = !1);
        let { routesMeta: r } = e,
          i = {},
          o = "/",
          a = [];
        for (let s = 0; s < r.length; ++s) {
          let e = r[s],
            l = s === r.length - 1,
            c = "/" === o ? t : t.slice(o.length) || "/",
            u = _(
              { path: e.relativePath, caseSensitive: e.caseSensitive, end: l },
              c
            ),
            d = e.route;
          if (
            (!u &&
              l &&
              n &&
              !r[r.length - 1].route.index &&
              (u = _(
                {
                  path: e.relativePath,
                  caseSensitive: e.caseSensitive,
                  end: !1,
                },
                c
              )),
            !u)
          )
            return null;
          Object.assign(i, u.params),
            a.push({
              params: i,
              pathname: M([o, u.pathname]),
              pathnameBase: F(M([o, u.pathnameBase])),
              route: d,
            }),
            "/" !== u.pathnameBase && (o = M([o, u.pathnameBase]));
        }
        return a;
      }
      function _(e, t) {
        "string" === typeof e && (e = { path: e, caseSensitive: !1, end: !0 });
        let [n, r] = (function (e, t, n) {
            void 0 === t && (t = !1);
            void 0 === n && (n = !0);
            u(
              "*" === e || !e.endsWith("*") || e.endsWith("/*"),
              'Route path "' +
                e +
                '" will be treated as if it were "' +
                e.replace(/\*$/, "/*") +
                '" because the `*` character must always follow a `/` in the pattern. To get rid of this warning, please change the route path to "' +
                e.replace(/\*$/, "/*") +
                '".'
            );
            let r = [],
              i =
                "^" +
                e
                  .replace(/\/*\*?$/, "")
                  .replace(/^\/*/, "/")
                  .replace(/[\\.*+^${}|()[\]]/g, "\\$&")
                  .replace(
                    /\/:([\w-]+)(\?)?/g,
                    (e, t, n) => (
                      r.push({ paramName: t, isOptional: null != n }),
                      n ? "/?([^\\/]+)?" : "/([^\\/]+)"
                    )
                  );
            e.endsWith("*")
              ? (r.push({ paramName: "*" }),
                (i += "*" === e || "/*" === e ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
              : n
              ? (i += "\\/*$")
              : "" !== e && "/" !== e && (i += "(?:(?=\\/|$))");
            let o = new RegExp(i, t ? void 0 : "i");
            return [o, r];
          })(e.path, e.caseSensitive, e.end),
          i = t.match(n);
        if (!i) return null;
        let o = i[0],
          a = o.replace(/(.)\/+$/, "$1"),
          s = i.slice(1),
          l = r.reduce((e, t, n) => {
            let { paramName: r, isOptional: i } = t;
            if ("*" === r) {
              let e = s[n] || "";
              a = o.slice(0, o.length - e.length).replace(/(.)\/+$/, "$1");
            }
            const l = s[n];
            return (
              (e[r] = i && !l ? void 0 : (l || "").replace(/%2F/g, "/")), e
            );
          }, {});
        return { params: l, pathname: o, pathnameBase: a, pattern: e };
      }
      function O(e) {
        try {
          return e
            .split("/")
            .map((e) => decodeURIComponent(e).replace(/\//g, "%2F"))
            .join("/");
        } catch (t) {
          return (
            u(
              !1,
              'The URL path "' +
                e +
                '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent encoding (' +
                t +
                ")."
            ),
            e
          );
        }
      }
      function A(e, t) {
        if ("/" === t) return e;
        if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
        let n = t.endsWith("/") ? t.length - 1 : t.length,
          r = e.charAt(n);
        return r && "/" !== r ? null : e.slice(n) || "/";
      }
      function z(e, t, n, r) {
        return (
          "Cannot include a '" +
          e +
          "' character in a manually specified `to." +
          t +
          "` field [" +
          JSON.stringify(r) +
          "].  Please separate it out to the `to." +
          n +
          '` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.'
        );
      }
      function D(e) {
        return e.filter(
          (e, t) => 0 === t || (e.route.path && e.route.path.length > 0)
        );
      }
      function N(e, t) {
        let n = D(e);
        return t
          ? n.map((e, t) => (t === n.length - 1 ? e.pathname : e.pathnameBase))
          : n.map((e) => e.pathnameBase);
      }
      function L(e, t, n, r) {
        let i;
        void 0 === r && (r = !1),
          "string" === typeof e
            ? (i = p(e))
            : ((i = s({}, e)),
              c(
                !i.pathname || !i.pathname.includes("?"),
                z("?", "pathname", "search", i)
              ),
              c(
                !i.pathname || !i.pathname.includes("#"),
                z("#", "pathname", "hash", i)
              ),
              c(
                !i.search || !i.search.includes("#"),
                z("#", "search", "hash", i)
              ));
        let o,
          a = "" === e || "" === i.pathname,
          l = a ? "/" : i.pathname;
        if (null == l) o = n;
        else {
          let e = t.length - 1;
          if (!r && l.startsWith("..")) {
            let t = l.split("/");
            for (; ".." === t[0]; ) t.shift(), (e -= 1);
            i.pathname = t.join("/");
          }
          o = e >= 0 ? t[e] : "/";
        }
        let u = (function (e, t) {
            void 0 === t && (t = "/");
            let {
                pathname: n,
                search: r = "",
                hash: i = "",
              } = "string" === typeof e ? p(e) : e,
              o = n
                ? n.startsWith("/")
                  ? n
                  : (function (e, t) {
                      let n = t.replace(/\/+$/, "").split("/");
                      return (
                        e.split("/").forEach((e) => {
                          ".." === e
                            ? n.length > 1 && n.pop()
                            : "." !== e && n.push(e);
                        }),
                        n.length > 1 ? n.join("/") : "/"
                      );
                    })(n, t)
                : t;
            return { pathname: o, search: I(r), hash: V(i) };
          })(i, o),
          d = l && "/" !== l && l.endsWith("/"),
          h = (a || "." === l) && n.endsWith("/");
        return u.pathname.endsWith("/") || (!d && !h) || (u.pathname += "/"), u;
      }
      const M = (e) => e.join("/").replace(/\/\/+/g, "/"),
        F = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/"),
        I = (e) => (e && "?" !== e ? (e.startsWith("?") ? e : "?" + e) : ""),
        V = (e) => (e && "#" !== e ? (e.startsWith("#") ? e : "#" + e) : "");
      Error;
      function B(e) {
        return (
          null != e &&
          "number" === typeof e.status &&
          "string" === typeof e.statusText &&
          "boolean" === typeof e.internal &&
          "data" in e
        );
      }
      const U = ["post", "put", "patch", "delete"],
        W = (new Set(U), ["get", ...U]);
      new Set(W), new Set([301, 302, 303, 307, 308]), new Set([307, 308]);
      Symbol("deferred");
      function $() {
        return (
          ($ = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var r in n)
                    Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
              }),
          $.apply(this, arguments)
        );
      }
      const H = t.createContext(null);
      const Y = t.createContext(null);
      const q = t.createContext(null);
      const G = t.createContext(null);
      const K = t.createContext({ outlet: null, matches: [], isDataRoute: !1 });
      const Q = t.createContext(null);
      function X() {
        return null != t.useContext(G);
      }
      function J() {
        return X() || c(!1), t.useContext(G).location;
      }
      function Z(e) {
        t.useContext(q).static || t.useLayoutEffect(e);
      }
      function ee() {
        let { isDataRoute: e } = t.useContext(K);
        return e
          ? (function () {
              let { router: e } = ue(le.UseNavigateStable),
                n = he(ce.UseNavigateStable),
                r = t.useRef(!1);
              Z(() => {
                r.current = !0;
              });
              let i = t.useCallback(
                function (t, i) {
                  void 0 === i && (i = {}),
                    r.current &&
                      ("number" === typeof t
                        ? e.navigate(t)
                        : e.navigate(t, $({ fromRouteId: n }, i)));
                },
                [e, n]
              );
              return i;
            })()
          : (function () {
              X() || c(!1);
              let e = t.useContext(H),
                { basename: n, future: r, navigator: i } = t.useContext(q),
                { matches: o } = t.useContext(K),
                { pathname: a } = J(),
                s = JSON.stringify(N(o, r.v7_relativeSplatPath)),
                l = t.useRef(!1);
              return (
                Z(() => {
                  l.current = !0;
                }),
                t.useCallback(
                  function (t, r) {
                    if ((void 0 === r && (r = {}), !l.current)) return;
                    if ("number" === typeof t) return void i.go(t);
                    let o = L(t, JSON.parse(s), a, "path" === r.relative);
                    null == e &&
                      "/" !== n &&
                      (o.pathname =
                        "/" === o.pathname ? n : M([n, o.pathname])),
                      (r.replace ? i.replace : i.push)(o, r.state, r);
                  },
                  [n, i, s, a, e]
                )
              );
            })();
      }
      function te(e, n) {
        let { relative: r } = void 0 === n ? {} : n,
          { future: i } = t.useContext(q),
          { matches: o } = t.useContext(K),
          { pathname: a } = J(),
          s = JSON.stringify(N(o, i.v7_relativeSplatPath));
        return t.useMemo(
          () => L(e, JSON.parse(s), a, "path" === r),
          [e, s, a, r]
        );
      }
      function ne(n, r, i, o) {
        X() || c(!1);
        let { navigator: a, static: s } = t.useContext(q),
          { matches: l } = t.useContext(K),
          u = l[l.length - 1],
          d = u ? u.params : {},
          h = (u && u.pathname, u ? u.pathnameBase : "/");
        u && u.route;
        let f,
          m = J();
        if (r) {
          var g;
          let e = "string" === typeof r ? p(r) : r;
          "/" === h ||
            (null == (g = e.pathname) ? void 0 : g.startsWith(h)) ||
            c(!1),
            (f = e);
        } else f = m;
        let y = f.pathname || "/",
          x = y;
        if ("/" !== h) {
          let e = h.replace(/^\//, "").split("/");
          x = "/" + y.replace(/^\//, "").split("/").slice(e.length).join("/");
        }
        let b =
          !s && i && i.matches && i.matches.length > 0
            ? i.matches
            : v(n, { pathname: x });
        let w = se(
          b &&
            b.map((e) =>
              Object.assign({}, e, {
                params: Object.assign({}, d, e.params),
                pathname: M([
                  h,
                  a.encodeLocation
                    ? a.encodeLocation(e.pathname).pathname
                    : e.pathname,
                ]),
                pathnameBase:
                  "/" === e.pathnameBase
                    ? h
                    : M([
                        h,
                        a.encodeLocation
                          ? a.encodeLocation(e.pathnameBase).pathname
                          : e.pathnameBase,
                      ]),
              })
            ),
          l,
          i,
          o
        );
        return r && w
          ? t.createElement(
              G.Provider,
              {
                value: {
                  location: $(
                    {
                      pathname: "/",
                      search: "",
                      hash: "",
                      state: null,
                      key: "default",
                    },
                    f
                  ),
                  navigationType: e.Pop,
                },
              },
              w
            )
          : w;
      }
      function re() {
        let e = (function () {
            var e;
            let n = t.useContext(Q),
              r = de(ce.UseRouteError),
              i = he(ce.UseRouteError);
            if (void 0 !== n) return n;
            return null == (e = r.errors) ? void 0 : e[i];
          })(),
          n = B(e)
            ? e.status + " " + e.statusText
            : e instanceof Error
            ? e.message
            : JSON.stringify(e),
          r = e instanceof Error ? e.stack : null,
          i = "rgba(200,200,200, 0.5)",
          o = { padding: "0.5rem", backgroundColor: i };
        return t.createElement(
          t.Fragment,
          null,
          t.createElement("h2", null, "Unexpected Application Error!"),
          t.createElement("h3", { style: { fontStyle: "italic" } }, n),
          r ? t.createElement("pre", { style: o }, r) : null,
          null
        );
      }
      const ie = t.createElement(re, null);
      class oe extends t.Component {
        constructor(e) {
          super(e),
            (this.state = {
              location: e.location,
              revalidation: e.revalidation,
              error: e.error,
            });
        }
        static getDerivedStateFromError(e) {
          return { error: e };
        }
        static getDerivedStateFromProps(e, t) {
          return t.location !== e.location ||
            ("idle" !== t.revalidation && "idle" === e.revalidation)
            ? {
                error: e.error,
                location: e.location,
                revalidation: e.revalidation,
              }
            : {
                error: void 0 !== e.error ? e.error : t.error,
                location: t.location,
                revalidation: e.revalidation || t.revalidation,
              };
        }
        componentDidCatch(e, t) {
          console.error(
            "React Router caught the following error during render",
            e,
            t
          );
        }
        render() {
          return void 0 !== this.state.error
            ? t.createElement(
                K.Provider,
                { value: this.props.routeContext },
                t.createElement(Q.Provider, {
                  value: this.state.error,
                  children: this.props.component,
                })
              )
            : this.props.children;
        }
      }
      function ae(e) {
        let { routeContext: n, match: r, children: i } = e,
          o = t.useContext(H);
        return (
          o &&
            o.static &&
            o.staticContext &&
            (r.route.errorElement || r.route.ErrorBoundary) &&
            (o.staticContext._deepestRenderedBoundaryId = r.route.id),
          t.createElement(K.Provider, { value: n }, i)
        );
      }
      function se(e, n, r, i) {
        var o;
        if (
          (void 0 === n && (n = []),
          void 0 === r && (r = null),
          void 0 === i && (i = null),
          null == e)
        ) {
          var a;
          if (!r) return null;
          if (r.errors) e = r.matches;
          else {
            if (
              !(
                null != (a = i) &&
                a.v7_partialHydration &&
                0 === n.length &&
                !r.initialized &&
                r.matches.length > 0
              )
            )
              return null;
            e = r.matches;
          }
        }
        let s = e,
          l = null == (o = r) ? void 0 : o.errors;
        if (null != l) {
          let e = s.findIndex(
            (e) => e.route.id && void 0 !== (null == l ? void 0 : l[e.route.id])
          );
          e >= 0 || c(!1), (s = s.slice(0, Math.min(s.length, e + 1)));
        }
        let u = !1,
          d = -1;
        if (r && i && i.v7_partialHydration)
          for (let t = 0; t < s.length; t++) {
            let e = s[t];
            if (
              ((e.route.HydrateFallback || e.route.hydrateFallbackElement) &&
                (d = t),
              e.route.id)
            ) {
              let { loaderData: t, errors: n } = r,
                i =
                  e.route.loader &&
                  void 0 === t[e.route.id] &&
                  (!n || void 0 === n[e.route.id]);
              if (e.route.lazy || i) {
                (u = !0), (s = d >= 0 ? s.slice(0, d + 1) : [s[0]]);
                break;
              }
            }
          }
        return s.reduceRight((e, i, o) => {
          let a,
            c = !1,
            h = null,
            f = null;
          var p;
          r &&
            ((a = l && i.route.id ? l[i.route.id] : void 0),
            (h = i.route.errorElement || ie),
            u &&
              (d < 0 && 0 === o
                ? ((p = "route-fallback"),
                  !1 || fe[p] || (fe[p] = !0),
                  (c = !0),
                  (f = null))
                : d === o &&
                  ((c = !0), (f = i.route.hydrateFallbackElement || null))));
          let m = n.concat(s.slice(0, o + 1)),
            g = () => {
              let n;
              return (
                (n = a
                  ? h
                  : c
                  ? f
                  : i.route.Component
                  ? t.createElement(i.route.Component, null)
                  : i.route.element
                  ? i.route.element
                  : e),
                t.createElement(ae, {
                  match: i,
                  routeContext: {
                    outlet: e,
                    matches: m,
                    isDataRoute: null != r,
                  },
                  children: n,
                })
              );
            };
          return r && (i.route.ErrorBoundary || i.route.errorElement || 0 === o)
            ? t.createElement(oe, {
                location: r.location,
                revalidation: r.revalidation,
                component: h,
                error: a,
                children: g(),
                routeContext: { outlet: null, matches: m, isDataRoute: !0 },
              })
            : g();
        }, null);
      }
      var le = (function (e) {
          return (
            (e.UseBlocker = "useBlocker"),
            (e.UseRevalidator = "useRevalidator"),
            (e.UseNavigateStable = "useNavigate"),
            e
          );
        })(le || {}),
        ce = (function (e) {
          return (
            (e.UseBlocker = "useBlocker"),
            (e.UseLoaderData = "useLoaderData"),
            (e.UseActionData = "useActionData"),
            (e.UseRouteError = "useRouteError"),
            (e.UseNavigation = "useNavigation"),
            (e.UseRouteLoaderData = "useRouteLoaderData"),
            (e.UseMatches = "useMatches"),
            (e.UseRevalidator = "useRevalidator"),
            (e.UseNavigateStable = "useNavigate"),
            (e.UseRouteId = "useRouteId"),
            e
          );
        })(ce || {});
      function ue(e) {
        let n = t.useContext(H);
        return n || c(!1), n;
      }
      function de(e) {
        let n = t.useContext(Y);
        return n || c(!1), n;
      }
      function he(e) {
        let n = (function () {
            let e = t.useContext(K);
            return e || c(!1), e;
          })(),
          r = n.matches[n.matches.length - 1];
        return r.route.id || c(!1), r.route.id;
      }
      const fe = {};
      function pe(e, t) {
        null == e || e.v7_startTransition,
          void 0 === (null == e ? void 0 : e.v7_relativeSplatPath) &&
            (!t || t.v7_relativeSplatPath),
          t &&
            (t.v7_fetcherPersist,
            t.v7_normalizeFormMethod,
            t.v7_partialHydration,
            t.v7_skipActionErrorRevalidation);
      }
      r.startTransition;
      function me(e) {
        c(!1);
      }
      function ge(n) {
        let {
          basename: r = "/",
          children: i = null,
          location: o,
          navigationType: a = e.Pop,
          navigator: s,
          static: l = !1,
          future: u,
        } = n;
        X() && c(!1);
        let d = r.replace(/^\/*/, "/"),
          h = t.useMemo(
            () => ({
              basename: d,
              navigator: s,
              static: l,
              future: $({ v7_relativeSplatPath: !1 }, u),
            }),
            [d, u, s, l]
          );
        "string" === typeof o && (o = p(o));
        let {
            pathname: f = "/",
            search: m = "",
            hash: g = "",
            state: v = null,
            key: y = "default",
          } = o,
          x = t.useMemo(() => {
            let e = A(f, d);
            return null == e
              ? null
              : {
                  location: {
                    pathname: e,
                    search: m,
                    hash: g,
                    state: v,
                    key: y,
                  },
                  navigationType: a,
                };
          }, [d, f, m, g, v, y, a]);
        return null == x
          ? null
          : t.createElement(
              q.Provider,
              { value: h },
              t.createElement(G.Provider, { children: i, value: x })
            );
      }
      function ve(e) {
        let { children: t, location: n } = e;
        return ne(ye(t), n);
      }
      new Promise(() => {});
      t.Component;
      function ye(e, n) {
        void 0 === n && (n = []);
        let r = [];
        return (
          t.Children.forEach(e, (e, i) => {
            if (!t.isValidElement(e)) return;
            let o = [...n, i];
            if (e.type === t.Fragment)
              return void r.push.apply(r, ye(e.props.children, o));
            e.type !== me && c(!1), e.props.index && e.props.children && c(!1);
            let a = {
              id: e.props.id || o.join("-"),
              caseSensitive: e.props.caseSensitive,
              element: e.props.element,
              Component: e.props.Component,
              index: e.props.index,
              path: e.props.path,
              loader: e.props.loader,
              action: e.props.action,
              errorElement: e.props.errorElement,
              ErrorBoundary: e.props.ErrorBoundary,
              hasErrorBoundary:
                null != e.props.ErrorBoundary || null != e.props.errorElement,
              shouldRevalidate: e.props.shouldRevalidate,
              handle: e.props.handle,
              lazy: e.props.lazy,
            };
            e.props.children && (a.children = ye(e.props.children, o)),
              r.push(a);
          }),
          r
        );
      }
      function xe() {
        return (
          (xe = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var r in n)
                    Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
                }
                return e;
              }),
          xe.apply(this, arguments)
        );
      }
      function be(e, t) {
        if (null == e) return {};
        var n,
          r,
          i = {},
          o = Object.keys(e);
        for (r = 0; r < o.length; r++)
          (n = o[r]), t.indexOf(n) >= 0 || (i[n] = e[n]);
        return i;
      }
      new Set([
        "application/x-www-form-urlencoded",
        "multipart/form-data",
        "text/plain",
      ]);
      const we = [
        "onClick",
        "relative",
        "reloadDocument",
        "replace",
        "state",
        "target",
        "to",
        "preventScrollReset",
        "viewTransition",
      ];
      try {
        window.__reactRouterVersion = "6";
      } catch (Yp) {}
      new Map();
      const Se = r.startTransition;
      a.flushSync, r.useId;
      function ke(e) {
        let { basename: n, children: r, future: i, window: o } = e,
          a = t.useRef();
        var s;
        null == a.current &&
          (a.current =
            (void 0 === (s = { window: o, v5Compat: !0 }) && (s = {}),
            m(
              function (e, t) {
                let { pathname: n, search: r, hash: i } = e.location;
                return h(
                  "",
                  { pathname: n, search: r, hash: i },
                  (t.state && t.state.usr) || null,
                  (t.state && t.state.key) || "default"
                );
              },
              function (e, t) {
                return "string" === typeof t ? t : f(t);
              },
              null,
              s
            )));
        let l = a.current,
          [c, u] = t.useState({ action: l.action, location: l.location }),
          { v7_startTransition: d } = i || {},
          p = t.useCallback(
            (e) => {
              d && Se ? Se(() => u(e)) : u(e);
            },
            [u, d]
          );
        return (
          t.useLayoutEffect(() => l.listen(p), [l, p]),
          t.useEffect(() => pe(i), [i]),
          t.createElement(ge, {
            basename: n,
            children: r,
            location: c.location,
            navigationType: c.action,
            navigator: l,
            future: i,
          })
        );
      }
      const je =
          "undefined" !== typeof window &&
          "undefined" !== typeof window.document &&
          "undefined" !== typeof window.document.createElement,
        Ce = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
        Pe = t.forwardRef(function (e, n) {
          let r,
            {
              onClick: i,
              relative: o,
              reloadDocument: a,
              replace: s,
              state: l,
              target: u,
              to: d,
              preventScrollReset: h,
              viewTransition: p,
            } = e,
            m = be(e, we),
            { basename: g } = t.useContext(q),
            v = !1;
          if ("string" === typeof d && Ce.test(d) && ((r = d), je))
            try {
              let e = new URL(window.location.href),
                t = d.startsWith("//") ? new URL(e.protocol + d) : new URL(d),
                n = A(t.pathname, g);
              t.origin === e.origin && null != n
                ? (d = n + t.search + t.hash)
                : (v = !0);
            } catch (Yp) {}
          let y = (function (e, n) {
              let { relative: r } = void 0 === n ? {} : n;
              X() || c(!1);
              let { basename: i, navigator: o } = t.useContext(q),
                { hash: a, pathname: s, search: l } = te(e, { relative: r }),
                u = s;
              return (
                "/" !== i && (u = "/" === s ? i : M([i, s])),
                o.createHref({ pathname: u, search: l, hash: a })
              );
            })(d, { relative: o }),
            x = (function (e, n) {
              let {
                  target: r,
                  replace: i,
                  state: o,
                  preventScrollReset: a,
                  relative: s,
                  viewTransition: l,
                } = void 0 === n ? {} : n,
                c = ee(),
                u = J(),
                d = te(e, { relative: s });
              return t.useCallback(
                (t) => {
                  if (
                    (function (e, t) {
                      return (
                        0 === e.button &&
                        (!t || "_self" === t) &&
                        !(function (e) {
                          return !!(
                            e.metaKey ||
                            e.altKey ||
                            e.ctrlKey ||
                            e.shiftKey
                          );
                        })(e)
                      );
                    })(t, r)
                  ) {
                    t.preventDefault();
                    let n = void 0 !== i ? i : f(u) === f(d);
                    c(e, {
                      replace: n,
                      state: o,
                      preventScrollReset: a,
                      relative: s,
                      viewTransition: l,
                    });
                  }
                },
                [u, c, d, i, o, r, e, a, s, l]
              );
            })(d, {
              replace: s,
              state: l,
              target: u,
              preventScrollReset: h,
              relative: o,
              viewTransition: p,
            });
          return t.createElement(
            "a",
            xe({}, m, {
              href: r || y,
              onClick:
                v || a
                  ? i
                  : function (e) {
                      i && i(e), e.defaultPrevented || x(e);
                    },
              ref: n,
              target: u,
            })
          );
        });
      var Ee, Te;
      (function (e) {
        (e.UseScrollRestoration = "useScrollRestoration"),
          (e.UseSubmit = "useSubmit"),
          (e.UseSubmitFetcher = "useSubmitFetcher"),
          (e.UseFetcher = "useFetcher"),
          (e.useViewTransitionState = "useViewTransitionState");
      })(Ee || (Ee = {})),
        (function (e) {
          (e.UseFetcher = "useFetcher"),
            (e.UseFetchers = "useFetchers"),
            (e.UseScrollRestoration = "useScrollRestoration");
        })(Te || (Te = {}));
      var Re = function () {
        return (
          (Re =
            Object.assign ||
            function (e) {
              for (var t, n = 1, r = arguments.length; n < r; n++)
                for (var i in (t = arguments[n]))
                  Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
              return e;
            }),
          Re.apply(this, arguments)
        );
      };
      Object.create;
      function _e(e, t, n) {
        if (n || 2 === arguments.length)
          for (var r, i = 0, o = t.length; i < o; i++)
            (!r && i in t) ||
              (r || (r = Array.prototype.slice.call(t, 0, i)), (r[i] = t[i]));
        return e.concat(r || Array.prototype.slice.call(t));
      }
      Object.create;
      "function" === typeof SuppressedError && SuppressedError;
      var Oe = n(324),
        Ae = n.n(Oe),
        ze = "-ms-",
        De = "-moz-",
        Ne = "-webkit-",
        Le = "comm",
        Me = "rule",
        Fe = "decl",
        Ie = "@keyframes",
        Ve = Math.abs,
        Be = String.fromCharCode,
        Ue = Object.assign;
      function We(e) {
        return e.trim();
      }
      function $e(e, t) {
        return (e = t.exec(e)) ? e[0] : e;
      }
      function He(e, t, n) {
        return e.replace(t, n);
      }
      function Ye(e, t, n) {
        return e.indexOf(t, n);
      }
      function qe(e, t) {
        return 0 | e.charCodeAt(t);
      }
      function Ge(e, t, n) {
        return e.slice(t, n);
      }
      function Ke(e) {
        return e.length;
      }
      function Qe(e) {
        return e.length;
      }
      function Xe(e, t) {
        return t.push(e), e;
      }
      function Je(e, t) {
        return e.filter(function (e) {
          return !$e(e, t);
        });
      }
      var Ze = 1,
        et = 1,
        tt = 0,
        nt = 0,
        rt = 0,
        it = "";
      function ot(e, t, n, r, i, o, a, s) {
        return {
          value: e,
          root: t,
          parent: n,
          type: r,
          props: i,
          children: o,
          line: Ze,
          column: et,
          length: a,
          return: "",
          siblings: s,
        };
      }
      function at(e, t) {
        return Ue(
          ot("", null, null, "", null, null, 0, e.siblings),
          e,
          { length: -e.length },
          t
        );
      }
      function st(e) {
        for (; e.root; ) e = at(e.root, { children: [e] });
        Xe(e, e.siblings);
      }
      function lt() {
        return (
          (rt = nt > 0 ? qe(it, --nt) : 0),
          et--,
          10 === rt && ((et = 1), Ze--),
          rt
        );
      }
      function ct() {
        return (
          (rt = nt < tt ? qe(it, nt++) : 0),
          et++,
          10 === rt && ((et = 1), Ze++),
          rt
        );
      }
      function ut() {
        return qe(it, nt);
      }
      function dt() {
        return nt;
      }
      function ht(e, t) {
        return Ge(it, e, t);
      }
      function ft(e) {
        switch (e) {
          case 0:
          case 9:
          case 10:
          case 13:
          case 32:
            return 5;
          case 33:
          case 43:
          case 44:
          case 47:
          case 62:
          case 64:
          case 126:
          case 59:
          case 123:
          case 125:
            return 4;
          case 58:
            return 3;
          case 34:
          case 39:
          case 40:
          case 91:
            return 2;
          case 41:
          case 93:
            return 1;
        }
        return 0;
      }
      function pt(e) {
        return (Ze = et = 1), (tt = Ke((it = e))), (nt = 0), [];
      }
      function mt(e) {
        return (it = ""), e;
      }
      function gt(e) {
        return We(ht(nt - 1, xt(91 === e ? e + 2 : 40 === e ? e + 1 : e)));
      }
      function vt(e) {
        for (; (rt = ut()) && rt < 33; ) ct();
        return ft(e) > 2 || ft(rt) > 3 ? "" : " ";
      }
      function yt(e, t) {
        for (
          ;
          --t &&
          ct() &&
          !(
            rt < 48 ||
            rt > 102 ||
            (rt > 57 && rt < 65) ||
            (rt > 70 && rt < 97)
          );

        );
        return ht(e, dt() + (t < 6 && 32 == ut() && 32 == ct()));
      }
      function xt(e) {
        for (; ct(); )
          switch (rt) {
            case e:
              return nt;
            case 34:
            case 39:
              34 !== e && 39 !== e && xt(rt);
              break;
            case 40:
              41 === e && xt(e);
              break;
            case 92:
              ct();
          }
        return nt;
      }
      function bt(e, t) {
        for (; ct() && e + rt !== 57 && (e + rt !== 84 || 47 !== ut()); );
        return "/*" + ht(t, nt - 1) + "*" + Be(47 === e ? e : ct());
      }
      function wt(e) {
        for (; !ft(ut()); ) ct();
        return ht(e, nt);
      }
      function St(e, t) {
        for (var n = "", r = 0; r < e.length; r++) n += t(e[r], r, e, t) || "";
        return n;
      }
      function kt(e, t, n, r) {
        switch (e.type) {
          case "@layer":
            if (e.children.length) break;
          case "@import":
          case Fe:
            return (e.return = e.return || e.value);
          case Le:
            return "";
          case Ie:
            return (e.return = e.value + "{" + St(e.children, r) + "}");
          case Me:
            if (!Ke((e.value = e.props.join(",")))) return "";
        }
        return Ke((n = St(e.children, r)))
          ? (e.return = e.value + "{" + n + "}")
          : "";
      }
      function jt(e, t, n) {
        switch (
          (function (e, t) {
            return 45 ^ qe(e, 0)
              ? (((((((t << 2) ^ qe(e, 0)) << 2) ^ qe(e, 1)) << 2) ^
                  qe(e, 2)) <<
                  2) ^
                  qe(e, 3)
              : 0;
          })(e, t)
        ) {
          case 5103:
            return Ne + "print-" + e + e;
          case 5737:
          case 4201:
          case 3177:
          case 3433:
          case 1641:
          case 4457:
          case 2921:
          case 5572:
          case 6356:
          case 5844:
          case 3191:
          case 6645:
          case 3005:
          case 6391:
          case 5879:
          case 5623:
          case 6135:
          case 4599:
          case 4855:
          case 4215:
          case 6389:
          case 5109:
          case 5365:
          case 5621:
          case 3829:
            return Ne + e + e;
          case 4789:
            return De + e + e;
          case 5349:
          case 4246:
          case 4810:
          case 6968:
          case 2756:
            return Ne + e + De + e + ze + e + e;
          case 5936:
            switch (qe(e, t + 11)) {
              case 114:
                return Ne + e + ze + He(e, /[svh]\w+-[tblr]{2}/, "tb") + e;
              case 108:
                return Ne + e + ze + He(e, /[svh]\w+-[tblr]{2}/, "tb-rl") + e;
              case 45:
                return Ne + e + ze + He(e, /[svh]\w+-[tblr]{2}/, "lr") + e;
            }
          case 6828:
          case 4268:
          case 2903:
            return Ne + e + ze + e + e;
          case 6165:
            return Ne + e + ze + "flex-" + e + e;
          case 5187:
            return (
              Ne +
              e +
              He(e, /(\w+).+(:[^]+)/, Ne + "box-$1$2" + ze + "flex-$1$2") +
              e
            );
          case 5443:
            return (
              Ne +
              e +
              ze +
              "flex-item-" +
              He(e, /flex-|-self/g, "") +
              ($e(e, /flex-|baseline/)
                ? ""
                : ze + "grid-row-" + He(e, /flex-|-self/g, "")) +
              e
            );
          case 4675:
            return (
              Ne +
              e +
              ze +
              "flex-line-pack" +
              He(e, /align-content|flex-|-self/g, "") +
              e
            );
          case 5548:
            return Ne + e + ze + He(e, "shrink", "negative") + e;
          case 5292:
            return Ne + e + ze + He(e, "basis", "preferred-size") + e;
          case 6060:
            return (
              Ne +
              "box-" +
              He(e, "-grow", "") +
              Ne +
              e +
              ze +
              He(e, "grow", "positive") +
              e
            );
          case 4554:
            return Ne + He(e, /([^-])(transform)/g, "$1" + Ne + "$2") + e;
          case 6187:
            return (
              He(
                He(He(e, /(zoom-|grab)/, Ne + "$1"), /(image-set)/, Ne + "$1"),
                e,
                ""
              ) + e
            );
          case 5495:
          case 3959:
            return He(e, /(image-set\([^]*)/, Ne + "$1$`$1");
          case 4968:
            return (
              He(
                He(
                  e,
                  /(.+:)(flex-)?(.*)/,
                  Ne + "box-pack:$3" + ze + "flex-pack:$3"
                ),
                /s.+-b[^;]+/,
                "justify"
              ) +
              Ne +
              e +
              e
            );
          case 4200:
            if (!$e(e, /flex-|baseline/))
              return ze + "grid-column-align" + Ge(e, t) + e;
            break;
          case 2592:
          case 3360:
            return ze + He(e, "template-", "") + e;
          case 4384:
          case 3616:
            return n &&
              n.some(function (e, n) {
                return (t = n), $e(e.props, /grid-\w+-end/);
              })
              ? ~Ye(e + (n = n[t].value), "span", 0)
                ? e
                : ze +
                  He(e, "-start", "") +
                  e +
                  ze +
                  "grid-row-span:" +
                  (~Ye(n, "span", 0)
                    ? $e(n, /\d+/)
                    : +$e(n, /\d+/) - +$e(e, /\d+/)) +
                  ";"
              : ze + He(e, "-start", "") + e;
          case 4896:
          case 4128:
            return n &&
              n.some(function (e) {
                return $e(e.props, /grid-\w+-start/);
              })
              ? e
              : ze + He(He(e, "-end", "-span"), "span ", "") + e;
          case 4095:
          case 3583:
          case 4068:
          case 2532:
            return He(e, /(.+)-inline(.+)/, Ne + "$1$2") + e;
          case 8116:
          case 7059:
          case 5753:
          case 5535:
          case 5445:
          case 5701:
          case 4933:
          case 4677:
          case 5533:
          case 5789:
          case 5021:
          case 4765:
            if (Ke(e) - 1 - t > 6)
              switch (qe(e, t + 1)) {
                case 109:
                  if (45 !== qe(e, t + 4)) break;
                case 102:
                  return (
                    He(
                      e,
                      /(.+:)(.+)-([^]+)/,
                      "$1" +
                        Ne +
                        "$2-$3$1" +
                        De +
                        (108 == qe(e, t + 3) ? "$3" : "$2-$3")
                    ) + e
                  );
                case 115:
                  return ~Ye(e, "stretch", 0)
                    ? jt(He(e, "stretch", "fill-available"), t, n) + e
                    : e;
              }
            break;
          case 5152:
          case 5920:
            return He(
              e,
              /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,
              function (t, n, r, i, o, a, s) {
                return (
                  ze +
                  n +
                  ":" +
                  r +
                  s +
                  (i ? ze + n + "-span:" + (o ? a : +a - +r) + s : "") +
                  e
                );
              }
            );
          case 4949:
            if (121 === qe(e, t + 6)) return He(e, ":", ":" + Ne) + e;
            break;
          case 6444:
            switch (qe(e, 45 === qe(e, 14) ? 18 : 11)) {
              case 120:
                return (
                  He(
                    e,
                    /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,
                    "$1" +
                      Ne +
                      (45 === qe(e, 14) ? "inline-" : "") +
                      "box$3$1" +
                      Ne +
                      "$2$3$1" +
                      ze +
                      "$2box$3"
                  ) + e
                );
              case 100:
                return He(e, ":", ":" + ze) + e;
            }
            break;
          case 5719:
          case 2647:
          case 2135:
          case 3927:
          case 2391:
            return He(e, "scroll-", "scroll-snap-") + e;
        }
        return e;
      }
      function Ct(e, t, n, r) {
        if (e.length > -1 && !e.return)
          switch (e.type) {
            case Fe:
              return void (e.return = jt(e.value, e.length, n));
            case Ie:
              return St([at(e, { value: He(e.value, "@", "@" + Ne) })], r);
            case Me:
              if (e.length)
                return (function (e, t) {
                  return e.map(t).join("");
                })((n = e.props), function (t) {
                  switch ($e(t, (r = /(::plac\w+|:read-\w+)/))) {
                    case ":read-only":
                    case ":read-write":
                      st(at(e, { props: [He(t, /:(read-\w+)/, ":-moz-$1")] })),
                        st(at(e, { props: [t] })),
                        Ue(e, { props: Je(n, r) });
                      break;
                    case "::placeholder":
                      st(
                        at(e, {
                          props: [He(t, /:(plac\w+)/, ":" + Ne + "input-$1")],
                        })
                      ),
                        st(at(e, { props: [He(t, /:(plac\w+)/, ":-moz-$1")] })),
                        st(
                          at(e, {
                            props: [He(t, /:(plac\w+)/, ze + "input-$1")],
                          })
                        ),
                        st(at(e, { props: [t] })),
                        Ue(e, { props: Je(n, r) });
                  }
                  return "";
                });
          }
      }
      function Pt(e) {
        return mt(Et("", null, null, null, [""], (e = pt(e)), 0, [0], e));
      }
      function Et(e, t, n, r, i, o, a, s, l) {
        for (
          var c = 0,
            u = 0,
            d = a,
            h = 0,
            f = 0,
            p = 0,
            m = 1,
            g = 1,
            v = 1,
            y = 0,
            x = "",
            b = i,
            w = o,
            S = r,
            k = x;
          g;

        )
          switch (((p = y), (y = ct()))) {
            case 40:
              if (108 != p && 58 == qe(k, d - 1)) {
                -1 !=
                  Ye(
                    (k += He(gt(y), "&", "&\f")),
                    "&\f",
                    Ve(c ? s[c - 1] : 0)
                  ) && (v = -1);
                break;
              }
            case 34:
            case 39:
            case 91:
              k += gt(y);
              break;
            case 9:
            case 10:
            case 13:
            case 32:
              k += vt(p);
              break;
            case 92:
              k += yt(dt() - 1, 7);
              continue;
            case 47:
              switch (ut()) {
                case 42:
                case 47:
                  Xe(Rt(bt(ct(), dt()), t, n, l), l);
                  break;
                default:
                  k += "/";
              }
              break;
            case 123 * m:
              s[c++] = Ke(k) * v;
            case 125 * m:
            case 59:
            case 0:
              switch (y) {
                case 0:
                case 125:
                  g = 0;
                case 59 + u:
                  -1 == v && (k = He(k, /\f/g, "")),
                    f > 0 &&
                      Ke(k) - d &&
                      Xe(
                        f > 32
                          ? _t(k + ";", r, n, d - 1, l)
                          : _t(He(k, " ", "") + ";", r, n, d - 2, l),
                        l
                      );
                  break;
                case 59:
                  k += ";";
                default:
                  if (
                    (Xe(
                      (S = Tt(
                        k,
                        t,
                        n,
                        c,
                        u,
                        i,
                        s,
                        x,
                        (b = []),
                        (w = []),
                        d,
                        o
                      )),
                      o
                    ),
                    123 === y)
                  )
                    if (0 === u) Et(k, t, S, S, b, o, d, s, w);
                    else
                      switch (99 === h && 110 === qe(k, 3) ? 100 : h) {
                        case 100:
                        case 108:
                        case 109:
                        case 115:
                          Et(
                            e,
                            S,
                            S,
                            r &&
                              Xe(
                                Tt(e, S, S, 0, 0, i, s, x, i, (b = []), d, w),
                                w
                              ),
                            i,
                            w,
                            d,
                            s,
                            r ? b : w
                          );
                          break;
                        default:
                          Et(k, S, S, S, [""], w, 0, s, w);
                      }
              }
              (c = u = f = 0), (m = v = 1), (x = k = ""), (d = a);
              break;
            case 58:
              (d = 1 + Ke(k)), (f = p);
            default:
              if (m < 1)
                if (123 == y) --m;
                else if (125 == y && 0 == m++ && 125 == lt()) continue;
              switch (((k += Be(y)), y * m)) {
                case 38:
                  v = u > 0 ? 1 : ((k += "\f"), -1);
                  break;
                case 44:
                  (s[c++] = (Ke(k) - 1) * v), (v = 1);
                  break;
                case 64:
                  45 === ut() && (k += gt(ct())),
                    (h = ut()),
                    (u = d = Ke((x = k += wt(dt())))),
                    y++;
                  break;
                case 45:
                  45 === p && 2 == Ke(k) && (m = 0);
              }
          }
        return o;
      }
      function Tt(e, t, n, r, i, o, a, s, l, c, u, d) {
        for (
          var h = i - 1, f = 0 === i ? o : [""], p = Qe(f), m = 0, g = 0, v = 0;
          m < r;
          ++m
        )
          for (
            var y = 0, x = Ge(e, h + 1, (h = Ve((g = a[m])))), b = e;
            y < p;
            ++y
          )
            (b = We(g > 0 ? f[y] + " " + x : He(x, /&\f/g, f[y]))) &&
              (l[v++] = b);
        return ot(e, t, n, 0 === i ? Me : s, l, c, u, d);
      }
      function Rt(e, t, n, r) {
        return ot(e, t, n, Le, Be(rt), Ge(e, 2, -2), 0, r);
      }
      function _t(e, t, n, r, i) {
        return ot(e, t, n, Fe, Ge(e, 0, r), Ge(e, r + 1, -1), r, i);
      }
      var Ot = {
          animationIterationCount: 1,
          aspectRatio: 1,
          borderImageOutset: 1,
          borderImageSlice: 1,
          borderImageWidth: 1,
          boxFlex: 1,
          boxFlexGroup: 1,
          boxOrdinalGroup: 1,
          columnCount: 1,
          columns: 1,
          flex: 1,
          flexGrow: 1,
          flexPositive: 1,
          flexShrink: 1,
          flexNegative: 1,
          flexOrder: 1,
          gridRow: 1,
          gridRowEnd: 1,
          gridRowSpan: 1,
          gridRowStart: 1,
          gridColumn: 1,
          gridColumnEnd: 1,
          gridColumnSpan: 1,
          gridColumnStart: 1,
          msGridRow: 1,
          msGridRowSpan: 1,
          msGridColumn: 1,
          msGridColumnSpan: 1,
          fontWeight: 1,
          lineHeight: 1,
          opacity: 1,
          order: 1,
          orphans: 1,
          tabSize: 1,
          widows: 1,
          zIndex: 1,
          zoom: 1,
          WebkitLineClamp: 1,
          fillOpacity: 1,
          floodOpacity: 1,
          stopOpacity: 1,
          strokeDasharray: 1,
          strokeDashoffset: 1,
          strokeMiterlimit: 1,
          strokeOpacity: 1,
          strokeWidth: 1,
        },
        At =
          ("undefined" != typeof process &&
            void 0 !==
              {
                NODE_ENV: "production",
                PUBLIC_URL: "",
                WDS_SOCKET_HOST: void 0,
                WDS_SOCKET_PATH: void 0,
                WDS_SOCKET_PORT: void 0,
                FAST_REFRESH: !0,
              } &&
            ({
              NODE_ENV: "production",
              PUBLIC_URL: "",
              WDS_SOCKET_HOST: void 0,
              WDS_SOCKET_PATH: void 0,
              WDS_SOCKET_PORT: void 0,
              FAST_REFRESH: !0,
            }.REACT_APP_SC_ATTR ||
              {
                NODE_ENV: "production",
                PUBLIC_URL: "",
                WDS_SOCKET_HOST: void 0,
                WDS_SOCKET_PATH: void 0,
                WDS_SOCKET_PORT: void 0,
                FAST_REFRESH: !0,
              }.SC_ATTR)) ||
          "data-styled",
        zt = "active",
        Dt = "data-styled-version",
        Nt = "6.1.17",
        Lt = "/*!sc*/\n",
        Mt = "undefined" != typeof window && "HTMLElement" in window,
        Ft = Boolean(
          "boolean" == typeof SC_DISABLE_SPEEDY
            ? SC_DISABLE_SPEEDY
            : "undefined" != typeof process &&
              void 0 !==
                {
                  NODE_ENV: "production",
                  PUBLIC_URL: "",
                  WDS_SOCKET_HOST: void 0,
                  WDS_SOCKET_PATH: void 0,
                  WDS_SOCKET_PORT: void 0,
                  FAST_REFRESH: !0,
                } &&
              void 0 !==
                {
                  NODE_ENV: "production",
                  PUBLIC_URL: "",
                  WDS_SOCKET_HOST: void 0,
                  WDS_SOCKET_PATH: void 0,
                  WDS_SOCKET_PORT: void 0,
                  FAST_REFRESH: !0,
                }.REACT_APP_SC_DISABLE_SPEEDY &&
              "" !==
                {
                  NODE_ENV: "production",
                  PUBLIC_URL: "",
                  WDS_SOCKET_HOST: void 0,
                  WDS_SOCKET_PATH: void 0,
                  WDS_SOCKET_PORT: void 0,
                  FAST_REFRESH: !0,
                }.REACT_APP_SC_DISABLE_SPEEDY
            ? "false" !==
                {
                  NODE_ENV: "production",
                  PUBLIC_URL: "",
                  WDS_SOCKET_HOST: void 0,
                  WDS_SOCKET_PATH: void 0,
                  WDS_SOCKET_PORT: void 0,
                  FAST_REFRESH: !0,
                }.REACT_APP_SC_DISABLE_SPEEDY &&
              {
                NODE_ENV: "production",
                PUBLIC_URL: "",
                WDS_SOCKET_HOST: void 0,
                WDS_SOCKET_PATH: void 0,
                WDS_SOCKET_PORT: void 0,
                FAST_REFRESH: !0,
              }.REACT_APP_SC_DISABLE_SPEEDY
            : "undefined" != typeof process &&
              void 0 !==
                {
                  NODE_ENV: "production",
                  PUBLIC_URL: "",
                  WDS_SOCKET_HOST: void 0,
                  WDS_SOCKET_PATH: void 0,
                  WDS_SOCKET_PORT: void 0,
                  FAST_REFRESH: !0,
                } &&
              void 0 !==
                {
                  NODE_ENV: "production",
                  PUBLIC_URL: "",
                  WDS_SOCKET_HOST: void 0,
                  WDS_SOCKET_PATH: void 0,
                  WDS_SOCKET_PORT: void 0,
                  FAST_REFRESH: !0,
                }.SC_DISABLE_SPEEDY &&
              "" !==
                {
                  NODE_ENV: "production",
                  PUBLIC_URL: "",
                  WDS_SOCKET_HOST: void 0,
                  WDS_SOCKET_PATH: void 0,
                  WDS_SOCKET_PORT: void 0,
                  FAST_REFRESH: !0,
                }.SC_DISABLE_SPEEDY &&
              "false" !==
                {
                  NODE_ENV: "production",
                  PUBLIC_URL: "",
                  WDS_SOCKET_HOST: void 0,
                  WDS_SOCKET_PATH: void 0,
                  WDS_SOCKET_PORT: void 0,
                  FAST_REFRESH: !0,
                }.SC_DISABLE_SPEEDY &&
              {
                NODE_ENV: "production",
                PUBLIC_URL: "",
                WDS_SOCKET_HOST: void 0,
                WDS_SOCKET_PATH: void 0,
                WDS_SOCKET_PORT: void 0,
                FAST_REFRESH: !0,
              }.SC_DISABLE_SPEEDY
        ),
        It = (new Set(), Object.freeze([])),
        Vt = Object.freeze({});
      function Bt(e, t, n) {
        return (
          void 0 === n && (n = Vt),
          (e.theme !== n.theme && e.theme) || t || n.theme
        );
      }
      var Ut = new Set([
          "a",
          "abbr",
          "address",
          "area",
          "article",
          "aside",
          "audio",
          "b",
          "base",
          "bdi",
          "bdo",
          "big",
          "blockquote",
          "body",
          "br",
          "button",
          "canvas",
          "caption",
          "cite",
          "code",
          "col",
          "colgroup",
          "data",
          "datalist",
          "dd",
          "del",
          "details",
          "dfn",
          "dialog",
          "div",
          "dl",
          "dt",
          "em",
          "embed",
          "fieldset",
          "figcaption",
          "figure",
          "footer",
          "form",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "header",
          "hgroup",
          "hr",
          "html",
          "i",
          "iframe",
          "img",
          "input",
          "ins",
          "kbd",
          "keygen",
          "label",
          "legend",
          "li",
          "link",
          "main",
          "map",
          "mark",
          "menu",
          "menuitem",
          "meta",
          "meter",
          "nav",
          "noscript",
          "object",
          "ol",
          "optgroup",
          "option",
          "output",
          "p",
          "param",
          "picture",
          "pre",
          "progress",
          "q",
          "rp",
          "rt",
          "ruby",
          "s",
          "samp",
          "script",
          "section",
          "select",
          "small",
          "source",
          "span",
          "strong",
          "style",
          "sub",
          "summary",
          "sup",
          "table",
          "tbody",
          "td",
          "textarea",
          "tfoot",
          "th",
          "thead",
          "time",
          "tr",
          "track",
          "u",
          "ul",
          "use",
          "var",
          "video",
          "wbr",
          "circle",
          "clipPath",
          "defs",
          "ellipse",
          "foreignObject",
          "g",
          "image",
          "line",
          "linearGradient",
          "marker",
          "mask",
          "path",
          "pattern",
          "polygon",
          "polyline",
          "radialGradient",
          "rect",
          "stop",
          "svg",
          "text",
          "tspan",
        ]),
        Wt = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,
        $t = /(^-|-$)/g;
      function Ht(e) {
        return e.replace(Wt, "-").replace($t, "");
      }
      var Yt = /(a)(d)/gi,
        qt = function (e) {
          return String.fromCharCode(e + (e > 25 ? 39 : 97));
        };
      function Gt(e) {
        var t,
          n = "";
        for (t = Math.abs(e); t > 52; t = (t / 52) | 0) n = qt(t % 52) + n;
        return (qt(t % 52) + n).replace(Yt, "$1-$2");
      }
      var Kt,
        Qt = function (e, t) {
          for (var n = t.length; n; ) e = (33 * e) ^ t.charCodeAt(--n);
          return e;
        },
        Xt = function (e) {
          return Qt(5381, e);
        };
      function Jt(e) {
        return Gt(Xt(e) >>> 0);
      }
      function Zt(e) {
        return e.displayName || e.name || "Component";
      }
      function en(e) {
        return "string" == typeof e && !0;
      }
      var tn = "function" == typeof Symbol && Symbol.for,
        nn = tn ? Symbol.for("react.memo") : 60115,
        rn = tn ? Symbol.for("react.forward_ref") : 60112,
        on = {
          childContextTypes: !0,
          contextType: !0,
          contextTypes: !0,
          defaultProps: !0,
          displayName: !0,
          getDefaultProps: !0,
          getDerivedStateFromError: !0,
          getDerivedStateFromProps: !0,
          mixins: !0,
          propTypes: !0,
          type: !0,
        },
        an = {
          name: !0,
          length: !0,
          prototype: !0,
          caller: !0,
          callee: !0,
          arguments: !0,
          arity: !0,
        },
        sn = {
          $$typeof: !0,
          compare: !0,
          defaultProps: !0,
          displayName: !0,
          propTypes: !0,
          type: !0,
        },
        ln =
          (((Kt = {})[rn] = {
            $$typeof: !0,
            render: !0,
            defaultProps: !0,
            displayName: !0,
            propTypes: !0,
          }),
          (Kt[nn] = sn),
          Kt);
      function cn(e) {
        return ("type" in (t = e) && t.type.$$typeof) === nn
          ? sn
          : "$$typeof" in e
          ? ln[e.$$typeof]
          : on;
        var t;
      }
      var un = Object.defineProperty,
        dn = Object.getOwnPropertyNames,
        hn = Object.getOwnPropertySymbols,
        fn = Object.getOwnPropertyDescriptor,
        pn = Object.getPrototypeOf,
        mn = Object.prototype;
      function gn(e, t, n) {
        if ("string" != typeof t) {
          if (mn) {
            var r = pn(t);
            r && r !== mn && gn(e, r, n);
          }
          var i = dn(t);
          hn && (i = i.concat(hn(t)));
          for (var o = cn(e), a = cn(t), s = 0; s < i.length; ++s) {
            var l = i[s];
            if (!(l in an || (n && n[l]) || (a && l in a) || (o && l in o))) {
              var c = fn(t, l);
              try {
                un(e, l, c);
              } catch (e) {}
            }
          }
        }
        return e;
      }
      function vn(e) {
        return "function" == typeof e;
      }
      function yn(e) {
        return "object" == typeof e && "styledComponentId" in e;
      }
      function xn(e, t) {
        return e && t ? "".concat(e, " ").concat(t) : e || t || "";
      }
      function bn(e, t) {
        if (0 === e.length) return "";
        for (var n = e[0], r = 1; r < e.length; r++) n += t ? t + e[r] : e[r];
        return n;
      }
      function wn(e) {
        return (
          null !== e &&
          "object" == typeof e &&
          e.constructor.name === Object.name &&
          !("props" in e && e.$$typeof)
        );
      }
      function Sn(e, t, n) {
        if ((void 0 === n && (n = !1), !n && !wn(e) && !Array.isArray(e)))
          return t;
        if (Array.isArray(t))
          for (var r = 0; r < t.length; r++) e[r] = Sn(e[r], t[r]);
        else if (wn(t)) for (var r in t) e[r] = Sn(e[r], t[r]);
        return e;
      }
      function kn(e, t) {
        Object.defineProperty(e, "toString", { value: t });
      }
      function jn(e) {
        for (var t = [], n = 1; n < arguments.length; n++)
          t[n - 1] = arguments[n];
        return new Error(
          "An error occurred. See https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#"
            .concat(e, " for more information.")
            .concat(t.length > 0 ? " Args: ".concat(t.join(", ")) : "")
        );
      }
      var Cn = (function () {
          function e(e) {
            (this.groupSizes = new Uint32Array(512)),
              (this.length = 512),
              (this.tag = e);
          }
          return (
            (e.prototype.indexOfGroup = function (e) {
              for (var t = 0, n = 0; n < e; n++) t += this.groupSizes[n];
              return t;
            }),
            (e.prototype.insertRules = function (e, t) {
              if (e >= this.groupSizes.length) {
                for (var n = this.groupSizes, r = n.length, i = r; e >= i; )
                  if ((i <<= 1) < 0) throw jn(16, "".concat(e));
                (this.groupSizes = new Uint32Array(i)),
                  this.groupSizes.set(n),
                  (this.length = i);
                for (var o = r; o < i; o++) this.groupSizes[o] = 0;
              }
              for (
                var a = this.indexOfGroup(e + 1), s = ((o = 0), t.length);
                o < s;
                o++
              )
                this.tag.insertRule(a, t[o]) && (this.groupSizes[e]++, a++);
            }),
            (e.prototype.clearGroup = function (e) {
              if (e < this.length) {
                var t = this.groupSizes[e],
                  n = this.indexOfGroup(e),
                  r = n + t;
                this.groupSizes[e] = 0;
                for (var i = n; i < r; i++) this.tag.deleteRule(n);
              }
            }),
            (e.prototype.getGroup = function (e) {
              var t = "";
              if (e >= this.length || 0 === this.groupSizes[e]) return t;
              for (
                var n = this.groupSizes[e],
                  r = this.indexOfGroup(e),
                  i = r + n,
                  o = r;
                o < i;
                o++
              )
                t += "".concat(this.tag.getRule(o)).concat(Lt);
              return t;
            }),
            e
          );
        })(),
        Pn = new Map(),
        En = new Map(),
        Tn = 1,
        Rn = function (e) {
          if (Pn.has(e)) return Pn.get(e);
          for (; En.has(Tn); ) Tn++;
          var t = Tn++;
          return Pn.set(e, t), En.set(t, e), t;
        },
        _n = function (e, t) {
          (Tn = t + 1), Pn.set(e, t), En.set(t, e);
        },
        On = "style[".concat(At, "][").concat(Dt, '="').concat(Nt, '"]'),
        An = new RegExp(
          "^".concat(At, '\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)')
        ),
        zn = function (e, t, n) {
          for (var r, i = n.split(","), o = 0, a = i.length; o < a; o++)
            (r = i[o]) && e.registerName(t, r);
        },
        Dn = function (e, t) {
          for (
            var n,
              r = (null !== (n = t.textContent) && void 0 !== n ? n : "").split(
                Lt
              ),
              i = [],
              o = 0,
              a = r.length;
            o < a;
            o++
          ) {
            var s = r[o].trim();
            if (s) {
              var l = s.match(An);
              if (l) {
                var c = 0 | parseInt(l[1], 10),
                  u = l[2];
                0 !== c &&
                  (_n(u, c), zn(e, u, l[3]), e.getTag().insertRules(c, i)),
                  (i.length = 0);
              } else i.push(s);
            }
          }
        },
        Nn = function (e) {
          for (
            var t = document.querySelectorAll(On), n = 0, r = t.length;
            n < r;
            n++
          ) {
            var i = t[n];
            i &&
              i.getAttribute(At) !== zt &&
              (Dn(e, i), i.parentNode && i.parentNode.removeChild(i));
          }
        };
      function Ln() {
        return n.nc;
      }
      var Mn = function (e) {
          var t = document.head,
            n = e || t,
            r = document.createElement("style"),
            i = (function (e) {
              var t = Array.from(e.querySelectorAll("style[".concat(At, "]")));
              return t[t.length - 1];
            })(n),
            o = void 0 !== i ? i.nextSibling : null;
          r.setAttribute(At, zt), r.setAttribute(Dt, Nt);
          var a = Ln();
          return a && r.setAttribute("nonce", a), n.insertBefore(r, o), r;
        },
        Fn = (function () {
          function e(e) {
            (this.element = Mn(e)),
              this.element.appendChild(document.createTextNode("")),
              (this.sheet = (function (e) {
                if (e.sheet) return e.sheet;
                for (
                  var t = document.styleSheets, n = 0, r = t.length;
                  n < r;
                  n++
                ) {
                  var i = t[n];
                  if (i.ownerNode === e) return i;
                }
                throw jn(17);
              })(this.element)),
              (this.length = 0);
          }
          return (
            (e.prototype.insertRule = function (e, t) {
              try {
                return this.sheet.insertRule(t, e), this.length++, !0;
              } catch (e) {
                return !1;
              }
            }),
            (e.prototype.deleteRule = function (e) {
              this.sheet.deleteRule(e), this.length--;
            }),
            (e.prototype.getRule = function (e) {
              var t = this.sheet.cssRules[e];
              return t && t.cssText ? t.cssText : "";
            }),
            e
          );
        })(),
        In = (function () {
          function e(e) {
            (this.element = Mn(e)),
              (this.nodes = this.element.childNodes),
              (this.length = 0);
          }
          return (
            (e.prototype.insertRule = function (e, t) {
              if (e <= this.length && e >= 0) {
                var n = document.createTextNode(t);
                return (
                  this.element.insertBefore(n, this.nodes[e] || null),
                  this.length++,
                  !0
                );
              }
              return !1;
            }),
            (e.prototype.deleteRule = function (e) {
              this.element.removeChild(this.nodes[e]), this.length--;
            }),
            (e.prototype.getRule = function (e) {
              return e < this.length ? this.nodes[e].textContent : "";
            }),
            e
          );
        })(),
        Vn = (function () {
          function e(e) {
            (this.rules = []), (this.length = 0);
          }
          return (
            (e.prototype.insertRule = function (e, t) {
              return (
                e <= this.length &&
                (this.rules.splice(e, 0, t), this.length++, !0)
              );
            }),
            (e.prototype.deleteRule = function (e) {
              this.rules.splice(e, 1), this.length--;
            }),
            (e.prototype.getRule = function (e) {
              return e < this.length ? this.rules[e] : "";
            }),
            e
          );
        })(),
        Bn = Mt,
        Un = { isServer: !Mt, useCSSOMInjection: !Ft },
        Wn = (function () {
          function e(e, t, n) {
            void 0 === e && (e = Vt), void 0 === t && (t = {});
            var r = this;
            (this.options = Re(Re({}, Un), e)),
              (this.gs = t),
              (this.names = new Map(n)),
              (this.server = !!e.isServer),
              !this.server && Mt && Bn && ((Bn = !1), Nn(this)),
              kn(this, function () {
                return (function (e) {
                  for (
                    var t = e.getTag(),
                      n = t.length,
                      r = "",
                      i = function (n) {
                        var i = (function (e) {
                          return En.get(e);
                        })(n);
                        if (void 0 === i) return "continue";
                        var o = e.names.get(i),
                          a = t.getGroup(n);
                        if (void 0 === o || !o.size || 0 === a.length)
                          return "continue";
                        var s = ""
                            .concat(At, ".g")
                            .concat(n, '[id="')
                            .concat(i, '"]'),
                          l = "";
                        void 0 !== o &&
                          o.forEach(function (e) {
                            e.length > 0 && (l += "".concat(e, ","));
                          }),
                          (r += ""
                            .concat(a)
                            .concat(s, '{content:"')
                            .concat(l, '"}')
                            .concat(Lt));
                      },
                      o = 0;
                    o < n;
                    o++
                  )
                    i(o);
                  return r;
                })(r);
              });
          }
          return (
            (e.registerId = function (e) {
              return Rn(e);
            }),
            (e.prototype.rehydrate = function () {
              !this.server && Mt && Nn(this);
            }),
            (e.prototype.reconstructWithOptions = function (t, n) {
              return (
                void 0 === n && (n = !0),
                new e(
                  Re(Re({}, this.options), t),
                  this.gs,
                  (n && this.names) || void 0
                )
              );
            }),
            (e.prototype.allocateGSInstance = function (e) {
              return (this.gs[e] = (this.gs[e] || 0) + 1);
            }),
            (e.prototype.getTag = function () {
              return (
                this.tag ||
                (this.tag =
                  ((e = (function (e) {
                    var t = e.useCSSOMInjection,
                      n = e.target;
                    return e.isServer ? new Vn(n) : t ? new Fn(n) : new In(n);
                  })(this.options)),
                  new Cn(e)))
              );
              var e;
            }),
            (e.prototype.hasNameForId = function (e, t) {
              return this.names.has(e) && this.names.get(e).has(t);
            }),
            (e.prototype.registerName = function (e, t) {
              if ((Rn(e), this.names.has(e))) this.names.get(e).add(t);
              else {
                var n = new Set();
                n.add(t), this.names.set(e, n);
              }
            }),
            (e.prototype.insertRules = function (e, t, n) {
              this.registerName(e, t), this.getTag().insertRules(Rn(e), n);
            }),
            (e.prototype.clearNames = function (e) {
              this.names.has(e) && this.names.get(e).clear();
            }),
            (e.prototype.clearRules = function (e) {
              this.getTag().clearGroup(Rn(e)), this.clearNames(e);
            }),
            (e.prototype.clearTag = function () {
              this.tag = void 0;
            }),
            e
          );
        })(),
        $n = /&/g,
        Hn = /^\s*\/\/.*$/gm;
      function Yn(e, t) {
        return e.map(function (e) {
          return (
            "rule" === e.type &&
              ((e.value = "".concat(t, " ").concat(e.value)),
              (e.value = e.value.replaceAll(",", ",".concat(t, " "))),
              (e.props = e.props.map(function (e) {
                return "".concat(t, " ").concat(e);
              }))),
            Array.isArray(e.children) &&
              "@keyframes" !== e.type &&
              (e.children = Yn(e.children, t)),
            e
          );
        });
      }
      function qn(e) {
        var t,
          n,
          r,
          i = void 0 === e ? Vt : e,
          o = i.options,
          a = void 0 === o ? Vt : o,
          s = i.plugins,
          l = void 0 === s ? It : s,
          c = function (e, r, i) {
            return i.startsWith(n) &&
              i.endsWith(n) &&
              i.replaceAll(n, "").length > 0
              ? ".".concat(t)
              : e;
          },
          u = l.slice();
        u.push(function (e) {
          e.type === Me &&
            e.value.includes("&") &&
            (e.props[0] = e.props[0].replace($n, n).replace(r, c));
        }),
          a.prefix && u.push(Ct),
          u.push(kt);
        var d = function (e, i, o, s) {
          void 0 === i && (i = ""),
            void 0 === o && (o = ""),
            void 0 === s && (s = "&"),
            (t = s),
            (n = i),
            (r = new RegExp("\\".concat(n, "\\b"), "g"));
          var l = e.replace(Hn, ""),
            c = Pt(
              o || i ? "".concat(o, " ").concat(i, " { ").concat(l, " }") : l
            );
          a.namespace && (c = Yn(c, a.namespace));
          var d,
            h = [];
          return (
            St(
              c,
              (function (e) {
                var t = Qe(e);
                return function (n, r, i, o) {
                  for (var a = "", s = 0; s < t; s++)
                    a += e[s](n, r, i, o) || "";
                  return a;
                };
              })(
                u.concat(
                  ((d = function (e) {
                    return h.push(e);
                  }),
                  function (e) {
                    e.root || ((e = e.return) && d(e));
                  })
                )
              )
            ),
            h
          );
        };
        return (
          (d.hash = l.length
            ? l
                .reduce(function (e, t) {
                  return t.name || jn(15), Qt(e, t.name);
                }, 5381)
                .toString()
            : ""),
          d
        );
      }
      var Gn = new Wn(),
        Kn = qn(),
        Qn = t.createContext({
          shouldForwardProp: void 0,
          styleSheet: Gn,
          stylis: Kn,
        }),
        Xn = (Qn.Consumer, t.createContext(void 0));
      function Jn() {
        return (0, t.useContext)(Qn);
      }
      function Zn(e) {
        var n = (0, t.useState)(e.stylisPlugins),
          r = n[0],
          i = n[1],
          o = Jn().styleSheet,
          a = (0, t.useMemo)(
            function () {
              var t = o;
              return (
                e.sheet
                  ? (t = e.sheet)
                  : e.target &&
                    (t = t.reconstructWithOptions({ target: e.target }, !1)),
                e.disableCSSOMInjection &&
                  (t = t.reconstructWithOptions({ useCSSOMInjection: !1 })),
                t
              );
            },
            [e.disableCSSOMInjection, e.sheet, e.target, o]
          ),
          s = (0, t.useMemo)(
            function () {
              return qn({
                options: {
                  namespace: e.namespace,
                  prefix: e.enableVendorPrefixes,
                },
                plugins: r,
              });
            },
            [e.enableVendorPrefixes, e.namespace, r]
          );
        (0, t.useEffect)(
          function () {
            Ae()(r, e.stylisPlugins) || i(e.stylisPlugins);
          },
          [e.stylisPlugins]
        );
        var l = (0, t.useMemo)(
          function () {
            return {
              shouldForwardProp: e.shouldForwardProp,
              styleSheet: a,
              stylis: s,
            };
          },
          [e.shouldForwardProp, a, s]
        );
        return t.createElement(
          Qn.Provider,
          { value: l },
          t.createElement(Xn.Provider, { value: s }, e.children)
        );
      }
      var er = (function () {
          function e(e, t) {
            var n = this;
            (this.inject = function (e, t) {
              void 0 === t && (t = Kn);
              var r = n.name + t.hash;
              e.hasNameForId(n.id, r) ||
                e.insertRules(n.id, r, t(n.rules, r, "@keyframes"));
            }),
              (this.name = e),
              (this.id = "sc-keyframes-".concat(e)),
              (this.rules = t),
              kn(this, function () {
                throw jn(12, String(n.name));
              });
          }
          return (
            (e.prototype.getName = function (e) {
              return void 0 === e && (e = Kn), this.name + e.hash;
            }),
            e
          );
        })(),
        tr = function (e) {
          return e >= "A" && e <= "Z";
        };
      function nr(e) {
        for (var t = "", n = 0; n < e.length; n++) {
          var r = e[n];
          if (1 === n && "-" === r && "-" === e[0]) return e;
          tr(r) ? (t += "-" + r.toLowerCase()) : (t += r);
        }
        return t.startsWith("ms-") ? "-" + t : t;
      }
      var rr = function (e) {
          return null == e || !1 === e || "" === e;
        },
        ir = function (e) {
          var t,
            n,
            r = [];
          for (var i in e) {
            var o = e[i];
            e.hasOwnProperty(i) &&
              !rr(o) &&
              ((Array.isArray(o) && o.isCss) || vn(o)
                ? r.push("".concat(nr(i), ":"), o, ";")
                : wn(o)
                ? r.push.apply(
                    r,
                    _e(_e(["".concat(i, " {")], ir(o), !1), ["}"], !1)
                  )
                : r.push(
                    ""
                      .concat(nr(i), ": ")
                      .concat(
                        ((t = i),
                        null == (n = o) || "boolean" == typeof n || "" === n
                          ? ""
                          : "number" != typeof n ||
                            0 === n ||
                            t in Ot ||
                            t.startsWith("--")
                          ? String(n).trim()
                          : "".concat(n, "px")),
                        ";"
                      )
                  ));
          }
          return r;
        };
      function or(e, t, n, r) {
        return rr(e)
          ? []
          : yn(e)
          ? [".".concat(e.styledComponentId)]
          : vn(e)
          ? !vn((i = e)) || (i.prototype && i.prototype.isReactComponent) || !t
            ? [e]
            : or(e(t), t, n, r)
          : e instanceof er
          ? n
            ? (e.inject(n, r), [e.getName(r)])
            : [e]
          : wn(e)
          ? ir(e)
          : Array.isArray(e)
          ? Array.prototype.concat.apply(
              It,
              e.map(function (e) {
                return or(e, t, n, r);
              })
            )
          : [e.toString()];
        var i;
      }
      function ar(e) {
        for (var t = 0; t < e.length; t += 1) {
          var n = e[t];
          if (vn(n) && !yn(n)) return !1;
        }
        return !0;
      }
      var sr = Xt(Nt),
        lr = (function () {
          function e(e, t, n) {
            (this.rules = e),
              (this.staticRulesId = ""),
              (this.isStatic = (void 0 === n || n.isStatic) && ar(e)),
              (this.componentId = t),
              (this.baseHash = Qt(sr, t)),
              (this.baseStyle = n),
              Wn.registerId(t);
          }
          return (
            (e.prototype.generateAndInjectStyles = function (e, t, n) {
              var r = this.baseStyle
                ? this.baseStyle.generateAndInjectStyles(e, t, n)
                : "";
              if (this.isStatic && !n.hash)
                if (
                  this.staticRulesId &&
                  t.hasNameForId(this.componentId, this.staticRulesId)
                )
                  r = xn(r, this.staticRulesId);
                else {
                  var i = bn(or(this.rules, e, t, n)),
                    o = Gt(Qt(this.baseHash, i) >>> 0);
                  if (!t.hasNameForId(this.componentId, o)) {
                    var a = n(i, ".".concat(o), void 0, this.componentId);
                    t.insertRules(this.componentId, o, a);
                  }
                  (r = xn(r, o)), (this.staticRulesId = o);
                }
              else {
                for (
                  var s = Qt(this.baseHash, n.hash), l = "", c = 0;
                  c < this.rules.length;
                  c++
                ) {
                  var u = this.rules[c];
                  if ("string" == typeof u) l += u;
                  else if (u) {
                    var d = bn(or(u, e, t, n));
                    (s = Qt(s, d + c)), (l += d);
                  }
                }
                if (l) {
                  var h = Gt(s >>> 0);
                  t.hasNameForId(this.componentId, h) ||
                    t.insertRules(
                      this.componentId,
                      h,
                      n(l, ".".concat(h), void 0, this.componentId)
                    ),
                    (r = xn(r, h));
                }
              }
              return r;
            }),
            e
          );
        })(),
        cr = t.createContext(void 0);
      cr.Consumer;
      var ur = {};
      new Set();
      function dr(e, n, r) {
        var i = yn(e),
          o = e,
          a = !en(e),
          s = n.attrs,
          l = void 0 === s ? It : s,
          c = n.componentId,
          u =
            void 0 === c
              ? (function (e, t) {
                  var n = "string" != typeof e ? "sc" : Ht(e);
                  ur[n] = (ur[n] || 0) + 1;
                  var r = "".concat(n, "-").concat(Jt(Nt + n + ur[n]));
                  return t ? "".concat(t, "-").concat(r) : r;
                })(n.displayName, n.parentComponentId)
              : c,
          d = n.displayName,
          h =
            void 0 === d
              ? (function (e) {
                  return en(e)
                    ? "styled.".concat(e)
                    : "Styled(".concat(Zt(e), ")");
                })(e)
              : d,
          f =
            n.displayName && n.componentId
              ? "".concat(Ht(n.displayName), "-").concat(n.componentId)
              : n.componentId || u,
          p = i && o.attrs ? o.attrs.concat(l).filter(Boolean) : l,
          m = n.shouldForwardProp;
        if (i && o.shouldForwardProp) {
          var g = o.shouldForwardProp;
          if (n.shouldForwardProp) {
            var v = n.shouldForwardProp;
            m = function (e, t) {
              return g(e, t) && v(e, t);
            };
          } else m = g;
        }
        var y = new lr(r, f, i ? o.componentStyle : void 0);
        function x(e, n) {
          return (function (e, n, r) {
            var i = e.attrs,
              o = e.componentStyle,
              a = e.defaultProps,
              s = e.foldedComponentIds,
              l = e.styledComponentId,
              c = e.target,
              u = t.useContext(cr),
              d = Jn(),
              h = e.shouldForwardProp || d.shouldForwardProp,
              f = Bt(n, u, a) || Vt,
              p = (function (e, t, n) {
                for (
                  var r,
                    i = Re(Re({}, t), { className: void 0, theme: n }),
                    o = 0;
                  o < e.length;
                  o += 1
                ) {
                  var a = vn((r = e[o])) ? r(i) : r;
                  for (var s in a)
                    i[s] =
                      "className" === s
                        ? xn(i[s], a[s])
                        : "style" === s
                        ? Re(Re({}, i[s]), a[s])
                        : a[s];
                }
                return (
                  t.className && (i.className = xn(i.className, t.className)), i
                );
              })(i, n, f),
              m = p.as || c,
              g = {};
            for (var v in p)
              void 0 === p[v] ||
                "$" === v[0] ||
                "as" === v ||
                ("theme" === v && p.theme === f) ||
                ("forwardedAs" === v
                  ? (g.as = p.forwardedAs)
                  : (h && !h(v, m)) || (g[v] = p[v]));
            var y = (function (e, t) {
                var n = Jn();
                return e.generateAndInjectStyles(t, n.styleSheet, n.stylis);
              })(o, p),
              x = xn(s, l);
            return (
              y && (x += " " + y),
              p.className && (x += " " + p.className),
              (g[en(m) && !Ut.has(m) ? "class" : "className"] = x),
              r && (g.ref = r),
              (0, t.createElement)(m, g)
            );
          })(b, e, n);
        }
        x.displayName = h;
        var b = t.forwardRef(x);
        return (
          (b.attrs = p),
          (b.componentStyle = y),
          (b.displayName = h),
          (b.shouldForwardProp = m),
          (b.foldedComponentIds = i
            ? xn(o.foldedComponentIds, o.styledComponentId)
            : ""),
          (b.styledComponentId = f),
          (b.target = i ? o.target : e),
          Object.defineProperty(b, "defaultProps", {
            get: function () {
              return this._foldedDefaultProps;
            },
            set: function (e) {
              this._foldedDefaultProps = i
                ? (function (e) {
                    for (var t = [], n = 1; n < arguments.length; n++)
                      t[n - 1] = arguments[n];
                    for (var r = 0, i = t; r < i.length; r++) Sn(e, i[r], !0);
                    return e;
                  })({}, o.defaultProps, e)
                : e;
            },
          }),
          kn(b, function () {
            return ".".concat(b.styledComponentId);
          }),
          a &&
            gn(b, e, {
              attrs: !0,
              componentStyle: !0,
              displayName: !0,
              foldedComponentIds: !0,
              shouldForwardProp: !0,
              styledComponentId: !0,
              target: !0,
            }),
          b
        );
      }
      function hr(e, t) {
        for (var n = [e[0]], r = 0, i = t.length; r < i; r += 1)
          n.push(t[r], e[r + 1]);
        return n;
      }
      var fr = function (e) {
        return Object.assign(e, { isCss: !0 });
      };
      function pr(e) {
        for (var t = [], n = 1; n < arguments.length; n++)
          t[n - 1] = arguments[n];
        if (vn(e) || wn(e)) return fr(or(hr(It, _e([e], t, !0))));
        var r = e;
        return 0 === t.length && 1 === r.length && "string" == typeof r[0]
          ? or(r)
          : fr(or(hr(r, t)));
      }
      function mr(e, t, n) {
        if ((void 0 === n && (n = Vt), !t)) throw jn(1, t);
        var r = function (r) {
          for (var i = [], o = 1; o < arguments.length; o++)
            i[o - 1] = arguments[o];
          return e(t, n, pr.apply(void 0, _e([r], i, !1)));
        };
        return (
          (r.attrs = function (r) {
            return mr(
              e,
              t,
              Re(Re({}, n), {
                attrs: Array.prototype.concat(n.attrs, r).filter(Boolean),
              })
            );
          }),
          (r.withConfig = function (r) {
            return mr(e, t, Re(Re({}, n), r));
          }),
          r
        );
      }
      var gr = function (e) {
          return mr(dr, e);
        },
        vr = gr;
      Ut.forEach(function (e) {
        vr[e] = gr(e);
      });
      !(function () {
        function e(e, t) {
          (this.rules = e),
            (this.componentId = t),
            (this.isStatic = ar(e)),
            Wn.registerId(this.componentId + 1);
        }
        (e.prototype.createStyles = function (e, t, n, r) {
          var i = r(bn(or(this.rules, t, n, r)), ""),
            o = this.componentId + e;
          n.insertRules(o, o, i);
        }),
          (e.prototype.removeStyles = function (e, t) {
            t.clearRules(this.componentId + e);
          }),
          (e.prototype.renderStyles = function (e, t, n, r) {
            e > 2 && Wn.registerId(this.componentId + e),
              this.removeStyles(e, n),
              this.createStyles(e, t, n, r);
          });
      })();
      (function () {
        function e() {
          var e = this;
          (this._emitSheetCSS = function () {
            var t = e.instance.toString();
            if (!t) return "";
            var n = Ln(),
              r = bn(
                [
                  n && 'nonce="'.concat(n, '"'),
                  "".concat(At, '="true"'),
                  "".concat(Dt, '="').concat(Nt, '"'),
                ].filter(Boolean),
                " "
              );
            return "<style ".concat(r, ">").concat(t, "</style>");
          }),
            (this.getStyleTags = function () {
              if (e.sealed) throw jn(2);
              return e._emitSheetCSS();
            }),
            (this.getStyleElement = function () {
              var n;
              if (e.sealed) throw jn(2);
              var r = e.instance.toString();
              if (!r) return [];
              var i =
                  (((n = {})[At] = ""),
                  (n[Dt] = Nt),
                  (n.dangerouslySetInnerHTML = { __html: r }),
                  n),
                o = Ln();
              return (
                o && (i.nonce = o),
                [t.createElement("style", Re({}, i, { key: "sc-0-0" }))]
              );
            }),
            (this.seal = function () {
              e.sealed = !0;
            }),
            (this.instance = new Wn({ isServer: !0 })),
            (this.sealed = !1);
        }
        (e.prototype.collectStyles = function (e) {
          if (this.sealed) throw jn(2);
          return t.createElement(Zn, { sheet: this.instance }, e);
        }),
          (e.prototype.interleaveWithNodeStream = function (e) {
            throw jn(3);
          });
      })(),
        "__sc-".concat(At, "__");
      var yr = n(579);
      const xr = vr.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &.scrolled {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`,
        br = vr.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`,
        wr = vr(Pe)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: none;
  }
`,
        Sr = vr.nav`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: ${(e) => {
      let { isOpen: t } = e;
      return t ? "flex" : "none";
    }};
    flex-direction: column;
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 1rem;
  }
`,
        kr = vr(Pe)`
  margin-left: 1.5rem;
  color: var(--text-dark);
  font-weight: 500;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--primary-color);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &.active:after,
  &:hover:after {
    transform: scaleX(1);
  }

  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }
`,
        jr = vr.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-dark);

  @media (max-width: 768px) {
    display: block;
  }
`,
        Cr = vr(Pe)`
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  margin-left: 1.5rem;
  font-weight: 500;

  &:hover {
    background-color: var(--primary-dark);
    text-decoration: none;
  }

  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }
`,
        Pr = () => {
          const [e, n] = (0, t.useState)(!1),
            [r, i] = (0, t.useState)(!1),
            o = J();
          (0, t.useEffect)(() => {
            const e = () => {
              window.scrollY > 10 ? i(!0) : i(!1);
            };
            return (
              window.addEventListener("scroll", e),
              () => window.removeEventListener("scroll", e)
            );
          }, []);
          return (0, yr.jsx)(xr, {
            className: r ? "scrolled" : "",
            children: (0, yr.jsxs)(br, {
              children: [
                (0, yr.jsx)(wr, { to: "/", children: "Homegroups" }),
                (0, yr.jsx)(jr, {
                  onClick: () => {
                    n(!e);
                  },
                  children: e ? "\u2715" : "\u2630",
                }),
                (0, yr.jsxs)(Sr, {
                  isOpen: e,
                  children: [
                    (0, yr.jsx)(kr, {
                      to: "/",
                      className: "/" === o.pathname ? "active" : "",
                      children: "Home",
                    }),
                    (0, yr.jsx)(kr, {
                      to: "/features",
                      className: "/features" === o.pathname ? "active" : "",
                      children: "Features",
                    }),
                    (0, yr.jsx)(kr, {
                      to: "/pricing",
                      className: "/pricing" === o.pathname ? "active" : "",
                      children: "Pricing",
                    }),
                    (0, yr.jsx)(kr, {
                      to: "/about",
                      className: "/about" === o.pathname ? "active" : "",
                      children: "About",
                    }),
                    (0, yr.jsx)(Cr, {
                      to: "/contact",
                      children: "Get Started",
                    }),
                  ],
                }),
              ],
            }),
          });
        },
        Er = vr.footer`
  background-color: var(--background-alt);
  padding: 4rem 1rem 2rem;
  color: var(--text-light);
`,
        Tr = vr.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`,
        Rr = vr.div`
  display: flex;
  flex-direction: column;
`,
        _r = vr.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
`,
        Or = vr(Pe)`
  margin-bottom: 0.75rem;
  color: var(--text-light);
  font-size: 0.95rem;

  &:hover {
    color: var(--primary-color);
  }
`,
        Ar =
          (vr.a`
  margin-bottom: 0.75rem;
  color: var(--text-light);
  font-size: 0.95rem;

  &:hover {
    color: var(--primary-color);
  }
`,
          vr.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.875rem;
`),
        zr = vr.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`,
        Dr = vr.a`
  font-size: 1.25rem;
  color: var(--text-light);

  &:hover {
    color: var(--primary-color);
  }
`,
        Nr = () => {
          const e = new Date().getFullYear();
          return (0, yr.jsxs)(Er, {
            children: [
              (0, yr.jsxs)(Tr, {
                children: [
                  (0, yr.jsxs)(Rr, {
                    children: [
                      (0, yr.jsx)(_r, { children: "Homegroups" }),
                      (0, yr.jsx)("p", {
                        children:
                          "A privacy-first app for 12-step recovery groups. Manage meetings, treasury, and communications with ease.",
                      }),
                      (0, yr.jsxs)(zr, {
                        children: [
                          (0, yr.jsx)(Dr, {
                            href: "https://twitter.com",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            children: "\ud835\udd4f",
                          }),
                          (0, yr.jsx)(Dr, {
                            href: "https://facebook.com",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            children: "f",
                          }),
                          (0, yr.jsx)(Dr, {
                            href: "https://instagram.com",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            children: "\ud83d\udcf7",
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, yr.jsxs)(Rr, {
                    children: [
                      (0, yr.jsx)(_r, { children: "Product" }),
                      (0, yr.jsx)(Or, {
                        to: "/features",
                        children: "Features",
                      }),
                      (0, yr.jsx)(Or, { to: "/pricing", children: "Pricing" }),
                      (0, yr.jsx)(Or, {
                        to: "/download",
                        children: "Download",
                      }),
                      (0, yr.jsx)(Or, { to: "/updates", children: "Updates" }),
                    ],
                  }),
                  (0, yr.jsxs)(Rr, {
                    children: [
                      (0, yr.jsx)(_r, { children: "Company" }),
                      (0, yr.jsx)(Or, { to: "/about", children: "About" }),
                      (0, yr.jsx)(Or, { to: "/contact", children: "Contact" }),
                      (0, yr.jsx)(Or, { to: "/blog", children: "Blog" }),
                      (0, yr.jsx)(Or, { to: "/careers", children: "Careers" }),
                    ],
                  }),
                  (0, yr.jsxs)(Rr, {
                    children: [
                      (0, yr.jsx)(_r, { children: "Legal" }),
                      (0, yr.jsx)(Or, {
                        to: "/terms",
                        children: "Terms of Service",
                      }),
                      (0, yr.jsx)(Or, {
                        to: "/privacy",
                        children: "Privacy Policy",
                      }),
                      (0, yr.jsx)(Or, {
                        to: "/cookies",
                        children: "Cookie Policy",
                      }),
                      (0, yr.jsx)(Or, {
                        to: "/accessibility",
                        children: "Accessibility",
                      }),
                    ],
                  }),
                ],
              }),
              (0, yr.jsxs)(Ar, {
                children: ["\xa9 ", e, " Homegroups. All rights reserved."],
              }),
            ],
          });
        },
        Lr = (0, t.createContext)({
          transformPagePoint: (e) => e,
          isStatic: !1,
          reducedMotion: "never",
        }),
        Mr = (0, t.createContext)({}),
        Fr = (0, t.createContext)(null),
        Ir = "undefined" !== typeof document,
        Vr = Ir ? t.useLayoutEffect : t.useEffect,
        Br = (0, t.createContext)({ strict: !1 }),
        Ur = (e) => e.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
        Wr = "data-" + Ur("framerAppearId");
      function $r(e) {
        return (
          e &&
          "object" === typeof e &&
          Object.prototype.hasOwnProperty.call(e, "current")
        );
      }
      function Hr(e) {
        return "string" === typeof e || Array.isArray(e);
      }
      function Yr(e) {
        return (
          null !== e && "object" === typeof e && "function" === typeof e.start
        );
      }
      const qr = [
          "animate",
          "whileInView",
          "whileFocus",
          "whileHover",
          "whileTap",
          "whileDrag",
          "exit",
        ],
        Gr = ["initial", ...qr];
      function Kr(e) {
        return Yr(e.animate) || Gr.some((t) => Hr(e[t]));
      }
      function Qr(e) {
        return Boolean(Kr(e) || e.variants);
      }
      function Xr(e) {
        const { initial: n, animate: r } = (function (e, t) {
          if (Kr(e)) {
            const { initial: t, animate: n } = e;
            return {
              initial: !1 === t || Hr(t) ? t : void 0,
              animate: Hr(n) ? n : void 0,
            };
          }
          return !1 !== e.inherit ? t : {};
        })(e, (0, t.useContext)(Mr));
        return (0, t.useMemo)(
          () => ({ initial: n, animate: r }),
          [Jr(n), Jr(r)]
        );
      }
      function Jr(e) {
        return Array.isArray(e) ? e.join(" ") : e;
      }
      const Zr = {
          animation: [
            "animate",
            "variants",
            "whileHover",
            "whileTap",
            "exit",
            "whileInView",
            "whileFocus",
            "whileDrag",
          ],
          exit: ["exit"],
          drag: ["drag", "dragControls"],
          focus: ["whileFocus"],
          hover: ["whileHover", "onHoverStart", "onHoverEnd"],
          tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
          pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
          inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
          layout: ["layout", "layoutId"],
        },
        ei = {};
      for (const n in Zr)
        ei[n] = { isEnabled: (e) => Zr[n].some((t) => !!e[t]) };
      const ti = (0, t.createContext)({}),
        ni = (0, t.createContext)({}),
        ri = Symbol.for("motionComponentSymbol");
      function ii(e) {
        let {
          preloadedFeatures: n,
          createVisualElement: r,
          useRender: i,
          useVisualState: o,
          Component: a,
        } = e;
        n &&
          (function (e) {
            for (const t in e) ei[t] = { ...ei[t], ...e[t] };
          })(n);
        const s = (0, t.forwardRef)(function (e, s) {
          let l;
          const c = { ...(0, t.useContext)(Lr), ...e, layoutId: oi(e) },
            { isStatic: u } = c,
            d = Xr(e),
            h = o(e, u);
          if (!u && Ir) {
            d.visualElement = (function (e, n, r, i) {
              const { visualElement: o } = (0, t.useContext)(Mr),
                a = (0, t.useContext)(Br),
                s = (0, t.useContext)(Fr),
                l = (0, t.useContext)(Lr).reducedMotion,
                c = (0, t.useRef)();
              (i = i || a.renderer),
                !c.current &&
                  i &&
                  (c.current = i(e, {
                    visualState: n,
                    parent: o,
                    props: r,
                    presenceContext: s,
                    blockInitialAnimation: !!s && !1 === s.initial,
                    reducedMotionConfig: l,
                  }));
              const u = c.current;
              (0, t.useInsertionEffect)(() => {
                u && u.update(r, s);
              });
              const d = (0, t.useRef)(
                Boolean(r[Wr] && !window.HandoffComplete)
              );
              return (
                Vr(() => {
                  u &&
                    (u.render(),
                    d.current &&
                      u.animationState &&
                      u.animationState.animateChanges());
                }),
                (0, t.useEffect)(() => {
                  u &&
                    (u.updateFeatures(),
                    !d.current &&
                      u.animationState &&
                      u.animationState.animateChanges(),
                    d.current &&
                      ((d.current = !1), (window.HandoffComplete = !0)));
                }),
                u
              );
            })(a, h, c, r);
            const e = (0, t.useContext)(ni),
              i = (0, t.useContext)(Br).strict;
            d.visualElement && (l = d.visualElement.loadFeatures(c, i, n, e));
          }
          return t.createElement(
            Mr.Provider,
            { value: d },
            l && d.visualElement
              ? t.createElement(l, { visualElement: d.visualElement, ...c })
              : null,
            i(
              a,
              e,
              (function (e, n, r) {
                return (0, t.useCallback)(
                  (t) => {
                    t && e.mount && e.mount(t),
                      n && (t ? n.mount(t) : n.unmount()),
                      r &&
                        ("function" === typeof r
                          ? r(t)
                          : $r(r) && (r.current = t));
                  },
                  [n]
                );
              })(h, d.visualElement, s),
              h,
              u,
              d.visualElement
            )
          );
        });
        return (s[ri] = a), s;
      }
      function oi(e) {
        let { layoutId: n } = e;
        const r = (0, t.useContext)(ti).id;
        return r && void 0 !== n ? r + "-" + n : n;
      }
      function ai(e) {
        function t(t) {
          return ii(
            e(
              t,
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {}
            )
          );
        }
        if ("undefined" === typeof Proxy) return t;
        const n = new Map();
        return new Proxy(t, {
          get: (e, r) => (n.has(r) || n.set(r, t(r)), n.get(r)),
        });
      }
      const si = [
        "animate",
        "circle",
        "defs",
        "desc",
        "ellipse",
        "g",
        "image",
        "line",
        "filter",
        "marker",
        "mask",
        "metadata",
        "path",
        "pattern",
        "polygon",
        "polyline",
        "rect",
        "stop",
        "switch",
        "symbol",
        "svg",
        "text",
        "tspan",
        "use",
        "view",
      ];
      function li(e) {
        return (
          "string" === typeof e &&
          !e.includes("-") &&
          !!(si.indexOf(e) > -1 || /[A-Z]/.test(e))
        );
      }
      const ci = {};
      const ui = [
          "transformPerspective",
          "x",
          "y",
          "z",
          "translateX",
          "translateY",
          "translateZ",
          "scale",
          "scaleX",
          "scaleY",
          "rotate",
          "rotateX",
          "rotateY",
          "rotateZ",
          "skew",
          "skewX",
          "skewY",
        ],
        di = new Set(ui);
      function hi(e, t) {
        let { layout: n, layoutId: r } = t;
        return (
          di.has(e) ||
          e.startsWith("origin") ||
          ((n || void 0 !== r) && (!!ci[e] || "opacity" === e))
        );
      }
      const fi = (e) => Boolean(e && e.getVelocity),
        pi = {
          x: "translateX",
          y: "translateY",
          z: "translateZ",
          transformPerspective: "perspective",
        },
        mi = ui.length;
      const gi = (e) => (t) => "string" === typeof t && t.startsWith(e),
        vi = gi("--"),
        yi = gi("var(--"),
        xi = (e, t) => (t && "number" === typeof e ? t.transform(e) : e),
        bi = (e, t, n) => Math.min(Math.max(n, e), t),
        wi = {
          test: (e) => "number" === typeof e,
          parse: parseFloat,
          transform: (e) => e,
        },
        Si = { ...wi, transform: (e) => bi(0, 1, e) },
        ki = { ...wi, default: 1 },
        ji = (e) => Math.round(1e5 * e) / 1e5,
        Ci = /(-)?([\d]*\.?[\d])+/g,
        Pi =
          /(#[0-9a-f]{3,8}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))/gi,
        Ei =
          /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))$/i;
      function Ti(e) {
        return "string" === typeof e;
      }
      const Ri = (e) => ({
          test: (t) => Ti(t) && t.endsWith(e) && 1 === t.split(" ").length,
          parse: parseFloat,
          transform: (t) => `${t}${e}`,
        }),
        _i = Ri("deg"),
        Oi = Ri("%"),
        Ai = Ri("px"),
        zi = Ri("vh"),
        Di = Ri("vw"),
        Ni = {
          ...Oi,
          parse: (e) => Oi.parse(e) / 100,
          transform: (e) => Oi.transform(100 * e),
        },
        Li = { ...wi, transform: Math.round },
        Mi = {
          borderWidth: Ai,
          borderTopWidth: Ai,
          borderRightWidth: Ai,
          borderBottomWidth: Ai,
          borderLeftWidth: Ai,
          borderRadius: Ai,
          radius: Ai,
          borderTopLeftRadius: Ai,
          borderTopRightRadius: Ai,
          borderBottomRightRadius: Ai,
          borderBottomLeftRadius: Ai,
          width: Ai,
          maxWidth: Ai,
          height: Ai,
          maxHeight: Ai,
          size: Ai,
          top: Ai,
          right: Ai,
          bottom: Ai,
          left: Ai,
          padding: Ai,
          paddingTop: Ai,
          paddingRight: Ai,
          paddingBottom: Ai,
          paddingLeft: Ai,
          margin: Ai,
          marginTop: Ai,
          marginRight: Ai,
          marginBottom: Ai,
          marginLeft: Ai,
          rotate: _i,
          rotateX: _i,
          rotateY: _i,
          rotateZ: _i,
          scale: ki,
          scaleX: ki,
          scaleY: ki,
          scaleZ: ki,
          skew: _i,
          skewX: _i,
          skewY: _i,
          distance: Ai,
          translateX: Ai,
          translateY: Ai,
          translateZ: Ai,
          x: Ai,
          y: Ai,
          z: Ai,
          perspective: Ai,
          transformPerspective: Ai,
          opacity: Si,
          originX: Ni,
          originY: Ni,
          originZ: Ai,
          zIndex: Li,
          fillOpacity: Si,
          strokeOpacity: Si,
          numOctaves: Li,
        };
      function Fi(e, t, n, r) {
        const { style: i, vars: o, transform: a, transformOrigin: s } = e;
        let l = !1,
          c = !1,
          u = !0;
        for (const d in t) {
          const e = t[d];
          if (vi(d)) {
            o[d] = e;
            continue;
          }
          const n = Mi[d],
            r = xi(e, n);
          if (di.has(d)) {
            if (((l = !0), (a[d] = r), !u)) continue;
            e !== (n.default || 0) && (u = !1);
          } else d.startsWith("origin") ? ((c = !0), (s[d] = r)) : (i[d] = r);
        }
        if (
          (t.transform ||
            (l || r
              ? (i.transform = (function (e, t, n, r) {
                  let {
                      enableHardwareAcceleration: i = !0,
                      allowTransformNone: o = !0,
                    } = t,
                    a = "";
                  for (let s = 0; s < mi; s++) {
                    const t = ui[s];
                    void 0 !== e[t] && (a += `${pi[t] || t}(${e[t]}) `);
                  }
                  return (
                    i && !e.z && (a += "translateZ(0)"),
                    (a = a.trim()),
                    r ? (a = r(e, n ? "" : a)) : o && n && (a = "none"),
                    a
                  );
                })(e.transform, n, u, r))
              : i.transform && (i.transform = "none")),
          c)
        ) {
          const { originX: e = "50%", originY: t = "50%", originZ: n = 0 } = s;
          i.transformOrigin = `${e} ${t} ${n}`;
        }
      }
      const Ii = () => ({
        style: {},
        transform: {},
        transformOrigin: {},
        vars: {},
      });
      function Vi(e, t, n) {
        for (const r in t) fi(t[r]) || hi(r, n) || (e[r] = t[r]);
      }
      function Bi(e, n, r) {
        const i = {};
        return (
          Vi(i, e.style || {}, e),
          Object.assign(
            i,
            (function (e, n, r) {
              let { transformTemplate: i } = e;
              return (0, t.useMemo)(() => {
                const e = {
                  style: {},
                  transform: {},
                  transformOrigin: {},
                  vars: {},
                };
                return (
                  Fi(e, n, { enableHardwareAcceleration: !r }, i),
                  Object.assign({}, e.vars, e.style)
                );
              }, [n]);
            })(e, n, r)
          ),
          e.transformValues ? e.transformValues(i) : i
        );
      }
      function Ui(e, t, n) {
        const r = {},
          i = Bi(e, t, n);
        return (
          e.drag &&
            !1 !== e.dragListener &&
            ((r.draggable = !1),
            (i.userSelect = i.WebkitUserSelect = i.WebkitTouchCallout = "none"),
            (i.touchAction =
              !0 === e.drag ? "none" : "pan-" + ("x" === e.drag ? "y" : "x"))),
          void 0 === e.tabIndex &&
            (e.onTap || e.onTapStart || e.whileTap) &&
            (r.tabIndex = 0),
          (r.style = i),
          r
        );
      }
      const Wi = new Set([
        "animate",
        "exit",
        "variants",
        "initial",
        "style",
        "values",
        "variants",
        "transition",
        "transformTemplate",
        "transformValues",
        "custom",
        "inherit",
        "onBeforeLayoutMeasure",
        "onAnimationStart",
        "onAnimationComplete",
        "onUpdate",
        "onDragStart",
        "onDrag",
        "onDragEnd",
        "onMeasureDragConstraints",
        "onDirectionLock",
        "onDragTransitionEnd",
        "_dragX",
        "_dragY",
        "onHoverStart",
        "onHoverEnd",
        "onViewportEnter",
        "onViewportLeave",
        "globalTapTarget",
        "ignoreStrict",
        "viewport",
      ]);
      function $i(e) {
        return (
          e.startsWith("while") ||
          (e.startsWith("drag") && "draggable" !== e) ||
          e.startsWith("layout") ||
          e.startsWith("onTap") ||
          e.startsWith("onPan") ||
          e.startsWith("onLayout") ||
          Wi.has(e)
        );
      }
      let Hi = (e) => !$i(e);
      try {
        (Yi = require("@emotion/is-prop-valid").default) &&
          (Hi = (e) => (e.startsWith("on") ? !$i(e) : Yi(e)));
      } catch (qp) {}
      var Yi;
      function qi(e, t, n) {
        return "string" === typeof e ? e : Ai.transform(t + n * e);
      }
      const Gi = { offset: "stroke-dashoffset", array: "stroke-dasharray" },
        Ki = { offset: "strokeDashoffset", array: "strokeDasharray" };
      function Qi(e, t, n, r, i) {
        let {
          attrX: o,
          attrY: a,
          attrScale: s,
          originX: l,
          originY: c,
          pathLength: u,
          pathSpacing: d = 1,
          pathOffset: h = 0,
          ...f
        } = t;
        if ((Fi(e, f, n, i), r))
          return void (e.style.viewBox && (e.attrs.viewBox = e.style.viewBox));
        (e.attrs = e.style), (e.style = {});
        const { attrs: p, style: m, dimensions: g } = e;
        p.transform && (g && (m.transform = p.transform), delete p.transform),
          g &&
            (void 0 !== l || void 0 !== c || m.transform) &&
            (m.transformOrigin = (function (e, t, n) {
              return `${qi(t, e.x, e.width)} ${qi(n, e.y, e.height)}`;
            })(g, void 0 !== l ? l : 0.5, void 0 !== c ? c : 0.5)),
          void 0 !== o && (p.x = o),
          void 0 !== a && (p.y = a),
          void 0 !== s && (p.scale = s),
          void 0 !== u &&
            (function (e, t) {
              let n =
                  arguments.length > 2 && void 0 !== arguments[2]
                    ? arguments[2]
                    : 1,
                r =
                  arguments.length > 3 && void 0 !== arguments[3]
                    ? arguments[3]
                    : 0,
                i =
                  !(arguments.length > 4 && void 0 !== arguments[4]) ||
                  arguments[4];
              e.pathLength = 1;
              const o = i ? Gi : Ki;
              e[o.offset] = Ai.transform(-r);
              const a = Ai.transform(t),
                s = Ai.transform(n);
              e[o.array] = `${a} ${s}`;
            })(p, u, d, h, !1);
      }
      const Xi = () => ({
          style: {},
          transform: {},
          transformOrigin: {},
          vars: {},
          attrs: {},
        }),
        Ji = (e) => "string" === typeof e && "svg" === e.toLowerCase();
      function Zi(e, n, r, i) {
        const o = (0, t.useMemo)(() => {
          const t = {
            style: {},
            transform: {},
            transformOrigin: {},
            vars: {},
            attrs: {},
          };
          return (
            Qi(
              t,
              n,
              { enableHardwareAcceleration: !1 },
              Ji(i),
              e.transformTemplate
            ),
            { ...t.attrs, style: { ...t.style } }
          );
        }, [n]);
        if (e.style) {
          const t = {};
          Vi(t, e.style, e), (o.style = { ...t, ...o.style });
        }
        return o;
      }
      function eo() {
        let e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
        return (n, r, i, o, a) => {
          let { latestValues: s } = o;
          const l = (li(n) ? Zi : Ui)(r, s, a, n),
            c = (function (e, t, n) {
              const r = {};
              for (const i in e)
                ("values" === i && "object" === typeof e.values) ||
                  ((Hi(i) ||
                    (!0 === n && $i(i)) ||
                    (!t && !$i(i)) ||
                    (e.draggable && i.startsWith("onDrag"))) &&
                    (r[i] = e[i]));
              return r;
            })(r, "string" === typeof n, e),
            u = { ...c, ...l, ref: i },
            { children: d } = r,
            h = (0, t.useMemo)(() => (fi(d) ? d.get() : d), [d]);
          return (0, t.createElement)(n, { ...u, children: h });
        };
      }
      function to(e, t, n, r) {
        let { style: i, vars: o } = t;
        Object.assign(e.style, i, r && r.getProjectionStyles(n));
        for (const a in o) e.style.setProperty(a, o[a]);
      }
      const no = new Set([
        "baseFrequency",
        "diffuseConstant",
        "kernelMatrix",
        "kernelUnitLength",
        "keySplines",
        "keyTimes",
        "limitingConeAngle",
        "markerHeight",
        "markerWidth",
        "numOctaves",
        "targetX",
        "targetY",
        "surfaceScale",
        "specularConstant",
        "specularExponent",
        "stdDeviation",
        "tableValues",
        "viewBox",
        "gradientTransform",
        "pathLength",
        "startOffset",
        "textLength",
        "lengthAdjust",
      ]);
      function ro(e, t, n, r) {
        to(e, t, void 0, r);
        for (const i in t.attrs)
          e.setAttribute(no.has(i) ? i : Ur(i), t.attrs[i]);
      }
      function io(e, t) {
        const { style: n } = e,
          r = {};
        for (const i in n)
          (fi(n[i]) || (t.style && fi(t.style[i])) || hi(i, e)) &&
            (r[i] = n[i]);
        return r;
      }
      function oo(e, t) {
        const n = io(e, t);
        for (const r in e)
          if (fi(e[r]) || fi(t[r])) {
            n[
              -1 !== ui.indexOf(r)
                ? "attr" + r.charAt(0).toUpperCase() + r.substring(1)
                : r
            ] = e[r];
          }
        return n;
      }
      function ao(e, t, n) {
        let r =
            arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {},
          i =
            arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : {};
        return (
          "function" === typeof t && (t = t(void 0 !== n ? n : e.custom, r, i)),
          "string" === typeof t && (t = e.variants && e.variants[t]),
          "function" === typeof t && (t = t(void 0 !== n ? n : e.custom, r, i)),
          t
        );
      }
      const so = (e) => Array.isArray(e),
        lo = (e) => (so(e) ? e[e.length - 1] || 0 : e);
      function co(e) {
        const t = fi(e) ? e.get() : e;
        return ((e) =>
          Boolean(e && "object" === typeof e && e.mix && e.toValue))(t)
          ? t.toValue()
          : t;
      }
      const uo = (e) => (n, r) => {
        const i = (0, t.useContext)(Mr),
          o = (0, t.useContext)(Fr),
          a = () =>
            (function (e, t, n, r) {
              let {
                scrapeMotionValuesFromProps: i,
                createRenderState: o,
                onMount: a,
              } = e;
              const s = { latestValues: ho(t, n, r, i), renderState: o() };
              return a && (s.mount = (e) => a(t, e, s)), s;
            })(e, n, i, o);
        return r
          ? a()
          : (function (e) {
              const n = (0, t.useRef)(null);
              return null === n.current && (n.current = e()), n.current;
            })(a);
      };
      function ho(e, t, n, r) {
        const i = {},
          o = r(e, {});
        for (const h in o) i[h] = co(o[h]);
        let { initial: a, animate: s } = e;
        const l = Kr(e),
          c = Qr(e);
        t &&
          c &&
          !l &&
          !1 !== e.inherit &&
          (void 0 === a && (a = t.initial), void 0 === s && (s = t.animate));
        let u = !!n && !1 === n.initial;
        u = u || !1 === a;
        const d = u ? s : a;
        if (d && "boolean" !== typeof d && !Yr(d)) {
          (Array.isArray(d) ? d : [d]).forEach((t) => {
            const n = ao(e, t);
            if (!n) return;
            const { transitionEnd: r, transition: o, ...a } = n;
            for (const e in a) {
              let t = a[e];
              if (Array.isArray(t)) {
                t = t[u ? t.length - 1 : 0];
              }
              null !== t && (i[e] = t);
            }
            for (const e in r) i[e] = r[e];
          });
        }
        return i;
      }
      const fo = (e) => e;
      class po {
        constructor() {
          (this.order = []), (this.scheduled = new Set());
        }
        add(e) {
          if (!this.scheduled.has(e))
            return this.scheduled.add(e), this.order.push(e), !0;
        }
        remove(e) {
          const t = this.order.indexOf(e);
          -1 !== t && (this.order.splice(t, 1), this.scheduled.delete(e));
        }
        clear() {
          (this.order.length = 0), this.scheduled.clear();
        }
      }
      const mo = [
        "prepare",
        "read",
        "update",
        "preRender",
        "render",
        "postRender",
      ];
      const {
          schedule: go,
          cancel: vo,
          state: yo,
          steps: xo,
        } = (function (e, t) {
          let n = !1,
            r = !0;
          const i = { delta: 0, timestamp: 0, isProcessing: !1 },
            o = mo.reduce(
              (e, t) => (
                (e[t] = (function (e) {
                  let t = new po(),
                    n = new po(),
                    r = 0,
                    i = !1,
                    o = !1;
                  const a = new WeakSet(),
                    s = {
                      schedule: function (e) {
                        const o =
                            arguments.length > 2 &&
                            void 0 !== arguments[2] &&
                            arguments[2] &&
                            i,
                          s = o ? t : n;
                        return (
                          arguments.length > 1 &&
                            void 0 !== arguments[1] &&
                            arguments[1] &&
                            a.add(e),
                          s.add(e) && o && i && (r = t.order.length),
                          e
                        );
                      },
                      cancel: (e) => {
                        n.remove(e), a.delete(e);
                      },
                      process: (l) => {
                        if (i) o = !0;
                        else {
                          if (
                            ((i = !0),
                            ([t, n] = [n, t]),
                            n.clear(),
                            (r = t.order.length),
                            r)
                          )
                            for (let n = 0; n < r; n++) {
                              const r = t.order[n];
                              r(l), a.has(r) && (s.schedule(r), e());
                            }
                          (i = !1), o && ((o = !1), s.process(l));
                        }
                      },
                    };
                  return s;
                })(() => (n = !0))),
                e
              ),
              {}
            ),
            a = (e) => o[e].process(i),
            s = () => {
              const o = performance.now();
              (n = !1),
                (i.delta = r
                  ? 1e3 / 60
                  : Math.max(Math.min(o - i.timestamp, 40), 1)),
                (i.timestamp = o),
                (i.isProcessing = !0),
                mo.forEach(a),
                (i.isProcessing = !1),
                n && t && ((r = !1), e(s));
            },
            l = mo.reduce((t, a) => {
              const l = o[a];
              return (
                (t[a] = function (t) {
                  let o =
                      arguments.length > 1 &&
                      void 0 !== arguments[1] &&
                      arguments[1],
                    a =
                      arguments.length > 2 &&
                      void 0 !== arguments[2] &&
                      arguments[2];
                  return (
                    n || ((n = !0), (r = !0), i.isProcessing || e(s)),
                    l.schedule(t, o, a)
                  );
                }),
                t
              );
            }, {});
          return {
            schedule: l,
            cancel: (e) => mo.forEach((t) => o[t].cancel(e)),
            state: i,
            steps: o,
          };
        })(
          "undefined" !== typeof requestAnimationFrame
            ? requestAnimationFrame
            : fo,
          !0
        ),
        bo = {
          useVisualState: uo({
            scrapeMotionValuesFromProps: oo,
            createRenderState: Xi,
            onMount: (e, t, n) => {
              let { renderState: r, latestValues: i } = n;
              go.read(() => {
                try {
                  r.dimensions =
                    "function" === typeof t.getBBox
                      ? t.getBBox()
                      : t.getBoundingClientRect();
                } catch (Yp) {
                  r.dimensions = { x: 0, y: 0, width: 0, height: 0 };
                }
              }),
                go.render(() => {
                  Qi(
                    r,
                    i,
                    { enableHardwareAcceleration: !1 },
                    Ji(t.tagName),
                    e.transformTemplate
                  ),
                    ro(t, r);
                });
            },
          }),
        },
        wo = {
          useVisualState: uo({
            scrapeMotionValuesFromProps: io,
            createRenderState: Ii,
          }),
        };
      function So(e, t, n) {
        let r =
          arguments.length > 3 && void 0 !== arguments[3]
            ? arguments[3]
            : { passive: !0 };
        return e.addEventListener(t, n, r), () => e.removeEventListener(t, n);
      }
      const ko = (e) =>
        "mouse" === e.pointerType
          ? "number" !== typeof e.button || e.button <= 0
          : !1 !== e.isPrimary;
      function jo(e) {
        let t =
          arguments.length > 1 && void 0 !== arguments[1]
            ? arguments[1]
            : "page";
        return { point: { x: e[t + "X"], y: e[t + "Y"] } };
      }
      function Co(e, t, n, r) {
        return So(
          e,
          t,
          (
            (e) => (t) =>
              ko(t) && e(t, jo(t))
          )(n),
          r
        );
      }
      const Po = (e, t) => (n) => t(e(n)),
        Eo = function () {
          for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
            t[n] = arguments[n];
          return t.reduce(Po);
        };
      function To(e) {
        let t = null;
        return () => {
          const n = () => {
            t = null;
          };
          return null === t && ((t = e), n);
        };
      }
      const Ro = To("dragHorizontal"),
        _o = To("dragVertical");
      function Oo(e) {
        let t = !1;
        if ("y" === e) t = _o();
        else if ("x" === e) t = Ro();
        else {
          const e = Ro(),
            n = _o();
          e && n
            ? (t = () => {
                e(), n();
              })
            : (e && e(), n && n());
        }
        return t;
      }
      function Ao() {
        const e = Oo(!0);
        return !e || (e(), !1);
      }
      class zo {
        constructor(e) {
          (this.isMounted = !1), (this.node = e);
        }
        update() {}
      }
      function Do(e, t) {
        const n = "pointer" + (t ? "enter" : "leave"),
          r = "onHover" + (t ? "Start" : "End");
        return Co(
          e.current,
          n,
          (n, i) => {
            if ("touch" === n.pointerType || Ao()) return;
            const o = e.getProps();
            e.animationState &&
              o.whileHover &&
              e.animationState.setActive("whileHover", t),
              o[r] && go.update(() => o[r](n, i));
          },
          { passive: !e.getProps()[r] }
        );
      }
      const No = (e, t) => !!t && (e === t || No(e, t.parentElement));
      function Lo(e, t) {
        if (!t) return;
        const n = new PointerEvent("pointer" + e);
        t(n, jo(n));
      }
      const Mo = new WeakMap(),
        Fo = new WeakMap(),
        Io = (e) => {
          const t = Mo.get(e.target);
          t && t(e);
        },
        Vo = (e) => {
          e.forEach(Io);
        };
      function Bo(e, t, n) {
        const r = (function (e) {
          let { root: t, ...n } = e;
          const r = t || document;
          Fo.has(r) || Fo.set(r, {});
          const i = Fo.get(r),
            o = JSON.stringify(n);
          return (
            i[o] || (i[o] = new IntersectionObserver(Vo, { root: t, ...n })),
            i[o]
          );
        })(t);
        return (
          Mo.set(e, n),
          r.observe(e),
          () => {
            Mo.delete(e), r.unobserve(e);
          }
        );
      }
      const Uo = { some: 0, all: 1 };
      const Wo = {
        inView: {
          Feature: class extends zo {
            constructor() {
              super(...arguments),
                (this.hasEnteredView = !1),
                (this.isInView = !1);
            }
            startObserver() {
              this.unmount();
              const { viewport: e = {} } = this.node.getProps(),
                { root: t, margin: n, amount: r = "some", once: i } = e,
                o = {
                  root: t ? t.current : void 0,
                  rootMargin: n,
                  threshold: "number" === typeof r ? r : Uo[r],
                };
              return Bo(this.node.current, o, (e) => {
                const { isIntersecting: t } = e;
                if (this.isInView === t) return;
                if (((this.isInView = t), i && !t && this.hasEnteredView))
                  return;
                t && (this.hasEnteredView = !0),
                  this.node.animationState &&
                    this.node.animationState.setActive("whileInView", t);
                const { onViewportEnter: n, onViewportLeave: r } =
                    this.node.getProps(),
                  o = t ? n : r;
                o && o(e);
              });
            }
            mount() {
              this.startObserver();
            }
            update() {
              if ("undefined" === typeof IntersectionObserver) return;
              const { props: e, prevProps: t } = this.node,
                n = ["amount", "margin", "root"].some(
                  (function (e) {
                    let { viewport: t = {} } = e,
                      { viewport: n = {} } =
                        arguments.length > 1 && void 0 !== arguments[1]
                          ? arguments[1]
                          : {};
                    return (e) => t[e] !== n[e];
                  })(e, t)
                );
              n && this.startObserver();
            }
            unmount() {}
          },
        },
        tap: {
          Feature: class extends zo {
            constructor() {
              super(...arguments),
                (this.removeStartListeners = fo),
                (this.removeEndListeners = fo),
                (this.removeAccessibleListeners = fo),
                (this.startPointerPress = (e, t) => {
                  if (this.isPressing) return;
                  this.removeEndListeners();
                  const n = this.node.getProps(),
                    r = Co(
                      window,
                      "pointerup",
                      (e, t) => {
                        if (!this.checkPressEnd()) return;
                        const {
                          onTap: n,
                          onTapCancel: r,
                          globalTapTarget: i,
                        } = this.node.getProps();
                        go.update(() => {
                          i || No(this.node.current, e.target)
                            ? n && n(e, t)
                            : r && r(e, t);
                        });
                      },
                      { passive: !(n.onTap || n.onPointerUp) }
                    ),
                    i = Co(
                      window,
                      "pointercancel",
                      (e, t) => this.cancelPress(e, t),
                      { passive: !(n.onTapCancel || n.onPointerCancel) }
                    );
                  (this.removeEndListeners = Eo(r, i)), this.startPress(e, t);
                }),
                (this.startAccessiblePress = () => {
                  const e = So(this.node.current, "keydown", (e) => {
                      if ("Enter" !== e.key || this.isPressing) return;
                      this.removeEndListeners(),
                        (this.removeEndListeners = So(
                          this.node.current,
                          "keyup",
                          (e) => {
                            "Enter" === e.key &&
                              this.checkPressEnd() &&
                              Lo("up", (e, t) => {
                                const { onTap: n } = this.node.getProps();
                                n && go.update(() => n(e, t));
                              });
                          }
                        )),
                        Lo("down", (e, t) => {
                          this.startPress(e, t);
                        });
                    }),
                    t = So(this.node.current, "blur", () => {
                      this.isPressing &&
                        Lo("cancel", (e, t) => this.cancelPress(e, t));
                    });
                  this.removeAccessibleListeners = Eo(e, t);
                });
            }
            startPress(e, t) {
              this.isPressing = !0;
              const { onTapStart: n, whileTap: r } = this.node.getProps();
              r &&
                this.node.animationState &&
                this.node.animationState.setActive("whileTap", !0),
                n && go.update(() => n(e, t));
            }
            checkPressEnd() {
              this.removeEndListeners(), (this.isPressing = !1);
              return (
                this.node.getProps().whileTap &&
                  this.node.animationState &&
                  this.node.animationState.setActive("whileTap", !1),
                !Ao()
              );
            }
            cancelPress(e, t) {
              if (!this.checkPressEnd()) return;
              const { onTapCancel: n } = this.node.getProps();
              n && go.update(() => n(e, t));
            }
            mount() {
              const e = this.node.getProps(),
                t = Co(
                  e.globalTapTarget ? window : this.node.current,
                  "pointerdown",
                  this.startPointerPress,
                  { passive: !(e.onTapStart || e.onPointerStart) }
                ),
                n = So(this.node.current, "focus", this.startAccessiblePress);
              this.removeStartListeners = Eo(t, n);
            }
            unmount() {
              this.removeStartListeners(),
                this.removeEndListeners(),
                this.removeAccessibleListeners();
            }
          },
        },
        focus: {
          Feature: class extends zo {
            constructor() {
              super(...arguments), (this.isActive = !1);
            }
            onFocus() {
              let e = !1;
              try {
                e = this.node.current.matches(":focus-visible");
              } catch (Yp) {
                e = !0;
              }
              e &&
                this.node.animationState &&
                (this.node.animationState.setActive("whileFocus", !0),
                (this.isActive = !0));
            }
            onBlur() {
              this.isActive &&
                this.node.animationState &&
                (this.node.animationState.setActive("whileFocus", !1),
                (this.isActive = !1));
            }
            mount() {
              this.unmount = Eo(
                So(this.node.current, "focus", () => this.onFocus()),
                So(this.node.current, "blur", () => this.onBlur())
              );
            }
            unmount() {}
          },
        },
        hover: {
          Feature: class extends zo {
            mount() {
              this.unmount = Eo(Do(this.node, !0), Do(this.node, !1));
            }
            unmount() {}
          },
        },
      };
      function $o(e, t) {
        if (!Array.isArray(t)) return !1;
        const n = t.length;
        if (n !== e.length) return !1;
        for (let r = 0; r < n; r++) if (t[r] !== e[r]) return !1;
        return !0;
      }
      function Ho(e, t, n) {
        const r = e.getProps();
        return ao(
          r,
          t,
          void 0 !== n ? n : r.custom,
          (function (e) {
            const t = {};
            return e.values.forEach((e, n) => (t[n] = e.get())), t;
          })(e),
          (function (e) {
            const t = {};
            return e.values.forEach((e, n) => (t[n] = e.getVelocity())), t;
          })(e)
        );
      }
      let Yo = fo,
        qo = fo;
      const Go = (e) => 1e3 * e,
        Ko = (e) => e / 1e3,
        Qo = !1,
        Xo = (e) => Array.isArray(e) && "number" === typeof e[0];
      function Jo(e) {
        return Boolean(
          !e ||
            ("string" === typeof e && ea[e]) ||
            Xo(e) ||
            (Array.isArray(e) && e.every(Jo))
        );
      }
      const Zo = (e) => {
          let [t, n, r, i] = e;
          return `cubic-bezier(${t}, ${n}, ${r}, ${i})`;
        },
        ea = {
          linear: "linear",
          ease: "ease",
          easeIn: "ease-in",
          easeOut: "ease-out",
          easeInOut: "ease-in-out",
          circIn: Zo([0, 0.65, 0.55, 1]),
          circOut: Zo([0.55, 0, 1, 0.45]),
          backIn: Zo([0.31, 0.01, 0.66, -0.59]),
          backOut: Zo([0.33, 1.53, 0.69, 0.99]),
        };
      function ta(e) {
        if (e) return Xo(e) ? Zo(e) : Array.isArray(e) ? e.map(ta) : ea[e];
      }
      const na = (e, t, n) =>
        (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e;
      function ra(e, t, n, r) {
        if (e === t && n === r) return fo;
        const i = (t) =>
          (function (e, t, n, r, i) {
            let o,
              a,
              s = 0;
            do {
              (a = t + (n - t) / 2),
                (o = na(a, r, i) - e),
                o > 0 ? (n = a) : (t = a);
            } while (Math.abs(o) > 1e-7 && ++s < 12);
            return a;
          })(t, 0, 1, e, n);
        return (e) => (0 === e || 1 === e ? e : na(i(e), t, r));
      }
      const ia = ra(0.42, 0, 1, 1),
        oa = ra(0, 0, 0.58, 1),
        aa = ra(0.42, 0, 0.58, 1),
        sa = (e) => (t) => t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2,
        la = (e) => (t) => 1 - e(1 - t),
        ca = (e) => 1 - Math.sin(Math.acos(e)),
        ua = la(ca),
        da = sa(ca),
        ha = ra(0.33, 1.53, 0.69, 0.99),
        fa = la(ha),
        pa = sa(fa),
        ma = {
          linear: fo,
          easeIn: ia,
          easeInOut: aa,
          easeOut: oa,
          circIn: ca,
          circInOut: da,
          circOut: ua,
          backIn: fa,
          backInOut: pa,
          backOut: ha,
          anticipate: (e) =>
            (e *= 2) < 1 ? 0.5 * fa(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))),
        },
        ga = (e) => {
          if (Array.isArray(e)) {
            qo(
              4 === e.length,
              "Cubic bezier arrays must contain four numerical values."
            );
            const [t, n, r, i] = e;
            return ra(t, n, r, i);
          }
          return "string" === typeof e
            ? (qo(void 0 !== ma[e], `Invalid easing type '${e}'`), ma[e])
            : e;
        },
        va = (e, t) => (n) =>
          Boolean(
            (Ti(n) && Ei.test(n) && n.startsWith(e)) ||
              (t && Object.prototype.hasOwnProperty.call(n, t))
          ),
        ya = (e, t, n) => (r) => {
          if (!Ti(r)) return r;
          const [i, o, a, s] = r.match(Ci);
          return {
            [e]: parseFloat(i),
            [t]: parseFloat(o),
            [n]: parseFloat(a),
            alpha: void 0 !== s ? parseFloat(s) : 1,
          };
        },
        xa = { ...wi, transform: (e) => Math.round(((e) => bi(0, 255, e))(e)) },
        ba = {
          test: va("rgb", "red"),
          parse: ya("red", "green", "blue"),
          transform: (e) => {
            let { red: t, green: n, blue: r, alpha: i = 1 } = e;
            return (
              "rgba(" +
              xa.transform(t) +
              ", " +
              xa.transform(n) +
              ", " +
              xa.transform(r) +
              ", " +
              ji(Si.transform(i)) +
              ")"
            );
          },
        };
      const wa = {
          test: va("#"),
          parse: function (e) {
            let t = "",
              n = "",
              r = "",
              i = "";
            return (
              e.length > 5
                ? ((t = e.substring(1, 3)),
                  (n = e.substring(3, 5)),
                  (r = e.substring(5, 7)),
                  (i = e.substring(7, 9)))
                : ((t = e.substring(1, 2)),
                  (n = e.substring(2, 3)),
                  (r = e.substring(3, 4)),
                  (i = e.substring(4, 5)),
                  (t += t),
                  (n += n),
                  (r += r),
                  (i += i)),
              {
                red: parseInt(t, 16),
                green: parseInt(n, 16),
                blue: parseInt(r, 16),
                alpha: i ? parseInt(i, 16) / 255 : 1,
              }
            );
          },
          transform: ba.transform,
        },
        Sa = {
          test: va("hsl", "hue"),
          parse: ya("hue", "saturation", "lightness"),
          transform: (e) => {
            let { hue: t, saturation: n, lightness: r, alpha: i = 1 } = e;
            return (
              "hsla(" +
              Math.round(t) +
              ", " +
              Oi.transform(ji(n)) +
              ", " +
              Oi.transform(ji(r)) +
              ", " +
              ji(Si.transform(i)) +
              ")"
            );
          },
        },
        ka = {
          test: (e) => ba.test(e) || wa.test(e) || Sa.test(e),
          parse: (e) =>
            ba.test(e) ? ba.parse(e) : Sa.test(e) ? Sa.parse(e) : wa.parse(e),
          transform: (e) =>
            Ti(e)
              ? e
              : e.hasOwnProperty("red")
              ? ba.transform(e)
              : Sa.transform(e),
        },
        ja = (e, t, n) => -n * e + n * t + e;
      function Ca(e, t, n) {
        return (
          n < 0 && (n += 1),
          n > 1 && (n -= 1),
          n < 1 / 6
            ? e + 6 * (t - e) * n
            : n < 0.5
            ? t
            : n < 2 / 3
            ? e + (t - e) * (2 / 3 - n) * 6
            : e
        );
      }
      const Pa = (e, t, n) => {
          const r = e * e;
          return Math.sqrt(Math.max(0, n * (t * t - r) + r));
        },
        Ea = [wa, ba, Sa];
      function Ta(e) {
        const t = ((e) => Ea.find((t) => t.test(e)))(e);
        qo(
          Boolean(t),
          `'${e}' is not an animatable color. Use the equivalent color code instead.`
        );
        let n = t.parse(e);
        return (
          t === Sa &&
            (n = (function (e) {
              let { hue: t, saturation: n, lightness: r, alpha: i } = e;
              (t /= 360), (n /= 100), (r /= 100);
              let o = 0,
                a = 0,
                s = 0;
              if (n) {
                const e = r < 0.5 ? r * (1 + n) : r + n - r * n,
                  i = 2 * r - e;
                (o = Ca(i, e, t + 1 / 3)),
                  (a = Ca(i, e, t)),
                  (s = Ca(i, e, t - 1 / 3));
              } else o = a = s = r;
              return {
                red: Math.round(255 * o),
                green: Math.round(255 * a),
                blue: Math.round(255 * s),
                alpha: i,
              };
            })(n)),
          n
        );
      }
      const Ra = (e, t) => {
        const n = Ta(e),
          r = Ta(t),
          i = { ...n };
        return (e) => (
          (i.red = Pa(n.red, r.red, e)),
          (i.green = Pa(n.green, r.green, e)),
          (i.blue = Pa(n.blue, r.blue, e)),
          (i.alpha = ja(n.alpha, r.alpha, e)),
          ba.transform(i)
        );
      };
      const _a = {
          regex:
            /var\s*\(\s*--[\w-]+(\s*,\s*(?:(?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)+)?\s*\)/g,
          countKey: "Vars",
          token: "${v}",
          parse: fo,
        },
        Oa = { regex: Pi, countKey: "Colors", token: "${c}", parse: ka.parse },
        Aa = { regex: Ci, countKey: "Numbers", token: "${n}", parse: wi.parse };
      function za(e, t) {
        let { regex: n, countKey: r, token: i, parse: o } = t;
        const a = e.tokenised.match(n);
        a &&
          ((e["num" + r] = a.length),
          (e.tokenised = e.tokenised.replace(n, i)),
          e.values.push(...a.map(o)));
      }
      function Da(e) {
        const t = e.toString(),
          n = {
            value: t,
            tokenised: t,
            values: [],
            numVars: 0,
            numColors: 0,
            numNumbers: 0,
          };
        return n.value.includes("var(--") && za(n, _a), za(n, Oa), za(n, Aa), n;
      }
      function Na(e) {
        return Da(e).values;
      }
      function La(e) {
        const { values: t, numColors: n, numVars: r, tokenised: i } = Da(e),
          o = t.length;
        return (e) => {
          let t = i;
          for (let i = 0; i < o; i++)
            t =
              i < r
                ? t.replace(_a.token, e[i])
                : i < r + n
                ? t.replace(Oa.token, ka.transform(e[i]))
                : t.replace(Aa.token, ji(e[i]));
          return t;
        };
      }
      const Ma = (e) => ("number" === typeof e ? 0 : e);
      const Fa = {
          test: function (e) {
            var t, n;
            return (
              isNaN(e) &&
              Ti(e) &&
              ((null === (t = e.match(Ci)) || void 0 === t
                ? void 0
                : t.length) || 0) +
                ((null === (n = e.match(Pi)) || void 0 === n
                  ? void 0
                  : n.length) || 0) >
                0
            );
          },
          parse: Na,
          createTransformer: La,
          getAnimatableNone: function (e) {
            const t = Na(e);
            return La(e)(t.map(Ma));
          },
        },
        Ia = (e, t) => (n) => `${n > 0 ? t : e}`;
      function Va(e, t) {
        return "number" === typeof e
          ? (n) => ja(e, t, n)
          : ka.test(e)
          ? Ra(e, t)
          : e.startsWith("var(")
          ? Ia(e, t)
          : Wa(e, t);
      }
      const Ba = (e, t) => {
          const n = [...e],
            r = n.length,
            i = e.map((e, n) => Va(e, t[n]));
          return (e) => {
            for (let t = 0; t < r; t++) n[t] = i[t](e);
            return n;
          };
        },
        Ua = (e, t) => {
          const n = { ...e, ...t },
            r = {};
          for (const i in n)
            void 0 !== e[i] && void 0 !== t[i] && (r[i] = Va(e[i], t[i]));
          return (e) => {
            for (const t in r) n[t] = r[t](e);
            return n;
          };
        },
        Wa = (e, t) => {
          const n = Fa.createTransformer(t),
            r = Da(e),
            i = Da(t);
          return r.numVars === i.numVars &&
            r.numColors === i.numColors &&
            r.numNumbers >= i.numNumbers
            ? Eo(Ba(r.values, i.values), n)
            : (Yo(
                !0,
                `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`
              ),
              Ia(e, t));
        },
        $a = (e, t, n) => {
          const r = t - e;
          return 0 === r ? 1 : (n - e) / r;
        },
        Ha = (e, t) => (n) => ja(e, t, n);
      function Ya(e, t, n) {
        const r = [],
          i =
            n ||
            (function (e) {
              return "number" === typeof e
                ? Ha
                : "string" === typeof e
                ? ka.test(e)
                  ? Ra
                  : Wa
                : Array.isArray(e)
                ? Ba
                : "object" === typeof e
                ? Ua
                : Ha;
            })(e[0]),
          o = e.length - 1;
        for (let a = 0; a < o; a++) {
          let n = i(e[a], e[a + 1]);
          if (t) {
            const e = Array.isArray(t) ? t[a] || fo : t;
            n = Eo(e, n);
          }
          r.push(n);
        }
        return r;
      }
      function qa(e, t) {
        let {
          clamp: n = !0,
          ease: r,
          mixer: i,
        } = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
        const o = e.length;
        if (
          (qo(
            o === t.length,
            "Both input and output ranges must be the same length"
          ),
          1 === o)
        )
          return () => t[0];
        e[0] > e[o - 1] && ((e = [...e].reverse()), (t = [...t].reverse()));
        const a = Ya(t, r, i),
          s = a.length,
          l = (t) => {
            let n = 0;
            if (s > 1) for (; n < e.length - 2 && !(t < e[n + 1]); n++);
            const r = $a(e[n], e[n + 1], t);
            return a[n](r);
          };
        return n ? (t) => l(bi(e[0], e[o - 1], t)) : l;
      }
      function Ga(e) {
        const t = [0];
        return (
          (function (e, t) {
            const n = e[e.length - 1];
            for (let r = 1; r <= t; r++) {
              const i = $a(0, t, r);
              e.push(ja(n, 1, i));
            }
          })(t, e.length - 1),
          t
        );
      }
      function Ka(e) {
        let {
          duration: t = 300,
          keyframes: n,
          times: r,
          ease: i = "easeInOut",
        } = e;
        const o = ((e) => Array.isArray(e) && "number" !== typeof e[0])(i)
            ? i.map(ga)
            : ga(i),
          a = { done: !1, value: n[0] },
          s = (function (e, t) {
            return e.map((e) => e * t);
          })(r && r.length === n.length ? r : Ga(n), t),
          l = qa(s, n, {
            ease: Array.isArray(o)
              ? o
              : ((c = n),
                (u = o),
                c.map(() => u || aa).splice(0, c.length - 1)),
          });
        var c, u;
        return {
          calculatedDuration: t,
          next: (e) => ((a.value = l(e)), (a.done = e >= t), a),
        };
      }
      function Qa(e, t) {
        return t ? e * (1e3 / t) : 0;
      }
      function Xa(e, t, n) {
        const r = Math.max(t - 5, 0);
        return Qa(n - e(r), t - r);
      }
      const Ja = 0.001;
      function Za(e) {
        let t,
          n,
          {
            duration: r = 800,
            bounce: i = 0.25,
            velocity: o = 0,
            mass: a = 1,
          } = e;
        Yo(r <= Go(10), "Spring duration must be 10 seconds or less");
        let s = 1 - i;
        (s = bi(0.05, 1, s)),
          (r = bi(0.01, 10, Ko(r))),
          s < 1
            ? ((t = (e) => {
                const t = e * s,
                  n = t * r,
                  i = t - o,
                  a = ts(e, s),
                  l = Math.exp(-n);
                return Ja - (i / a) * l;
              }),
              (n = (e) => {
                const n = e * s * r,
                  i = n * o + o,
                  a = Math.pow(s, 2) * Math.pow(e, 2) * r,
                  l = Math.exp(-n),
                  c = ts(Math.pow(e, 2), s);
                return ((-t(e) + Ja > 0 ? -1 : 1) * ((i - a) * l)) / c;
              }))
            : ((t = (e) => Math.exp(-e * r) * ((e - o) * r + 1) - 0.001),
              (n = (e) => Math.exp(-e * r) * (r * r * (o - e))));
        const l = (function (e, t, n) {
          let r = n;
          for (let i = 1; i < es; i++) r -= e(r) / t(r);
          return r;
        })(t, n, 5 / r);
        if (((r = Go(r)), isNaN(l)))
          return { stiffness: 100, damping: 10, duration: r };
        {
          const e = Math.pow(l, 2) * a;
          return {
            stiffness: e,
            damping: 2 * s * Math.sqrt(a * e),
            duration: r,
          };
        }
      }
      const es = 12;
      function ts(e, t) {
        return e * Math.sqrt(1 - t * t);
      }
      const ns = ["duration", "bounce"],
        rs = ["stiffness", "damping", "mass"];
      function is(e, t) {
        return t.some((t) => void 0 !== e[t]);
      }
      function os(e) {
        let { keyframes: t, restDelta: n, restSpeed: r, ...i } = e;
        const o = t[0],
          a = t[t.length - 1],
          s = { done: !1, value: o },
          {
            stiffness: l,
            damping: c,
            mass: u,
            duration: d,
            velocity: h,
            isResolvedFromDuration: f,
          } = (function (e) {
            let t = {
              velocity: 0,
              stiffness: 100,
              damping: 10,
              mass: 1,
              isResolvedFromDuration: !1,
              ...e,
            };
            if (!is(e, rs) && is(e, ns)) {
              const n = Za(e);
              (t = { ...t, ...n, mass: 1 }), (t.isResolvedFromDuration = !0);
            }
            return t;
          })({ ...i, velocity: -Ko(i.velocity || 0) }),
          p = h || 0,
          m = c / (2 * Math.sqrt(l * u)),
          g = a - o,
          v = Ko(Math.sqrt(l / u)),
          y = Math.abs(g) < 5;
        let x;
        if ((r || (r = y ? 0.01 : 2), n || (n = y ? 0.005 : 0.5), m < 1)) {
          const e = ts(v, m);
          x = (t) => {
            const n = Math.exp(-m * v * t);
            return (
              a -
              n *
                (((p + m * v * g) / e) * Math.sin(e * t) + g * Math.cos(e * t))
            );
          };
        } else if (1 === m)
          x = (e) => a - Math.exp(-v * e) * (g + (p + v * g) * e);
        else {
          const e = v * Math.sqrt(m * m - 1);
          x = (t) => {
            const n = Math.exp(-m * v * t),
              r = Math.min(e * t, 300);
            return (
              a -
              (n * ((p + m * v * g) * Math.sinh(r) + e * g * Math.cosh(r))) / e
            );
          };
        }
        return {
          calculatedDuration: (f && d) || null,
          next: (e) => {
            const t = x(e);
            if (f) s.done = e >= d;
            else {
              let i = p;
              0 !== e && (i = m < 1 ? Xa(x, e, t) : 0);
              const o = Math.abs(i) <= r,
                l = Math.abs(a - t) <= n;
              s.done = o && l;
            }
            return (s.value = s.done ? a : t), s;
          },
        };
      }
      function as(e) {
        let {
          keyframes: t,
          velocity: n = 0,
          power: r = 0.8,
          timeConstant: i = 325,
          bounceDamping: o = 10,
          bounceStiffness: a = 500,
          modifyTarget: s,
          min: l,
          max: c,
          restDelta: u = 0.5,
          restSpeed: d,
        } = e;
        const h = t[0],
          f = { done: !1, value: h },
          p = (e) =>
            void 0 === l
              ? c
              : void 0 === c || Math.abs(l - e) < Math.abs(c - e)
              ? l
              : c;
        let m = r * n;
        const g = h + m,
          v = void 0 === s ? g : s(g);
        v !== g && (m = v - h);
        const y = (e) => -m * Math.exp(-e / i),
          x = (e) => v + y(e),
          b = (e) => {
            const t = y(e),
              n = x(e);
            (f.done = Math.abs(t) <= u), (f.value = f.done ? v : n);
          };
        let w, S;
        const k = (e) => {
          ((e) => (void 0 !== l && e < l) || (void 0 !== c && e > c))(
            f.value
          ) &&
            ((w = e),
            (S = os({
              keyframes: [f.value, p(f.value)],
              velocity: Xa(x, e, f.value),
              damping: o,
              stiffness: a,
              restDelta: u,
              restSpeed: d,
            })));
        };
        return (
          k(0),
          {
            calculatedDuration: null,
            next: (e) => {
              let t = !1;
              return (
                S || void 0 !== w || ((t = !0), b(e), k(e)),
                void 0 !== w && e > w ? S.next(e - w) : (!t && b(e), f)
              );
            },
          }
        );
      }
      const ss = (e) => {
        const t = (t) => {
          let { timestamp: n } = t;
          return e(n);
        };
        return {
          start: () => go.update(t, !0),
          stop: () => vo(t),
          now: () => (yo.isProcessing ? yo.timestamp : performance.now()),
        };
      };
      function ls(e) {
        let t = 0;
        let n = e.next(t);
        for (; !n.done && t < 2e4; ) (t += 50), (n = e.next(t));
        return t >= 2e4 ? 1 / 0 : t;
      }
      const cs = {
        decay: as,
        inertia: as,
        tween: Ka,
        keyframes: Ka,
        spring: os,
      };
      function us(e) {
        let t,
          n,
          {
            autoplay: r = !0,
            delay: i = 0,
            driver: o = ss,
            keyframes: a,
            type: s = "keyframes",
            repeat: l = 0,
            repeatDelay: c = 0,
            repeatType: u = "loop",
            onPlay: d,
            onStop: h,
            onComplete: f,
            onUpdate: p,
            ...m
          } = e,
          g = 1,
          v = !1;
        const y = () => {
          n = new Promise((e) => {
            t = e;
          });
        };
        let x;
        y();
        const b = cs[s] || Ka;
        let w;
        b !== Ka &&
          "number" !== typeof a[0] &&
          ((w = qa([0, 100], a, { clamp: !1 })), (a = [0, 100]));
        const S = b({ ...m, keyframes: a });
        let k;
        "mirror" === u &&
          (k = b({
            ...m,
            keyframes: [...a].reverse(),
            velocity: -(m.velocity || 0),
          }));
        let j = "idle",
          C = null,
          P = null,
          E = null;
        null === S.calculatedDuration && l && (S.calculatedDuration = ls(S));
        const { calculatedDuration: T } = S;
        let R = 1 / 0,
          _ = 1 / 0;
        null !== T && ((R = T + c), (_ = R * (l + 1) - c));
        let O = 0;
        const A = (e) => {
            if (null === P) return;
            g > 0 && (P = Math.min(P, e)),
              g < 0 && (P = Math.min(e - _ / g, P)),
              (O = null !== C ? C : Math.round(e - P) * g);
            const t = O - i * (g >= 0 ? 1 : -1),
              n = g >= 0 ? t < 0 : t > _;
            (O = Math.max(t, 0)), "finished" === j && null === C && (O = _);
            let r = O,
              o = S;
            if (l) {
              const e = Math.min(O, _) / R;
              let t = Math.floor(e),
                n = e % 1;
              !n && e >= 1 && (n = 1), 1 === n && t--, (t = Math.min(t, l + 1));
              Boolean(t % 2) &&
                ("reverse" === u
                  ? ((n = 1 - n), c && (n -= c / R))
                  : "mirror" === u && (o = k)),
                (r = bi(0, 1, n) * R);
            }
            const s = n ? { done: !1, value: a[0] } : o.next(r);
            w && (s.value = w(s.value));
            let { done: d } = s;
            n || null === T || (d = g >= 0 ? O >= _ : O <= 0);
            const h =
              null === C && ("finished" === j || ("running" === j && d));
            return p && p(s.value), h && N(), s;
          },
          z = () => {
            x && x.stop(), (x = void 0);
          },
          D = () => {
            (j = "idle"), z(), t(), y(), (P = E = null);
          },
          N = () => {
            (j = "finished"), f && f(), z(), t();
          },
          L = () => {
            if (v) return;
            x || (x = o(A));
            const e = x.now();
            d && d(),
              null !== C ? (P = e - C) : (P && "finished" !== j) || (P = e),
              "finished" === j && y(),
              (E = P),
              (C = null),
              (j = "running"),
              x.start();
          };
        r && L();
        const M = {
          then: (e, t) => n.then(e, t),
          get time() {
            return Ko(O);
          },
          set time(e) {
            (e = Go(e)),
              (O = e),
              null === C && x && 0 !== g ? (P = x.now() - e / g) : (C = e);
          },
          get duration() {
            const e =
              null === S.calculatedDuration ? ls(S) : S.calculatedDuration;
            return Ko(e);
          },
          get speed() {
            return g;
          },
          set speed(e) {
            e !== g && x && ((g = e), (M.time = Ko(O)));
          },
          get state() {
            return j;
          },
          play: L,
          pause: () => {
            (j = "paused"), (C = O);
          },
          stop: () => {
            (v = !0), "idle" !== j && ((j = "idle"), h && h(), D());
          },
          cancel: () => {
            null !== E && A(E), D();
          },
          complete: () => {
            j = "finished";
          },
          sample: (e) => ((P = 0), A(e)),
        };
        return M;
      }
      const ds = (function (e) {
          let t;
          return () => (void 0 === t && (t = e()), t);
        })(() => Object.hasOwnProperty.call(Element.prototype, "animate")),
        hs = new Set([
          "opacity",
          "clipPath",
          "filter",
          "transform",
          "backgroundColor",
        ]);
      function fs(e, t, n) {
        let { onUpdate: r, onComplete: i, ...o } = n;
        if (
          !(
            ds() &&
            hs.has(t) &&
            !o.repeatDelay &&
            "mirror" !== o.repeatType &&
            0 !== o.damping &&
            "inertia" !== o.type
          )
        )
          return !1;
        let a,
          s,
          l = !1,
          c = !1;
        const u = () => {
          s = new Promise((e) => {
            a = e;
          });
        };
        u();
        let { keyframes: d, duration: h = 300, ease: f, times: p } = o;
        if (
          ((e, t) =>
            "spring" === t.type || "backgroundColor" === e || !Jo(t.ease))(t, o)
        ) {
          const e = us({ ...o, repeat: 0, delay: 0 });
          let t = { done: !1, value: d[0] };
          const n = [];
          let r = 0;
          for (; !t.done && r < 2e4; )
            (t = e.sample(r)), n.push(t.value), (r += 10);
          (p = void 0), (d = n), (h = r - 10), (f = "linear");
        }
        const m = (function (e, t, n) {
            let {
              delay: r = 0,
              duration: i,
              repeat: o = 0,
              repeatType: a = "loop",
              ease: s,
              times: l,
            } = arguments.length > 3 && void 0 !== arguments[3]
              ? arguments[3]
              : {};
            const c = { [t]: n };
            l && (c.offset = l);
            const u = ta(s);
            return (
              Array.isArray(u) && (c.easing = u),
              e.animate(c, {
                delay: r,
                duration: i,
                easing: Array.isArray(u) ? "linear" : u,
                fill: "both",
                iterations: o + 1,
                direction: "reverse" === a ? "alternate" : "normal",
              })
            );
          })(e.owner.current, t, d, { ...o, duration: h, ease: f, times: p }),
          g = () => {
            (c = !1), m.cancel();
          },
          v = () => {
            (c = !0), go.update(g), a(), u();
          };
        m.onfinish = () => {
          c ||
            (e.set(
              (function (e, t) {
                let { repeat: n, repeatType: r = "loop" } = t;
                return e[n && "loop" !== r && n % 2 === 1 ? 0 : e.length - 1];
              })(d, o)
            ),
            i && i(),
            v());
        };
        return {
          then: (e, t) => s.then(e, t),
          attachTimeline: (e) => ((m.timeline = e), (m.onfinish = null), fo),
          get time() {
            return Ko(m.currentTime || 0);
          },
          set time(e) {
            m.currentTime = Go(e);
          },
          get speed() {
            return m.playbackRate;
          },
          set speed(e) {
            m.playbackRate = e;
          },
          get duration() {
            return Ko(h);
          },
          play: () => {
            l || (m.play(), vo(g));
          },
          pause: () => m.pause(),
          stop: () => {
            if (((l = !0), "idle" === m.playState)) return;
            const { currentTime: t } = m;
            if (t) {
              const n = us({ ...o, autoplay: !1 });
              e.setWithVelocity(n.sample(t - 10).value, n.sample(t).value, 10);
            }
            v();
          },
          complete: () => {
            c || m.finish();
          },
          cancel: v,
        };
      }
      const ps = { type: "spring", stiffness: 500, damping: 25, restSpeed: 10 },
        ms = { type: "keyframes", duration: 0.8 },
        gs = { type: "keyframes", ease: [0.25, 0.1, 0.35, 1], duration: 0.3 },
        vs = (e, t) => {
          let { keyframes: n } = t;
          return n.length > 2
            ? ms
            : di.has(e)
            ? e.startsWith("scale")
              ? {
                  type: "spring",
                  stiffness: 550,
                  damping: 0 === n[1] ? 2 * Math.sqrt(550) : 30,
                  restSpeed: 10,
                }
              : ps
            : gs;
        },
        ys = (e, t) =>
          "zIndex" !== e &&
          (!("number" !== typeof t && !Array.isArray(t)) ||
            !(
              "string" !== typeof t ||
              (!Fa.test(t) && "0" !== t) ||
              t.startsWith("url(")
            )),
        xs = new Set(["brightness", "contrast", "saturate", "opacity"]);
      function bs(e) {
        const [t, n] = e.slice(0, -1).split("(");
        if ("drop-shadow" === t) return e;
        const [r] = n.match(Ci) || [];
        if (!r) return e;
        const i = n.replace(r, "");
        let o = xs.has(t) ? 1 : 0;
        return r !== n && (o *= 100), t + "(" + o + i + ")";
      }
      const ws = /([a-z-]*)\(.*?\)/g,
        Ss = {
          ...Fa,
          getAnimatableNone: (e) => {
            const t = e.match(ws);
            return t ? t.map(bs).join(" ") : e;
          },
        },
        ks = {
          ...Mi,
          color: ka,
          backgroundColor: ka,
          outlineColor: ka,
          fill: ka,
          stroke: ka,
          borderColor: ka,
          borderTopColor: ka,
          borderRightColor: ka,
          borderBottomColor: ka,
          borderLeftColor: ka,
          filter: Ss,
          WebkitFilter: Ss,
        },
        js = (e) => ks[e];
      function Cs(e, t) {
        let n = js(e);
        return (
          n !== Ss && (n = Fa),
          n.getAnimatableNone ? n.getAnimatableNone(t) : void 0
        );
      }
      const Ps = (e) => /^0[^.\s]+$/.test(e);
      function Es(e) {
        return "number" === typeof e
          ? 0 === e
          : null !== e
          ? "none" === e || "0" === e || Ps(e)
          : void 0;
      }
      function Ts(e, t) {
        return e[t] || e.default || e;
      }
      const Rs = !1,
        _s = function (e, t, n) {
          let r =
            arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
          return (i) => {
            const o = Ts(r, e) || {},
              a = o.delay || r.delay || 0;
            let { elapsed: s = 0 } = r;
            s -= Go(a);
            const l = (function (e, t, n, r) {
                const i = ys(t, n);
                let o;
                o = Array.isArray(n) ? [...n] : [null, n];
                const a = void 0 !== r.from ? r.from : e.get();
                let s;
                const l = [];
                for (let c = 0; c < o.length; c++)
                  null === o[c] && (o[c] = 0 === c ? a : o[c - 1]),
                    Es(o[c]) && l.push(c),
                    "string" === typeof o[c] &&
                      "none" !== o[c] &&
                      "0" !== o[c] &&
                      (s = o[c]);
                if (i && l.length && s)
                  for (let c = 0; c < l.length; c++) o[l[c]] = Cs(t, s);
                return o;
              })(t, e, n, o),
              c = l[0],
              u = l[l.length - 1],
              d = ys(e, c),
              h = ys(e, u);
            Yo(
              d === h,
              `You are trying to animate ${e} from "${c}" to "${u}". ${c} is not an animatable value - to enable this animation set ${c} to a value animatable to ${u} via the \`style\` property.`
            );
            let f = {
              keyframes: l,
              velocity: t.getVelocity(),
              ease: "easeOut",
              ...o,
              delay: -s,
              onUpdate: (e) => {
                t.set(e), o.onUpdate && o.onUpdate(e);
              },
              onComplete: () => {
                i(), o.onComplete && o.onComplete();
              },
            };
            if (
              ((function (e) {
                let {
                  when: t,
                  delay: n,
                  delayChildren: r,
                  staggerChildren: i,
                  staggerDirection: o,
                  repeat: a,
                  repeatType: s,
                  repeatDelay: l,
                  from: c,
                  elapsed: u,
                  ...d
                } = e;
                return !!Object.keys(d).length;
              })(o) || (f = { ...f, ...vs(e, f) }),
              f.duration && (f.duration = Go(f.duration)),
              f.repeatDelay && (f.repeatDelay = Go(f.repeatDelay)),
              !d || !h || Qo || !1 === o.type || Rs)
            )
              return (function (e) {
                let { keyframes: t, delay: n, onUpdate: r, onComplete: i } = e;
                const o = () => (
                  r && r(t[t.length - 1]),
                  i && i(),
                  {
                    time: 0,
                    speed: 1,
                    duration: 0,
                    play: fo,
                    pause: fo,
                    stop: fo,
                    then: (e) => (e(), Promise.resolve()),
                    cancel: fo,
                    complete: fo,
                  }
                );
                return n
                  ? us({
                      keyframes: [0, 1],
                      duration: 0,
                      delay: n,
                      onComplete: o,
                    })
                  : o();
              })(Qo ? { ...f, delay: 0 } : f);
            if (
              !r.isHandoff &&
              t.owner &&
              t.owner.current instanceof HTMLElement &&
              !t.owner.getProps().onUpdate
            ) {
              const n = fs(t, e, f);
              if (n) return n;
            }
            return us(f);
          };
        };
      function Os(e) {
        return Boolean(fi(e) && e.add);
      }
      const As = (e) => /^\-?\d*\.?\d+$/.test(e);
      function zs(e, t) {
        -1 === e.indexOf(t) && e.push(t);
      }
      function Ds(e, t) {
        const n = e.indexOf(t);
        n > -1 && e.splice(n, 1);
      }
      class Ns {
        constructor() {
          this.subscriptions = [];
        }
        add(e) {
          return zs(this.subscriptions, e), () => Ds(this.subscriptions, e);
        }
        notify(e, t, n) {
          const r = this.subscriptions.length;
          if (r)
            if (1 === r) this.subscriptions[0](e, t, n);
            else
              for (let i = 0; i < r; i++) {
                const r = this.subscriptions[i];
                r && r(e, t, n);
              }
        }
        getSize() {
          return this.subscriptions.length;
        }
        clear() {
          this.subscriptions.length = 0;
        }
      }
      const Ls = { current: void 0 };
      class Ms {
        constructor(e) {
          var t = this;
          let n =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          var r;
          (this.version = "10.18.0"),
            (this.timeDelta = 0),
            (this.lastUpdated = 0),
            (this.canTrackVelocity = !1),
            (this.events = {}),
            (this.updateAndNotify = function (e) {
              let n =
                !(arguments.length > 1 && void 0 !== arguments[1]) ||
                arguments[1];
              (t.prev = t.current), (t.current = e);
              const { delta: r, timestamp: i } = yo;
              t.lastUpdated !== i &&
                ((t.timeDelta = r),
                (t.lastUpdated = i),
                go.postRender(t.scheduleVelocityCheck)),
                t.prev !== t.current &&
                  t.events.change &&
                  t.events.change.notify(t.current),
                t.events.velocityChange &&
                  t.events.velocityChange.notify(t.getVelocity()),
                n &&
                  t.events.renderRequest &&
                  t.events.renderRequest.notify(t.current);
            }),
            (this.scheduleVelocityCheck = () =>
              go.postRender(this.velocityCheck)),
            (this.velocityCheck = (e) => {
              let { timestamp: t } = e;
              t !== this.lastUpdated &&
                ((this.prev = this.current),
                this.events.velocityChange &&
                  this.events.velocityChange.notify(this.getVelocity()));
            }),
            (this.hasAnimated = !1),
            (this.prev = this.current = e),
            (this.canTrackVelocity =
              ((r = this.current), !isNaN(parseFloat(r)))),
            (this.owner = n.owner);
        }
        onChange(e) {
          return this.on("change", e);
        }
        on(e, t) {
          this.events[e] || (this.events[e] = new Ns());
          const n = this.events[e].add(t);
          return "change" === e
            ? () => {
                n(),
                  go.read(() => {
                    this.events.change.getSize() || this.stop();
                  });
              }
            : n;
        }
        clearListeners() {
          for (const e in this.events) this.events[e].clear();
        }
        attach(e, t) {
          (this.passiveEffect = e), (this.stopPassiveEffect = t);
        }
        set(e) {
          let t =
            !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
          t && this.passiveEffect
            ? this.passiveEffect(e, this.updateAndNotify)
            : this.updateAndNotify(e, t);
        }
        setWithVelocity(e, t, n) {
          this.set(t), (this.prev = e), (this.timeDelta = n);
        }
        jump(e) {
          this.updateAndNotify(e),
            (this.prev = e),
            this.stop(),
            this.stopPassiveEffect && this.stopPassiveEffect();
        }
        get() {
          return Ls.current && Ls.current.push(this), this.current;
        }
        getPrevious() {
          return this.prev;
        }
        getVelocity() {
          return this.canTrackVelocity
            ? Qa(
                parseFloat(this.current) - parseFloat(this.prev),
                this.timeDelta
              )
            : 0;
        }
        start(e) {
          return (
            this.stop(),
            new Promise((t) => {
              (this.hasAnimated = !0),
                (this.animation = e(t)),
                this.events.animationStart &&
                  this.events.animationStart.notify();
            }).then(() => {
              this.events.animationComplete &&
                this.events.animationComplete.notify(),
                this.clearAnimation();
            })
          );
        }
        stop() {
          this.animation &&
            (this.animation.stop(),
            this.events.animationCancel &&
              this.events.animationCancel.notify()),
            this.clearAnimation();
        }
        isAnimating() {
          return !!this.animation;
        }
        clearAnimation() {
          delete this.animation;
        }
        destroy() {
          this.clearListeners(),
            this.stop(),
            this.stopPassiveEffect && this.stopPassiveEffect();
        }
      }
      function Fs(e, t) {
        return new Ms(e, t);
      }
      const Is = (e) => (t) => t.test(e),
        Vs = [
          wi,
          Ai,
          Oi,
          _i,
          Di,
          zi,
          { test: (e) => "auto" === e, parse: (e) => e },
        ],
        Bs = (e) => Vs.find(Is(e)),
        Us = [...Vs, ka, Fa],
        Ws = (e) => Us.find(Is(e));
      function $s(e, t, n) {
        e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, Fs(n));
      }
      function Hs(e, t) {
        const n = Ho(e, t);
        let {
          transitionEnd: r = {},
          transition: i = {},
          ...o
        } = n ? e.makeTargetAnimatable(n, !1) : {};
        o = { ...o, ...r };
        for (const a in o) {
          $s(e, a, lo(o[a]));
        }
      }
      function Ys(e, t) {
        if (!t) return;
        return (t[e] || t.default || t).from;
      }
      function qs(e, t) {
        let { protectedKeys: n, needsAnimating: r } = e;
        const i = n.hasOwnProperty(t) && !0 !== r[t];
        return (r[t] = !1), i;
      }
      function Gs(e, t) {
        const n = e.get();
        if (!Array.isArray(t)) return n !== t;
        for (let r = 0; r < t.length; r++) if (t[r] !== n) return !0;
      }
      function Ks(e, t) {
        let {
            delay: n = 0,
            transitionOverride: r,
            type: i,
          } = arguments.length > 2 && void 0 !== arguments[2]
            ? arguments[2]
            : {},
          {
            transition: o = e.getDefaultTransition(),
            transitionEnd: a,
            ...s
          } = e.makeTargetAnimatable(t);
        const l = e.getValue("willChange");
        r && (o = r);
        const c = [],
          u = i && e.animationState && e.animationState.getState()[i];
        for (const d in s) {
          const t = e.getValue(d),
            r = s[d];
          if (!t || void 0 === r || (u && qs(u, d))) continue;
          const i = { delay: n, elapsed: 0, ...Ts(o || {}, d) };
          if (window.HandoffAppearAnimations) {
            const n = e.getProps()[Wr];
            if (n) {
              const e = window.HandoffAppearAnimations(n, d, t, go);
              null !== e && ((i.elapsed = e), (i.isHandoff = !0));
            }
          }
          let a = !i.isHandoff && !Gs(t, r);
          if (
            ("spring" === i.type && (t.getVelocity() || i.velocity) && (a = !1),
            t.animation && (a = !1),
            a)
          )
            continue;
          t.start(
            _s(d, t, r, e.shouldReduceMotion && di.has(d) ? { type: !1 } : i)
          );
          const h = t.animation;
          Os(l) && (l.add(d), h.then(() => l.remove(d))), c.push(h);
        }
        return (
          a &&
            Promise.all(c).then(() => {
              a && Hs(e, a);
            }),
          c
        );
      }
      function Qs(e, t) {
        let n =
          arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
        const r = Ho(e, t, n.custom);
        let { transition: i = e.getDefaultTransition() || {} } = r || {};
        n.transitionOverride && (i = n.transitionOverride);
        const o = r ? () => Promise.all(Ks(e, r, n)) : () => Promise.resolve(),
          a =
            e.variantChildren && e.variantChildren.size
              ? function () {
                  let r =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : 0;
                  const {
                    delayChildren: o = 0,
                    staggerChildren: a,
                    staggerDirection: s,
                  } = i;
                  return (function (e, t) {
                    let n =
                        arguments.length > 2 && void 0 !== arguments[2]
                          ? arguments[2]
                          : 0,
                      r =
                        arguments.length > 3 && void 0 !== arguments[3]
                          ? arguments[3]
                          : 0,
                      i =
                        arguments.length > 4 && void 0 !== arguments[4]
                          ? arguments[4]
                          : 1,
                      o = arguments.length > 5 ? arguments[5] : void 0;
                    const a = [],
                      s = (e.variantChildren.size - 1) * r,
                      l =
                        1 === i
                          ? function () {
                              return (
                                (arguments.length > 0 && void 0 !== arguments[0]
                                  ? arguments[0]
                                  : 0) * r
                              );
                            }
                          : function () {
                              return (
                                s -
                                (arguments.length > 0 && void 0 !== arguments[0]
                                  ? arguments[0]
                                  : 0) *
                                  r
                              );
                            };
                    return (
                      Array.from(e.variantChildren)
                        .sort(Xs)
                        .forEach((e, r) => {
                          e.notify("AnimationStart", t),
                            a.push(
                              Qs(e, t, { ...o, delay: n + l(r) }).then(() =>
                                e.notify("AnimationComplete", t)
                              )
                            );
                        }),
                      Promise.all(a)
                    );
                  })(e, t, o + r, a, s, n);
                }
              : () => Promise.resolve(),
          { when: s } = i;
        if (s) {
          const [e, t] = "beforeChildren" === s ? [o, a] : [a, o];
          return e().then(() => t());
        }
        return Promise.all([o(), a(n.delay)]);
      }
      function Xs(e, t) {
        return e.sortNodePosition(t);
      }
      const Js = [...qr].reverse(),
        Zs = qr.length;
      function el(e) {
        return (t) =>
          Promise.all(
            t.map((t) => {
              let { animation: n, options: r } = t;
              return (function (e, t) {
                let n,
                  r =
                    arguments.length > 2 && void 0 !== arguments[2]
                      ? arguments[2]
                      : {};
                if ((e.notify("AnimationStart", t), Array.isArray(t))) {
                  const i = t.map((t) => Qs(e, t, r));
                  n = Promise.all(i);
                } else if ("string" === typeof t) n = Qs(e, t, r);
                else {
                  const i = "function" === typeof t ? Ho(e, t, r.custom) : t;
                  n = Promise.all(Ks(e, i, r));
                }
                return n.then(() => e.notify("AnimationComplete", t));
              })(e, n, r);
            })
          );
      }
      function tl(e) {
        let t = el(e);
        const n = {
          animate: rl(!0),
          whileInView: rl(),
          whileHover: rl(),
          whileTap: rl(),
          whileDrag: rl(),
          whileFocus: rl(),
          exit: rl(),
        };
        let r = !0;
        const i = (t, n) => {
          const r = Ho(e, n);
          if (r) {
            const { transition: e, transitionEnd: n, ...i } = r;
            t = { ...t, ...i, ...n };
          }
          return t;
        };
        function o(o, a) {
          const s = e.getProps(),
            l = e.getVariantContext(!0) || {},
            c = [],
            u = new Set();
          let d = {},
            h = 1 / 0;
          for (let t = 0; t < Zs; t++) {
            const f = Js[t],
              p = n[f],
              m = void 0 !== s[f] ? s[f] : l[f],
              g = Hr(m),
              v = f === a ? p.isActive : null;
            !1 === v && (h = t);
            let y = m === l[f] && m !== s[f] && g;
            if (
              (y && r && e.manuallyAnimateOnMount && (y = !1),
              (p.protectedKeys = { ...d }),
              (!p.isActive && null === v) ||
                (!m && !p.prevProp) ||
                Yr(m) ||
                "boolean" === typeof m)
            )
              continue;
            let x =
                nl(p.prevProp, m) ||
                (f === a && p.isActive && !y && g) ||
                (t > h && g),
              b = !1;
            const w = Array.isArray(m) ? m : [m];
            let S = w.reduce(i, {});
            !1 === v && (S = {});
            const { prevResolvedValues: k = {} } = p,
              j = { ...k, ...S },
              C = (e) => {
                (x = !0),
                  u.has(e) && ((b = !0), u.delete(e)),
                  (p.needsAnimating[e] = !0);
              };
            for (const e in j) {
              const t = S[e],
                n = k[e];
              if (d.hasOwnProperty(e)) continue;
              let r = !1;
              (r = so(t) && so(n) ? !$o(t, n) : t !== n),
                r
                  ? void 0 !== t
                    ? C(e)
                    : u.add(e)
                  : void 0 !== t && u.has(e)
                  ? C(e)
                  : (p.protectedKeys[e] = !0);
            }
            (p.prevProp = m),
              (p.prevResolvedValues = S),
              p.isActive && (d = { ...d, ...S }),
              r && e.blockInitialAnimation && (x = !1),
              !x ||
                (y && !b) ||
                c.push(
                  ...w.map((e) => ({
                    animation: e,
                    options: { type: f, ...o },
                  }))
                );
          }
          if (u.size) {
            const t = {};
            u.forEach((n) => {
              const r = e.getBaseTarget(n);
              void 0 !== r && (t[n] = r);
            }),
              c.push({ animation: t });
          }
          let f = Boolean(c.length);
          return (
            !r ||
              (!1 !== s.initial && s.initial !== s.animate) ||
              e.manuallyAnimateOnMount ||
              (f = !1),
            (r = !1),
            f ? t(c) : Promise.resolve()
          );
        }
        return {
          animateChanges: o,
          setActive: function (t, r, i) {
            var a;
            if (n[t].isActive === r) return Promise.resolve();
            null === (a = e.variantChildren) ||
              void 0 === a ||
              a.forEach((e) => {
                var n;
                return null === (n = e.animationState) || void 0 === n
                  ? void 0
                  : n.setActive(t, r);
              }),
              (n[t].isActive = r);
            const s = o(i, t);
            for (const e in n) n[e].protectedKeys = {};
            return s;
          },
          setAnimateFunction: function (n) {
            t = n(e);
          },
          getState: () => n,
        };
      }
      function nl(e, t) {
        return "string" === typeof t
          ? t !== e
          : !!Array.isArray(t) && !$o(t, e);
      }
      function rl() {
        return {
          isActive:
            arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
          protectedKeys: {},
          needsAnimating: {},
          prevResolvedValues: {},
        };
      }
      let il = 0;
      const ol = {
          animation: {
            Feature: class extends zo {
              constructor(e) {
                super(e), e.animationState || (e.animationState = tl(e));
              }
              updateAnimationControlsSubscription() {
                const { animate: e } = this.node.getProps();
                this.unmount(),
                  Yr(e) && (this.unmount = e.subscribe(this.node));
              }
              mount() {
                this.updateAnimationControlsSubscription();
              }
              update() {
                const { animate: e } = this.node.getProps(),
                  { animate: t } = this.node.prevProps || {};
                e !== t && this.updateAnimationControlsSubscription();
              }
              unmount() {}
            },
          },
          exit: {
            Feature: class extends zo {
              constructor() {
                super(...arguments), (this.id = il++);
              }
              update() {
                if (!this.node.presenceContext) return;
                const {
                    isPresent: e,
                    onExitComplete: t,
                    custom: n,
                  } = this.node.presenceContext,
                  { isPresent: r } = this.node.prevPresenceContext || {};
                if (!this.node.animationState || e === r) return;
                const i = this.node.animationState.setActive("exit", !e, {
                  custom:
                    null !== n && void 0 !== n
                      ? n
                      : this.node.getProps().custom,
                });
                t && !e && i.then(() => t(this.id));
              }
              mount() {
                const { register: e } = this.node.presenceContext || {};
                e && (this.unmount = e(this.id));
              }
              unmount() {}
            },
          },
        },
        al = (e, t) => Math.abs(e - t);
      class sl {
        constructor(e, t) {
          let {
            transformPagePoint: n,
            contextWindow: r,
            dragSnapToOrigin: i = !1,
          } = arguments.length > 2 && void 0 !== arguments[2]
            ? arguments[2]
            : {};
          if (
            ((this.startEvent = null),
            (this.lastMoveEvent = null),
            (this.lastMoveEventInfo = null),
            (this.handlers = {}),
            (this.contextWindow = window),
            (this.updatePoint = () => {
              if (!this.lastMoveEvent || !this.lastMoveEventInfo) return;
              const e = ul(this.lastMoveEventInfo, this.history),
                t = null !== this.startEvent,
                n =
                  (function (e, t) {
                    const n = al(e.x, t.x),
                      r = al(e.y, t.y);
                    return Math.sqrt(n ** 2 + r ** 2);
                  })(e.offset, { x: 0, y: 0 }) >= 3;
              if (!t && !n) return;
              const { point: r } = e,
                { timestamp: i } = yo;
              this.history.push({ ...r, timestamp: i });
              const { onStart: o, onMove: a } = this.handlers;
              t ||
                (o && o(this.lastMoveEvent, e),
                (this.startEvent = this.lastMoveEvent)),
                a && a(this.lastMoveEvent, e);
            }),
            (this.handlePointerMove = (e, t) => {
              (this.lastMoveEvent = e),
                (this.lastMoveEventInfo = ll(t, this.transformPagePoint)),
                go.update(this.updatePoint, !0);
            }),
            (this.handlePointerUp = (e, t) => {
              this.end();
              const {
                onEnd: n,
                onSessionEnd: r,
                resumeAnimation: i,
              } = this.handlers;
              if (
                (this.dragSnapToOrigin && i && i(),
                !this.lastMoveEvent || !this.lastMoveEventInfo)
              )
                return;
              const o = ul(
                "pointercancel" === e.type
                  ? this.lastMoveEventInfo
                  : ll(t, this.transformPagePoint),
                this.history
              );
              this.startEvent && n && n(e, o), r && r(e, o);
            }),
            !ko(e))
          )
            return;
          (this.dragSnapToOrigin = i),
            (this.handlers = t),
            (this.transformPagePoint = n),
            (this.contextWindow = r || window);
          const o = ll(jo(e), this.transformPagePoint),
            { point: a } = o,
            { timestamp: s } = yo;
          this.history = [{ ...a, timestamp: s }];
          const { onSessionStart: l } = t;
          l && l(e, ul(o, this.history)),
            (this.removeListeners = Eo(
              Co(this.contextWindow, "pointermove", this.handlePointerMove),
              Co(this.contextWindow, "pointerup", this.handlePointerUp),
              Co(this.contextWindow, "pointercancel", this.handlePointerUp)
            ));
        }
        updateHandlers(e) {
          this.handlers = e;
        }
        end() {
          this.removeListeners && this.removeListeners(), vo(this.updatePoint);
        }
      }
      function ll(e, t) {
        return t ? { point: t(e.point) } : e;
      }
      function cl(e, t) {
        return { x: e.x - t.x, y: e.y - t.y };
      }
      function ul(e, t) {
        let { point: n } = e;
        return {
          point: n,
          delta: cl(n, hl(t)),
          offset: cl(n, dl(t)),
          velocity: fl(t, 0.1),
        };
      }
      function dl(e) {
        return e[0];
      }
      function hl(e) {
        return e[e.length - 1];
      }
      function fl(e, t) {
        if (e.length < 2) return { x: 0, y: 0 };
        let n = e.length - 1,
          r = null;
        const i = hl(e);
        for (; n >= 0 && ((r = e[n]), !(i.timestamp - r.timestamp > Go(t))); )
          n--;
        if (!r) return { x: 0, y: 0 };
        const o = Ko(i.timestamp - r.timestamp);
        if (0 === o) return { x: 0, y: 0 };
        const a = { x: (i.x - r.x) / o, y: (i.y - r.y) / o };
        return a.x === 1 / 0 && (a.x = 0), a.y === 1 / 0 && (a.y = 0), a;
      }
      function pl(e) {
        return e.max - e.min;
      }
      function ml(e) {
        let t =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
          n =
            arguments.length > 2 && void 0 !== arguments[2]
              ? arguments[2]
              : 0.01;
        return Math.abs(e - t) <= n;
      }
      function gl(e, t, n) {
        let r =
          arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0.5;
        (e.origin = r),
          (e.originPoint = ja(t.min, t.max, e.origin)),
          (e.scale = pl(n) / pl(t)),
          (ml(e.scale, 1, 1e-4) || isNaN(e.scale)) && (e.scale = 1),
          (e.translate = ja(n.min, n.max, e.origin) - e.originPoint),
          (ml(e.translate) || isNaN(e.translate)) && (e.translate = 0);
      }
      function vl(e, t, n, r) {
        gl(e.x, t.x, n.x, r ? r.originX : void 0),
          gl(e.y, t.y, n.y, r ? r.originY : void 0);
      }
      function yl(e, t, n) {
        (e.min = n.min + t.min), (e.max = e.min + pl(t));
      }
      function xl(e, t, n) {
        (e.min = t.min - n.min), (e.max = e.min + pl(t));
      }
      function bl(e, t, n) {
        xl(e.x, t.x, n.x), xl(e.y, t.y, n.y);
      }
      function wl(e, t, n) {
        return {
          min: void 0 !== t ? e.min + t : void 0,
          max: void 0 !== n ? e.max + n - (e.max - e.min) : void 0,
        };
      }
      function Sl(e, t) {
        let n = t.min - e.min,
          r = t.max - e.max;
        return (
          t.max - t.min < e.max - e.min && ([n, r] = [r, n]), { min: n, max: r }
        );
      }
      const kl = 0.35;
      function jl(e, t, n) {
        return { min: Cl(e, t), max: Cl(e, n) };
      }
      function Cl(e, t) {
        return "number" === typeof e ? e : e[t] || 0;
      }
      function Pl(e) {
        return [e("x"), e("y")];
      }
      function El(e) {
        let { top: t, left: n, right: r, bottom: i } = e;
        return { x: { min: n, max: r }, y: { min: t, max: i } };
      }
      function Tl(e) {
        return void 0 === e || 1 === e;
      }
      function Rl(e) {
        let { scale: t, scaleX: n, scaleY: r } = e;
        return !Tl(t) || !Tl(n) || !Tl(r);
      }
      function _l(e) {
        return Rl(e) || Ol(e) || e.z || e.rotate || e.rotateX || e.rotateY;
      }
      function Ol(e) {
        return Al(e.x) || Al(e.y);
      }
      function Al(e) {
        return e && "0%" !== e;
      }
      function zl(e, t, n) {
        return n + t * (e - n);
      }
      function Dl(e, t, n, r, i) {
        return void 0 !== i && (e = zl(e, i, r)), zl(e, n, r) + t;
      }
      function Nl(e) {
        let t =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
          n =
            arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1,
          r = arguments.length > 3 ? arguments[3] : void 0,
          i = arguments.length > 4 ? arguments[4] : void 0;
        (e.min = Dl(e.min, t, n, r, i)), (e.max = Dl(e.max, t, n, r, i));
      }
      function Ll(e, t) {
        let { x: n, y: r } = t;
        Nl(e.x, n.translate, n.scale, n.originPoint),
          Nl(e.y, r.translate, r.scale, r.originPoint);
      }
      function Ml(e) {
        return Number.isInteger(e) || e > 1.0000000000001 || e < 0.999999999999
          ? e
          : 1;
      }
      function Fl(e, t) {
        (e.min = e.min + t), (e.max = e.max + t);
      }
      function Il(e, t, n) {
        let [r, i, o] = n;
        const a = void 0 !== t[o] ? t[o] : 0.5,
          s = ja(e.min, e.max, a);
        Nl(e, t[r], t[i], s, t.scale);
      }
      const Vl = ["x", "scaleX", "originX"],
        Bl = ["y", "scaleY", "originY"];
      function Ul(e, t) {
        Il(e.x, t, Vl), Il(e.y, t, Bl);
      }
      function Wl(e, t) {
        return El(
          (function (e, t) {
            if (!t) return e;
            const n = t({ x: e.left, y: e.top }),
              r = t({ x: e.right, y: e.bottom });
            return { top: n.y, left: n.x, bottom: r.y, right: r.x };
          })(e.getBoundingClientRect(), t)
        );
      }
      const $l = (e) => {
          let { current: t } = e;
          return t ? t.ownerDocument.defaultView : null;
        },
        Hl = new WeakMap();
      class Yl {
        constructor(e) {
          (this.openGlobalLock = null),
            (this.isDragging = !1),
            (this.currentDirection = null),
            (this.originPoint = { x: 0, y: 0 }),
            (this.constraints = !1),
            (this.hasMutatedConstraints = !1),
            (this.elastic = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } }),
            (this.visualElement = e);
        }
        start(e) {
          let { snapToCursor: t = !1 } =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
          const { presenceContext: n } = this.visualElement;
          if (n && !1 === n.isPresent) return;
          const { dragSnapToOrigin: r } = this.getProps();
          this.panSession = new sl(
            e,
            {
              onSessionStart: (e) => {
                const { dragSnapToOrigin: n } = this.getProps();
                n ? this.pauseAnimation() : this.stopAnimation(),
                  t && this.snapToCursor(jo(e, "page").point);
              },
              onStart: (e, t) => {
                const {
                  drag: n,
                  dragPropagation: r,
                  onDragStart: i,
                } = this.getProps();
                if (
                  n &&
                  !r &&
                  (this.openGlobalLock && this.openGlobalLock(),
                  (this.openGlobalLock = Oo(n)),
                  !this.openGlobalLock)
                )
                  return;
                (this.isDragging = !0),
                  (this.currentDirection = null),
                  this.resolveConstraints(),
                  this.visualElement.projection &&
                    ((this.visualElement.projection.isAnimationBlocked = !0),
                    (this.visualElement.projection.target = void 0)),
                  Pl((e) => {
                    let t = this.getAxisMotionValue(e).get() || 0;
                    if (Oi.test(t)) {
                      const { projection: n } = this.visualElement;
                      if (n && n.layout) {
                        const r = n.layout.layoutBox[e];
                        if (r) {
                          t = pl(r) * (parseFloat(t) / 100);
                        }
                      }
                    }
                    this.originPoint[e] = t;
                  }),
                  i && go.update(() => i(e, t), !1, !0);
                const { animationState: o } = this.visualElement;
                o && o.setActive("whileDrag", !0);
              },
              onMove: (e, t) => {
                const {
                  dragPropagation: n,
                  dragDirectionLock: r,
                  onDirectionLock: i,
                  onDrag: o,
                } = this.getProps();
                if (!n && !this.openGlobalLock) return;
                const { offset: a } = t;
                if (r && null === this.currentDirection)
                  return (
                    (this.currentDirection = (function (e) {
                      let t =
                          arguments.length > 1 && void 0 !== arguments[1]
                            ? arguments[1]
                            : 10,
                        n = null;
                      Math.abs(e.y) > t
                        ? (n = "y")
                        : Math.abs(e.x) > t && (n = "x");
                      return n;
                    })(a)),
                    void (
                      null !== this.currentDirection &&
                      i &&
                      i(this.currentDirection)
                    )
                  );
                this.updateAxis("x", t.point, a),
                  this.updateAxis("y", t.point, a),
                  this.visualElement.render(),
                  o && o(e, t);
              },
              onSessionEnd: (e, t) => this.stop(e, t),
              resumeAnimation: () =>
                Pl((e) => {
                  var t;
                  return (
                    "paused" === this.getAnimationState(e) &&
                    (null === (t = this.getAxisMotionValue(e).animation) ||
                    void 0 === t
                      ? void 0
                      : t.play())
                  );
                }),
            },
            {
              transformPagePoint: this.visualElement.getTransformPagePoint(),
              dragSnapToOrigin: r,
              contextWindow: $l(this.visualElement),
            }
          );
        }
        stop(e, t) {
          const n = this.isDragging;
          if ((this.cancel(), !n)) return;
          const { velocity: r } = t;
          this.startAnimation(r);
          const { onDragEnd: i } = this.getProps();
          i && go.update(() => i(e, t));
        }
        cancel() {
          this.isDragging = !1;
          const { projection: e, animationState: t } = this.visualElement;
          e && (e.isAnimationBlocked = !1),
            this.panSession && this.panSession.end(),
            (this.panSession = void 0);
          const { dragPropagation: n } = this.getProps();
          !n &&
            this.openGlobalLock &&
            (this.openGlobalLock(), (this.openGlobalLock = null)),
            t && t.setActive("whileDrag", !1);
        }
        updateAxis(e, t, n) {
          const { drag: r } = this.getProps();
          if (!n || !ql(e, r, this.currentDirection)) return;
          const i = this.getAxisMotionValue(e);
          let o = this.originPoint[e] + n[e];
          this.constraints &&
            this.constraints[e] &&
            (o = (function (e, t, n) {
              let { min: r, max: i } = t;
              return (
                void 0 !== r && e < r
                  ? (e = n ? ja(r, e, n.min) : Math.max(e, r))
                  : void 0 !== i &&
                    e > i &&
                    (e = n ? ja(i, e, n.max) : Math.min(e, i)),
                e
              );
            })(o, this.constraints[e], this.elastic[e])),
            i.set(o);
        }
        resolveConstraints() {
          var e;
          const { dragConstraints: t, dragElastic: n } = this.getProps(),
            r =
              this.visualElement.projection &&
              !this.visualElement.projection.layout
                ? this.visualElement.projection.measure(!1)
                : null === (e = this.visualElement.projection) || void 0 === e
                ? void 0
                : e.layout,
            i = this.constraints;
          t && $r(t)
            ? this.constraints ||
              (this.constraints = this.resolveRefConstraints())
            : (this.constraints =
                !(!t || !r) &&
                (function (e, t) {
                  let { top: n, left: r, bottom: i, right: o } = t;
                  return { x: wl(e.x, r, o), y: wl(e.y, n, i) };
                })(r.layoutBox, t)),
            (this.elastic = (function () {
              let e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : kl;
              return (
                !1 === e ? (e = 0) : !0 === e && (e = kl),
                { x: jl(e, "left", "right"), y: jl(e, "top", "bottom") }
              );
            })(n)),
            i !== this.constraints &&
              r &&
              this.constraints &&
              !this.hasMutatedConstraints &&
              Pl((e) => {
                this.getAxisMotionValue(e) &&
                  (this.constraints[e] = (function (e, t) {
                    const n = {};
                    return (
                      void 0 !== t.min && (n.min = t.min - e.min),
                      void 0 !== t.max && (n.max = t.max - e.min),
                      n
                    );
                  })(r.layoutBox[e], this.constraints[e]));
              });
        }
        resolveRefConstraints() {
          const { dragConstraints: e, onMeasureDragConstraints: t } =
            this.getProps();
          if (!e || !$r(e)) return !1;
          const n = e.current;
          qo(
            null !== n,
            "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop."
          );
          const { projection: r } = this.visualElement;
          if (!r || !r.layout) return !1;
          const i = (function (e, t, n) {
            const r = Wl(e, n),
              { scroll: i } = t;
            return i && (Fl(r.x, i.offset.x), Fl(r.y, i.offset.y)), r;
          })(n, r.root, this.visualElement.getTransformPagePoint());
          let o = (function (e, t) {
            return { x: Sl(e.x, t.x), y: Sl(e.y, t.y) };
          })(r.layout.layoutBox, i);
          if (t) {
            const e = t(
              (function (e) {
                let { x: t, y: n } = e;
                return { top: n.min, right: t.max, bottom: n.max, left: t.min };
              })(o)
            );
            (this.hasMutatedConstraints = !!e), e && (o = El(e));
          }
          return o;
        }
        startAnimation(e) {
          const {
              drag: t,
              dragMomentum: n,
              dragElastic: r,
              dragTransition: i,
              dragSnapToOrigin: o,
              onDragTransitionEnd: a,
            } = this.getProps(),
            s = this.constraints || {},
            l = Pl((a) => {
              if (!ql(a, t, this.currentDirection)) return;
              let l = (s && s[a]) || {};
              o && (l = { min: 0, max: 0 });
              const c = r ? 200 : 1e6,
                u = r ? 40 : 1e7,
                d = {
                  type: "inertia",
                  velocity: n ? e[a] : 0,
                  bounceStiffness: c,
                  bounceDamping: u,
                  timeConstant: 750,
                  restDelta: 1,
                  restSpeed: 10,
                  ...i,
                  ...l,
                };
              return this.startAxisValueAnimation(a, d);
            });
          return Promise.all(l).then(a);
        }
        startAxisValueAnimation(e, t) {
          const n = this.getAxisMotionValue(e);
          return n.start(_s(e, n, 0, t));
        }
        stopAnimation() {
          Pl((e) => this.getAxisMotionValue(e).stop());
        }
        pauseAnimation() {
          Pl((e) => {
            var t;
            return null === (t = this.getAxisMotionValue(e).animation) ||
              void 0 === t
              ? void 0
              : t.pause();
          });
        }
        getAnimationState(e) {
          var t;
          return null === (t = this.getAxisMotionValue(e).animation) ||
            void 0 === t
            ? void 0
            : t.state;
        }
        getAxisMotionValue(e) {
          const t = "_drag" + e.toUpperCase(),
            n = this.visualElement.getProps(),
            r = n[t];
          return (
            r ||
            this.visualElement.getValue(
              e,
              (n.initial ? n.initial[e] : void 0) || 0
            )
          );
        }
        snapToCursor(e) {
          Pl((t) => {
            const { drag: n } = this.getProps();
            if (!ql(t, n, this.currentDirection)) return;
            const { projection: r } = this.visualElement,
              i = this.getAxisMotionValue(t);
            if (r && r.layout) {
              const { min: n, max: o } = r.layout.layoutBox[t];
              i.set(e[t] - ja(n, o, 0.5));
            }
          });
        }
        scalePositionWithinConstraints() {
          if (!this.visualElement.current) return;
          const { drag: e, dragConstraints: t } = this.getProps(),
            { projection: n } = this.visualElement;
          if (!$r(t) || !n || !this.constraints) return;
          this.stopAnimation();
          const r = { x: 0, y: 0 };
          Pl((e) => {
            const t = this.getAxisMotionValue(e);
            if (t) {
              const n = t.get();
              r[e] = (function (e, t) {
                let n = 0.5;
                const r = pl(e),
                  i = pl(t);
                return (
                  i > r
                    ? (n = $a(t.min, t.max - r, e.min))
                    : r > i && (n = $a(e.min, e.max - i, t.min)),
                  bi(0, 1, n)
                );
              })({ min: n, max: n }, this.constraints[e]);
            }
          });
          const { transformTemplate: i } = this.visualElement.getProps();
          (this.visualElement.current.style.transform = i ? i({}, "") : "none"),
            n.root && n.root.updateScroll(),
            n.updateLayout(),
            this.resolveConstraints(),
            Pl((t) => {
              if (!ql(t, e, null)) return;
              const n = this.getAxisMotionValue(t),
                { min: i, max: o } = this.constraints[t];
              n.set(ja(i, o, r[t]));
            });
        }
        addListeners() {
          if (!this.visualElement.current) return;
          Hl.set(this.visualElement, this);
          const e = Co(this.visualElement.current, "pointerdown", (e) => {
              const { drag: t, dragListener: n = !0 } = this.getProps();
              t && n && this.start(e);
            }),
            t = () => {
              const { dragConstraints: e } = this.getProps();
              $r(e) && (this.constraints = this.resolveRefConstraints());
            },
            { projection: n } = this.visualElement,
            r = n.addEventListener("measure", t);
          n && !n.layout && (n.root && n.root.updateScroll(), n.updateLayout()),
            t();
          const i = So(window, "resize", () =>
              this.scalePositionWithinConstraints()
            ),
            o = n.addEventListener("didUpdate", (e) => {
              let { delta: t, hasLayoutChanged: n } = e;
              this.isDragging &&
                n &&
                (Pl((e) => {
                  const n = this.getAxisMotionValue(e);
                  n &&
                    ((this.originPoint[e] += t[e].translate),
                    n.set(n.get() + t[e].translate));
                }),
                this.visualElement.render());
            });
          return () => {
            i(), e(), r(), o && o();
          };
        }
        getProps() {
          const e = this.visualElement.getProps(),
            {
              drag: t = !1,
              dragDirectionLock: n = !1,
              dragPropagation: r = !1,
              dragConstraints: i = !1,
              dragElastic: o = kl,
              dragMomentum: a = !0,
            } = e;
          return {
            ...e,
            drag: t,
            dragDirectionLock: n,
            dragPropagation: r,
            dragConstraints: i,
            dragElastic: o,
            dragMomentum: a,
          };
        }
      }
      function ql(e, t, n) {
        return (!0 === t || t === e) && (null === n || n === e);
      }
      const Gl = (e) => (t, n) => {
        e && go.update(() => e(t, n));
      };
      const Kl = { hasAnimatedSinceResize: !0, hasEverUpdated: !1 };
      function Ql(e, t) {
        return t.max === t.min ? 0 : (e / (t.max - t.min)) * 100;
      }
      const Xl = {
          correct: (e, t) => {
            if (!t.target) return e;
            if ("string" === typeof e) {
              if (!Ai.test(e)) return e;
              e = parseFloat(e);
            }
            return `${Ql(e, t.target.x)}% ${Ql(e, t.target.y)}%`;
          },
        },
        Jl = {
          correct: (e, t) => {
            let { treeScale: n, projectionDelta: r } = t;
            const i = e,
              o = Fa.parse(e);
            if (o.length > 5) return i;
            const a = Fa.createTransformer(e),
              s = "number" !== typeof o[0] ? 1 : 0,
              l = r.x.scale * n.x,
              c = r.y.scale * n.y;
            (o[0 + s] /= l), (o[1 + s] /= c);
            const u = ja(l, c, 0.5);
            return (
              "number" === typeof o[2 + s] && (o[2 + s] /= u),
              "number" === typeof o[3 + s] && (o[3 + s] /= u),
              a(o)
            );
          },
        };
      class Zl extends t.Component {
        componentDidMount() {
          const {
              visualElement: e,
              layoutGroup: t,
              switchLayoutGroup: n,
              layoutId: r,
            } = this.props,
            { projection: i } = e;
          var o;
          (o = tc),
            Object.assign(ci, o),
            i &&
              (t.group && t.group.add(i),
              n && n.register && r && n.register(i),
              i.root.didUpdate(),
              i.addEventListener("animationComplete", () => {
                this.safeToRemove();
              }),
              i.setOptions({
                ...i.options,
                onExitComplete: () => this.safeToRemove(),
              })),
            (Kl.hasEverUpdated = !0);
        }
        getSnapshotBeforeUpdate(e) {
          const {
              layoutDependency: t,
              visualElement: n,
              drag: r,
              isPresent: i,
            } = this.props,
            o = n.projection;
          return o
            ? ((o.isPresent = i),
              r || e.layoutDependency !== t || void 0 === t
                ? o.willUpdate()
                : this.safeToRemove(),
              e.isPresent !== i &&
                (i
                  ? o.promote()
                  : o.relegate() ||
                    go.postRender(() => {
                      const e = o.getStack();
                      (e && e.members.length) || this.safeToRemove();
                    })),
              null)
            : null;
        }
        componentDidUpdate() {
          const { projection: e } = this.props.visualElement;
          e &&
            (e.root.didUpdate(),
            queueMicrotask(() => {
              !e.currentAnimation && e.isLead() && this.safeToRemove();
            }));
        }
        componentWillUnmount() {
          const {
              visualElement: e,
              layoutGroup: t,
              switchLayoutGroup: n,
            } = this.props,
            { projection: r } = e;
          r &&
            (r.scheduleCheckAfterUnmount(),
            t && t.group && t.group.remove(r),
            n && n.deregister && n.deregister(r));
        }
        safeToRemove() {
          const { safeToRemove: e } = this.props;
          e && e();
        }
        render() {
          return null;
        }
      }
      function ec(e) {
        const [n, r] = (function () {
            const e = (0, t.useContext)(Fr);
            if (null === e) return [!0, null];
            const { isPresent: n, onExitComplete: r, register: i } = e,
              o = (0, t.useId)();
            return (
              (0, t.useEffect)(() => i(o), []),
              !n && r ? [!1, () => r && r(o)] : [!0]
            );
          })(),
          i = (0, t.useContext)(ti);
        return t.createElement(Zl, {
          ...e,
          layoutGroup: i,
          switchLayoutGroup: (0, t.useContext)(ni),
          isPresent: n,
          safeToRemove: r,
        });
      }
      const tc = {
          borderRadius: {
            ...Xl,
            applyTo: [
              "borderTopLeftRadius",
              "borderTopRightRadius",
              "borderBottomLeftRadius",
              "borderBottomRightRadius",
            ],
          },
          borderTopLeftRadius: Xl,
          borderTopRightRadius: Xl,
          borderBottomLeftRadius: Xl,
          borderBottomRightRadius: Xl,
          boxShadow: Jl,
        },
        nc = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"],
        rc = nc.length,
        ic = (e) => ("string" === typeof e ? parseFloat(e) : e),
        oc = (e) => "number" === typeof e || Ai.test(e);
      function ac(e, t) {
        return void 0 !== e[t] ? e[t] : e.borderRadius;
      }
      const sc = cc(0, 0.5, ua),
        lc = cc(0.5, 0.95, fo);
      function cc(e, t, n) {
        return (r) => (r < e ? 0 : r > t ? 1 : n($a(e, t, r)));
      }
      function uc(e, t) {
        (e.min = t.min), (e.max = t.max);
      }
      function dc(e, t) {
        uc(e.x, t.x), uc(e.y, t.y);
      }
      function hc(e, t, n, r, i) {
        return (
          (e = zl((e -= t), 1 / n, r)), void 0 !== i && (e = zl(e, 1 / i, r)), e
        );
      }
      function fc(e, t, n, r, i) {
        let [o, a, s] = n;
        !(function (e) {
          let t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 0,
            n =
              arguments.length > 2 && void 0 !== arguments[2]
                ? arguments[2]
                : 1,
            r =
              arguments.length > 3 && void 0 !== arguments[3]
                ? arguments[3]
                : 0.5,
            i = arguments.length > 4 ? arguments[4] : void 0,
            o =
              arguments.length > 5 && void 0 !== arguments[5]
                ? arguments[5]
                : e,
            a =
              arguments.length > 6 && void 0 !== arguments[6]
                ? arguments[6]
                : e;
          Oi.test(t) &&
            ((t = parseFloat(t)), (t = ja(a.min, a.max, t / 100) - a.min));
          if ("number" !== typeof t) return;
          let s = ja(o.min, o.max, r);
          e === o && (s -= t),
            (e.min = hc(e.min, t, n, s, i)),
            (e.max = hc(e.max, t, n, s, i));
        })(e, t[o], t[a], t[s], t.scale, r, i);
      }
      const pc = ["x", "scaleX", "originX"],
        mc = ["y", "scaleY", "originY"];
      function gc(e, t, n, r) {
        fc(e.x, t, pc, n ? n.x : void 0, r ? r.x : void 0),
          fc(e.y, t, mc, n ? n.y : void 0, r ? r.y : void 0);
      }
      function vc(e) {
        return 0 === e.translate && 1 === e.scale;
      }
      function yc(e) {
        return vc(e.x) && vc(e.y);
      }
      function xc(e, t) {
        return (
          Math.round(e.x.min) === Math.round(t.x.min) &&
          Math.round(e.x.max) === Math.round(t.x.max) &&
          Math.round(e.y.min) === Math.round(t.y.min) &&
          Math.round(e.y.max) === Math.round(t.y.max)
        );
      }
      function bc(e) {
        return pl(e.x) / pl(e.y);
      }
      class wc {
        constructor() {
          this.members = [];
        }
        add(e) {
          zs(this.members, e), e.scheduleRender();
        }
        remove(e) {
          if (
            (Ds(this.members, e),
            e === this.prevLead && (this.prevLead = void 0),
            e === this.lead)
          ) {
            const e = this.members[this.members.length - 1];
            e && this.promote(e);
          }
        }
        relegate(e) {
          const t = this.members.findIndex((t) => e === t);
          if (0 === t) return !1;
          let n;
          for (let r = t; r >= 0; r--) {
            const e = this.members[r];
            if (!1 !== e.isPresent) {
              n = e;
              break;
            }
          }
          return !!n && (this.promote(n), !0);
        }
        promote(e, t) {
          const n = this.lead;
          if (e !== n && ((this.prevLead = n), (this.lead = e), e.show(), n)) {
            n.instance && n.scheduleRender(),
              e.scheduleRender(),
              (e.resumeFrom = n),
              t && (e.resumeFrom.preserveOpacity = !0),
              n.snapshot &&
                ((e.snapshot = n.snapshot),
                (e.snapshot.latestValues =
                  n.animationValues || n.latestValues)),
              e.root && e.root.isUpdating && (e.isLayoutDirty = !0);
            const { crossfade: r } = e.options;
            !1 === r && n.hide();
          }
        }
        exitAnimationComplete() {
          this.members.forEach((e) => {
            const { options: t, resumingFrom: n } = e;
            t.onExitComplete && t.onExitComplete(),
              n && n.options.onExitComplete && n.options.onExitComplete();
          });
        }
        scheduleRender() {
          this.members.forEach((e) => {
            e.instance && e.scheduleRender(!1);
          });
        }
        removeLeadSnapshot() {
          this.lead && this.lead.snapshot && (this.lead.snapshot = void 0);
        }
      }
      function Sc(e, t, n) {
        let r = "";
        const i = e.x.translate / t.x,
          o = e.y.translate / t.y;
        if (
          ((i || o) && (r = `translate3d(${i}px, ${o}px, 0) `),
          (1 === t.x && 1 === t.y) || (r += `scale(${1 / t.x}, ${1 / t.y}) `),
          n)
        ) {
          const { rotate: e, rotateX: t, rotateY: i } = n;
          e && (r += `rotate(${e}deg) `),
            t && (r += `rotateX(${t}deg) `),
            i && (r += `rotateY(${i}deg) `);
        }
        const a = e.x.scale * t.x,
          s = e.y.scale * t.y;
        return (1 === a && 1 === s) || (r += `scale(${a}, ${s})`), r || "none";
      }
      const kc = (e, t) => e.depth - t.depth;
      class jc {
        constructor() {
          (this.children = []), (this.isDirty = !1);
        }
        add(e) {
          zs(this.children, e), (this.isDirty = !0);
        }
        remove(e) {
          Ds(this.children, e), (this.isDirty = !0);
        }
        forEach(e) {
          this.isDirty && this.children.sort(kc),
            (this.isDirty = !1),
            this.children.forEach(e);
        }
      }
      const Cc = ["", "X", "Y", "Z"],
        Pc = { visibility: "hidden" };
      let Ec = 0;
      const Tc = {
        type: "projectionFrame",
        totalNodes: 0,
        resolvedTargetDeltas: 0,
        recalculatedProjection: 0,
      };
      function Rc(e) {
        let {
          attachResizeListener: t,
          defaultParent: n,
          measureScroll: r,
          checkIsScrollRoot: i,
          resetTransform: o,
        } = e;
        return class {
          constructor() {
            let e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : {},
              t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : null === n || void 0 === n
                  ? void 0
                  : n();
            (this.id = Ec++),
              (this.animationId = 0),
              (this.children = new Set()),
              (this.options = {}),
              (this.isTreeAnimating = !1),
              (this.isAnimationBlocked = !1),
              (this.isLayoutDirty = !1),
              (this.isProjectionDirty = !1),
              (this.isSharedProjectionDirty = !1),
              (this.isTransformDirty = !1),
              (this.updateManuallyBlocked = !1),
              (this.updateBlockedByResize = !1),
              (this.isUpdating = !1),
              (this.isSVG = !1),
              (this.needsReset = !1),
              (this.shouldResetTransform = !1),
              (this.treeScale = { x: 1, y: 1 }),
              (this.eventHandlers = new Map()),
              (this.hasTreeAnimated = !1),
              (this.updateScheduled = !1),
              (this.projectionUpdateScheduled = !1),
              (this.checkUpdateFailed = () => {
                this.isUpdating &&
                  ((this.isUpdating = !1), this.clearAllSnapshots());
              }),
              (this.updateProjection = () => {
                (this.projectionUpdateScheduled = !1),
                  (Tc.totalNodes =
                    Tc.resolvedTargetDeltas =
                    Tc.recalculatedProjection =
                      0),
                  this.nodes.forEach(Ac),
                  this.nodes.forEach(Ic),
                  this.nodes.forEach(Vc),
                  this.nodes.forEach(zc),
                  (function (e) {
                    window.MotionDebug && window.MotionDebug.record(e);
                  })(Tc);
              }),
              (this.hasProjected = !1),
              (this.isVisible = !0),
              (this.animationProgress = 0),
              (this.sharedNodes = new Map()),
              (this.latestValues = e),
              (this.root = t ? t.root || t : this),
              (this.path = t ? [...t.path, t] : []),
              (this.parent = t),
              (this.depth = t ? t.depth + 1 : 0);
            for (let n = 0; n < this.path.length; n++)
              this.path[n].shouldResetTransform = !0;
            this.root === this && (this.nodes = new jc());
          }
          addEventListener(e, t) {
            return (
              this.eventHandlers.has(e) || this.eventHandlers.set(e, new Ns()),
              this.eventHandlers.get(e).add(t)
            );
          }
          notifyListeners(e) {
            const t = this.eventHandlers.get(e);
            for (
              var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1;
              i < n;
              i++
            )
              r[i - 1] = arguments[i];
            t && t.notify(...r);
          }
          hasListeners(e) {
            return this.eventHandlers.has(e);
          }
          mount(e) {
            let n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : this.root.hasTreeAnimated;
            if (this.instance) return;
            var r;
            (this.isSVG = (r = e) instanceof SVGElement && "svg" !== r.tagName),
              (this.instance = e);
            const { layoutId: i, layout: o, visualElement: a } = this.options;
            if (
              (a && !a.current && a.mount(e),
              this.root.nodes.add(this),
              this.parent && this.parent.children.add(this),
              n && (o || i) && (this.isLayoutDirty = !0),
              t)
            ) {
              let n;
              const r = () => (this.root.updateBlockedByResize = !1);
              t(e, () => {
                (this.root.updateBlockedByResize = !0),
                  n && n(),
                  (n = (function (e, t) {
                    const n = performance.now(),
                      r = (i) => {
                        let { timestamp: o } = i;
                        const a = o - n;
                        a >= t && (vo(r), e(a - t));
                      };
                    return go.read(r, !0), () => vo(r);
                  })(r, 250)),
                  Kl.hasAnimatedSinceResize &&
                    ((Kl.hasAnimatedSinceResize = !1), this.nodes.forEach(Fc));
              });
            }
            i && this.root.registerSharedNode(i, this),
              !1 !== this.options.animate &&
                a &&
                (i || o) &&
                this.addEventListener("didUpdate", (e) => {
                  let {
                    delta: t,
                    hasLayoutChanged: n,
                    hasRelativeTargetChanged: r,
                    layout: i,
                  } = e;
                  if (this.isTreeAnimationBlocked())
                    return (
                      (this.target = void 0),
                      void (this.relativeTarget = void 0)
                    );
                  const o =
                      this.options.transition || a.getDefaultTransition() || Yc,
                    {
                      onLayoutAnimationStart: s,
                      onLayoutAnimationComplete: l,
                    } = a.getProps(),
                    c = !this.targetLayout || !xc(this.targetLayout, i) || r,
                    u = !n && r;
                  if (
                    this.options.layoutRoot ||
                    (this.resumeFrom && this.resumeFrom.instance) ||
                    u ||
                    (n && (c || !this.currentAnimation))
                  ) {
                    this.resumeFrom &&
                      ((this.resumingFrom = this.resumeFrom),
                      (this.resumingFrom.resumingFrom = void 0)),
                      this.setAnimationOrigin(t, u);
                    const e = { ...Ts(o, "layout"), onPlay: s, onComplete: l };
                    (a.shouldReduceMotion || this.options.layoutRoot) &&
                      ((e.delay = 0), (e.type = !1)),
                      this.startAnimation(e);
                  } else
                    n || Fc(this),
                      this.isLead() &&
                        this.options.onExitComplete &&
                        this.options.onExitComplete();
                  this.targetLayout = i;
                });
          }
          unmount() {
            this.options.layoutId && this.willUpdate(),
              this.root.nodes.remove(this);
            const e = this.getStack();
            e && e.remove(this),
              this.parent && this.parent.children.delete(this),
              (this.instance = void 0),
              vo(this.updateProjection);
          }
          blockUpdate() {
            this.updateManuallyBlocked = !0;
          }
          unblockUpdate() {
            this.updateManuallyBlocked = !1;
          }
          isUpdateBlocked() {
            return this.updateManuallyBlocked || this.updateBlockedByResize;
          }
          isTreeAnimationBlocked() {
            return (
              this.isAnimationBlocked ||
              (this.parent && this.parent.isTreeAnimationBlocked()) ||
              !1
            );
          }
          startUpdate() {
            this.isUpdateBlocked() ||
              ((this.isUpdating = !0),
              this.nodes && this.nodes.forEach(Bc),
              this.animationId++);
          }
          getTransformTemplate() {
            const { visualElement: e } = this.options;
            return e && e.getProps().transformTemplate;
          }
          willUpdate() {
            let e =
              !(arguments.length > 0 && void 0 !== arguments[0]) ||
              arguments[0];
            if (((this.root.hasTreeAnimated = !0), this.root.isUpdateBlocked()))
              return void (
                this.options.onExitComplete && this.options.onExitComplete()
              );
            if (
              (!this.root.isUpdating && this.root.startUpdate(),
              this.isLayoutDirty)
            )
              return;
            this.isLayoutDirty = !0;
            for (let i = 0; i < this.path.length; i++) {
              const e = this.path[i];
              (e.shouldResetTransform = !0),
                e.updateScroll("snapshot"),
                e.options.layoutRoot && e.willUpdate(!1);
            }
            const { layoutId: t, layout: n } = this.options;
            if (void 0 === t && !n) return;
            const r = this.getTransformTemplate();
            (this.prevTransformTemplateValue = r
              ? r(this.latestValues, "")
              : void 0),
              this.updateSnapshot(),
              e && this.notifyListeners("willUpdate");
          }
          update() {
            this.updateScheduled = !1;
            if (this.isUpdateBlocked())
              return (
                this.unblockUpdate(),
                this.clearAllSnapshots(),
                void this.nodes.forEach(Nc)
              );
            this.isUpdating || this.nodes.forEach(Lc),
              (this.isUpdating = !1),
              this.nodes.forEach(Mc),
              this.nodes.forEach(_c),
              this.nodes.forEach(Oc),
              this.clearAllSnapshots();
            const e = performance.now();
            (yo.delta = bi(0, 1e3 / 60, e - yo.timestamp)),
              (yo.timestamp = e),
              (yo.isProcessing = !0),
              xo.update.process(yo),
              xo.preRender.process(yo),
              xo.render.process(yo),
              (yo.isProcessing = !1);
          }
          didUpdate() {
            this.updateScheduled ||
              ((this.updateScheduled = !0),
              queueMicrotask(() => this.update()));
          }
          clearAllSnapshots() {
            this.nodes.forEach(Dc), this.sharedNodes.forEach(Uc);
          }
          scheduleUpdateProjection() {
            this.projectionUpdateScheduled ||
              ((this.projectionUpdateScheduled = !0),
              go.preRender(this.updateProjection, !1, !0));
          }
          scheduleCheckAfterUnmount() {
            go.postRender(() => {
              this.isLayoutDirty
                ? this.root.didUpdate()
                : this.root.checkUpdateFailed();
            });
          }
          updateSnapshot() {
            !this.snapshot && this.instance && (this.snapshot = this.measure());
          }
          updateLayout() {
            if (!this.instance) return;
            if (
              (this.updateScroll(),
              (!this.options.alwaysMeasureLayout || !this.isLead()) &&
                !this.isLayoutDirty)
            )
              return;
            if (this.resumeFrom && !this.resumeFrom.instance)
              for (let n = 0; n < this.path.length; n++) {
                this.path[n].updateScroll();
              }
            const e = this.layout;
            (this.layout = this.measure(!1)),
              (this.layoutCorrected = {
                x: { min: 0, max: 0 },
                y: { min: 0, max: 0 },
              }),
              (this.isLayoutDirty = !1),
              (this.projectionDelta = void 0),
              this.notifyListeners("measure", this.layout.layoutBox);
            const { visualElement: t } = this.options;
            t &&
              t.notify(
                "LayoutMeasure",
                this.layout.layoutBox,
                e ? e.layoutBox : void 0
              );
          }
          updateScroll() {
            let e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : "measure",
              t = Boolean(this.options.layoutScroll && this.instance);
            this.scroll &&
              this.scroll.animationId === this.root.animationId &&
              this.scroll.phase === e &&
              (t = !1),
              t &&
                (this.scroll = {
                  animationId: this.root.animationId,
                  phase: e,
                  isRoot: i(this.instance),
                  offset: r(this.instance),
                });
          }
          resetTransform() {
            if (!o) return;
            const e = this.isLayoutDirty || this.shouldResetTransform,
              t = this.projectionDelta && !yc(this.projectionDelta),
              n = this.getTransformTemplate(),
              r = n ? n(this.latestValues, "") : void 0,
              i = r !== this.prevTransformTemplateValue;
            e &&
              (t || _l(this.latestValues) || i) &&
              (o(this.instance, r),
              (this.shouldResetTransform = !1),
              this.scheduleRender());
          }
          measure() {
            let e =
              !(arguments.length > 0 && void 0 !== arguments[0]) ||
              arguments[0];
            const t = this.measurePageBox();
            let n = this.removeElementScroll(t);
            var r;
            return (
              e && (n = this.removeTransform(n)),
              Kc((r = n).x),
              Kc(r.y),
              {
                animationId: this.root.animationId,
                measuredBox: t,
                layoutBox: n,
                latestValues: {},
                source: this.id,
              }
            );
          }
          measurePageBox() {
            const { visualElement: e } = this.options;
            if (!e) return { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
            const t = e.measureViewportBox(),
              { scroll: n } = this.root;
            return n && (Fl(t.x, n.offset.x), Fl(t.y, n.offset.y)), t;
          }
          removeElementScroll(e) {
            const t = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
            dc(t, e);
            for (let n = 0; n < this.path.length; n++) {
              const r = this.path[n],
                { scroll: i, options: o } = r;
              if (r !== this.root && i && o.layoutScroll) {
                if (i.isRoot) {
                  dc(t, e);
                  const { scroll: n } = this.root;
                  n && (Fl(t.x, -n.offset.x), Fl(t.y, -n.offset.y));
                }
                Fl(t.x, i.offset.x), Fl(t.y, i.offset.y);
              }
            }
            return t;
          }
          applyTransform(e) {
            let t =
              arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
            const n = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
            dc(n, e);
            for (let r = 0; r < this.path.length; r++) {
              const e = this.path[r];
              !t &&
                e.options.layoutScroll &&
                e.scroll &&
                e !== e.root &&
                Ul(n, { x: -e.scroll.offset.x, y: -e.scroll.offset.y }),
                _l(e.latestValues) && Ul(n, e.latestValues);
            }
            return _l(this.latestValues) && Ul(n, this.latestValues), n;
          }
          removeTransform(e) {
            const t = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
            dc(t, e);
            for (let n = 0; n < this.path.length; n++) {
              const e = this.path[n];
              if (!e.instance) continue;
              if (!_l(e.latestValues)) continue;
              Rl(e.latestValues) && e.updateSnapshot();
              const r = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
              dc(r, e.measurePageBox()),
                gc(
                  t,
                  e.latestValues,
                  e.snapshot ? e.snapshot.layoutBox : void 0,
                  r
                );
            }
            return _l(this.latestValues) && gc(t, this.latestValues), t;
          }
          setTargetDelta(e) {
            (this.targetDelta = e),
              this.root.scheduleUpdateProjection(),
              (this.isProjectionDirty = !0);
          }
          setOptions(e) {
            this.options = {
              ...this.options,
              ...e,
              crossfade: void 0 === e.crossfade || e.crossfade,
            };
          }
          clearMeasurements() {
            (this.scroll = void 0),
              (this.layout = void 0),
              (this.snapshot = void 0),
              (this.prevTransformTemplateValue = void 0),
              (this.targetDelta = void 0),
              (this.target = void 0),
              (this.isLayoutDirty = !1);
          }
          forceRelativeParentToResolveTarget() {
            this.relativeParent &&
              this.relativeParent.resolvedRelativeTargetAt !== yo.timestamp &&
              this.relativeParent.resolveTargetDelta(!0);
          }
          resolveTargetDelta() {
            let e =
              arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
            var t;
            const n = this.getLead();
            this.isProjectionDirty ||
              (this.isProjectionDirty = n.isProjectionDirty),
              this.isTransformDirty ||
                (this.isTransformDirty = n.isTransformDirty),
              this.isSharedProjectionDirty ||
                (this.isSharedProjectionDirty = n.isSharedProjectionDirty);
            const r = Boolean(this.resumingFrom) || this !== n;
            if (
              !(
                e ||
                (r && this.isSharedProjectionDirty) ||
                this.isProjectionDirty ||
                (null === (t = this.parent) || void 0 === t
                  ? void 0
                  : t.isProjectionDirty) ||
                this.attemptToResolveRelativeTarget
              )
            )
              return;
            const { layout: i, layoutId: o } = this.options;
            if (this.layout && (i || o)) {
              if (
                ((this.resolvedRelativeTargetAt = yo.timestamp),
                !this.targetDelta && !this.relativeTarget)
              ) {
                const e = this.getClosestProjectingParent();
                e && e.layout && 1 !== this.animationProgress
                  ? ((this.relativeParent = e),
                    this.forceRelativeParentToResolveTarget(),
                    (this.relativeTarget = {
                      x: { min: 0, max: 0 },
                      y: { min: 0, max: 0 },
                    }),
                    (this.relativeTargetOrigin = {
                      x: { min: 0, max: 0 },
                      y: { min: 0, max: 0 },
                    }),
                    bl(
                      this.relativeTargetOrigin,
                      this.layout.layoutBox,
                      e.layout.layoutBox
                    ),
                    dc(this.relativeTarget, this.relativeTargetOrigin))
                  : (this.relativeParent = this.relativeTarget = void 0);
              }
              if (this.relativeTarget || this.targetDelta) {
                var a, s, l;
                if (
                  (this.target ||
                    ((this.target = {
                      x: { min: 0, max: 0 },
                      y: { min: 0, max: 0 },
                    }),
                    (this.targetWithTransforms = {
                      x: { min: 0, max: 0 },
                      y: { min: 0, max: 0 },
                    })),
                  this.relativeTarget &&
                  this.relativeTargetOrigin &&
                  this.relativeParent &&
                  this.relativeParent.target
                    ? (this.forceRelativeParentToResolveTarget(),
                      (a = this.target),
                      (s = this.relativeTarget),
                      (l = this.relativeParent.target),
                      yl(a.x, s.x, l.x),
                      yl(a.y, s.y, l.y))
                    : this.targetDelta
                    ? (Boolean(this.resumingFrom)
                        ? (this.target = this.applyTransform(
                            this.layout.layoutBox
                          ))
                        : dc(this.target, this.layout.layoutBox),
                      Ll(this.target, this.targetDelta))
                    : dc(this.target, this.layout.layoutBox),
                  this.attemptToResolveRelativeTarget)
                ) {
                  this.attemptToResolveRelativeTarget = !1;
                  const e = this.getClosestProjectingParent();
                  e &&
                  Boolean(e.resumingFrom) === Boolean(this.resumingFrom) &&
                  !e.options.layoutScroll &&
                  e.target &&
                  1 !== this.animationProgress
                    ? ((this.relativeParent = e),
                      this.forceRelativeParentToResolveTarget(),
                      (this.relativeTarget = {
                        x: { min: 0, max: 0 },
                        y: { min: 0, max: 0 },
                      }),
                      (this.relativeTargetOrigin = {
                        x: { min: 0, max: 0 },
                        y: { min: 0, max: 0 },
                      }),
                      bl(this.relativeTargetOrigin, this.target, e.target),
                      dc(this.relativeTarget, this.relativeTargetOrigin))
                    : (this.relativeParent = this.relativeTarget = void 0);
                }
                Tc.resolvedTargetDeltas++;
              }
            }
          }
          getClosestProjectingParent() {
            if (
              this.parent &&
              !Rl(this.parent.latestValues) &&
              !Ol(this.parent.latestValues)
            )
              return this.parent.isProjecting()
                ? this.parent
                : this.parent.getClosestProjectingParent();
          }
          isProjecting() {
            return Boolean(
              (this.relativeTarget ||
                this.targetDelta ||
                this.options.layoutRoot) &&
                this.layout
            );
          }
          calcProjection() {
            var e;
            const t = this.getLead(),
              n = Boolean(this.resumingFrom) || this !== t;
            let r = !0;
            if (
              ((this.isProjectionDirty ||
                (null === (e = this.parent) || void 0 === e
                  ? void 0
                  : e.isProjectionDirty)) &&
                (r = !1),
              n &&
                (this.isSharedProjectionDirty || this.isTransformDirty) &&
                (r = !1),
              this.resolvedRelativeTargetAt === yo.timestamp && (r = !1),
              r)
            )
              return;
            const { layout: i, layoutId: o } = this.options;
            if (
              ((this.isTreeAnimating = Boolean(
                (this.parent && this.parent.isTreeAnimating) ||
                  this.currentAnimation ||
                  this.pendingAnimation
              )),
              this.isTreeAnimating ||
                (this.targetDelta = this.relativeTarget = void 0),
              !this.layout || (!i && !o))
            )
              return;
            dc(this.layoutCorrected, this.layout.layoutBox);
            const a = this.treeScale.x,
              s = this.treeScale.y;
            !(function (e, t, n) {
              let r =
                arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
              const i = n.length;
              if (!i) return;
              let o, a;
              t.x = t.y = 1;
              for (let s = 0; s < i; s++) {
                (o = n[s]), (a = o.projectionDelta);
                const i = o.instance;
                (i && i.style && "contents" === i.style.display) ||
                  (r &&
                    o.options.layoutScroll &&
                    o.scroll &&
                    o !== o.root &&
                    Ul(e, { x: -o.scroll.offset.x, y: -o.scroll.offset.y }),
                  a && ((t.x *= a.x.scale), (t.y *= a.y.scale), Ll(e, a)),
                  r && _l(o.latestValues) && Ul(e, o.latestValues));
              }
              (t.x = Ml(t.x)), (t.y = Ml(t.y));
            })(this.layoutCorrected, this.treeScale, this.path, n),
              !t.layout ||
                t.target ||
                (1 === this.treeScale.x && 1 === this.treeScale.y) ||
                (t.target = t.layout.layoutBox);
            const { target: l } = t;
            if (!l)
              return void (
                this.projectionTransform &&
                ((this.projectionDelta = {
                  x: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
                  y: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
                }),
                (this.projectionTransform = "none"),
                this.scheduleRender())
              );
            this.projectionDelta ||
              ((this.projectionDelta = {
                x: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
                y: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
              }),
              (this.projectionDeltaWithTransform = {
                x: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
                y: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
              }));
            const c = this.projectionTransform;
            vl(
              this.projectionDelta,
              this.layoutCorrected,
              l,
              this.latestValues
            ),
              (this.projectionTransform = Sc(
                this.projectionDelta,
                this.treeScale
              )),
              (this.projectionTransform === c &&
                this.treeScale.x === a &&
                this.treeScale.y === s) ||
                ((this.hasProjected = !0),
                this.scheduleRender(),
                this.notifyListeners("projectionUpdate", l)),
              Tc.recalculatedProjection++;
          }
          hide() {
            this.isVisible = !1;
          }
          show() {
            this.isVisible = !0;
          }
          scheduleRender() {
            let e =
              !(arguments.length > 0 && void 0 !== arguments[0]) ||
              arguments[0];
            if (
              (this.options.scheduleRender && this.options.scheduleRender(), e)
            ) {
              const e = this.getStack();
              e && e.scheduleRender();
            }
            this.resumingFrom &&
              !this.resumingFrom.instance &&
              (this.resumingFrom = void 0);
          }
          setAnimationOrigin(e) {
            let t =
              arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
            const n = this.snapshot,
              r = n ? n.latestValues : {},
              i = { ...this.latestValues },
              o = {
                x: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
                y: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
              };
            (this.relativeParent && this.relativeParent.options.layoutRoot) ||
              (this.relativeTarget = this.relativeTargetOrigin = void 0),
              (this.attemptToResolveRelativeTarget = !t);
            const a = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } },
              s =
                (n ? n.source : void 0) !==
                (this.layout ? this.layout.source : void 0),
              l = this.getStack(),
              c = !l || l.members.length <= 1,
              u = Boolean(
                s && !c && !0 === this.options.crossfade && !this.path.some(Hc)
              );
            let d;
            (this.animationProgress = 0),
              (this.mixTargetDelta = (t) => {
                const n = t / 1e3;
                Wc(o.x, e.x, n),
                  Wc(o.y, e.y, n),
                  this.setTargetDelta(o),
                  this.relativeTarget &&
                    this.relativeTargetOrigin &&
                    this.layout &&
                    this.relativeParent &&
                    this.relativeParent.layout &&
                    (bl(
                      a,
                      this.layout.layoutBox,
                      this.relativeParent.layout.layoutBox
                    ),
                    (function (e, t, n, r) {
                      $c(e.x, t.x, n.x, r), $c(e.y, t.y, n.y, r);
                    })(this.relativeTarget, this.relativeTargetOrigin, a, n),
                    d &&
                      (function (e, t) {
                        return (
                          e.x.min === t.x.min &&
                          e.x.max === t.x.max &&
                          e.y.min === t.y.min &&
                          e.y.max === t.y.max
                        );
                      })(this.relativeTarget, d) &&
                      (this.isProjectionDirty = !1),
                    d || (d = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } }),
                    dc(d, this.relativeTarget)),
                  s &&
                    ((this.animationValues = i),
                    (function (e, t, n, r, i, o) {
                      i
                        ? ((e.opacity = ja(
                            0,
                            void 0 !== n.opacity ? n.opacity : 1,
                            sc(r)
                          )),
                          (e.opacityExit = ja(
                            void 0 !== t.opacity ? t.opacity : 1,
                            0,
                            lc(r)
                          )))
                        : o &&
                          (e.opacity = ja(
                            void 0 !== t.opacity ? t.opacity : 1,
                            void 0 !== n.opacity ? n.opacity : 1,
                            r
                          ));
                      for (let a = 0; a < rc; a++) {
                        const i = `border${nc[a]}Radius`;
                        let o = ac(t, i),
                          s = ac(n, i);
                        (void 0 === o && void 0 === s) ||
                          (o || (o = 0),
                          s || (s = 0),
                          0 === o || 0 === s || oc(o) === oc(s)
                            ? ((e[i] = Math.max(ja(ic(o), ic(s), r), 0)),
                              (Oi.test(s) || Oi.test(o)) && (e[i] += "%"))
                            : (e[i] = s));
                      }
                      (t.rotate || n.rotate) &&
                        (e.rotate = ja(t.rotate || 0, n.rotate || 0, r));
                    })(i, r, this.latestValues, n, u, c)),
                  this.root.scheduleUpdateProjection(),
                  this.scheduleRender(),
                  (this.animationProgress = n);
              }),
              this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
          }
          startAnimation(e) {
            this.notifyListeners("animationStart"),
              this.currentAnimation && this.currentAnimation.stop(),
              this.resumingFrom &&
                this.resumingFrom.currentAnimation &&
                this.resumingFrom.currentAnimation.stop(),
              this.pendingAnimation &&
                (vo(this.pendingAnimation), (this.pendingAnimation = void 0)),
              (this.pendingAnimation = go.update(() => {
                (Kl.hasAnimatedSinceResize = !0),
                  (this.currentAnimation = (function (e, t, n) {
                    const r = fi(e) ? e : Fs(e);
                    return r.start(_s("", r, t, n)), r.animation;
                  })(0, 1e3, {
                    ...e,
                    onUpdate: (t) => {
                      this.mixTargetDelta(t), e.onUpdate && e.onUpdate(t);
                    },
                    onComplete: () => {
                      e.onComplete && e.onComplete(), this.completeAnimation();
                    },
                  })),
                  this.resumingFrom &&
                    (this.resumingFrom.currentAnimation =
                      this.currentAnimation),
                  (this.pendingAnimation = void 0);
              }));
          }
          completeAnimation() {
            this.resumingFrom &&
              ((this.resumingFrom.currentAnimation = void 0),
              (this.resumingFrom.preserveOpacity = void 0));
            const e = this.getStack();
            e && e.exitAnimationComplete(),
              (this.resumingFrom =
                this.currentAnimation =
                this.animationValues =
                  void 0),
              this.notifyListeners("animationComplete");
          }
          finishAnimation() {
            this.currentAnimation &&
              (this.mixTargetDelta && this.mixTargetDelta(1e3),
              this.currentAnimation.stop()),
              this.completeAnimation();
          }
          applyTransformsToTarget() {
            const e = this.getLead();
            let {
              targetWithTransforms: t,
              target: n,
              layout: r,
              latestValues: i,
            } = e;
            if (t && n && r) {
              if (
                this !== e &&
                this.layout &&
                r &&
                Qc(
                  this.options.animationType,
                  this.layout.layoutBox,
                  r.layoutBox
                )
              ) {
                n = this.target || {
                  x: { min: 0, max: 0 },
                  y: { min: 0, max: 0 },
                };
                const t = pl(this.layout.layoutBox.x);
                (n.x.min = e.target.x.min), (n.x.max = n.x.min + t);
                const r = pl(this.layout.layoutBox.y);
                (n.y.min = e.target.y.min), (n.y.max = n.y.min + r);
              }
              dc(t, n),
                Ul(t, i),
                vl(
                  this.projectionDeltaWithTransform,
                  this.layoutCorrected,
                  t,
                  i
                );
            }
          }
          registerSharedNode(e, t) {
            this.sharedNodes.has(e) || this.sharedNodes.set(e, new wc());
            this.sharedNodes.get(e).add(t);
            const n = t.options.initialPromotionConfig;
            t.promote({
              transition: n ? n.transition : void 0,
              preserveFollowOpacity:
                n && n.shouldPreserveFollowOpacity
                  ? n.shouldPreserveFollowOpacity(t)
                  : void 0,
            });
          }
          isLead() {
            const e = this.getStack();
            return !e || e.lead === this;
          }
          getLead() {
            var e;
            const { layoutId: t } = this.options;
            return (
              (t &&
                (null === (e = this.getStack()) || void 0 === e
                  ? void 0
                  : e.lead)) ||
              this
            );
          }
          getPrevLead() {
            var e;
            const { layoutId: t } = this.options;
            return t
              ? null === (e = this.getStack()) || void 0 === e
                ? void 0
                : e.prevLead
              : void 0;
          }
          getStack() {
            const { layoutId: e } = this.options;
            if (e) return this.root.sharedNodes.get(e);
          }
          promote() {
            let {
              needsReset: e,
              transition: t,
              preserveFollowOpacity: n,
            } = arguments.length > 0 && void 0 !== arguments[0]
              ? arguments[0]
              : {};
            const r = this.getStack();
            r && r.promote(this, n),
              e && ((this.projectionDelta = void 0), (this.needsReset = !0)),
              t && this.setOptions({ transition: t });
          }
          relegate() {
            const e = this.getStack();
            return !!e && e.relegate(this);
          }
          resetRotation() {
            const { visualElement: e } = this.options;
            if (!e) return;
            let t = !1;
            const { latestValues: n } = e;
            if (
              ((n.rotate || n.rotateX || n.rotateY || n.rotateZ) && (t = !0),
              !t)
            )
              return;
            const r = {};
            for (let i = 0; i < Cc.length; i++) {
              const t = "rotate" + Cc[i];
              n[t] && ((r[t] = n[t]), e.setStaticValue(t, 0));
            }
            e.render();
            for (const i in r) e.setStaticValue(i, r[i]);
            e.scheduleRender();
          }
          getProjectionStyles(e) {
            var t, n;
            if (!this.instance || this.isSVG) return;
            if (!this.isVisible) return Pc;
            const r = { visibility: "" },
              i = this.getTransformTemplate();
            if (this.needsReset)
              return (
                (this.needsReset = !1),
                (r.opacity = ""),
                (r.pointerEvents =
                  co(null === e || void 0 === e ? void 0 : e.pointerEvents) ||
                  ""),
                (r.transform = i ? i(this.latestValues, "") : "none"),
                r
              );
            const o = this.getLead();
            if (!this.projectionDelta || !this.layout || !o.target) {
              const t = {};
              return (
                this.options.layoutId &&
                  ((t.opacity =
                    void 0 !== this.latestValues.opacity
                      ? this.latestValues.opacity
                      : 1),
                  (t.pointerEvents =
                    co(null === e || void 0 === e ? void 0 : e.pointerEvents) ||
                    "")),
                this.hasProjected &&
                  !_l(this.latestValues) &&
                  ((t.transform = i ? i({}, "") : "none"),
                  (this.hasProjected = !1)),
                t
              );
            }
            const a = o.animationValues || o.latestValues;
            this.applyTransformsToTarget(),
              (r.transform = Sc(
                this.projectionDeltaWithTransform,
                this.treeScale,
                a
              )),
              i && (r.transform = i(a, r.transform));
            const { x: s, y: l } = this.projectionDelta;
            (r.transformOrigin = `${100 * s.origin}% ${100 * l.origin}% 0`),
              o.animationValues
                ? (r.opacity =
                    o === this
                      ? null !==
                          (n =
                            null !== (t = a.opacity) && void 0 !== t
                              ? t
                              : this.latestValues.opacity) && void 0 !== n
                        ? n
                        : 1
                      : this.preserveOpacity
                      ? this.latestValues.opacity
                      : a.opacityExit)
                : (r.opacity =
                    o === this
                      ? void 0 !== a.opacity
                        ? a.opacity
                        : ""
                      : void 0 !== a.opacityExit
                      ? a.opacityExit
                      : 0);
            for (const c in ci) {
              if (void 0 === a[c]) continue;
              const { correct: e, applyTo: t } = ci[c],
                n = "none" === r.transform ? a[c] : e(a[c], o);
              if (t) {
                const e = t.length;
                for (let i = 0; i < e; i++) r[t[i]] = n;
              } else r[c] = n;
            }
            return (
              this.options.layoutId &&
                (r.pointerEvents =
                  o === this
                    ? co(
                        null === e || void 0 === e ? void 0 : e.pointerEvents
                      ) || ""
                    : "none"),
              r
            );
          }
          clearSnapshot() {
            this.resumeFrom = this.snapshot = void 0;
          }
          resetTree() {
            this.root.nodes.forEach((e) => {
              var t;
              return null === (t = e.currentAnimation) || void 0 === t
                ? void 0
                : t.stop();
            }),
              this.root.nodes.forEach(Nc),
              this.root.sharedNodes.clear();
          }
        };
      }
      function _c(e) {
        e.updateLayout();
      }
      function Oc(e) {
        var t;
        const n =
          (null === (t = e.resumeFrom) || void 0 === t ? void 0 : t.snapshot) ||
          e.snapshot;
        if (e.isLead() && e.layout && n && e.hasListeners("didUpdate")) {
          const { layoutBox: t, measuredBox: r } = e.layout,
            { animationType: i } = e.options,
            o = n.source !== e.layout.source;
          "size" === i
            ? Pl((e) => {
                const r = o ? n.measuredBox[e] : n.layoutBox[e],
                  i = pl(r);
                (r.min = t[e].min), (r.max = r.min + i);
              })
            : Qc(i, n.layoutBox, t) &&
              Pl((r) => {
                const i = o ? n.measuredBox[r] : n.layoutBox[r],
                  a = pl(t[r]);
                (i.max = i.min + a),
                  e.relativeTarget &&
                    !e.currentAnimation &&
                    ((e.isProjectionDirty = !0),
                    (e.relativeTarget[r].max = e.relativeTarget[r].min + a));
              });
          const a = {
            x: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
            y: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
          };
          vl(a, t, n.layoutBox);
          const s = {
            x: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
            y: { translate: 0, scale: 1, origin: 0, originPoint: 0 },
          };
          o
            ? vl(s, e.applyTransform(r, !0), n.measuredBox)
            : vl(s, t, n.layoutBox);
          const l = !yc(a);
          let c = !1;
          if (!e.resumeFrom) {
            const r = e.getClosestProjectingParent();
            if (r && !r.resumeFrom) {
              const { snapshot: i, layout: o } = r;
              if (i && o) {
                const a = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
                bl(a, n.layoutBox, i.layoutBox);
                const s = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
                bl(s, t, o.layoutBox),
                  xc(a, s) || (c = !0),
                  r.options.layoutRoot &&
                    ((e.relativeTarget = s),
                    (e.relativeTargetOrigin = a),
                    (e.relativeParent = r));
              }
            }
          }
          e.notifyListeners("didUpdate", {
            layout: t,
            snapshot: n,
            delta: s,
            layoutDelta: a,
            hasLayoutChanged: l,
            hasRelativeTargetChanged: c,
          });
        } else if (e.isLead()) {
          const { onExitComplete: t } = e.options;
          t && t();
        }
        e.options.transition = void 0;
      }
      function Ac(e) {
        Tc.totalNodes++,
          e.parent &&
            (e.isProjecting() ||
              (e.isProjectionDirty = e.parent.isProjectionDirty),
            e.isSharedProjectionDirty ||
              (e.isSharedProjectionDirty = Boolean(
                e.isProjectionDirty ||
                  e.parent.isProjectionDirty ||
                  e.parent.isSharedProjectionDirty
              )),
            e.isTransformDirty ||
              (e.isTransformDirty = e.parent.isTransformDirty));
      }
      function zc(e) {
        e.isProjectionDirty =
          e.isSharedProjectionDirty =
          e.isTransformDirty =
            !1;
      }
      function Dc(e) {
        e.clearSnapshot();
      }
      function Nc(e) {
        e.clearMeasurements();
      }
      function Lc(e) {
        e.isLayoutDirty = !1;
      }
      function Mc(e) {
        const { visualElement: t } = e.options;
        t &&
          t.getProps().onBeforeLayoutMeasure &&
          t.notify("BeforeLayoutMeasure"),
          e.resetTransform();
      }
      function Fc(e) {
        e.finishAnimation(),
          (e.targetDelta = e.relativeTarget = e.target = void 0),
          (e.isProjectionDirty = !0);
      }
      function Ic(e) {
        e.resolveTargetDelta();
      }
      function Vc(e) {
        e.calcProjection();
      }
      function Bc(e) {
        e.resetRotation();
      }
      function Uc(e) {
        e.removeLeadSnapshot();
      }
      function Wc(e, t, n) {
        (e.translate = ja(t.translate, 0, n)),
          (e.scale = ja(t.scale, 1, n)),
          (e.origin = t.origin),
          (e.originPoint = t.originPoint);
      }
      function $c(e, t, n, r) {
        (e.min = ja(t.min, n.min, r)), (e.max = ja(t.max, n.max, r));
      }
      function Hc(e) {
        return e.animationValues && void 0 !== e.animationValues.opacityExit;
      }
      const Yc = { duration: 0.45, ease: [0.4, 0, 0.1, 1] },
        qc = (e) =>
          "undefined" !== typeof navigator &&
          navigator.userAgent.toLowerCase().includes(e),
        Gc = qc("applewebkit/") && !qc("chrome/") ? Math.round : fo;
      function Kc(e) {
        (e.min = Gc(e.min)), (e.max = Gc(e.max));
      }
      function Qc(e, t, n) {
        return (
          "position" === e ||
          ("preserve-aspect" === e && !ml(bc(t), bc(n), 0.2))
        );
      }
      const Xc = Rc({
          attachResizeListener: (e, t) => So(e, "resize", t),
          measureScroll: () => ({
            x: document.documentElement.scrollLeft || document.body.scrollLeft,
            y: document.documentElement.scrollTop || document.body.scrollTop,
          }),
          checkIsScrollRoot: () => !0,
        }),
        Jc = { current: void 0 },
        Zc = Rc({
          measureScroll: (e) => ({ x: e.scrollLeft, y: e.scrollTop }),
          defaultParent: () => {
            if (!Jc.current) {
              const e = new Xc({});
              e.mount(window),
                e.setOptions({ layoutScroll: !0 }),
                (Jc.current = e);
            }
            return Jc.current;
          },
          resetTransform: (e, t) => {
            e.style.transform = void 0 !== t ? t : "none";
          },
          checkIsScrollRoot: (e) =>
            Boolean("fixed" === window.getComputedStyle(e).position),
        }),
        eu = {
          pan: {
            Feature: class extends zo {
              constructor() {
                super(...arguments), (this.removePointerDownListener = fo);
              }
              onPointerDown(e) {
                this.session = new sl(e, this.createPanHandlers(), {
                  transformPagePoint: this.node.getTransformPagePoint(),
                  contextWindow: $l(this.node),
                });
              }
              createPanHandlers() {
                const {
                  onPanSessionStart: e,
                  onPanStart: t,
                  onPan: n,
                  onPanEnd: r,
                } = this.node.getProps();
                return {
                  onSessionStart: Gl(e),
                  onStart: Gl(t),
                  onMove: n,
                  onEnd: (e, t) => {
                    delete this.session, r && go.update(() => r(e, t));
                  },
                };
              }
              mount() {
                this.removePointerDownListener = Co(
                  this.node.current,
                  "pointerdown",
                  (e) => this.onPointerDown(e)
                );
              }
              update() {
                this.session &&
                  this.session.updateHandlers(this.createPanHandlers());
              }
              unmount() {
                this.removePointerDownListener(),
                  this.session && this.session.end();
              }
            },
          },
          drag: {
            Feature: class extends zo {
              constructor(e) {
                super(e),
                  (this.removeGroupControls = fo),
                  (this.removeListeners = fo),
                  (this.controls = new Yl(e));
              }
              mount() {
                const { dragControls: e } = this.node.getProps();
                e && (this.removeGroupControls = e.subscribe(this.controls)),
                  (this.removeListeners = this.controls.addListeners() || fo);
              }
              unmount() {
                this.removeGroupControls(), this.removeListeners();
              }
            },
            ProjectionNode: Zc,
            MeasureLayout: ec,
          },
        },
        tu = /var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z0-9 ()%#.,-]+)?\)/;
      function nu(e, t) {
        let n =
          arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1;
        qo(
          n <= 4,
          `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`
        );
        const [r, i] = (function (e) {
          const t = tu.exec(e);
          if (!t) return [,];
          const [, n, r] = t;
          return [n, r];
        })(e);
        if (!r) return;
        const o = window.getComputedStyle(t).getPropertyValue(r);
        if (o) {
          const e = o.trim();
          return As(e) ? parseFloat(e) : e;
        }
        return yi(i) ? nu(i, t, n + 1) : i;
      }
      const ru = new Set([
          "width",
          "height",
          "top",
          "left",
          "right",
          "bottom",
          "x",
          "y",
          "translateX",
          "translateY",
        ]),
        iu = (e) => ru.has(e),
        ou = (e) => e === wi || e === Ai,
        au = (e, t) => parseFloat(e.split(", ")[t]),
        su = (e, t) => (n, r) => {
          let { transform: i } = r;
          if ("none" === i || !i) return 0;
          const o = i.match(/^matrix3d\((.+)\)$/);
          if (o) return au(o[1], t);
          {
            const t = i.match(/^matrix\((.+)\)$/);
            return t ? au(t[1], e) : 0;
          }
        },
        lu = new Set(["x", "y", "z"]),
        cu = ui.filter((e) => !lu.has(e));
      const uu = {
        width: (e, t) => {
          let { x: n } = e,
            { paddingLeft: r = "0", paddingRight: i = "0" } = t;
          return n.max - n.min - parseFloat(r) - parseFloat(i);
        },
        height: (e, t) => {
          let { y: n } = e,
            { paddingTop: r = "0", paddingBottom: i = "0" } = t;
          return n.max - n.min - parseFloat(r) - parseFloat(i);
        },
        top: (e, t) => {
          let { top: n } = t;
          return parseFloat(n);
        },
        left: (e, t) => {
          let { left: n } = t;
          return parseFloat(n);
        },
        bottom: (e, t) => {
          let { y: n } = e,
            { top: r } = t;
          return parseFloat(r) + (n.max - n.min);
        },
        right: (e, t) => {
          let { x: n } = e,
            { left: r } = t;
          return parseFloat(r) + (n.max - n.min);
        },
        x: su(4, 13),
        y: su(5, 14),
      };
      (uu.translateX = uu.x), (uu.translateY = uu.y);
      const du = function (e, t) {
        let n =
            arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
          r =
            arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
        (t = { ...t }), (r = { ...r });
        const i = Object.keys(t).filter(iu);
        let o = [],
          a = !1;
        const s = [];
        if (
          (i.forEach((i) => {
            const l = e.getValue(i);
            if (!e.hasValue(i)) return;
            let c = n[i],
              u = Bs(c);
            const d = t[i];
            let h;
            if (so(d)) {
              const e = d.length,
                t = null === d[0] ? 1 : 0;
              (c = d[t]), (u = Bs(c));
              for (let n = t; n < e && null !== d[n]; n++)
                h
                  ? qo(Bs(d[n]) === h, "All keyframes must be of the same type")
                  : ((h = Bs(d[n])),
                    qo(
                      h === u || (ou(u) && ou(h)),
                      "Keyframes must be of the same dimension as the current value"
                    ));
            } else h = Bs(d);
            if (u !== h)
              if (ou(u) && ou(h)) {
                const e = l.get();
                "string" === typeof e && l.set(parseFloat(e)),
                  "string" === typeof d
                    ? (t[i] = parseFloat(d))
                    : Array.isArray(d) &&
                      h === Ai &&
                      (t[i] = d.map(parseFloat));
              } else
                (null === u || void 0 === u ? void 0 : u.transform) &&
                (null === h || void 0 === h ? void 0 : h.transform) &&
                (0 === c || 0 === d)
                  ? 0 === c
                    ? l.set(h.transform(c))
                    : (t[i] = u.transform(d))
                  : (a ||
                      ((o = (function (e) {
                        const t = [];
                        return (
                          cu.forEach((n) => {
                            const r = e.getValue(n);
                            void 0 !== r &&
                              (t.push([n, r.get()]),
                              r.set(n.startsWith("scale") ? 1 : 0));
                          }),
                          t.length && e.render(),
                          t
                        );
                      })(e)),
                      (a = !0)),
                    s.push(i),
                    (r[i] = void 0 !== r[i] ? r[i] : t[i]),
                    l.jump(d));
          }),
          s.length)
        ) {
          const n = s.indexOf("height") >= 0 ? window.pageYOffset : null,
            i = ((e, t, n) => {
              const r = t.measureViewportBox(),
                i = t.current,
                o = getComputedStyle(i),
                { display: a } = o,
                s = {};
              "none" === a && t.setStaticValue("display", e.display || "block"),
                n.forEach((e) => {
                  s[e] = uu[e](r, o);
                }),
                t.render();
              const l = t.measureViewportBox();
              return (
                n.forEach((n) => {
                  const r = t.getValue(n);
                  r && r.jump(s[n]), (e[n] = uu[n](l, o));
                }),
                e
              );
            })(t, e, s);
          return (
            o.length &&
              o.forEach((t) => {
                let [n, r] = t;
                e.getValue(n).set(r);
              }),
            e.render(),
            Ir && null !== n && window.scrollTo({ top: n }),
            { target: i, transitionEnd: r }
          );
        }
        return { target: t, transitionEnd: r };
      };
      function hu(e, t, n, r) {
        return ((e) => Object.keys(e).some(iu))(t)
          ? du(e, t, n, r)
          : { target: t, transitionEnd: r };
      }
      const fu = (e, t, n, r) => {
          const i = (function (e, t, n) {
            let { ...r } = t;
            const i = e.current;
            if (!(i instanceof Element)) return { target: r, transitionEnd: n };
            n && (n = { ...n }),
              e.values.forEach((e) => {
                const t = e.get();
                if (!yi(t)) return;
                const n = nu(t, i);
                n && e.set(n);
              });
            for (const o in r) {
              const e = r[o];
              if (!yi(e)) continue;
              const t = nu(e, i);
              t && ((r[o] = t), n || (n = {}), void 0 === n[o] && (n[o] = e));
            }
            return { target: r, transitionEnd: n };
          })(e, t, r);
          return hu(e, (t = i.target), n, (r = i.transitionEnd));
        },
        pu = { current: null },
        mu = { current: !1 };
      const gu = new WeakMap(),
        vu = Object.keys(ei),
        yu = vu.length,
        xu = [
          "AnimationStart",
          "AnimationComplete",
          "Update",
          "BeforeLayoutMeasure",
          "LayoutMeasure",
          "LayoutAnimationStart",
          "LayoutAnimationComplete",
        ],
        bu = Gr.length;
      class wu {
        constructor(e) {
          let {
              parent: t,
              props: n,
              presenceContext: r,
              reducedMotionConfig: i,
              visualState: o,
            } = e,
            a =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {};
          (this.current = null),
            (this.children = new Set()),
            (this.isVariantNode = !1),
            (this.isControllingVariants = !1),
            (this.shouldReduceMotion = null),
            (this.values = new Map()),
            (this.features = {}),
            (this.valueSubscriptions = new Map()),
            (this.prevMotionValues = {}),
            (this.events = {}),
            (this.propEventSubscriptions = {}),
            (this.notifyUpdate = () =>
              this.notify("Update", this.latestValues)),
            (this.render = () => {
              this.current &&
                (this.triggerBuild(),
                this.renderInstance(
                  this.current,
                  this.renderState,
                  this.props.style,
                  this.projection
                ));
            }),
            (this.scheduleRender = () => go.render(this.render, !1, !0));
          const { latestValues: s, renderState: l } = o;
          (this.latestValues = s),
            (this.baseTarget = { ...s }),
            (this.initialValues = n.initial ? { ...s } : {}),
            (this.renderState = l),
            (this.parent = t),
            (this.props = n),
            (this.presenceContext = r),
            (this.depth = t ? t.depth + 1 : 0),
            (this.reducedMotionConfig = i),
            (this.options = a),
            (this.isControllingVariants = Kr(n)),
            (this.isVariantNode = Qr(n)),
            this.isVariantNode && (this.variantChildren = new Set()),
            (this.manuallyAnimateOnMount = Boolean(t && t.current));
          const { willChange: c, ...u } = this.scrapeMotionValuesFromProps(
            n,
            {}
          );
          for (const d in u) {
            const e = u[d];
            void 0 !== s[d] && fi(e) && (e.set(s[d], !1), Os(c) && c.add(d));
          }
        }
        scrapeMotionValuesFromProps(e, t) {
          return {};
        }
        mount(e) {
          (this.current = e),
            gu.set(e, this),
            this.projection &&
              !this.projection.instance &&
              this.projection.mount(e),
            this.parent &&
              this.isVariantNode &&
              !this.isControllingVariants &&
              (this.removeFromVariantTree = this.parent.addVariantChild(this)),
            this.values.forEach((e, t) => this.bindToMotionValue(t, e)),
            mu.current ||
              (function () {
                if (((mu.current = !0), Ir))
                  if (window.matchMedia) {
                    const e = window.matchMedia("(prefers-reduced-motion)"),
                      t = () => (pu.current = e.matches);
                    e.addListener(t), t();
                  } else pu.current = !1;
              })(),
            (this.shouldReduceMotion =
              "never" !== this.reducedMotionConfig &&
              ("always" === this.reducedMotionConfig || pu.current)),
            this.parent && this.parent.children.add(this),
            this.update(this.props, this.presenceContext);
        }
        unmount() {
          gu.delete(this.current),
            this.projection && this.projection.unmount(),
            vo(this.notifyUpdate),
            vo(this.render),
            this.valueSubscriptions.forEach((e) => e()),
            this.removeFromVariantTree && this.removeFromVariantTree(),
            this.parent && this.parent.children.delete(this);
          for (const e in this.events) this.events[e].clear();
          for (const e in this.features) this.features[e].unmount();
          this.current = null;
        }
        bindToMotionValue(e, t) {
          const n = di.has(e),
            r = t.on("change", (t) => {
              (this.latestValues[e] = t),
                this.props.onUpdate && go.update(this.notifyUpdate, !1, !0),
                n && this.projection && (this.projection.isTransformDirty = !0);
            }),
            i = t.on("renderRequest", this.scheduleRender);
          this.valueSubscriptions.set(e, () => {
            r(), i();
          });
        }
        sortNodePosition(e) {
          return this.current &&
            this.sortInstanceNodePosition &&
            this.type === e.type
            ? this.sortInstanceNodePosition(this.current, e.current)
            : 0;
        }
        loadFeatures(e, t, n, r) {
          let i,
            o,
            { children: a, ...s } = e;
          for (let l = 0; l < yu; l++) {
            const e = vu[l],
              {
                isEnabled: t,
                Feature: n,
                ProjectionNode: r,
                MeasureLayout: a,
              } = ei[e];
            r && (i = r),
              t(s) &&
                (!this.features[e] && n && (this.features[e] = new n(this)),
                a && (o = a));
          }
          if (
            ("html" === this.type || "svg" === this.type) &&
            !this.projection &&
            i
          ) {
            this.projection = new i(
              this.latestValues,
              this.parent && this.parent.projection
            );
            const {
              layoutId: e,
              layout: t,
              drag: n,
              dragConstraints: o,
              layoutScroll: a,
              layoutRoot: l,
            } = s;
            this.projection.setOptions({
              layoutId: e,
              layout: t,
              alwaysMeasureLayout: Boolean(n) || (o && $r(o)),
              visualElement: this,
              scheduleRender: () => this.scheduleRender(),
              animationType: "string" === typeof t ? t : "both",
              initialPromotionConfig: r,
              layoutScroll: a,
              layoutRoot: l,
            });
          }
          return o;
        }
        updateFeatures() {
          for (const e in this.features) {
            const t = this.features[e];
            t.isMounted ? t.update() : (t.mount(), (t.isMounted = !0));
          }
        }
        triggerBuild() {
          this.build(
            this.renderState,
            this.latestValues,
            this.options,
            this.props
          );
        }
        measureViewportBox() {
          return this.current
            ? this.measureInstanceViewportBox(this.current, this.props)
            : { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
        }
        getStaticValue(e) {
          return this.latestValues[e];
        }
        setStaticValue(e, t) {
          this.latestValues[e] = t;
        }
        makeTargetAnimatable(e) {
          let t =
            !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
          return this.makeTargetAnimatableFromInstance(e, this.props, t);
        }
        update(e, t) {
          (e.transformTemplate || this.props.transformTemplate) &&
            this.scheduleRender(),
            (this.prevProps = this.props),
            (this.props = e),
            (this.prevPresenceContext = this.presenceContext),
            (this.presenceContext = t);
          for (let n = 0; n < xu.length; n++) {
            const t = xu[n];
            this.propEventSubscriptions[t] &&
              (this.propEventSubscriptions[t](),
              delete this.propEventSubscriptions[t]);
            const r = e["on" + t];
            r && (this.propEventSubscriptions[t] = this.on(t, r));
          }
          (this.prevMotionValues = (function (e, t, n) {
            const { willChange: r } = t;
            for (const i in t) {
              const o = t[i],
                a = n[i];
              if (fi(o)) e.addValue(i, o), Os(r) && r.add(i);
              else if (fi(a))
                e.addValue(i, Fs(o, { owner: e })), Os(r) && r.remove(i);
              else if (a !== o)
                if (e.hasValue(i)) {
                  const t = e.getValue(i);
                  !t.hasAnimated && t.set(o);
                } else {
                  const t = e.getStaticValue(i);
                  e.addValue(i, Fs(void 0 !== t ? t : o, { owner: e }));
                }
            }
            for (const i in n) void 0 === t[i] && e.removeValue(i);
            return t;
          })(
            this,
            this.scrapeMotionValuesFromProps(e, this.prevProps),
            this.prevMotionValues
          )),
            this.handleChildMotionValue && this.handleChildMotionValue();
        }
        getProps() {
          return this.props;
        }
        getVariant(e) {
          return this.props.variants ? this.props.variants[e] : void 0;
        }
        getDefaultTransition() {
          return this.props.transition;
        }
        getTransformPagePoint() {
          return this.props.transformPagePoint;
        }
        getClosestVariantNode() {
          return this.isVariantNode
            ? this
            : this.parent
            ? this.parent.getClosestVariantNode()
            : void 0;
        }
        getVariantContext() {
          if (arguments.length > 0 && void 0 !== arguments[0] && arguments[0])
            return this.parent ? this.parent.getVariantContext() : void 0;
          if (!this.isControllingVariants) {
            const e = (this.parent && this.parent.getVariantContext()) || {};
            return (
              void 0 !== this.props.initial && (e.initial = this.props.initial),
              e
            );
          }
          const e = {};
          for (let t = 0; t < bu; t++) {
            const n = Gr[t],
              r = this.props[n];
            (Hr(r) || !1 === r) && (e[n] = r);
          }
          return e;
        }
        addVariantChild(e) {
          const t = this.getClosestVariantNode();
          if (t)
            return (
              t.variantChildren && t.variantChildren.add(e),
              () => t.variantChildren.delete(e)
            );
        }
        addValue(e, t) {
          t !== this.values.get(e) &&
            (this.removeValue(e), this.bindToMotionValue(e, t)),
            this.values.set(e, t),
            (this.latestValues[e] = t.get());
        }
        removeValue(e) {
          this.values.delete(e);
          const t = this.valueSubscriptions.get(e);
          t && (t(), this.valueSubscriptions.delete(e)),
            delete this.latestValues[e],
            this.removeValueFromRenderState(e, this.renderState);
        }
        hasValue(e) {
          return this.values.has(e);
        }
        getValue(e, t) {
          if (this.props.values && this.props.values[e])
            return this.props.values[e];
          let n = this.values.get(e);
          return (
            void 0 === n &&
              void 0 !== t &&
              ((n = Fs(t, { owner: this })), this.addValue(e, n)),
            n
          );
        }
        readValue(e) {
          var t;
          return void 0 === this.latestValues[e] && this.current
            ? null !== (t = this.getBaseTargetFromProps(this.props, e)) &&
              void 0 !== t
              ? t
              : this.readValueFromInstance(this.current, e, this.options)
            : this.latestValues[e];
        }
        setBaseTarget(e, t) {
          this.baseTarget[e] = t;
        }
        getBaseTarget(e) {
          var t;
          const { initial: n } = this.props,
            r =
              "string" === typeof n || "object" === typeof n
                ? null === (t = ao(this.props, n)) || void 0 === t
                  ? void 0
                  : t[e]
                : void 0;
          if (n && void 0 !== r) return r;
          const i = this.getBaseTargetFromProps(this.props, e);
          return void 0 === i || fi(i)
            ? void 0 !== this.initialValues[e] && void 0 === r
              ? void 0
              : this.baseTarget[e]
            : i;
        }
        on(e, t) {
          return (
            this.events[e] || (this.events[e] = new Ns()), this.events[e].add(t)
          );
        }
        notify(e) {
          if (this.events[e]) {
            for (
              var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1;
              r < t;
              r++
            )
              n[r - 1] = arguments[r];
            this.events[e].notify(...n);
          }
        }
      }
      class Su extends wu {
        sortInstanceNodePosition(e, t) {
          return 2 & e.compareDocumentPosition(t) ? 1 : -1;
        }
        getBaseTargetFromProps(e, t) {
          return e.style ? e.style[t] : void 0;
        }
        removeValueFromRenderState(e, t) {
          let { vars: n, style: r } = t;
          delete n[e], delete r[e];
        }
        makeTargetAnimatableFromInstance(e, t, n) {
          let { transition: r, transitionEnd: i, ...o } = e,
            { transformValues: a } = t,
            s = (function (e, t, n) {
              const r = {};
              for (const i in e) {
                const e = Ys(i, t);
                if (void 0 !== e) r[i] = e;
                else {
                  const e = n.getValue(i);
                  e && (r[i] = e.get());
                }
              }
              return r;
            })(o, r || {}, this);
          if ((a && (i && (i = a(i)), o && (o = a(o)), s && (s = a(s))), n)) {
            !(function (e, t, n) {
              var r, i;
              const o = Object.keys(t).filter((t) => !e.hasValue(t)),
                a = o.length;
              if (a)
                for (let s = 0; s < a; s++) {
                  const a = o[s],
                    l = t[a];
                  let c = null;
                  Array.isArray(l) && (c = l[0]),
                    null === c &&
                      (c =
                        null !==
                          (i =
                            null !== (r = n[a]) && void 0 !== r
                              ? r
                              : e.readValue(a)) && void 0 !== i
                          ? i
                          : t[a]),
                    void 0 !== c &&
                      null !== c &&
                      ("string" === typeof c && (As(c) || Ps(c))
                        ? (c = parseFloat(c))
                        : !Ws(c) && Fa.test(l) && (c = Cs(a, l)),
                      e.addValue(a, Fs(c, { owner: e })),
                      void 0 === n[a] && (n[a] = c),
                      null !== c && e.setBaseTarget(a, c));
                }
            })(this, o, s);
            const e = fu(this, o, s, i);
            (i = e.transitionEnd), (o = e.target);
          }
          return { transition: r, transitionEnd: i, ...o };
        }
      }
      class ku extends Su {
        constructor() {
          super(...arguments), (this.type = "html");
        }
        readValueFromInstance(e, t) {
          if (di.has(t)) {
            const e = js(t);
            return (e && e.default) || 0;
          }
          {
            const r = ((n = e), window.getComputedStyle(n)),
              i = (vi(t) ? r.getPropertyValue(t) : r[t]) || 0;
            return "string" === typeof i ? i.trim() : i;
          }
          var n;
        }
        measureInstanceViewportBox(e, t) {
          let { transformPagePoint: n } = t;
          return Wl(e, n);
        }
        build(e, t, n, r) {
          Fi(e, t, n, r.transformTemplate);
        }
        scrapeMotionValuesFromProps(e, t) {
          return io(e, t);
        }
        handleChildMotionValue() {
          this.childSubscription &&
            (this.childSubscription(), delete this.childSubscription);
          const { children: e } = this.props;
          fi(e) &&
            (this.childSubscription = e.on("change", (e) => {
              this.current && (this.current.textContent = `${e}`);
            }));
        }
        renderInstance(e, t, n, r) {
          to(e, t, n, r);
        }
      }
      class ju extends Su {
        constructor() {
          super(...arguments), (this.type = "svg"), (this.isSVGTag = !1);
        }
        getBaseTargetFromProps(e, t) {
          return e[t];
        }
        readValueFromInstance(e, t) {
          if (di.has(t)) {
            const e = js(t);
            return (e && e.default) || 0;
          }
          return (t = no.has(t) ? t : Ur(t)), e.getAttribute(t);
        }
        measureInstanceViewportBox() {
          return { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } };
        }
        scrapeMotionValuesFromProps(e, t) {
          return oo(e, t);
        }
        build(e, t, n, r) {
          Qi(e, t, n, this.isSVGTag, r.transformTemplate);
        }
        renderInstance(e, t, n, r) {
          ro(e, t, 0, r);
        }
        mount(e) {
          (this.isSVGTag = Ji(e.tagName)), super.mount(e);
        }
      }
      const Cu = (e, t) =>
          li(e)
            ? new ju(t, { enableHardwareAcceleration: !1 })
            : new ku(t, { enableHardwareAcceleration: !0 }),
        Pu = {
          ...ol,
          ...Wo,
          ...eu,
          ...{ layout: { ProjectionNode: Zc, MeasureLayout: ec } },
        },
        Eu = ai((e, t) =>
          (function (e, t, n, r) {
            let { forwardMotionProps: i = !1 } = t;
            return {
              ...(li(e) ? bo : wo),
              preloadedFeatures: n,
              useRender: eo(i),
              createVisualElement: r,
              Component: e,
            };
          })(e, t, Pu, Cu)
        );
      const Tu = vr.section`
  background: linear-gradient(
    135deg,
    var(--primary-light) 0%,
    var(--primary-color) 100%
  );
  padding: 10rem 1rem 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
`,
        Ru = vr.div`
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
`,
        _u = vr(Eu.h1)`
  color: white;
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`,
        Ou = vr(Eu.p)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto 2.5rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        Au = vr(Eu.div)`
  display: flex;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
`,
        zu = vr(Pe)`
  background-color: white;
  color: var(--primary-color);
  padding: 1rem 2rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1.125rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
    text-decoration: none;
  }

  @media (max-width: 480px) {
    display: block;
    width: 100%;
    text-align: center;
  }
`,
        Du = vr(Pe)`
  background-color: transparent;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1.125rem;
  border: 2px solid white;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    text-decoration: none;
  }

  @media (max-width: 480px) {
    display: block;
    width: 100%;
    text-align: center;
  }
`,
        Nu = vr.div`
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  top: -200px;
  right: -200px;

  @media (max-width: 768px) {
    width: 400px;
    height: 400px;
  }
`,
        Lu = vr.div`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  bottom: -150px;
  left: -150px;

  @media (max-width: 768px) {
    width: 300px;
    height: 300px;
  }
`,
        Mu = () =>
          (0, yr.jsxs)(Tu, {
            children: [
              (0, yr.jsx)(Nu, {}),
              (0, yr.jsx)(Lu, {}),
              (0, yr.jsxs)(Ru, {
                children: [
                  (0, yr.jsx)(_u, {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.5 },
                    children:
                      "Privacy-First Group Management for 12-Step Recovery",
                  }),
                  (0, yr.jsx)(Ou, {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.5, delay: 0.2 },
                    children:
                      "Homegroups simplifies meeting coordination, treasury management, and group communications while respecting the traditions of anonymity.",
                  }),
                  (0, yr.jsxs)(Au, {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.5, delay: 0.4 },
                    children: [
                      (0, yr.jsx)(zu, {
                        to: "/contact",
                        children: "Get Started",
                      }),
                      (0, yr.jsx)(Du, {
                        to: "/features",
                        children: "Learn More",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
      var Fu = Object.defineProperty,
        Iu = (e, t, n) =>
          ((e, t, n) =>
            t in e
              ? Fu(e, t, {
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                  value: n,
                })
              : (e[t] = n))(e, "symbol" !== typeof t ? t + "" : t, n),
        Vu = new Map(),
        Bu = new WeakMap(),
        Uu = 0,
        Wu = void 0;
      function $u(e) {
        return Object.keys(e)
          .sort()
          .filter((t) => void 0 !== e[t])
          .map(
            (t) =>
              `${t}_${
                "root" === t
                  ? (function (e) {
                      return e
                        ? (Bu.has(e) || ((Uu += 1), Bu.set(e, Uu.toString())),
                          Bu.get(e))
                        : "0";
                    })(e.root)
                  : e[t]
              }`
          )
          .toString();
      }
      function Hu(e, t) {
        let n =
            arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
          r =
            arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : Wu;
        if (
          "undefined" === typeof window.IntersectionObserver &&
          void 0 !== r
        ) {
          const i = e.getBoundingClientRect();
          return (
            t(r, {
              isIntersecting: r,
              target: e,
              intersectionRatio:
                "number" === typeof n.threshold ? n.threshold : 0,
              time: 0,
              boundingClientRect: i,
              intersectionRect: i,
              rootBounds: i,
            }),
            () => {}
          );
        }
        const {
            id: i,
            observer: o,
            elements: a,
          } = (function (e) {
            const t = $u(e);
            let n = Vu.get(t);
            if (!n) {
              const r = new Map();
              let i;
              const o = new IntersectionObserver((t) => {
                t.forEach((t) => {
                  var n;
                  const o =
                    t.isIntersecting && i.some((e) => t.intersectionRatio >= e);
                  e.trackVisibility &&
                    "undefined" === typeof t.isVisible &&
                    (t.isVisible = o),
                    null == (n = r.get(t.target)) ||
                      n.forEach((e) => {
                        e(o, t);
                      });
                });
              }, e);
              (i =
                o.thresholds ||
                (Array.isArray(e.threshold)
                  ? e.threshold
                  : [e.threshold || 0])),
                (n = { id: t, observer: o, elements: r }),
                Vu.set(t, n);
            }
            return n;
          })(n),
          s = a.get(e) || [];
        return (
          a.has(e) || a.set(e, s),
          s.push(t),
          o.observe(e),
          function () {
            s.splice(s.indexOf(t), 1),
              0 === s.length && (a.delete(e), o.unobserve(e)),
              0 === a.size && (o.disconnect(), Vu.delete(i));
          }
        );
      }
      t.Component;
      function Yu() {
        let {
          threshold: e,
          delay: n,
          trackVisibility: r,
          rootMargin: i,
          root: o,
          triggerOnce: a,
          skip: s,
          initialInView: l,
          fallbackInView: c,
          onChange: u,
        } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        var d;
        const [h, f] = t.useState(null),
          p = t.useRef(u),
          [m, g] = t.useState({ inView: !!l, entry: void 0 });
        (p.current = u),
          t.useEffect(() => {
            if (s || !h) return;
            let t;
            return (
              (t = Hu(
                h,
                (e, n) => {
                  g({ inView: e, entry: n }),
                    p.current && p.current(e, n),
                    n.isIntersecting && a && t && (t(), (t = void 0));
                },
                {
                  root: o,
                  rootMargin: i,
                  threshold: e,
                  trackVisibility: r,
                  delay: n,
                },
                c
              )),
              () => {
                t && t();
              }
            );
          }, [Array.isArray(e) ? e.toString() : e, h, o, i, a, s, r, c, n]);
        const v = null == (d = m.entry) ? void 0 : d.target,
          y = t.useRef(void 0);
        h ||
          !v ||
          a ||
          s ||
          y.current === v ||
          ((y.current = v), g({ inView: !!l, entry: void 0 }));
        const x = [f, m.inView, m.entry];
        return (x.ref = x[0]), (x.inView = x[1]), (x.entry = x[2]), x;
      }
      const qu = vr.section`
  padding: 6rem 1rem;
  background-color: var(--background);
`,
        Gu = vr.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
`,
        Ku = vr.h2`
  color: var(--text-dark);
  margin-bottom: 1rem;
  font-size: 2.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`,
        Qu = vr.p`
  color: var(--text-light);
  font-size: 1.25rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        Xu = vr.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`,
        Ju = vr(Eu.div)`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`,
        Zu = vr.div`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
`,
        ed = vr.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`,
        td = vr.p`
  color: var(--text-light);
  line-height: 1.6;
`,
        nd = [
          {
            icon: "\ud83d\udcc5",
            title: "Meeting Management",
            description:
              "Find meetings near you, save your favorites, and access meeting details even when offline.",
          },
          {
            icon: "\ud83d\udcac",
            title: "Group Communication",
            description:
              "Manage group announcements and directly message other members with end-to-end encryption.",
          },
          {
            icon: "\ud83d\udcb0",
            title: "Treasury Tracking",
            description:
              "Easily track income and expenses, generate reports, and handle treasurer transitions seamlessly.",
          },
          {
            icon: "\ud83d\udd12",
            title: "Privacy First",
            description:
              "Built with anonymity in mind. First-name only display options and end-to-end encrypted messages.",
          },
          {
            icon: "\ud83d\udcf1",
            title: "Offline Access",
            description:
              "View meeting details, member contact info, and important announcements even without internet.",
          },
          {
            icon: "\ud83c\udf89",
            title: "Celebration Notifications",
            description:
              "Never miss important sobriety milestones. Get notified of celebrations and group events.",
          },
        ],
        rd = () => {
          const { ref: e, inView: t } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            n = {
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            };
          return (0, yr.jsxs)(qu, {
            children: [
              (0, yr.jsxs)(Gu, {
                children: [
                  (0, yr.jsx)(Ku, {
                    children: "Powerful Features for Recovery Groups",
                  }),
                  (0, yr.jsx)(Qu, {
                    children:
                      "Homegroups simplifies managing your homegroup's operations while preserving anonymity and group autonomy.",
                  }),
                ],
              }),
              (0, yr.jsx)(Xu, {
                ref: e,
                as: Eu.div,
                variants: {
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } },
                },
                initial: "hidden",
                animate: t ? "visible" : "hidden",
                children: nd.map((e, t) =>
                  (0, yr.jsxs)(
                    Ju,
                    {
                      variants: n,
                      children: [
                        (0, yr.jsx)(Zu, { children: e.icon }),
                        (0, yr.jsx)(ed, { children: e.title }),
                        (0, yr.jsx)(td, { children: e.description }),
                      ],
                    },
                    t
                  )
                ),
              }),
            ],
          });
        },
        id = vr.section`
  padding: 6rem 1rem;
  background-color: var(--background-alt);
`,
        od = vr.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
`,
        ad = vr.h2`
  color: var(--text-dark);
  margin-bottom: 1rem;
  font-size: 2.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`,
        sd = vr.p`
  color: var(--text-light);
  font-size: 1.25rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        ld = vr.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`,
        cd = vr(Eu.div)`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`,
        ud = vr.blockquote`
  font-size: 1.125rem;
  color: var(--text-dark);
  line-height: 1.7;
  margin-bottom: 1.5rem;
  flex-grow: 1;
  position: relative;

  &::before,
  &::after {
    content: '"';
    font-size: 2.5rem;
    color: var(--primary-light);
    position: absolute;
    line-height: 1;
  }

  &::before {
    top: -1rem;
    left: -0.5rem;
  }

  &::after {
    content: '"';
    bottom: -2rem;
    right: -0.5rem;
  }
`,
        dd = vr.div`
  display: flex;
  align-items: center;
  margin-top: auto;
`,
        hd = vr.div`
  margin-left: 1rem;
`,
        fd = vr.h4`
  font-size: 1.125rem;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
`,
        pd = vr.p`
  font-size: 0.875rem;
  color: var(--text-light);
`,
        md = vr.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1.25rem;
`,
        gd = vr.div`
  background: linear-gradient(
    to right,
    var(--primary-dark),
    var(--primary-color)
  );
  border-radius: 0.5rem;
  padding: 3rem;
  color: white;
  max-width: 1200px;
  margin: 4rem auto 0;
`,
        vd = vr.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`,
        yd = vr.div``,
        xd = vr.h3`
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`,
        bd = vr.ul`
  list-style-type: none;
  padding: 0;
`,
        wd = vr.li`
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;

  &:before {
    content: ${(e) => (e.isProblem ? '"\u274c"' : '"\u2705"')};
    margin-right: 0.75rem;
    font-size: 1.125rem;
  }
`,
        Sd = [
          {
            text: "Homegroups has completely transformed how our group manages meetings and treasury. The app makes it easy to track our 7th Tradition and stay connected without compromising anonymity.",
            name: "James T.",
            title: "Group Secretary, 5 years",
            initial: "J",
          },
          {
            text: "As a treasurer, I used to stress about keeping track of group finances and worried about the handoff when my service term ended. This app has eliminated those concerns completely.",
            name: "Sarah M.",
            title: "Group Treasurer, 3 years",
            initial: "S",
          },
          {
            text: "The meeting finder has been a lifesaver during my travels. Being able to find nearby meetings and have all the details saved offline has been incredibly helpful to maintaining my recovery.",
            name: "Michael H.",
            title: "Recovery Group Member, 7 years",
            initial: "M",
          },
          {
            text: "We needed a way for members to stay connected without using social media. Homegroups respects our traditions while giving us the tools we need to communicate effectively.",
            name: "Lisa P.",
            title: "Group Administrator, 4 years",
            initial: "L",
          },
        ],
        kd = [
          "Disorganized meeting info spread across emails, texts, and social media",
          "Treasury records lost during treasurer transitions",
          "Communications that compromise anonymity",
          "Inability to track group finances properly",
          "Difficult to manage prudent reserve funds",
        ],
        jd = [
          "Centralized meeting management with offline access",
          "Seamless treasurer transitions with complete history",
          "Privacy-first communication respecting anonymity",
          "Simple treasury tracking with categorized expenses",
          "Automated prudent reserve monitoring and reporting",
        ],
        Cd = () => {
          const { ref: e, inView: t } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: n, inView: r } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            i = {
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            };
          return (0, yr.jsxs)(id, {
            children: [
              (0, yr.jsxs)(od, {
                children: [
                  (0, yr.jsx)(ad, {
                    children: "What Recovery Groups Are Saying",
                  }),
                  (0, yr.jsx)(sd, {
                    children:
                      "Groups like yours are using Homegroups to simplify operations and strengthen their recovery communities.",
                  }),
                ],
              }),
              (0, yr.jsx)(ld, {
                ref: e,
                as: Eu.div,
                variants: {
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } },
                },
                initial: "hidden",
                animate: t ? "visible" : "hidden",
                children: Sd.map((e, t) =>
                  (0, yr.jsxs)(
                    cd,
                    {
                      variants: i,
                      children: [
                        (0, yr.jsx)(ud, { children: e.text }),
                        (0, yr.jsxs)(dd, {
                          children: [
                            (0, yr.jsx)(md, { children: e.initial }),
                            (0, yr.jsxs)(hd, {
                              children: [
                                (0, yr.jsx)(fd, { children: e.name }),
                                (0, yr.jsx)(pd, { children: e.title }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    },
                    t
                  )
                ),
              }),
              (0, yr.jsx)(gd, {
                ref: n,
                as: Eu.div,
                initial: { opacity: 0, y: 30 },
                animate: r ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
                transition: { duration: 0.6 },
                children: (0, yr.jsxs)(vd, {
                  children: [
                    (0, yr.jsxs)(yd, {
                      children: [
                        (0, yr.jsx)(xd, { children: "Problems We Solve" }),
                        (0, yr.jsx)(bd, {
                          children: kd.map((e, t) =>
                            (0, yr.jsx)(wd, { isProblem: !0, children: e }, t)
                          ),
                        }),
                      ],
                    }),
                    (0, yr.jsxs)(yd, {
                      children: [
                        (0, yr.jsx)(xd, { children: "Our Solutions" }),
                        (0, yr.jsx)(bd, {
                          children: jd.map((e, t) =>
                            (0, yr.jsx)(wd, { children: e }, t)
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          });
        },
        Pd = vr.section`
  padding: 6rem 1rem;
  background-color: var(--background);
`,
        Ed = vr.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
`,
        Td = vr.h2`
  color: var(--text-dark);
  margin-bottom: 1rem;
  font-size: 2.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`,
        Rd = vr.p`
  color: var(--text-light);
  font-size: 1.25rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        _d = vr.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 992px) {
    flex-direction: column;
    align-items: center;
  }
`,
        Od = vr(Eu.div)`
  background-color: white;
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  border: ${(e) =>
    e.featured ? "2px solid var(--primary-color)" : "1px solid #e2e8f0"};
  position: relative;
  overflow: hidden;

  @media (max-width: 992px) {
    max-width: 500px;
  }
`,
        Ad = vr.div`
  position: absolute;
  top: 1.5rem;
  right: -3rem;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 3rem;
  transform: rotate(45deg);
`,
        zd = vr.h3`
  font-size: 1.5rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
  font-weight: 700;
`,
        Dd = vr.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.25rem;

  span {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-light);
  }
`,
        Nd = vr.p`
  color: var(--text-light);
  margin-bottom: 2rem;
  font-size: 0.95rem;
`,
        Ld = vr(Pe)`
  background-color: ${(e) =>
    e.primary ? "var(--primary-color)" : "transparent"};
  color: ${(e) => (e.primary ? "white" : "var(--primary-color)")};
  border: ${(e) => (e.primary ? "none" : "2px solid var(--primary-color)")};
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  margin-top: auto;

  &:hover {
    background-color: ${(e) =>
      e.primary ? "var(--primary-dark)" : "var(--primary-light)"};
    text-decoration: none;
  }
`,
        Md = vr.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 2rem;
  flex-grow: 1;
`,
        Fd = vr.li`
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;

  &:before {
    content: "✓";
    margin-right: 0.75rem;
    color: var(--success);
    font-weight: bold;
  }
`,
        Id = vr.div`
  max-width: 800px;
  margin: 5rem auto 0;
  text-align: center;
`,
        Vd = vr.p`
  font-size: 1.25rem;
  color: var(--text-dark);
  margin-bottom: 2rem;
`,
        Bd = vr.div`
  display: flex;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
`,
        Ud = vr(Pe)`
  background-color: ${(e) =>
    e.secondary ? "transparent" : "var(--primary-color)"};
  color: ${(e) => (e.secondary ? "var(--primary-color)" : "white")};
  border: ${(e) => (e.secondary ? "2px solid var(--primary-color)" : "none")};
  padding: 1rem 2rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(e) =>
      e.secondary ? "var(--primary-light)" : "var(--primary-dark)"};
    text-decoration: none;
  }

  @media (max-width: 480px) {
    display: block;
    width: 100%;
  }
`,
        Wd = () => {
          const { ref: e, inView: t } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: n, inView: r } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            i = {
              hidden: { opacity: 0, y: 20 },
              visible: (e) => ({
                opacity: 1,
                y: 0,
                transition: { delay: 0.1 * e, duration: 0.5 },
              }),
            };
          return (0, yr.jsxs)(Pd, {
            children: [
              (0, yr.jsxs)(Ed, {
                children: [
                  (0, yr.jsx)(Td, { children: "Simple, Affordable Pricing" }),
                  (0, yr.jsx)(Rd, {
                    children:
                      "Homegroups is designed to be accessible for all recovery groups, no matter their size.",
                  }),
                ],
              }),
              (0, yr.jsxs)(_d, {
                ref: e,
                children: [
                  (0, yr.jsxs)(Od, {
                    as: Eu.div,
                    custom: 0,
                    variants: i,
                    initial: "hidden",
                    animate: t ? "visible" : "hidden",
                    children: [
                      (0, yr.jsx)(zd, { children: "Free" }),
                      (0, yr.jsxs)(Dd, {
                        children: [
                          "$0 ",
                          (0, yr.jsx)("span", { children: "per month" }),
                        ],
                      }),
                      (0, yr.jsx)(Nd, {
                        children:
                          "For individuals seeking recovery meetings and basic group features.",
                      }),
                      (0, yr.jsxs)(Md, {
                        children: [
                          (0, yr.jsx)(Fd, {
                            children: "Find and save meetings",
                          }),
                          (0, yr.jsx)(Fd, {
                            children: "Personal meeting schedule",
                          }),
                          (0, yr.jsx)(Fd, {
                            children: "View group announcements",
                          }),
                          (0, yr.jsx)(Fd, {
                            children: "Basic member profiles",
                          }),
                          (0, yr.jsx)(Fd, {
                            children: "End-to-end encrypted messages",
                          }),
                        ],
                      }),
                      (0, yr.jsx)(Ld, {
                        to: "/contact",
                        children: "Get Started",
                      }),
                    ],
                  }),
                  (0, yr.jsxs)(Od, {
                    featured: !0,
                    as: Eu.div,
                    custom: 1,
                    variants: i,
                    initial: "hidden",
                    animate: t ? "visible" : "hidden",
                    children: [
                      (0, yr.jsx)(Ad, { children: "MOST POPULAR" }),
                      (0, yr.jsx)(zd, { children: "Premium" }),
                      (0, yr.jsxs)(Dd, {
                        children: [
                          "$1 ",
                          (0, yr.jsx)("span", { children: "per month" }),
                        ],
                      }),
                      (0, yr.jsx)(Nd, {
                        children:
                          "For recovery groups who need additional management features.",
                      }),
                      (0, yr.jsxs)(Md, {
                        children: [
                          (0, yr.jsx)(Fd, { children: "All Free features" }),
                          (0, yr.jsx)(Fd, {
                            children: "Complete treasury management",
                          }),
                          (0, yr.jsx)(Fd, {
                            children: "Business meeting tools",
                          }),
                          (0, yr.jsx)(Fd, { children: "Financial reports" }),
                          (0, yr.jsx)(Fd, {
                            children: "Service commitment tracking",
                          }),
                          (0, yr.jsx)(Fd, {
                            children: "Unlimited group members",
                          }),
                          (0, yr.jsx)(Fd, {
                            children: "Celebration notifications",
                          }),
                        ],
                      }),
                      (0, yr.jsx)(Ld, {
                        to: "/contact",
                        primary: !0,
                        children: "Get Started",
                      }),
                    ],
                  }),
                ],
              }),
              (0, yr.jsxs)(Id, {
                ref: n,
                as: Eu.div,
                initial: { opacity: 0, y: 20 },
                animate: r ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
                transition: { duration: 0.5 },
                children: [
                  (0, yr.jsx)(Vd, {
                    children:
                      "Ready to transform how your recovery group operates? Join thousands of recovery groups already using Homegroups.",
                  }),
                  (0, yr.jsxs)(Bd, {
                    children: [
                      (0, yr.jsx)(Ud, {
                        to: "/contact",
                        children: "Start Free Trial",
                      }),
                      (0, yr.jsx)(Ud, {
                        to: "/demo",
                        secondary: !0,
                        children: "Schedule Demo",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        },
        $d = vr.section`
  padding: 5rem 1rem;
  background: linear-gradient(
    135deg,
    var(--primary-light) 0%,
    var(--primary-color) 100%
  );
  color: white;
`,
        Hd = vr.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`,
        Yd = vr.h2`
  font-size: 2.25rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`,
        qd = vr.p`
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        Gd = vr.form`
  display: flex;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
  }
`,
        Kd = vr.input`
  flex-grow: 1;
  padding: 1rem 1.5rem;
  border-radius: 0.375rem 0 0 0.375rem;
  border: none;
  font-size: 1rem;
  outline: none;

  @media (max-width: 640px) {
    border-radius: 0.375rem;
  }
`,
        Qd = vr.button`
  background-color: var(--text-dark);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0 0.375rem 0.375rem 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #000;
  }

  @media (max-width: 640px) {
    border-radius: 0.375rem;
  }
`,
        Xd = vr(Eu.div)`
  margin-top: 1.5rem;
  font-weight: 500;
`,
        Jd = vr.p`
  font-size: 0.875rem;
  margin-top: 1.5rem;
  opacity: 0.7;
`,
        Zd = () => {
          const [e, n] = (0, t.useState)(""),
            [r, i] = (0, t.useState)(!1),
            { ref: o, inView: a } = Yu({ triggerOnce: !0, threshold: 0.1 });
          return (0, yr.jsx)($d, {
            children: (0, yr.jsxs)(Hd, {
              ref: o,
              as: Eu.div,
              initial: { opacity: 0, y: 20 },
              animate: a ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
              transition: { duration: 0.5 },
              children: [
                (0, yr.jsx)(Yd, { children: "Stay Updated on Homegroups" }),
                (0, yr.jsx)(qd, {
                  children:
                    "Join our newsletter for updates, features, and tips for your recovery group.",
                }),
                (0, yr.jsxs)(Gd, {
                  onSubmit: (t) => {
                    t.preventDefault(),
                      e && (console.log(`Submitted email: ${e}`), i(!0), n(""));
                  },
                  children: [
                    (0, yr.jsx)(Kd, {
                      type: "email",
                      placeholder: "Enter your email address",
                      value: e,
                      onChange: (e) => n(e.target.value),
                      required: !0,
                    }),
                    (0, yr.jsx)(Qd, { type: "submit", children: "Subscribe" }),
                  ],
                }),
                r &&
                  (0, yr.jsx)(Xd, {
                    initial: { opacity: 0, height: 0 },
                    animate: { opacity: 1, height: "auto" },
                    transition: { duration: 0.3 },
                    children:
                      "Thank you for subscribing! We'll be in touch soon.",
                  }),
                (0, yr.jsx)(Jd, {
                  children:
                    "We respect your privacy. Unsubscribe at any time. We never share your information.",
                }),
              ],
            }),
          });
        },
        eh = vr.div`
  padding-top: 70px; // Adjust based on header height
`,
        th = () =>
          (0, yr.jsxs)(eh, {
            children: [
              (0, yr.jsx)(Mu, {}),
              (0, yr.jsx)(rd, {}),
              (0, yr.jsx)(Cd, {}),
              (0, yr.jsx)(Wd, {}),
              (0, yr.jsx)(Zd, {}),
            ],
          }),
        nh = vr.div`
  padding-top: 70px;
`,
        rh = vr.section`
  background: linear-gradient(
    135deg,
    var(--primary-light) 0%,
    var(--primary-color) 100%
  );
  padding: 6rem 1rem 4rem;
  color: white;
  text-align: center;
`,
        ih = vr.div`
  max-width: 800px;
  margin: 0 auto;
`,
        oh = vr.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`,
        ah = vr.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        sh = vr.section`
  padding: 5rem 1rem;
  background-color: ${(e) =>
    e.alternate ? "var(--background-alt)" : "var(--background)"};
`,
        lh = vr.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 4rem;

  @media (max-width: 992px) {
    flex-direction: ${(e) => (e.imageRight ? "column-reverse" : "column")};
    gap: 2rem;
  }
`,
        ch = vr.div`
  flex: 1;
`,
        uh = vr.div`
  flex: 1;
  display: flex;
  justify-content: center;
`,
        dh = vr.div`
  width: 100%;
  max-width: 500px;
  height: 350px;
  background-color: var(--primary-light);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 5rem;

  @media (max-width: 768px) {
    height: 250px;
  }
`,
        hh = vr.h2`
  font-size: 2.25rem;
  color: var(--text-dark);
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`,
        fh = vr.p`
  font-size: 1.125rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  line-height: 1.6;
`,
        ph = vr.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 1.5rem;
`,
        mh = vr.li`
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  font-size: 1.125rem;

  &:before {
    content: "✓";
    margin-right: 0.75rem;
    color: var(--success);
    font-weight: bold;
  }
`,
        gh = vr.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 4rem auto 0;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`,
        vh = vr.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`,
        yh = vr.div`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
`,
        xh = vr.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`,
        bh = vr.p`
  color: var(--text-light);
  line-height: 1.6;
`,
        wh = () => {
          const { ref: e, inView: t } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: n, inView: r } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: i, inView: o } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: a, inView: s } = Yu({ triggerOnce: !0, threshold: 0.1 });
          return (0, yr.jsxs)(nh, {
            children: [
              (0, yr.jsx)(rh, {
                children: (0, yr.jsxs)(ih, {
                  children: [
                    (0, yr.jsx)(oh, {
                      children: "Features Designed for Recovery Groups",
                    }),
                    (0, yr.jsx)(ah, {
                      children:
                        "Homegroups combines powerful functionality with privacy-first design to help 12-step groups operate more effectively while respecting recovery traditions.",
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(sh, {
                children: (0, yr.jsxs)(lh, {
                  ref: e,
                  as: Eu.div,
                  initial: { opacity: 0, y: 30 },
                  animate: t ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
                  transition: { duration: 0.6 },
                  children: [
                    (0, yr.jsxs)(ch, {
                      children: [
                        (0, yr.jsx)(hh, { children: "Meeting Management" }),
                        (0, yr.jsx)(fh, {
                          children:
                            "Finding and managing meetings has never been easier. Our comprehensive meeting tools help you stay connected to your recovery community wherever you are.",
                        }),
                        (0, yr.jsxs)(ph, {
                          children: [
                            (0, yr.jsx)(mh, {
                              children:
                                "Location-based meeting finder with filtering options",
                            }),
                            (0, yr.jsx)(mh, {
                              children: "Offline meeting list for travelers",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Personal meeting schedule with optional reminders",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Detailed meeting information including format and directions",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "One-click access to join online meetings",
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, yr.jsx)(uh, {
                      children: (0, yr.jsx)(dh, { children: "\ud83d\udcc5" }),
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(sh, {
                alternate: !0,
                children: (0, yr.jsxs)(lh, {
                  imageRight: !0,
                  ref: n,
                  as: Eu.div,
                  initial: { opacity: 0, y: 30 },
                  animate: r ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
                  transition: { duration: 0.6 },
                  children: [
                    (0, yr.jsx)(uh, {
                      children: (0, yr.jsx)(dh, { children: "\ud83d\udcac" }),
                    }),
                    (0, yr.jsxs)(ch, {
                      children: [
                        (0, yr.jsx)(hh, { children: "Group Communication" }),
                        (0, yr.jsx)(fh, {
                          children:
                            "Stay connected with your recovery community without compromising anonymity. Our communication tools are built with privacy in mind.",
                        }),
                        (0, yr.jsxs)(ph, {
                          children: [
                            (0, yr.jsx)(mh, {
                              children: "Official group announcements channel",
                            }),
                            (0, yr.jsx)(mh, {
                              children: "End-to-end encrypted direct messaging",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Privacy controls with first name or initial only display",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Celebration notifications for sobriety milestones",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Event coordination with RSVP functionality",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(sh, {
                children: (0, yr.jsxs)(lh, {
                  ref: i,
                  as: Eu.div,
                  initial: { opacity: 0, y: 30 },
                  animate: o ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
                  transition: { duration: 0.6 },
                  children: [
                    (0, yr.jsxs)(ch, {
                      children: [
                        (0, yr.jsx)(hh, { children: "Treasury Management" }),
                        (0, yr.jsx)(fh, {
                          children:
                            "Simplify your group's financial tracking with our comprehensive treasury tools. Never lose track of 7th Tradition contributions again.",
                        }),
                        (0, yr.jsxs)(ph, {
                          children: [
                            (0, yr.jsx)(mh, {
                              children: "Simple income and expense tracking",
                            }),
                            (0, yr.jsx)(mh, {
                              children: "7th Tradition record keeping",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Balance and prudent reserve monitoring",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Financial reports for business meetings",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Seamless treasurer transitions between service terms",
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, yr.jsx)(uh, {
                      children: (0, yr.jsx)(dh, { children: "\ud83d\udcb0" }),
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(sh, {
                alternate: !0,
                children: (0, yr.jsxs)(lh, {
                  imageRight: !0,
                  ref: a,
                  as: Eu.div,
                  initial: { opacity: 0, y: 30 },
                  animate: s ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
                  transition: { duration: 0.6 },
                  children: [
                    (0, yr.jsx)(uh, {
                      children: (0, yr.jsx)(dh, { children: "\ud83d\udd12" }),
                    }),
                    (0, yr.jsxs)(ch, {
                      children: [
                        (0, yr.jsx)(hh, { children: "Privacy & Security" }),
                        (0, yr.jsx)(fh, {
                          children:
                            "We take anonymity and security seriously. Homegroups is built with privacy-first principles and rigorous security standards.",
                        }),
                        (0, yr.jsxs)(ph, {
                          children: [
                            (0, yr.jsx)(mh, {
                              children:
                                "End-to-end encryption for all communications",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "First name or initial only display options",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "No social media integration or sharing",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Granular privacy controls for all information",
                            }),
                            (0, yr.jsx)(mh, {
                              children:
                                "Local data storage where possible for enhanced privacy",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, yr.jsxs)(sh, {
                children: [
                  (0, yr.jsxs)("div", {
                    style: {
                      maxWidth: "800px",
                      margin: "0 auto",
                      textAlign: "center",
                    },
                    children: [
                      (0, yr.jsx)(hh, { children: "Additional Features" }),
                      (0, yr.jsx)(fh, {
                        children:
                          "Homegroups continues to expand with new features requested by the recovery community.",
                      }),
                    ],
                  }),
                  (0, yr.jsx)(gh, {
                    children: [
                      {
                        icon: "\ud83d\udcca",
                        title: "Group Analytics",
                        description:
                          "Track attendance trends, treasury history, and service rotation patterns with easy-to-read visual reports.",
                      },
                      {
                        icon: "\ud83d\udd04",
                        title: "Service Rotations",
                        description:
                          "Automate service position rotation reminders and track commitments for your group.",
                      },
                      {
                        icon: "\ud83d\udccb",
                        title: "Business Meeting Tools",
                        description:
                          "Create agendas, track motions, and record business meeting minutes in one centralized place.",
                      },
                      {
                        icon: "\ud83d\udccb",
                        title: "Literature References",
                        description:
                          "Access a comprehensive library of recovery literature references and readings for your meetings.",
                      },
                      {
                        icon: "\ud83d\udd14",
                        title: "Smart Notifications",
                        description:
                          "Receive customized notifications for meetings, service commitments, and group announcements.",
                      },
                      {
                        icon: "\ud83d\udcf1",
                        title: "Cross-Platform Sync",
                        description:
                          "Seamlessly sync your data across all your devices for access anywhere, anytime.",
                      },
                    ].map((e, t) =>
                      (0, yr.jsxs)(
                        vh,
                        {
                          children: [
                            (0, yr.jsx)(yh, { children: e.icon }),
                            (0, yr.jsx)(xh, { children: e.title }),
                            (0, yr.jsx)(bh, { children: e.description }),
                          ],
                        },
                        t
                      )
                    ),
                  }),
                ],
              }),
              (0, yr.jsx)(Zd, {}),
            ],
          });
        },
        Sh = vr.div`
  padding-top: 70px;
`,
        kh = vr.section`
  background: linear-gradient(
    135deg,
    var(--primary-light) 0%,
    var(--primary-color) 100%
  );
  padding: 6rem 1rem 4rem;
  color: white;
  text-align: center;
`,
        jh = vr.div`
  max-width: 800px;
  margin: 0 auto;
`,
        Ch = vr.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`,
        Ph = vr.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        Eh = vr.section`
  padding: 5rem 1rem;
  background-color: ${(e) =>
    e.alternate ? "var(--background-alt)" : "var(--background)"};
`,
        Th = vr.div`
  max-width: 1200px;
  margin: 0 auto;
`,
        Rh = vr.h2`
  font-size: 2.25rem;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-dark);

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`,
        _h = vr.p`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  font-size: 1.125rem;
  color: var(--text-light);
`,
        Oh = vr.div`
  display: flex;
  justify-content: center;
  gap: 2rem;

  @media (max-width: 992px) {
    flex-direction: column;
    align-items: center;
  }
`,
        Ah = vr(Eu.div)`
  background-color: white;
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  border: ${(e) =>
    e.featured ? "2px solid var(--primary-color)" : "1px solid #e2e8f0"};
  position: relative;
  overflow: hidden;

  @media (max-width: 992px) {
    max-width: 500px;
  }
`,
        zh = vr.div`
  position: absolute;
  top: 1.5rem;
  right: -3rem;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 3rem;
  transform: rotate(45deg);
`,
        Dh = vr.h3`
  font-size: 1.75rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
  font-weight: 700;
`,
        Nh = vr.div`
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;

  span {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-light);
  }
`,
        Lh = vr.div`
  font-size: 0.95rem;
  color: var(--text-light);
  margin-bottom: 2rem;
`,
        Mh = vr.p`
  color: var(--text-light);
  margin-bottom: 2rem;
  font-size: 0.95rem;
  line-height: 1.6;
`,
        Fh = vr.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 2rem;
  flex-grow: 1;
`,
        Ih = vr.li`
  margin-bottom: 0.75rem;
  display: flex;
  align-items: flex-start;
  font-size: 1rem;

  &:before {
    content: "✓";
    margin-right: 0.75rem;
    color: var(--success);
    font-weight: bold;
  }
`,
        Vh = vr(Pe)`
  background-color: ${(e) =>
    e.primary ? "var(--primary-color)" : "transparent"};
  color: ${(e) => (e.primary ? "white" : "var(--primary-color)")};
  border: ${(e) => (e.primary ? "none" : "2px solid var(--primary-color)")};
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  margin-top: auto;

  &:hover {
    background-color: ${(e) =>
      e.primary ? "var(--primary-dark)" : "var(--primary-light)"};
    text-decoration: none;
  }
`,
        Bh = vr.div`
  max-width: 800px;
  margin: 0 auto;
`,
        Uh = vr(Eu.div)`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`,
        Wh = vr.h3`
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--text-dark);
`,
        $h = vr.p`
  font-size: 1rem;
  color: var(--text-light);
  line-height: 1.6;
`,
        Hh = vr.div`
  width: 100%;
  overflow-x: auto;
`,
        Yh = vr.table`
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  font-size: 0.95rem;
`,
        qh = vr.thead`
  background-color: var(--primary-color);
  color: white;
`,
        Gh = vr.tr`
  &:nth-child(even) {
    background-color: ${(e) =>
      e.header ? "transparent" : "rgba(195, 218, 254, 0.2)"};
  }
`,
        Kh = vr.th`
  padding: 1rem;
  text-align: ${(e) => e.align || "left"};
  border-bottom: 1px solid #e2e8f0;
`,
        Qh = vr.td`
  padding: 1rem;
  text-align: ${(e) => e.align || "left"};
  border-bottom: 1px solid #e2e8f0;

  // For checkmarks
  &.check {
    color: var(--success);
    font-weight: bold;
    text-align: center;
  }

  &.empty {
    color: var(--text-light);
    text-align: center;
  }
`,
        Xh = vr.td`
  font-weight: 600;
  padding: 1rem;
  background-color: var(--background-alt);
  color: var(--text-dark);
  border-bottom: 1px solid #e2e8f0;
`,
        Jh = vr.div`
  background: linear-gradient(
    to right,
    var(--primary-dark),
    var(--primary-color)
  );
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  color: white;
  text-align: center;
  max-width: 900px;
  margin: 4rem auto 0;
`,
        Zh = vr.h3`
  font-size: 1.75rem;
  margin-bottom: 1rem;
`,
        ef = vr.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`,
        tf = vr(Pe)`
  background-color: white;
  color: var(--primary-color);
  padding: 1rem 2rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  display: inline-block;

  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
  }
`,
        nf = () => {
          const { ref: e, inView: t } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: n, inView: r } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: i, inView: o } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: a, inView: s } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            l = {
              hidden: { opacity: 0, y: 20 },
              visible: (e) => ({
                opacity: 1,
                y: 0,
                transition: { delay: 0.1 * e, duration: 0.5 },
              }),
            },
            c = {
              hidden: { opacity: 0, y: 20 },
              visible: (e) => ({
                opacity: 1,
                y: 0,
                transition: { delay: 0.1 * e, duration: 0.3 },
              }),
            };
          return (0, yr.jsxs)(Sh, {
            children: [
              (0, yr.jsx)(kh, {
                children: (0, yr.jsxs)(jh, {
                  children: [
                    (0, yr.jsx)(Ch, { children: "Simple, Affordable Pricing" }),
                    (0, yr.jsx)(Ph, {
                      children:
                        "Homegroups is designed to be accessible for all recovery groups, with a focus on providing value while respecting the financial traditions of 12-step programs.",
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(Eh, {
                children: (0, yr.jsxs)(Th, {
                  children: [
                    (0, yr.jsx)(Rh, {
                      children: "Choose the Right Plan for Your Group",
                    }),
                    (0, yr.jsx)(_h, {
                      children:
                        "Whether you're an individual looking for meetings or a group treasurer managing finances, we have a plan that fits your needs.",
                    }),
                    (0, yr.jsxs)(Oh, {
                      ref: e,
                      as: Eu.div,
                      children: [
                        (0, yr.jsxs)(Ah, {
                          as: Eu.div,
                          custom: 0,
                          variants: l,
                          initial: "hidden",
                          animate: t ? "visible" : "hidden",
                          children: [
                            (0, yr.jsx)(Dh, { children: "Free" }),
                            (0, yr.jsxs)(Nh, {
                              children: [
                                "$0 ",
                                (0, yr.jsx)("span", { children: "per month" }),
                              ],
                            }),
                            (0, yr.jsx)(Lh, { children: "Always free" }),
                            (0, yr.jsx)(Mh, {
                              children:
                                "For individuals seeking recovery meetings and basic group features.",
                            }),
                            (0, yr.jsxs)(Fh, {
                              children: [
                                (0, yr.jsx)(Ih, {
                                  children: "Find and save meetings",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Personal meeting schedule",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "View group announcements",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Basic member profiles",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "End-to-end encrypted messages",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Up to 20 group members",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Limited treasury features",
                                }),
                              ],
                            }),
                            (0, yr.jsx)(Vh, {
                              to: "/contact",
                              children: "Get Started",
                            }),
                          ],
                        }),
                        (0, yr.jsxs)(Ah, {
                          featured: !0,
                          as: Eu.div,
                          custom: 1,
                          variants: l,
                          initial: "hidden",
                          animate: t ? "visible" : "hidden",
                          children: [
                            (0, yr.jsx)(zh, { children: "MOST POPULAR" }),
                            (0, yr.jsx)(Dh, { children: "Premium" }),
                            (0, yr.jsxs)(Nh, {
                              children: [
                                "$1 ",
                                (0, yr.jsx)("span", { children: "per month" }),
                              ],
                            }),
                            (0, yr.jsx)(Lh, {
                              children: "Billed annually at $12",
                            }),
                            (0, yr.jsx)(Mh, {
                              children:
                                "For recovery groups who need additional management features.",
                            }),
                            (0, yr.jsxs)(Fh, {
                              children: [
                                (0, yr.jsx)(Ih, {
                                  children: "All Free features",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Complete treasury management",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Business meeting tools",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Financial reports",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Service commitment tracking",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Unlimited group members",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Celebration notifications",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Group analytics",
                                }),
                                (0, yr.jsx)(Ih, {
                                  children: "Priority support",
                                }),
                              ],
                            }),
                            (0, yr.jsx)(Vh, {
                              to: "/contact",
                              primary: !0,
                              children: "Get Started",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(Eh, {
                alternate: !0,
                children: (0, yr.jsxs)(Th, {
                  children: [
                    (0, yr.jsx)(Rh, { children: "Feature Comparison" }),
                    (0, yr.jsx)(_h, {
                      children:
                        "See all the features included in each plan to make the best decision for your recovery group.",
                    }),
                    (0, yr.jsx)(Hh, {
                      ref: i,
                      as: Eu.div,
                      variants: {
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.5 },
                        },
                      },
                      initial: "hidden",
                      animate: o ? "visible" : "hidden",
                      children: (0, yr.jsxs)(Yh, {
                        children: [
                          (0, yr.jsx)(qh, {
                            children: (0, yr.jsxs)(Gh, {
                              header: !0,
                              children: [
                                (0, yr.jsx)(Kh, { children: "Feature" }),
                                (0, yr.jsx)(Kh, {
                                  align: "center",
                                  children: "Free",
                                }),
                                (0, yr.jsx)(Kh, {
                                  align: "center",
                                  children: "Premium",
                                }),
                              ],
                            }),
                          }),
                          (0, yr.jsxs)("tbody", {
                            children: [
                              (0, yr.jsx)(Gh, {
                                children: (0, yr.jsx)(Xh, {
                                  colSpan: "3",
                                  children: "Meeting Features",
                                }),
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Meeting finder",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Save favorite meetings",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Offline meeting access",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Meeting reminders",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsx)(Gh, {
                                children: (0, yr.jsx)(Xh, {
                                  colSpan: "3",
                                  children: "Group Features",
                                }),
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Group membership",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "Up to 20",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "Unlimited",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Group announcements",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Member profiles",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "Basic",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "Advanced",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Celebration notifications",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "empty",
                                    children: "\u2014",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsx)(Gh, {
                                children: (0, yr.jsx)(Xh, {
                                  colSpan: "3",
                                  children: "Treasury Management",
                                }),
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Basic income/expense tracking",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children:
                                      "Detailed financial categorization",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "empty",
                                    children: "\u2014",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Financial reports",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "empty",
                                    children: "\u2014",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Treasurer transition tools",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "empty",
                                    children: "\u2014",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Prudent reserve monitoring",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "empty",
                                    children: "\u2014",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsx)(Gh, {
                                children: (0, yr.jsx)(Xh, {
                                  colSpan: "3",
                                  children: "Additional Features",
                                }),
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "End-to-end encrypted messaging",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Business meeting tools",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "empty",
                                    children: "\u2014",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Service commitment tracking",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "empty",
                                    children: "\u2014",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Group analytics",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "empty",
                                    children: "\u2014",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                              (0, yr.jsxs)(Gh, {
                                children: [
                                  (0, yr.jsx)(Qh, {
                                    children: "Priority support",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "empty",
                                    children: "\u2014",
                                  }),
                                  (0, yr.jsx)(Qh, {
                                    className: "check",
                                    children: "\u2713",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    (0, yr.jsxs)(Jh, {
                      ref: a,
                      as: Eu.div,
                      initial: { opacity: 0, y: 30 },
                      animate: s ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
                      transition: { duration: 0.6 },
                      children: [
                        (0, yr.jsx)(Zh, {
                          children: "Need a Custom Solution?",
                        }),
                        (0, yr.jsx)(ef, {
                          children:
                            "For intergroups, areas, or regions with multiple recovery groups, we offer custom solutions to fit your specific needs.",
                        }),
                        (0, yr.jsx)(tf, {
                          to: "/contact",
                          children: "Contact Us for Custom Pricing",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(Eh, {
                children: (0, yr.jsxs)(Th, {
                  children: [
                    (0, yr.jsx)(Rh, { children: "Frequently Asked Questions" }),
                    (0, yr.jsx)(Bh, {
                      ref: n,
                      as: Eu.div,
                      children: [
                        {
                          question: "How is the premium plan billed?",
                          answer:
                            "The premium plan is billed annually at $12 per year, which works out to $1 per month. We offer annual billing to keep administrative costs low, allowing us to provide our service at an affordable price.",
                        },
                        {
                          question: "Can I switch between plans?",
                          answer:
                            "Yes, you can upgrade to the premium plan at any time. When you upgrade, you'll gain immediate access to all premium features. If you need to downgrade, you can do so when your current billing period ends.",
                        },
                        {
                          question:
                            "Is there a trial period for the premium plan?",
                          answer:
                            "Yes, we offer a 30-day free trial of our premium plan so you can experience all the features before committing. No credit card is required to start the trial.",
                        },
                        {
                          question:
                            "How many group members can I have on each plan?",
                          answer:
                            "The free plan allows up to 20 members in your group. The premium plan removes this limit, allowing unlimited members in your recovery group.",
                        },
                        {
                          question:
                            "Do you offer discounts for multiple groups?",
                          answer:
                            "Yes, if you're managing multiple recovery groups, please contact us for information about our multi-group discount pricing.",
                        },
                      ].map((e, t) =>
                        (0, yr.jsxs)(
                          Uh,
                          {
                            as: Eu.div,
                            custom: t,
                            variants: c,
                            initial: "hidden",
                            animate: r ? "visible" : "hidden",
                            children: [
                              (0, yr.jsx)(Wh, { children: e.question }),
                              (0, yr.jsx)($h, { children: e.answer }),
                            ],
                          },
                          t
                        )
                      ),
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(Zd, {}),
            ],
          });
        },
        rf = vr.div`
  padding-top: 70px;
`,
        of = vr.section`
  background: linear-gradient(
    135deg,
    var(--primary-light) 0%,
    var(--primary-color) 100%
  );
  padding: 6rem 1rem 4rem;
  color: white;
  text-align: center;
`,
        af = vr.div`
  max-width: 800px;
  margin: 0 auto;
`,
        sf = vr.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`,
        lf = vr.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        cf = vr.section`
  padding: 5rem 1rem;
  background-color: ${(e) =>
    e.alternate ? "var(--background-alt)" : "var(--background)"};
`,
        uf = vr.div`
  max-width: 1000px;
  margin: 0 auto;
`,
        df = vr.h2`
  font-size: 2.25rem;
  margin-bottom: 2rem;
  color: var(--text-dark);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`,
        hf = vr.div`
  display: flex;
  align-items: center;
  gap: 4rem;
  margin-bottom: 4rem;

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 2rem;
  }
`,
        ff = vr.div`
  flex: 1;
`,
        pf = vr.div`
  flex: 1;
  display: flex;
  justify-content: center;
`,
        mf = vr.div`
  width: 100%;
  max-width: 450px;
  height: 350px;
  background-color: var(--primary-light);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 5rem;

  @media (max-width: 768px) {
    height: 250px;
  }
`,
        gf = vr.p`
  font-size: 1.125rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  line-height: 1.8;
`,
        vf = vr.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`,
        yf = vr(Eu.div)`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
`,
        xf = vr.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
`,
        bf = vr.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`,
        wf = vr.p`
  color: var(--text-light);
  line-height: 1.6;
`,
        Sf = vr.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`,
        kf = vr(Eu.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`,
        jf = vr.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 4rem;
  margin-bottom: 1.5rem;
`,
        Cf = vr.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
`,
        Pf = vr.p`
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 1rem;
`,
        Ef = vr.p`
  color: var(--text-light);
  line-height: 1.6;
`,
        Tf = vr.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 4px;
    background-color: var(--primary-light);
    transform: translateX(-50%);

    @media (max-width: 768px) {
      left: 30px;
    }
  }
`,
        Rf = vr(Eu.div)`
  position: relative;
  margin-bottom: 3rem;

  &:last-child {
    margin-bottom: 0;
  }

  &:nth-child(odd) {
    padding-right: calc(50% + 2rem);

    @media (max-width: 768px) {
      padding-right: 0;
      padding-left: 70px;
    }
  }

  &:nth-child(even) {
    padding-left: calc(50% + 2rem);

    @media (max-width: 768px) {
      padding-left: 70px;
    }
  }
`,
        _f = vr.div`
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: var(--primary-color);
  border-radius: 50%;
  top: 0;

  ${(e) =>
    e.right
      ? "\n    right: calc(50% - 12px);\n    \n    @media (max-width: 768px) {\n      right: auto;\n      left: 18px;\n    }\n  "
      : "\n    left: calc(50% - 12px);\n    \n    @media (max-width: 768px) {\n      left: 18px;\n    }\n  "}
`,
        Of = vr.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`,
        Af = vr.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`,
        zf = vr.h3`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
`,
        Df = vr.p`
  font-size: 0.95rem;
  color: var(--text-light);
  line-height: 1.6;
`,
        Nf = () => {
          const { ref: e, inView: t } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: n, inView: r } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: i, inView: o } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            { ref: a, inView: s } = Yu({ triggerOnce: !0, threshold: 0.1 }),
            l = {
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            },
            c = {
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            };
          return (0, yr.jsxs)(rf, {
            children: [
              (0, yr.jsx)(of, {
                children: (0, yr.jsxs)(af, {
                  children: [
                    (0, yr.jsx)(sf, { children: "Our Story" }),
                    (0, yr.jsx)(lf, {
                      children:
                        "Homegroups was built by members of the recovery community to solve real problems while respecting recovery traditions.",
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(cf, {
                children: (0, yr.jsx)(uf, {
                  children: (0, yr.jsxs)(hf, {
                    ref: e,
                    as: Eu.div,
                    initial: { opacity: 0, y: 30 },
                    animate: t ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
                    transition: { duration: 0.6 },
                    children: [
                      (0, yr.jsxs)(ff, {
                        children: [
                          (0, yr.jsx)(df, {
                            style: { textAlign: "left" },
                            children: "From Challenge to Solution",
                          }),
                          (0, yr.jsx)(gf, {
                            children:
                              "Homegroups began with a simple problem: as a treasurer for his homegroup, our founder James was frustrated with the disorganized system of paper records, email chains, and text messages used to manage the group.",
                          }),
                          (0, yr.jsx)(gf, {
                            children:
                              "When he became treasurer, he inherited a shoebox of receipts and a notebook with financial records. When his service term ended, he had to train the next treasurer and ensure a smooth transition of records\u2014a process that was unnecessarily complex.",
                          }),
                          (0, yr.jsx)(gf, {
                            children:
                              "He realized that while there were many digital tools available for businesses, none were designed specifically for 12-step recovery groups with their unique needs for anonymity, simplicity, and respect for traditions.",
                          }),
                          (0, yr.jsx)(gf, {
                            children:
                              "Homegroups was created to bridge that gap, providing recovery groups with the digital tools they need while maintaining the principles and traditions that make these communities special.",
                          }),
                        ],
                      }),
                      (0, yr.jsx)(pf, {
                        children: (0, yr.jsx)(mf, { children: "\ud83d\udcf1" }),
                      }),
                    ],
                  }),
                }),
              }),
              (0, yr.jsx)(cf, {
                alternate: !0,
                children: (0, yr.jsxs)(uf, {
                  children: [
                    (0, yr.jsx)(df, { children: "Our Values" }),
                    (0, yr.jsx)(vf, {
                      ref: n,
                      as: Eu.div,
                      variants: c,
                      initial: "hidden",
                      animate: r ? "visible" : "hidden",
                      children: [
                        {
                          icon: "\ud83e\udd1d",
                          title: "Respect for Traditions",
                          description:
                            "We build technology that respects and upholds the 12 Traditions, particularly around anonymity and group autonomy.",
                        },
                        {
                          icon: "\ud83d\udd12",
                          title: "Privacy First",
                          description:
                            "We never compromise on privacy. All features are designed with privacy as the foundation, not an afterthought.",
                        },
                        {
                          icon: "\ud83d\udca1",
                          title: "Simplicity",
                          description:
                            "We believe in simplicity of design and function. Recovery tools should make life easier, not more complicated.",
                        },
                        {
                          icon: "\ud83c\udf31",
                          title: "Service",
                          description:
                            "Our work is built on a foundation of service to the recovery community. We are here to help, not to profit.",
                        },
                        {
                          icon: "\ud83d\udd04",
                          title: "Continuous Improvement",
                          description:
                            "We continuously seek user feedback to improve and evolve our platform to better serve recovery communities.",
                        },
                        {
                          icon: "\u267f",
                          title: "Accessibility",
                          description:
                            "We believe recovery tools should be accessible to everyone, regardless of technical ability or disability.",
                        },
                      ].map((e, t) =>
                        (0, yr.jsxs)(
                          yf,
                          {
                            variants: l,
                            children: [
                              (0, yr.jsx)(xf, { children: e.icon }),
                              (0, yr.jsx)(bf, { children: e.title }),
                              (0, yr.jsx)(wf, { children: e.description }),
                            ],
                          },
                          t
                        )
                      ),
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(cf, {
                children: (0, yr.jsxs)(uf, {
                  children: [
                    (0, yr.jsx)(df, { children: "Our Team" }),
                    (0, yr.jsx)(Sf, {
                      ref: i,
                      as: Eu.div,
                      variants: c,
                      initial: "hidden",
                      animate: o ? "visible" : "hidden",
                      children: [
                        {
                          initial: "J",
                          name: "James Wilson",
                          role: "Founder & CEO",
                          bio: "James founded Homegroups after experiencing firsthand the challenges of managing a 12-step homegroup. With 8 years in recovery and 15 years in software development, he combines these passions to serve the recovery community.",
                        },
                        {
                          initial: "S",
                          name: "Sarah Chen",
                          role: "Lead Developer",
                          bio: "Sarah brings 10 years of mobile app development experience to Homegroups. Her expertise in building secure communication platforms ensures our app maintains the highest standards of privacy and security.",
                        },
                        {
                          initial: "M",
                          name: "Michael Davis",
                          role: "Community Manager",
                          bio: "With 12 years in recovery and experience serving at the intergroup level, Michael ensures Homegroups stays true to recovery principles while meeting the real needs of recovery groups.",
                        },
                      ].map((e, t) =>
                        (0, yr.jsxs)(
                          kf,
                          {
                            variants: l,
                            children: [
                              (0, yr.jsx)(jf, { children: e.initial }),
                              (0, yr.jsx)(Cf, { children: e.name }),
                              (0, yr.jsx)(Pf, { children: e.role }),
                              (0, yr.jsx)(Ef, { children: e.bio }),
                            ],
                          },
                          t
                        )
                      ),
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(cf, {
                alternate: !0,
                children: (0, yr.jsxs)(uf, {
                  children: [
                    (0, yr.jsx)(df, { children: "Our Journey" }),
                    (0, yr.jsx)(Tf, {
                      ref: a,
                      as: Eu.div,
                      children: [
                        {
                          year: "2019",
                          title: "The Idea Is Born",
                          description:
                            "After struggling with paper records and disorganized communication as a homegroup treasurer, James envisions a privacy-first digital solution for recovery groups.",
                        },
                        {
                          year: "2020",
                          title: "Research & Development",
                          description:
                            "The founding team interviews dozens of homegroup members across multiple fellowships to understand pain points and requirements.",
                        },
                        {
                          year: "2021",
                          title: "First Prototype",
                          description:
                            "The first version of Homegroups is built and tested with a handful of pilot groups, focusing on meeting management and treasury features.",
                        },
                        {
                          year: "2022",
                          title: "Official Launch",
                          description:
                            "Homegroups launches publicly with its core feature set. Within months, hundreds of recovery groups have adopted the platform.",
                        },
                        {
                          year: "2023",
                          title: "Expansion & Growth",
                          description:
                            "New features are added based on user feedback. Homegroups grows to serve thousands of users across multiple countries and fellowships.",
                        },
                      ].map((e, t) =>
                        (0, yr.jsxs)(
                          Rf,
                          {
                            as: Eu.div,
                            initial: { opacity: 0, y: 20 },
                            animate: s
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 20 },
                            transition: { delay: 0.2 * t, duration: 0.5 },
                            children: [
                              (0, yr.jsx)(_f, { right: t % 2 === 0 }),
                              (0, yr.jsxs)(Of, {
                                children: [
                                  (0, yr.jsx)(Af, { children: e.year }),
                                  (0, yr.jsx)(zf, { children: e.title }),
                                  (0, yr.jsx)(Df, { children: e.description }),
                                ],
                              }),
                            ],
                          },
                          t
                        )
                      ),
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(Zd, {}),
            ],
          });
        },
        Lf = vr.div`
  padding: 10rem 1rem 5rem;
  max-width: 1200px;
  margin: 0 auto;
`,
        Mf = vr.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
`,
        Ff = vr.h1`
  font-size: 3rem;
  color: var(--text-dark);
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`,
        If = vr.p`
  font-size: 1.25rem;
  color: var(--text-light);

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        Vf = vr.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`,
        Bf = vr.div``,
        Uf = vr.form`
  background-color: white;
  padding: 2.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`,
        Wf = vr.h2`
  font-size: 1.5rem;
  color: var(--text-dark);
  margin-bottom: 1.5rem;
`,
        $f = vr.div`
  margin-bottom: 1.5rem;
`,
        Hf = vr.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
`,
        Yf = vr.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: var(--primary-color);
  }
`,
        qf = vr.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
  min-height: 150px;
  resize: vertical;

  &:focus {
    border-color: var(--primary-color);
  }
`,
        Gf = vr.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--primary-dark);
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`,
        Kf = vr.div`
  margin-bottom: 2rem;
`,
        Qf = vr.h3`
  font-size: 1.25rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
`,
        Xf = vr.p`
  color: var(--text-light);
  margin-bottom: 0.5rem;
  line-height: 1.6;
`,
        Jf = vr.a`
  color: var(--primary-color);
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`,
        Zf = vr(Eu.div)`
  background-color: var(--success);
  color: white;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
`,
        ep = () => {
          const [e, n] = (0, t.useState)({
              name: "",
              email: "",
              groupName: "",
              message: "",
            }),
            [r, i] = (0, t.useState)(!1),
            [o, a] = (0, t.useState)(!1),
            s = (e) => {
              const { name: t, value: r } = e.target;
              n((e) => ({ ...e, [t]: r }));
            };
          return (0, yr.jsxs)(Lf, {
            children: [
              (0, yr.jsxs)(Mf, {
                children: [
                  (0, yr.jsx)(Ff, { children: "Get Started with Homegroups" }),
                  (0, yr.jsx)(If, {
                    children:
                      "We're here to help your recovery group thrive with our tools. Reach out to learn more or sign up for a free trial.",
                  }),
                ],
              }),
              (0, yr.jsxs)(Vf, {
                children: [
                  (0, yr.jsxs)(Bf, {
                    children: [
                      (0, yr.jsxs)(Kf, {
                        children: [
                          (0, yr.jsx)(Qf, { children: "Contact Information" }),
                          (0, yr.jsx)(Xf, {
                            children:
                              "We're here to answer any questions you have about Homegroups.",
                          }),
                          (0, yr.jsxs)(Xf, {
                            children: [
                              "Email:",
                              " ",
                              (0, yr.jsx)(Jf, {
                                href: "mailto:info@recoveryconnect.app",
                                children: "info@recoveryconnect.app",
                              }),
                            ],
                          }),
                          (0, yr.jsxs)(Xf, {
                            children: [
                              "Phone: ",
                              (0, yr.jsx)(Jf, {
                                href: "tel:+1234567890",
                                children: "(123) 456-7890",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, yr.jsxs)(Kf, {
                        children: [
                          (0, yr.jsx)(Qf, { children: "Office Hours" }),
                          (0, yr.jsx)(Xf, {
                            children: "Monday - Friday: 9:00 AM - 5:00 PM EST",
                          }),
                          (0, yr.jsx)(Xf, {
                            children: "Saturday - Sunday: Closed",
                          }),
                        ],
                      }),
                      (0, yr.jsxs)(Kf, {
                        children: [
                          (0, yr.jsx)(Qf, { children: "Need Help?" }),
                          (0, yr.jsxs)(Xf, {
                            children: [
                              "Check out our ",
                              (0, yr.jsx)(Jf, {
                                href: "/faq",
                                children: "FAQ",
                              }),
                              " for quick answers or schedule a ",
                              (0, yr.jsx)(Jf, {
                                href: "/demo",
                                children: "free demo",
                              }),
                              " ",
                              "to see the app in action.",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, yr.jsxs)(Uf, {
                    onSubmit: (t) => {
                      t.preventDefault(),
                        a(!0),
                        setTimeout(() => {
                          console.log("Form submitted:", e),
                            a(!1),
                            i(!0),
                            n({
                              name: "",
                              email: "",
                              groupName: "",
                              message: "",
                            }),
                            setTimeout(() => {
                              i(!1);
                            }, 5e3);
                        }, 1e3);
                    },
                    children: [
                      (0, yr.jsx)(Wf, { children: "Start Your Free Trial" }),
                      (0, yr.jsxs)($f, {
                        children: [
                          (0, yr.jsx)(Hf, {
                            htmlFor: "name",
                            children: "Name",
                          }),
                          (0, yr.jsx)(Yf, {
                            type: "text",
                            id: "name",
                            name: "name",
                            value: e.name,
                            onChange: s,
                            required: !0,
                          }),
                        ],
                      }),
                      (0, yr.jsxs)($f, {
                        children: [
                          (0, yr.jsx)(Hf, {
                            htmlFor: "email",
                            children: "Email",
                          }),
                          (0, yr.jsx)(Yf, {
                            type: "email",
                            id: "email",
                            name: "email",
                            value: e.email,
                            onChange: s,
                            required: !0,
                          }),
                        ],
                      }),
                      (0, yr.jsxs)($f, {
                        children: [
                          (0, yr.jsx)(Hf, {
                            htmlFor: "groupName",
                            children: "Group Name (Optional)",
                          }),
                          (0, yr.jsx)(Yf, {
                            type: "text",
                            id: "groupName",
                            name: "groupName",
                            value: e.groupName,
                            onChange: s,
                          }),
                        ],
                      }),
                      (0, yr.jsxs)($f, {
                        children: [
                          (0, yr.jsx)(Hf, {
                            htmlFor: "message",
                            children: "Message",
                          }),
                          (0, yr.jsx)(qf, {
                            id: "message",
                            name: "message",
                            value: e.message,
                            onChange: s,
                            required: !0,
                          }),
                        ],
                      }),
                      (0, yr.jsx)(Gf, {
                        type: "submit",
                        disabled: o,
                        children: o ? "Sending..." : "Get Started",
                      }),
                      r &&
                        (0, yr.jsx)(Zf, {
                          initial: { opacity: 0, y: -10 },
                          animate: { opacity: 1, y: 0 },
                          exit: { opacity: 0 },
                          children:
                            "Thank you for reaching out! We'll be in touch soon.",
                        }),
                    ],
                  }),
                ],
              }),
            ],
          });
        },
        tp = vr.div`
  padding-top: 70px;
`,
        np = vr.section`
  background-color: var(--primary-color);
  padding: 6rem 1rem 4rem;
  color: white;
  text-align: center;
`,
        rp = vr.div`
  max-width: 800px;
  margin: 0 auto;
`,
        ip = vr.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`,
        op = vr.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        ap = vr.section`
  padding: 5rem 1rem;
  background-color: var(--background);
`,
        sp = vr.div`
  max-width: 900px;
  margin: 0 auto;
`,
        lp = vr.p`
  font-size: 0.95rem;
  color: var(--text-light);
  margin-bottom: 3rem;
  text-align: center;
`,
        cp = vr.h2`
  font-size: 1.75rem;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;

  &:first-of-type {
    margin-top: 0;
  }
`,
        up = vr.h3`
  font-size: 1.25rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`,
        dp = vr.p`
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  line-height: 1.7;
`,
        hp = vr.ul`
  margin-bottom: 1.5rem;
  padding-left: 2rem;
`,
        fp = vr.li`
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 0.75rem;
  line-height: 1.7;
`,
        pp = vr.div`
  background-color: var(--background-alt);
  padding: 2rem;
  border-radius: 0.5rem;
  margin: 3rem 0;
`,
        mp =
          (vr.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`,
          vr.p`
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 0.75rem;
  line-height: 1.7;
`),
        gp = vr.div`
  background-color: rgba(90, 103, 216, 0.1);
  border-left: 4px solid var(--primary-color);
  padding: 1.5rem;
  border-radius: 0.25rem;
  margin: 2rem 0;
`,
        vp = vr.h4`
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
  color: var(--text-dark);
`,
        yp = vr(Pe)`
  color: var(--primary-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`,
        xp =
          (vr.a`
  color: var(--primary-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`,
          vr.span`
  font-weight: 600;
`),
        bp = () =>
          (0, yr.jsxs)(tp, {
            children: [
              (0, yr.jsx)(np, {
                children: (0, yr.jsxs)(rp, {
                  children: [
                    (0, yr.jsx)(ip, { children: "Privacy Policy" }),
                    (0, yr.jsx)(op, {
                      children:
                        "Your privacy is our top priority. Learn how we protect your information.",
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(ap, {
                children: (0, yr.jsxs)(sp, {
                  children: [
                    (0, yr.jsx)(lp, {
                      children: "Last Updated: January 1, 2023",
                    }),
                    (0, yr.jsxs)(gp, {
                      children: [
                        (0, yr.jsx)(vp, { children: "Our Privacy Commitment" }),
                        (0, yr.jsx)(dp, {
                          style: { marginBottom: 0 },
                          children:
                            "Homegroups was built with privacy as a foundational principle. We understand the sensitive nature of recovery information and the importance of anonymity in 12-step programs. Our privacy practices are designed to respect and protect these principles.",
                        }),
                      ],
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        'This Privacy Policy describes how Homegroups ("we", "our", or "us") collects, uses, and discloses your information when you use our mobile application and website (collectively, the "Service").',
                    }),
                    (0, yr.jsxs)(dp, {
                      children: [
                        "By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our",
                        " ",
                        (0, yr.jsx)(yp, {
                          to: "/terms",
                          children: "Terms of Service",
                        }),
                        ".",
                      ],
                    }),
                    (0, yr.jsx)(cp, { children: "1. Information We Collect" }),
                    (0, yr.jsx)(up, { children: "Personal Information" }),
                    (0, yr.jsx)(dp, {
                      children:
                        "When you use our Service, we may ask you to provide certain personally identifiable information that can be used to contact or identify you. This may include, but is not limited to:",
                    }),
                    (0, yr.jsxs)(hp, {
                      children: [
                        (0, yr.jsx)(fp, {
                          children:
                            "Email address (for account authentication)",
                        }),
                        (0, yr.jsx)(fp, {
                          children:
                            "First name or initial only (to respect anonymity)",
                        }),
                        (0, yr.jsx)(fp, {
                          children: "Recovery date (optional)",
                        }),
                        (0, yr.jsx)(fp, { children: "Group affiliations" }),
                      ],
                    }),
                    (0, yr.jsx)(dp, {
                      children: (0, yr.jsx)(xp, {
                        children:
                          "We never require your full name, address, phone number, or other identifying information beyond what is necessary to provide the Service.",
                      }),
                    }),
                    (0, yr.jsx)(up, { children: "Usage Data" }),
                    (0, yr.jsx)(dp, {
                      children:
                        'We may also collect information about how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your device\'s Internet Protocol address (e.g., IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.',
                    }),
                    (0, yr.jsx)(up, { children: "Location Data" }),
                    (0, yr.jsx)(dp, {
                      children:
                        'We may use and store information about your location if you give us permission to do so ("Location Data"). We use this data to provide features of our Service, such as finding nearby meetings, and to improve and customize our Service.',
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        "You can enable or disable location services when you use our Service at any time through your device settings.",
                    }),
                    (0, yr.jsx)(cp, {
                      children: "2. How We Use Your Information",
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        "We use the collected data for various purposes:",
                    }),
                    (0, yr.jsxs)(hp, {
                      children: [
                        (0, yr.jsx)(fp, {
                          children: "To provide and maintain our Service",
                        }),
                        (0, yr.jsx)(fp, {
                          children:
                            "To notify you about changes to our Service",
                        }),
                        (0, yr.jsx)(fp, {
                          children:
                            "To allow you to participate in interactive features of our Service when you choose to do so",
                        }),
                        (0, yr.jsx)(fp, {
                          children: "To provide customer support",
                        }),
                        (0, yr.jsx)(fp, {
                          children:
                            "To gather analysis or valuable information so that we can improve our Service",
                        }),
                        (0, yr.jsx)(fp, {
                          children: "To monitor the usage of our Service",
                        }),
                        (0, yr.jsx)(fp, {
                          children:
                            "To detect, prevent, and address technical issues",
                        }),
                      ],
                    }),
                    (0, yr.jsx)(cp, { children: "3. Data Security" }),
                    (0, yr.jsx)(dp, {
                      children:
                        "The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.",
                    }),
                    (0, yr.jsxs)(gp, {
                      children: [
                        (0, yr.jsx)(vp, { children: "End-to-End Encryption" }),
                        (0, yr.jsx)(dp, {
                          style: { marginBottom: 0 },
                          children:
                            "All direct messages and group communications in Homegroups are secured with end-to-end encryption. This means that only the intended recipients can read these messages\u2014not even our team at Homegroups can access the content of your conversations.",
                        }),
                      ],
                    }),
                    (0, yr.jsx)(cp, { children: "4. Data Retention" }),
                    (0, yr.jsx)(dp, {
                      children:
                        "We will retain your Personal Information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.",
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        "We will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of our Service, or we are legally obligated to retain this data for longer periods.",
                    }),
                    (0, yr.jsx)(cp, { children: "5. Transfer of Data" }),
                    (0, yr.jsx)(dp, {
                      children:
                        "Your information, including Personal Information, may be transferred to\u2014and maintained on\u2014computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.",
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        "If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including Personal Information, to the United States and process it there.",
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        "Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.",
                    }),
                    (0, yr.jsx)(cp, { children: "6. Disclosure of Data" }),
                    (0, yr.jsx)(up, { children: "Legal Requirements" }),
                    (0, yr.jsx)(dp, {
                      children:
                        "Homegroups may disclose your Personal Information in the good faith belief that such action is necessary to:",
                    }),
                    (0, yr.jsxs)(hp, {
                      children: [
                        (0, yr.jsx)(fp, {
                          children: "To comply with a legal obligation",
                        }),
                        (0, yr.jsx)(fp, {
                          children:
                            "To protect and defend the rights or property of Homegroups",
                        }),
                        (0, yr.jsx)(fp, {
                          children:
                            "To prevent or investigate possible wrongdoing in connection with the Service",
                        }),
                        (0, yr.jsx)(fp, {
                          children:
                            "To protect the personal safety of users of the Service or the public",
                        }),
                        (0, yr.jsx)(fp, {
                          children: "To protect against legal liability",
                        }),
                      ],
                    }),
                    (0, yr.jsxs)(gp, {
                      children: [
                        (0, yr.jsx)(vp, {
                          children: "We Do Not Sell Your Data",
                        }),
                        (0, yr.jsx)(dp, {
                          style: { marginBottom: 0 },
                          children:
                            "Homegroups does not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners and trusted affiliates for the purposes outlined above.",
                        }),
                      ],
                    }),
                    (0, yr.jsx)(cp, {
                      children: "7. Your Data Protection Rights",
                    }),
                    (0, yr.jsx)(dp, { children: "You have the right to:" }),
                    (0, yr.jsxs)(hp, {
                      children: [
                        (0, yr.jsxs)(fp, {
                          children: [
                            (0, yr.jsx)(xp, { children: "Access" }),
                            " - You can request copies of your personal data.",
                          ],
                        }),
                        (0, yr.jsxs)(fp, {
                          children: [
                            (0, yr.jsx)(xp, { children: "Rectification" }),
                            " - You can request that we correct any information you believe is inaccurate or complete information you believe is incomplete.",
                          ],
                        }),
                        (0, yr.jsxs)(fp, {
                          children: [
                            (0, yr.jsx)(xp, { children: "Erasure" }),
                            " - You can request that we erase your personal data, under certain conditions.",
                          ],
                        }),
                        (0, yr.jsxs)(fp, {
                          children: [
                            (0, yr.jsx)(xp, {
                              children: "Restriction of processing",
                            }),
                            " - You can request that we restrict the processing of your personal data, under certain conditions.",
                          ],
                        }),
                        (0, yr.jsxs)(fp, {
                          children: [
                            (0, yr.jsx)(xp, {
                              children: "Object to processing",
                            }),
                            " - You can object to our processing of your personal data, under certain conditions.",
                          ],
                        }),
                        (0, yr.jsxs)(fp, {
                          children: [
                            (0, yr.jsx)(xp, { children: "Data portability" }),
                            " - You can request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.",
                          ],
                        }),
                      ],
                    }),
                    (0, yr.jsx)(cp, { children: "8. Children's Privacy" }),
                    (0, yr.jsx)(dp, {
                      children:
                        'Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Child has provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from Children without verification of parental consent, we take steps to remove that information from our servers.',
                    }),
                    (0, yr.jsx)(cp, {
                      children: "9. Changes to This Privacy Policy",
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.',
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        "You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.",
                    }),
                    (0, yr.jsx)(cp, { children: "10. Third-Party Services" }),
                    (0, yr.jsx)(dp, {
                      children:
                        "Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.",
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        "We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.",
                    }),
                    (0, yr.jsx)(cp, { children: "11. Analytics" }),
                    (0, yr.jsx)(dp, {
                      children:
                        "We may use third-party Service Providers to monitor and analyze the use of our Service.",
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        "These analytics services collect only anonymized data that cannot be traced back to individual users. We use this information solely to improve the functionality and user experience of our Service.",
                    }),
                    (0, yr.jsx)(cp, { children: "12. Contact Us" }),
                    (0, yr.jsx)(dp, {
                      children:
                        "If you have any questions about this Privacy Policy, please contact us:",
                    }),
                    (0, yr.jsxs)(pp, {
                      children: [
                        (0, yr.jsxs)(mp, {
                          children: [
                            (0, yr.jsx)(xp, { children: "By Email:" }),
                            " privacy@recoveryconnect.app",
                          ],
                        }),
                        (0, yr.jsxs)(mp, {
                          children: [
                            (0, yr.jsx)(xp, { children: "By Mail:" }),
                            " Homegroups, Inc.",
                            (0, yr.jsx)("br", {}),
                            "123 Recovery Way, Suite 456",
                            (0, yr.jsx)("br", {}),
                            "San Francisco, CA 94103",
                            (0, yr.jsx)("br", {}),
                            "United States",
                          ],
                        }),
                      ],
                    }),
                    (0, yr.jsx)(dp, {
                      children:
                        "We take your privacy seriously and are committed to responding to your concerns promptly and effectively.",
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(Zd, {}),
            ],
          }),
        wp = vr.div`
  padding-top: 70px;
`,
        Sp = vr.section`
  background-color: var(--primary-color);
  padding: 6rem 1rem 4rem;
  color: white;
  text-align: center;
`,
        kp = vr.div`
  max-width: 800px;
  margin: 0 auto;
`,
        jp = vr.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`,
        Cp = vr.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        Pp = vr.section`
  padding: 5rem 1rem;
  background-color: var(--background);
`,
        Ep = vr.div`
  max-width: 900px;
  margin: 0 auto;
`,
        Tp = vr.p`
  font-size: 0.95rem;
  color: var(--text-light);
  margin-bottom: 3rem;
  text-align: center;
`,
        Rp = vr.h2`
  font-size: 1.75rem;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  color: var(--text-dark);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;

  &:first-of-type {
    margin-top: 0;
  }
`,
        _p =
          (vr.h3`
  font-size: 1.25rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`,
          vr.p`
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  line-height: 1.7;
`),
        Op = vr.ul`
  margin-bottom: 1.5rem;
  padding-left: 2rem;
`,
        Ap = vr.li`
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 0.75rem;
  line-height: 1.7;
`,
        zp = vr.div`
  background-color: var(--background-alt);
  padding: 2rem;
  border-radius: 0.5rem;
  margin: 3rem 0;
`,
        Dp =
          (vr.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
`,
          vr.p`
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 0.75rem;
  line-height: 1.7;
`),
        Np = vr(Pe)`
  color: var(--primary-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`,
        Lp =
          (vr.a`
  color: var(--primary-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`,
          vr.span`
  font-weight: 600;
`),
        Mp = () =>
          (0, yr.jsxs)(wp, {
            children: [
              (0, yr.jsx)(Sp, {
                children: (0, yr.jsxs)(kp, {
                  children: [
                    (0, yr.jsx)(jp, { children: "Terms of Service" }),
                    (0, yr.jsx)(Cp, {
                      children:
                        "Please read these terms carefully before using Homegroups.",
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(Pp, {
                children: (0, yr.jsxs)(Ep, {
                  children: [
                    (0, yr.jsx)(Tp, {
                      children: "Last Updated: January 1, 2023",
                    }),
                    (0, yr.jsx)(_p, {
                      children:
                        'Welcome to Homegroups. The following Terms of Service ("Terms") govern your access to and use of the Homegroups mobile application and website ("Service"), including any content, functionality, and services offered on or through the application or website.',
                    }),
                    (0, yr.jsx)(_p, {
                      children:
                        "By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.",
                    }),
                    (0, yr.jsx)(Rp, { children: "1. Acceptance of Terms" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "By accessing or using the Service, you confirm that you accept these Terms and agree to comply with them. If you do not agree to these Terms, you must not access or use the Service.",
                    }),
                    (0, yr.jsx)(Rp, { children: "2. Changes to Terms" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "We may revise these Terms at any time by updating this page. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised Terms.",
                    }),
                    (0, yr.jsx)(Rp, { children: "3. Privacy Policy" }),
                    (0, yr.jsxs)(_p, {
                      children: [
                        "Your privacy is important to us. Our",
                        " ",
                        (0, yr.jsx)(Np, {
                          to: "/privacy",
                          children: "Privacy Policy",
                        }),
                        " explains how we collect, use, disclose, and safeguard your information when you use our Service. By using the Service, you consent to the collection, use, and disclosure of information in accordance with our Privacy Policy.",
                      ],
                    }),
                    (0, yr.jsx)(Rp, { children: "4. User Accounts" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.",
                    }),
                    (0, yr.jsx)(_p, {
                      children:
                        'You are responsible for safeguarding the password you use to access the Service and for any activities or actions under your password. We encourage you to use a "strong" password (a password that uses a combination of upper and lower case letters, numbers, and symbols) with your account.',
                    }),
                    (0, yr.jsx)(_p, {
                      children:
                        "You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.",
                    }),
                    (0, yr.jsx)(Rp, { children: "5. User Content" }),
                    (0, yr.jsx)(_p, {
                      children:
                        'Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, photos, or other material ("Content"). By making Content available through the Service, you grant to Homegroups a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use, copy, modify, create derivative works based on, distribute, publicly display, and otherwise use such Content to provide the Service.',
                    }),
                    (0, yr.jsx)(_p, {
                      children:
                        "You represent and warrant that: (i) the Content is yours or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person.",
                    }),
                    (0, yr.jsx)(Rp, { children: "6. Prohibited Uses" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:",
                    }),
                    (0, yr.jsxs)(Op, {
                      children: [
                        (0, yr.jsx)(Ap, {
                          children:
                            "In any way that violates any applicable federal, state, local, or international law or regulation.",
                        }),
                        (0, yr.jsx)(Ap, {
                          children:
                            "To exploit, harm, or attempt to exploit or harm minors in any way.",
                        }),
                        (0, yr.jsx)(Ap, {
                          children:
                            'To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.',
                        }),
                        (0, yr.jsx)(Ap, {
                          children:
                            "To impersonate or attempt to impersonate Homegroups, a Homegroups employee, another user, or any other person or entity.",
                        }),
                        (0, yr.jsx)(Ap, {
                          children:
                            "To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm Homegroups or users of the Service.",
                        }),
                      ],
                    }),
                    (0, yr.jsx)(Rp, { children: "7. Intellectual Property" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Homegroups and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Homegroups.",
                    }),
                    (0, yr.jsx)(Rp, { children: "8. Termination" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.",
                    }),
                    (0, yr.jsx)(_p, {
                      children:
                        "Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service, or delete your account from within the application settings.",
                    }),
                    (0, yr.jsx)(Rp, { children: "9. Limitation of Liability" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "In no event shall Homegroups, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.",
                    }),
                    (0, yr.jsx)(Rp, { children: "10. Disclaimer" }),
                    (0, yr.jsx)(_p, {
                      children:
                        'Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.',
                    }),
                    (0, yr.jsx)(_p, {
                      children:
                        "Homegroups does not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.",
                    }),
                    (0, yr.jsx)(Rp, { children: "11. Governing Law" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.",
                    }),
                    (0, yr.jsx)(_p, {
                      children:
                        "Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.",
                    }),
                    (0, yr.jsx)(Rp, { children: "12. Severability" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "If any provision of these Terms is found to be unenforceable or invalid under any applicable law, such unenforceability or invalidity shall not render these Terms unenforceable or invalid as a whole, and such provisions shall be deleted without affecting the remaining provisions herein.",
                    }),
                    (0, yr.jsx)(Rp, { children: "13. Changes to Service" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.",
                    }),
                    (0, yr.jsx)(Rp, { children: "14. Contact Information" }),
                    (0, yr.jsx)(_p, {
                      children:
                        "If you have any questions about these Terms, please contact us:",
                    }),
                    (0, yr.jsxs)(zp, {
                      children: [
                        (0, yr.jsxs)(Dp, {
                          children: [
                            (0, yr.jsx)(Lp, { children: "By Email:" }),
                            " info@recoveryconnect.app",
                          ],
                        }),
                        (0, yr.jsxs)(Dp, {
                          children: [
                            (0, yr.jsx)(Lp, { children: "By Mail:" }),
                            " Homegroups, Inc.",
                            (0, yr.jsx)("br", {}),
                            "123 Recovery Way, Suite 456",
                            (0, yr.jsx)("br", {}),
                            "San Francisco, CA 94103",
                            (0, yr.jsx)("br", {}),
                            "United States",
                          ],
                        }),
                      ],
                    }),
                    (0, yr.jsx)(_p, {
                      children:
                        "By using our Service, you acknowledge that you have read these Terms of Service, understand them, and agree to be bound by them.",
                    }),
                  ],
                }),
              }),
              (0, yr.jsx)(Zd, {}),
            ],
          }),
        Fp = vr.div`
  padding: 10rem 1rem 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 80vh;
`,
        Ip = vr.h1`
  font-size: 6rem;
  color: var(--primary-color);
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 4rem;
  }
`,
        Vp = vr.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-dark);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`,
        Bp = vr.p`
  font-size: 1.25rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto 2.5rem;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`,
        Up = vr(Pe)`
  background-color: var(--primary-color);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--primary-dark);
    text-decoration: none;
  }
`,
        Wp = () =>
          (0, yr.jsxs)(Fp, {
            children: [
              (0, yr.jsx)(Ip, { children: "404" }),
              (0, yr.jsx)(Vp, { children: "Page Not Found" }),
              (0, yr.jsx)(Bp, {
                children:
                  "Looks like you've ventured into uncharted territory. The page you're looking for doesn't exist or has been moved.",
              }),
              (0, yr.jsx)(Up, { to: "/", children: "Return to Home" }),
            ],
          });
      const $p = function () {
          return (0, yr.jsx)(ke, {
            children: (0, yr.jsxs)("div", {
              className: "app",
              children: [
                (0, yr.jsx)(Pr, {}),
                (0, yr.jsx)("main", {
                  children: (0, yr.jsxs)(ve, {
                    children: [
                      (0, yr.jsx)(me, {
                        path: "/",
                        element: (0, yr.jsx)(th, {}),
                      }),
                      (0, yr.jsx)(me, {
                        path: "/features",
                        element: (0, yr.jsx)(wh, {}),
                      }),
                      (0, yr.jsx)(me, {
                        path: "/pricing",
                        element: (0, yr.jsx)(nf, {}),
                      }),
                      (0, yr.jsx)(me, {
                        path: "/about",
                        element: (0, yr.jsx)(Nf, {}),
                      }),
                      (0, yr.jsx)(me, {
                        path: "/contact",
                        element: (0, yr.jsx)(ep, {}),
                      }),
                      (0, yr.jsx)(me, {
                        path: "/privacy",
                        element: (0, yr.jsx)(bp, {}),
                      }),
                      (0, yr.jsx)(me, {
                        path: "/terms",
                        element: (0, yr.jsx)(Mp, {}),
                      }),
                      (0, yr.jsx)(me, {
                        path: "*",
                        element: (0, yr.jsx)(Wp, {}),
                      }),
                    ],
                  }),
                }),
                (0, yr.jsx)(Nr, {}),
              ],
            }),
          });
        },
        Hp = (e) => {
          e &&
            e instanceof Function &&
            n
              .e(453)
              .then(n.bind(n, 453))
              .then((t) => {
                let {
                  getCLS: n,
                  getFID: r,
                  getFCP: i,
                  getLCP: o,
                  getTTFB: a,
                } = t;
                n(e), r(e), i(e), o(e), a(e);
              });
        };
      i
        .createRoot(document.getElementById("root"))
        .render((0, yr.jsx)(t.StrictMode, { children: (0, yr.jsx)($p, {}) })),
        Hp();
    })();
})();
//# sourceMappingURL=main.d0db112b.js.map
