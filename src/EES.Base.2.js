/**
 * ElseEvent# Javascript Library v2.0.0
 */

/**
* Core 
*/
(function (window, undefined) {
    "use strict";

    var Sys = {
        ap: Array.prototype,
        bp: Boolean.prototype,
        dp: Date.prototype,
        fp: Function.prototype,
        np: Number.prototype,
        op: Object.prototype,
        sp: String.prototype,
        rp: RegExp.prototype,
        classes: {},
        getType: function (obj) {
            return obj === null ? String(obj) : Sys.classes[Sys.op.toString.call(obj)] || "object";
        },
        isArraylike: function (obj) {
            if (obj === null || obj === undefined) {
                return false;
            }

            if (EES.isFunction(obj) || EES.isString(obj) || EES.isWindow(obj)) {
                return false;
            }

            if (obj.nodeType === 1 && length) {
                return true;
            }

            var length = obj.length;
            return EES.isArray(obj) || length === 0 ||
                EES.isNumeric(length) && length > 0 && (length - 1) in obj;
        },
        makeArray: function (arr, results) {
            var ret = results || [];

            if (arr !== null) {
                if (Sys.isArraylike(Object(arr))) {
                    Sys.merge(ret, typeof arr === "string" ? [arr] : arr);
                } else {
                    Sys.ap.push.call(ret, arr);
                }
            }

            return ret;
        },
        merge: function (first, second) {
            var len = second.length,
                j = 0,
                i = first.length;

            for (; j < len; j++) {
                first[i++] = second[j];
            }

            first.length = i;

            return first;
        },
        grep: function (elems, callback, invert) {
            var callbackInverse,
                matches = [],
                i = 0,
                length = elems.length,
                callbackExpect = !invert;

            for (; i < length; i++) {
                callbackInverse = !callback(elems[i], i);
                if (callbackInverse !== callbackExpect) {
                    matches.push(elems[i]);
                }
            }
            return matches;
        },
        map: function (elems, callback, arg) {
            var value,
                i = 0,
                length = elems.length,
                isArray = Sys.isArraylike(elems),
                ret = [];

            if (isArray) {
                for (; i < length; i++) {
                    value = callback(elems[i], i, arg);

                    if (value !== null) {
                        ret.push(value);
                    }
                }

            } else {
                for (i in elems) {
                    value = callback(elems[i], i, arg);

                    if (value !== null) {
                        ret.push(value);
                    }
                }
            }

            return Sys.ap.concat.apply([], ret);
        },
        /**
         * Returns RFC4122, version 4 ID
         * @returns {UUID}
         */
        uuid: (function (uuidRegEx, uuidReplacer) {
            return function () {
                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
            };
        })(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 3 | 8);
            return v.toString(16);
        }),
        sleep: function (span) {
            var s = Date.now(), c;
            do {
                c = Date.now();
            } while (c - s < span);
        },
    };

    var rIsSelector = /^(?:(?:[\s,>+~]*)[a-zA-Z]*(?:[\.#][\w-]+|:[\w-\(\)]+)?)*$/i;

    var EES = function (es, context) {
        var ret;
        if (EES.isArray(es)) {
            if (es.length > 0) {
                var i = es[0];
                if (EES.isFunction(i)) {
                    ret = new EES.cWrapper.wrap(es, context);
                } else if (EES.isString(i)) {
                    ret = new EES.sWrapper.wrap(es, context);
                }
            }
            if (!ret) {
                ret = new EES.oWrapper.wrap(es, context);
            }
            return ret;
        }
        if (EES.isFunction(es)) {
            ret = new EES.cWrapper.wrap(es, context);
        } else if (EES.isString(es)) {
            if (rIsSelector.test(es)) {
                ret = new EES.dWrapper.wrap(es, context);
            } else {
                ret = new EES.sWrapper.wrap(es, context);
            }
        }
        if (!ret) {
            if (es && es.nodeType) {
                ret = new EES.dWrapper.wrap(es, context);
            } else {
                ret = new EES.oWrapper.wrap(es, context);
            }
        }
        return ret;
    };

    EES.extends = function () {
        var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false,
			targetType = Sys.getType(target);

        if (targetType === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }

        if (targetType !== 'object' && targetType !== 'function') {
            target = {};
        }

        if (length === i) {
            target = this;
            --i;
        }

        for (; i < length; i++) {
            if ((options = arguments[i]) !== null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (EES.isPlainObject(copy) || (copyIsArray = EES.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && EES.isArray(src) ? src : [];
                        } else {
                            clone = src && EES.isPlainObject(src) ? src : {};
                        }
                        target[name] = EES.extends(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };

    EES.extends({
        isDebugging: false,
        isArray: function (obj) {
            return Sys.getType(obj) === 'array';
        },
        isBoolean: function (obj) {
            return Sys.getType(obj) === 'boolean';
        },
        isDate: function (obj) {
            return Sys.getType(obj) === 'date';
        },
        isFunction: function (obj) {
            return Sys.getType(obj) === 'function';
        },
        isNumeric: function (obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },
        isObject: function (obj) {
            return Sys.getType(obj) === 'object';
        },
        isRegExp: function (obj) {
            return Sys.getType(obj) === 'regexp';
        },
        isString: function (obj) {
            return Sys.getType(obj) === 'string';
        },
        isWindow: function (obj) {
            return obj !== null && obj === obj.window;
        },
        isEmptyObject: function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },
        isPlainObject: function (obj) {
            if (!obj ||
				obj.nodeType ||
				!EES.isObject(obj) ||
				EES.isWindow(obj)) {
                return false;
            }

            try {
                if (obj.constructor &&
					!Sys.op.hasOwnProperty.call(obj, "constructor") &&
					!Sys.op.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                return false;
            }

            var key;
            for (key in obj) {
                //test empty obj
            }

            return key === undefined || Sys.op.hasOwnProperty.call(obj, key);
        },
        isNullOrUndefined: function (obj) {
            return obj === null || obj === undefined;
        },
        notNullAndUndefined: function (obj) {
            return obj !== null && obj !== undefined;
        },
        inArray: function (elem, arr, i) {
            return arr === null ? -1 : Sys.ap.indexOf.call(arr, elem, i);
        },
        each: function (obj, callback, args) {
            var value,
                i = 0,
                length = obj.length,
                isArray = Sys.isArraylike(obj);

            if (args) {
                if (isArray) {
                    for (; i < length; i++) {
                        value = callback.apply(obj[i], args);

                        if (value === false) {
                            break;
                        }
                    }
                } else {
                    for (i in obj) {
                        value = callback.apply(obj[i], args);

                        if (value === false) {
                            break;
                        }
                    }
                }

                // A special, fast, case for the most common use of each
            } else {
                if (isArray) {
                    for (; i < length; i++) {
                        value = callback.call(obj[i], i, obj[i]);

                        if (value === false) {
                            break;
                        }
                    }
                } else {
                    for (i in obj) {
                        value = callback.call(obj[i], i, obj[i]);

                        if (value === false) {
                            break;
                        }
                    }
                }
            }

            return obj;

        },
        namespace: function (namespace, nsScope) {
            return EES.klass.namespace(namespace, nsScope);
        },
        using: function (namespace, nsScope) {
            return EES.klass.using(namespace, nsScope);
        },
    });

    EES.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
        Sys.classes["[object " + name + "]"] = name.toLowerCase();
    });

    EES.cWrapper = {
        constructor: function (es, context) { return new EES.cWrapper.wrap(es, context); },
        length: 0,
        wrap: function (fn, context) {
            this.context = context;
            if (!fn) {
                return this;
            }
            return Sys.makeArray(fn, this);
        },
        declare: function (name, member, isSta) {
            return this.each(function (i, f) {
                if (isSta) {
                    f[name] = member;
                } else {
                    f.prototype[name] = member;
                }
            });
        },
        insExtra: function (map) {
            EES.each(this, function (i, f) {
                E$.extends(f.prototype, map);
            });
            return this;
        },
        staExtra: function (map) {
            EES.each(this, function (i, f) {
                E$.extends(f, map);
            });
            return this;
        },
    };

    EES.cWrapper.wrap.prototype = EES.cWrapper;

    EES.dWrapper = {
        constructor: function (es, context) { return new EES.dWrapper.wrap(es, context); },
        length: 0,
        wrap: function (selector, context) {
            if (selector && selector.nodeType) {
                return Sys.makeArray([selector], this);
            }

            var matched;
            if (context && context.nodeType) {
                matched = context.querySelectorAll(selector);
            } else {
                matched = document.querySelectorAll(selector);
            }
            this.selector = selector;
            this.context = context;
            return Sys.makeArray(matched, this);
        },
        find: function (selector) {
            var matched = [];
            if (rIsSelector.test(selector)) {
                this.execute(function (v, i) {
                    var m = v.querySelectorAll(selector);
                    S$.ap.push.apply(matched, m);
                });
            } else if (E$.isFunction(selector)) {
                matched = S$.map(this, selector);
            }
            return this.pushStack(matched);
        },
        attr: function (key, value) {
            var el = this.element();
            if (!el) {
                return undefined;
            }
            if (!E$.isNullOrUndefined(value)) {
                return this.each(function (i, v) {
                    if (v.nodeType) {
                        v.setAttribute(key, value);
                    }
                });
            }
            return el.getAttribute(key);
        },
        removeAttr: function (key) {
            return this.each(function (i, v) {
                if (v.nodeType) {
                    v.removeAttribute(key);
                }
            });
        },
        hasClass: function (value) {
            var i = 0, len = this.length, filter = function (v) { return v === value; };
            for (; i < len ; i++) {
                var el = this[i];
                if (el.nodeType === 1) {
                    if (E$(el.classList).filter(filter).length > 0) {
                        return true;
                    }
                }
            }
            return false;
        },
    };

    EES.dWrapper.wrap.prototype = EES.dWrapper;

    EES.sWrapper = {
        constructor: function (es, context) {
            return new EES.sWrapper.wrap(es, context);
        },
        length: 0,
        wrap: function (str, context) {
            this.context = context;
            if (!str) {
                return this;
            }
            return Sys.makeArray(str, this);
        },
        indexOf: function (val) {
            var ret = [];

            this.each(function (i, v) {
                ret[i] = S$.sp.indexOf.call(v, val);
            });

            return this.pushStack(ret);
        },
        join: function (separator) {
            return S$.ap.join.call(this, separator || ',');
        },
        replace: function (searchValue, replaceValue) {
            var ret = this.map(function (str) {
                return Sys.sp.replace.call(str, searchValue, replaceValue);
            });
            return this.pushStack(ret);
        },
        split: function (separator) {
            var ret = [];

            this.each(function (i, v) {
                S$.ap.push.apply(ret, S$.sp.split.call(v, separator));
            });

            return this.pushStack(ret);
        },
        trim: function () {
            var ret = [];

            this.each(function (i, v) {
                v = S$.sp.trim.call(v);
                if (v !== '') {
                    ret.push(v);
                }
            });
            return this.pushStack(ret);
        },
    };

    EES.sWrapper.wrap.prototype = EES.sWrapper;

    EES.oWrapper = {
        constructor: function (es, context) {
            return new EES.oWrapper.wrap(es, context);
        },
        length: 0,
        wrap: function (obj, context) {
            this.context = context;
            if (!obj) {
                return this;
            }
            return Sys.makeArray(obj, this);
        },
        addListener: function (eventName, listener, priority) {
            if (!E$.isFunction(listener)) {
                return this;
            }
            var handler = {
                method: listener,
                priority: priority || 0
            };
            return this.each(function (i, o) {
                if (!o.getRegistedEvents) {
                    o.getRegistedEvents = (function () {
                        var registed = {};
                        return function () {
                            return registed;
                        };
                    })();
                }

                var events = o.getRegistedEvents(), listeners = events[eventName];
                if (listeners) {
                    listeners.push(handler);
                } else {
                    listeners = [handler];
                    events[eventName] = listeners;
                }
                listeners.sort(function (a, b) {
                    if (a.priority < b.priority) {
                        return -1;
                    } else if (a.priority > b.priority) {
                        return 1;
                    }
                    return 0;
                });
            });
        },
        removeListener: function (eventName, listener) {
            if (!E$.isFunction(listener)) {
                return this;
            }
            return this.each(function (i, o) {
                if (o.getRegistedEvents) {
                    var listeners = o.getRegistedEvents()[eventName];
                    if (listeners) {
                        for (var j = 0; j < listeners.length; j++) {
                            if (listeners[j].method === listener) {
                                Sys.ap.splice.call(listeners, j, 1);
                                break;
                            }
                        }
                    }
                }
            });
        },
        unlisten: function (eventName) {
            return this.each(function (i, v) {
                if (o.getRegistedEvents) {
                    if (eventName) {
                        var events = o.getRegistedEvents();
                        delete events[eventName];
                    } else {
                        delete o.getRegistedEvents;
                    }
                }
            });
        },
        dispatch: function (eventName, args) {
            var _args = E$.isArray(args) ? args : Sys.ap.slice.call(arguments, 1);
            return this.each(function (i, o) {
                if (o.getRegistedEvents) {
                    var listeners = o.getRegistedEvents()[eventName];
                    if (!listeners) {
                        return;
                    }
                    for (var j = 0; j < listeners.length; j++) {
                        var func = listeners[j].method;
                        var _br = func.apply(o, _args);
                        if (_br) {
                            E$.log('Event [{0}] break by item[{1}] listeners[{2}].', eventName, i, j);
                            break;
                        }
                    }
                }
            });
        },
        memberwiseClone: function () {
            var ret = {};
            return EES.memberwiseClone(ret, this);
        },
        clone: function () {
            return EES.clone(this);
        },
        deepClone: function () {
            return EES.deepClone(this);
        },
        immediate: function (name, member) {
            return this.each(function (k, v) {
                v[name] = member;
            });
        },
        extra: function (map) {
            EES.each(this, function (i, o) {
                EES.extends(o, map);
            });
            return this;
        },
    };

    EES.oWrapper.wrap.prototype = EES.oWrapper;

    EES.cWrapper.extends =
    EES.dWrapper.extends =
    EES.sWrapper.extends =
    EES.oWrapper.extends = EES.extends;

    EES([EES.cWrapper, EES.dWrapper, EES.sWrapper, EES.oWrapper]).extra({
        pushStack: function (elems) {
            var ret = Sys.makeArray(elems, this.constructor());
            ret.prevObject = this;
            ret.context = this.context;
            return ret;
        },
        reWrap: function (wrapper) {
            if (!wrapper) {
                wrapper = this;
            }
            if (wrapper && E$.isFunction(wrapper.constructor)) {
                var ret = Sys.makeArray(this.toArray(), wrapper.constructor());
                ret.prevObject = this;
                ret.context = this.context;
                return ret;
            }
            return undefined;
        },
        contains: function (predicate) {
            return this.filter(predicate).length > 0;
        },
        filter: function (predicate, invert) {
            return this.pushStack(Sys.grep(this, predicate, invert));
        },
        map: function (callback, args) {
            return this.pushStack(Sys.map(this, callback, args));
        },
        execute: function (callback, args) {
            EES.each(this, function (i, v) {
                if (E$.isFunction(callback)) {
                    var ret = callback(v, i, args);
                    if (ret !== undefined) {
                        return ret;
                    }
                }
            });
            return this;
        },
        each: function (callback, args) {
            return EES.each(this, callback, args);
        },
        unique: function (predicate, args) {
            var el, dup = [],
                i = 0, j = 0,
                func = predicate || function (a, b) {
                    return a === b;
                };
            this.sort();
            while ((el = this[i++])) {
                if (func(this[i], el)) {
                    j = dup.push(i);
                }
            }
            while (j--) {
                this.splice(dup[j], 1);
            }
            return this;
        },
        element: function (i) {
            return i < 0 ? this[num + this.length] : this[i || 0];
        },
        slice: function () {
            return this.pushStack(slice.apply(this, arguments));
        },
        first: function () {
            return this.eq(0);
        },
        last: function () {
            return this.eq(-1);
        },
        eq: function (i) {
            var len = this.length,
                j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
        },
        toArray: function () {
            return Sys.ap.slice.call(this);
        },
        push: Sys.ap.push,
        sort: Sys.ap.sort,
        splice: Sys.ap.splice,
        valueOf: function () {
            var len = this.length;
            if (len > 1) {
                return this.toArray();
            } else if (len == 1) {
                return this[0];
            }
            return null;
        },
    });

    window.EES =
    window.E$ = EES;
    window.S$ = Sys;
    window.C$ = {
        VOID: -1,
        FALSE: 0,
        TRUE: 1,
        BREAK: 10,
        CONTINUE: 20,
        RETURN: 30,
    };

})(window);

/**
* Class & Interface
*/
(function (E$) {
    "use strict";

    var EmptyFn = function () {
    };

    var klass = function (baseClass, extraMember) {
        var parent = null, properties = S$.ap.slice.call(arguments);
        if (E$.isFunction(properties[0])) {
            parent = properties.shift();
        }

        var PrototypeContainer = function () {
        };

        var KernalClass = function () {
            this.ctor.apply(this, arguments);
            return this;
        };

        KernalClass.E$C = true;
        KernalClass.E$CT = Date.now();
        KernalClass.BaseClass = parent;

        if (parent) {
            PrototypeContainer.prototype = parent.prototype;
            KernalClass.prototype = new PrototypeContainer();
            KernalClass.Base = parent.prototype;
        }

        KernalClass.prototype.constructor = KernalClass;

        var _ext = [{}];
        if (properties.length > 0) {
            S$.ap.push.apply(_ext, properties);
        }

        var _prototype = E$.extends.apply(E$, _ext);
        E$.each(_prototype, function (_i, i) {
            KernalClass.prototype[_i] = i;
        });

        if (!KernalClass.prototype.ctor) {
            KernalClass.prototype.ctor = EmptyFn;
        }

        if (parent && parent.prototype.constructor === Object.prototype.constructor) {
            parent.prototype.constructor = parent;
        }

        return KernalClass;
    };

    E$(klass).staExtra({
        copyInstantiate: function (type, args) {
            if (E$.isPlainObject(type)) {
                return E$.deepClone(type);
            } else if (E$.isFunction(type)) {
                var _ins = E$.deepClone(type.prototype);
                type.apply(_ins, S$.ap.slice.call(arguments, 1));
                return _ins;
            }
            return type;
        },
        instantiate: function (type, args) {
            if (!type || !E$.isFunction(type)) {
                return;
            }
            var _args = E$.isArray(args) ? args : S$.ap.slice.call(arguments, 1);
            var _ins = E$.clone(type.prototype);
            var _result = type.prototype.constructor.apply(_ins, _args);
            return _result || _ins;
        },
        namespace: function (namespace, nsScope) {
            if (!EES.isString(namespace)) {
                EES.log(namespace);
                throw new Error('Is not a namespace.');
            }

            var ns = (namespace || "").split('.'),
                last = window;

            EES.each(ns, function (index, value) {
                last[value] = last[value] || {};
                last = last[value];
            });

            if (E$.isFunction(nsScope)) {
                return nsScope.call(EES, last);
            }
        },
        using: function (namespace, nsScope) {
            var searchNs = function (_nsRoot, _nsPart, _partLevel) {
                _partLevel = _partLevel || 0;
                if (_nsPart.length === _partLevel) {
                    return _nsRoot;
                }
                var _nsContainer = _nsRoot[_nsPart[_partLevel]];
                return searchNs(_nsContainer, _nsPart, _partLevel + 1);
            }, getNsPart = function (_ns) {
                return (_ns || '').split('.');
            };

            var args = [];
            if (EES.isArray(namespace)) {
                EES.each(namespace, function (i, v) {
                    args.push(searchNs(window, getNsPart(v)));
                });
            } else if (EES.isString(namespace)) {
                args.push(searchNs(window, getNsPart(namespace)));
            }
            if (args.length === 0) {
                args.push(window);
            }
            return nsScope.apply(EES, args);
        }
    });

    var Interface = klass({
        ctor: function (name, map) {
            if (arguments.length !== 2) {
                throw new Error('Invalid args');
            }

            if (E$.isPlainObject(map)) {
                this.name = name;
                this.map = klass(map);
            } else {
                throw new Error('Invalid interface map');
            }
        },
        name: '',
        map: null,
        getProperties: function () {
            if (!this.map) {
                throw new Error('Invalid interface map.');
            }

            return E$.reflections.utilities.getPropertyNames(E$.isFunction(this.map) ? this.map.prototype : this.map);
        },
        getMethods: function () {
            if (!this.map) {
                throw new Error('Invalid interface map.');
            }

            return E$.reflections.utilities.getMethodNames(E$.isFunction(this.map) ? this.map.prototype : this.map);
        },
        ensureProperty: function (propertyList) {
            var properties = this.getProperties(), self = this, ret = true;
            properties.each(function (_i, p) {
                if (!propertyList.contains(function (name) {
                return p === name;
                })) {
                    var msg = String.format('Not implement interface <{0}>(property #{1}).', self.name, p);
                    E$.log(msg);
                    if (ret) {
                        ret = false;
                    }
                }
            });
            return ret;
        },
        ensureMethod: function (methodList) {
            var methods = this.getMethods(), self = this, ret = true;
            methods.each(function (_i, m) {
                if (!methodList.contains(function (name) {
                return m === name;
                })) {
                    var msg = String.format('Not implement interface <{0}>(method #{1}).', self.name, m);
                    E$.log(msg);
                    if (ret) {
                        ret = false;
                    }
                }
            });
            return ret;
        },
        ensure: function (obj) {
            if (!obj) {
                throw new Error('Invalid arguments (argument is not defined).');
            }
            var _obj = E$.isFunction(obj) ? obj.prototype : obj;
            var memberObj = E$.reflections.utilities.getMemberNames(_obj);
            var propertyOk = this.ensureProperty(memberObj.properties), methodOk = this.ensureMethod(memberObj.methods);
            return propertyOk && methodOk;
        }
    });

    E$.extends({
        klass: klass,
        Interface: Interface,
    });

})(EES);

/**
* Reflections
*/
(function (E$) {
    "use strict";

    /**
     * Reflections
     * 
     * @namespace EES.reflections
     */
    E$.namespace('E$.reflections', function (reflections) {
        var enumMemberType = {
            unknow: -1,
            property: 0,
            method: 1
        };

        var MemberInfo = E$.klass({
            ctor: function (source, name, member, type) {
                this.source = source;
                this.name = name;
                this.member = member;
                this.type = type;
            },
            source: null,
            name: '',
            member: null,
            type: -1,
        });

        var PropertyInfo = E$.klass(MemberInfo, {
            ctor: function (source, name, property) {
                PropertyInfo.Base.ctor.call(this, source, name, property, enumMemberType.property);
            },
            getValue: function () {
                return this.member;
            },
        });

        var MethodInfo = E$.klass(MemberInfo, {
            ctor: function (source, name, method) {
                MethodInfo.Base.ctor.call(this, source, name, method, enumMemberType.method);
            },
            invoke: function (scope, args) {
                scope = scope || this.source;
                if (E$.isArray(args)) {
                    return this.member.apply(scope, args);
                } else if (arguments.length > 1) {
                    return this.member.apply(scope, S$.sp.slice.call(arguments, 1));
                } else {
                    return this.member.call(scope);
                }
            },
        });

        var ReflectionUtility = E$.klass({
            getPropertyInfos: function (obj) {
                if (!obj || !E$.isObject(obj)) {
                    return;
                }

                var list = new E$.components.collections.List();
                for (var name in obj) {
                    var _member = obj[name];
                    if (!E$.isFunction(_member)) {
                        list.add(new PropertyInfo(obj, name, _member));
                    }
                }
                return list;
            },
            getPropertyNames: function (obj) {
                if (!obj || !E$.isObject(obj)) {
                    return;
                }

                var list = new E$.components.collections.List();
                for (var name in obj) {
                    var _member = obj[name];
                    if (!E$.isFunction(_member)) {
                        list.add(name);
                    }
                }
                return list;
            },
            getMethodInfos: function (obj) {
                if (!obj || !E$.isObject(obj)) {
                    return;
                }

                var list = new E$.components.collections.List();
                for (var name in obj) {
                    var _member = obj[name];
                    if (E$.isFunction(_member)) {
                        list.add(new MethodInfo(obj, name, _member));
                    }
                }
                return list;
            },
            getMethodNames: function (obj) {
                if (!obj || !E$.isObject(obj)) {
                    return;
                }

                var list = new E$.components.collections.List();
                for (var name in obj) {
                    var _member = obj[name];
                    if (E$.isFunction(_member)) {
                        list.add(name);
                    }
                }
                return list;
            },
            getNoInfoMethods: function (obj) {
                if (!obj || !E$.isObject(obj)) {
                    return;
                }
                var list = {};
                for (var name in obj) {
                    var _member = obj[name];
                    if (E$.isFunction(_member)) {
                        list[name] = _member;
                    }
                }
                return list;
            },
            getMemberInfos: function (obj) {
                if (!obj || !E$.isObject(obj)) {
                    return null;
                }
                var properties = new E$.components.collections.List();
                var methods = new E$.components.collections.List();

                for (var name in obj) {
                    var _member = obj[name];
                    if (E$.isFunction(_member)) {
                        methods.add(new MethodInfo(obj, name, _member));
                    } else {
                        properties.add(new PropertyInfo(obj, name, _member));
                    }
                }
                return {
                    properties: properties,
                    methods: methods
                };
            },
            getMemberNames: function (obj) {
                if (!obj || !E$.isObject(obj)) {
                    return null;
                }
                var properties = new E$.components.collections.List();
                var methods = new E$.components.collections.List();

                for (var name in obj) {
                    var _member = obj[name];
                    if (E$.isFunction(_member)) {
                        methods.add(name);
                    } else {
                        properties.add(name);
                    }
                }
                return {
                    properties: properties,
                    methods: methods
                };
            },
        });

        E$.extends(reflections, {
            EnumMemberType: enumMemberType,
            MemberInfo: MemberInfo,
            PropertyInfo: PropertyInfo,
            MethodInfo: MethodInfo,
            utilities: new ReflectionUtility(),
        });

    });

})(EES);

/**
* Basic Components
*/
(function (E$) {
    "use strict";

    E$.namespace('E$.components.basic', function (basic) {

        var TouchMonitor = function (options) {
            var onDown = function (e) {
                if (!!options.onDown) {
                    options.onDown(e);
                }
                if (options.preventDefault && e.preventDefault) { e.preventDefault(); }
                if (options.stopPropagation && e.stopPropagation) { e.stopPropagation(); }
                this.addEventListener('touchmove', onMove, options.capture);
                this.addEventListener('mousemove', onMove, options.capture);
                this.addEventListener('touchend', onUp, options.capture);
                this.addEventListener('mouseup', onUp, options.capture);
            };
            var onMove = function (e) {
                if (options.onMove) {
                    options.onMove(e);
                }
                if (options.preventDefault && e.preventDefault) { e.preventDefault(); }
                if (options.stopPropagation && e.stopPropagation) { e.stopPropagation(); }
            };
            var onUp = function (e) {
                this.removeEventListener('touchmove', onMove, options.capture);
                this.removeEventListener('mousemove', onMove, options.capture);
                if (options.onUp) {
                    options.onUp(e);
                }
                if (options.preventDefault && e.preventDefault) { e.preventDefault(); }
                if (options.stopPropagation && e.stopPropagation) { e.stopPropagation(); }
                this.removeEventListener('touchend', onUp, options.capture);
                this.removeEventListener('mouseup', onUp, options.capture);
            };
            var _el;
            return {
                bind: function (el) {
                    _el = el;
                    if (_el) {
                        _el.addEventListener('touchstart', onDown, options.capture);
                        _el.addEventListener('mousedown', onDown, options.capture);
                    }
                    return this;
                },
                unbind: function () {
                    if (_el) {
                        _el.removeEventListener('touchstart', onDown, options.capture);
                        _el.removeEventListener('mousedown', onDown, options.capture);
                    }
                    return this;
                },
            };
        };

        E$.extends(basic, {
            TouchMonitor: TouchMonitor
        });

    });

    E$.namespace('E$.components.collections', function (collections) {

        //#region class CollectionBase

        var CollectionBase = E$.klass({
            ctor: function (source) {
                this.length = 0;
                if (source && (S$.isArraylike(source) || source instanceof CollectionBase)) {
                    S$.makeArray(source, this);
                }
            },
            /**
             * 获取条目数
             * 
             * @param {Function} callback 过滤表达式
             * @returns {Number} 结果
             */
            count: function (predicate) {
                if (E$.isNullOrUndefined(predicate) || !E$.isFunction(predicate)) {
                    return this.length;
                }
                return this.filter(predicate).length;
            },
            /**
             * 清空集合
             * 
             * @returns {Array} 被清理的项目
             */
            clear: function () {
                return S$.ap.splice.call(this, 0);
            },
            /**
             * 包含判定
             * 
             * @param {Object} obj 要判定的对象
             * 
             * @returns {Boolean} 是否存在
             */
            contains: function (obj) {
                return S$.ap.indexOf.call(this, obj) > -1;
            },
            /**
             * 过滤
             * 
             * @param {Function} callback 过滤表达式函数 arguments[0] item, arguments[1] index
             * 
             * @returns {Array} 过滤结果
             */
            filter: function (predicate) {
                return S$.grep(this, predicate);
            },
            /**
             * 映射
             * 
             * @param {Function} callback 映射表达式函数arguments[0] item, arguments[1] index, arguments[2] args
             * @param {Object} args 要传递至表达式函数中的额外参数
             * 
             * @returns {Array} 映射结果
             */
            map: function (callback, args) {
                return S$.map(this, callback, args);
            },
            /**
             * 转换至数组
             */
            toArray: function () {
                return S$.ap.slice.call(this);
            },
            /**
             * 转化为字符串
             * 
             * @param {String} separator 项分隔符
             * @returns {String}
             */
            toString: function (separator) {
                return S$.ap.join.call(this, separator || ',');
            },
            //looks like a Array
            //length: 0,
            indexOf: S$.ap.indexOf,
            sort: S$.ap.sort,
            splice: S$.ap.splice,
        });

        //#endregion

        //#region class List

        /**
         * 集合类型 列表
         */
        var List = E$.klass(CollectionBase, {
            /**
             * 构造
             * 
             * @param {Array} source 被转化为新集合的原始数据数组
             */
            ctor: function (source) {
                List.Base.ctor.call(this, source);
            },
            /**
             * 增加
             * 
             * @param {Object} obj 要增加的对象
             * @returns {Number} 集合新的大小
             */
            add: function (obj) {
                if (arguments.length > 1) {
                    return S$.ap.push.apply(this, arguments);
                }
                if (arguments.length > 0) {
                    return S$.ap.push.call(this, obj);
                }
                return;
            },
            /**
             * 获取范围项
             * 
             * @param {Number} startIndex 范围起始所以
             * @param {Number} endIndex 要获取的项目总数
             * 
             * @returns {Array} 结果
             */
            getRange: function (startIndex, endIndex) {
                return S$.ap.slice.call(this, startIndex, endIndex);
            },
            /**
             * 移除一个指定项
             * 
             * @param {Object} obj 要移除的项目
             * 
             * @returns {Object} 被移除的对象
             */
            remove: function (obj) {
                return S$.ap.splice.call(this, this.indexOf(obj), 1);
            },
            /**
             * 在指定位置移除对象
             * 
             * @param {Number} index 项索引
             * 
             * @returns {Object} 被移除的对象
             */
            removeAt: function (index) {
                return S$.ap.splice.call(this, index, 1);
            },
        });

        //#endregion

        //#region class Stack

        /**
         * 集合类型 堆栈(后进先出规则)
         */
        var Stack = E$.klass(CollectionBase, {
            /**
            * 构造
            * 
            * @param {Array} source 被转化为新集合的原始数据数组
            */
            ctor: function (source) {
                Stack.Base.ctor.call(this, source);
            },
            /**
             * 压栈
             * 
             * @param {Object} obj 要压入堆栈顶端的对象
             * 
             * @returns {Number} 集合新的大小
             */
            push: function (obj) {
                if (arguments.length > 1) {
                    return S$.ap.unshift.apply(this, arguments);
                }
                return S$.ap.unshift.call(this, obj);
            },
            /**
             * 弹出
             * 
             * @returns {Object} 从堆栈中弹出的对象
             */
            pop: function () {
                return S$.ap.shift.call(this);
            },
            /**
             * 检索堆栈顶端的对象但是不弹出此对象
             * 
             * @returns {Object} 堆栈顶端的对象
             */
            peek: function () {
                return this[0];
            },
        });

        //#endregion

        //#region class Queue

        /**
         * 集合类型 队列(先进先出规则)
         */
        var Queue = E$.klass(CollectionBase, {
            /**
             * 构造
             * 
             * @param {Array} source 被转化为新集合的原始数据数组
             */
            ctor: function (source) {
                Queue.Base.ctor.call(this, source);
            },
            /**
             * 进入队列
             * 
             * @param {Object} obj 要进入队列结尾的对象
             * 
             * @returns {Number} 集合新的大小
             */
            enqueue: function (obj) {
                if (arguments.length > 0) {
                    return S$.ap.push.apply(this, arguments);
                }
                return S$.ap.push.call(this, obj);
            },
            /**
             * 弹出队列
             * 
             * @returns {Object} 离开队列顶端的对象
             */
            dequeue: function () {
                return S$.ap.shift.call(this);
            },
            /**
             * 检索队列顶端的对象但是不弹出此对象
             * 
             * @returns {Object} 队列顶端的对象
             */
            peek: function () {
                return this[0];
            },
        });

        //#endregion

        E$.extends(collections, {
            CollectionBase: CollectionBase,
            List: List,
            Stack: Stack,
            Queue: Queue,
        });

    });

})(EES);

/**
* Basic Structs
*/
(function (E$) {
    "use strict";

    E$.namespace('E$.structs', function (structs) {

        //#region Vector2

        /**
         * 表示一个2D矢量
         */
        var Vector2 = E$.klass({
            /**
             * 构造
             * 
             * @param {Number} x 矢量的 x 坐标
             * @param {Number} y 矢量的 y 坐标
             * @param {Number} t 矢量的 时间刻度
             */
            ctor: function (x, y, t) {
                this.x = x || 0;
                this.y = y || 0;
                this.t = t || Date.now();
            },
            x: 0,
            y: 0,
            t: 0,
            /**
             * 加法运算
             * 
             * @param {Vector2} v 一个 Vector2 或 数字
             * @returns {Vector2}
             */
            addition: function (v) {
                if (v instanceof Vector2) {
                    return new Vector2(this.x + v.x, this.y + v.y);
                }
                if (E$.isNumeric(v)) {
                    return new Vector2(this.x + v, this.y + v);
                }
                throw new Error('Invalid opteration. Args[0] is not a Vector2 or Numeric.');
            },
            /**
             * 减法运算
             * 
             * @param {Vector2} v 一个 Vector2 或 数字
             * @returns {Vector2}
             */
            subtract: function (v) {
                if (v instanceof Vector2) {
                    return new Vector2(this.x - v.x, this.y - v.y);
                }
                if (E$.isNumeric(v)) {
                    return new Vector2(this.x - v, this.y - v);
                }
                throw new Error('Invalid opteration. Args[0] is not a Vector2 or Numeric.');
            },
            /**
             * 乘法运算
             * 
             * @param {Vector2} v 一个 Vector2 或 数字
             * @returns {Vector2}
             */
            multiply: function (v) {
                if (v instanceof Vector2) {
                    return new Vector2(this.x * v.x, this.y * v.y);
                }
                if (E$.isNumeric(v)) {
                    return new Vector2(this.x * v, this.y * v);
                }
                throw new Error('Invalid opteration. Args[0] is not a Vector2 or Numeric.');
            },
            /**
             * 除法运算
             * 
             * @param {Vector2} v 一个 Vector2 或 数字
             * @returns {Vector2}
             */
            divide: function (v) {
                if (v instanceof Vector2) {
                    return new Vector2(this.x / v.x, this.y / v.y);
                }
                if (E$.isNumeric(v)) {
                    if (v === 0) {
                        return Vector2.ORIGIN.copy();
                    }
                    return new Vector2(this.x / v, this.y / v);
                }
                throw new Error('Invalid opteration. Args[0] is not a Vector2 or Numeric.');
            },
            /**
             * 比较
             * 
             * @param {Vector2} v 一个 Vector2
             * @returns {Vector2}
             */
            compare: function (v) {
                return Vector2.compare(this, v);
            },
            /**
             * 相等判定
             * 
             * @param {Vector2} v 一个 Vector2
             * @returns {Boolean}
             */
            equals: function (v) {
                return Vector2.equals(this, v);
            },
            /**
             * 创建副本
             * 
             * @returns {Vector2}
             */
            copy: function () {
                return new Vector2(this.x, this.y, this.t);
            },
            /**
             * 矢量大小(长度)
             * 
             * @returns {Number} 当前矢量的大小(长度)
             */
            magnitude: function () {
                var sqrM = this.sqrMagnitude();
                return Math.sqrt(sqrM);
            },
            sqrMagnitude: function () {
                return this.x * this.x + this.y * this.y;
            },
            /**
             * 标准化
             * 
             * @requires {Vector2} 长度为1的一个矢量
             */
            normalize: function () {
                var l = this.magnitude();
                if (l === 0) {
                    return Vector2.ORIGIN.copy();
                }
                return this.divide(l);
            },
            /**
             * 向当前方向前进指定长度
             * 
             * @param {Number} f 要前进的长度
             * @returns {Vector2} 指定目标的矢量
             */
            toward: function (f) {
                var v = this.normalize().multiply(f);
                return this.addition(v);
            },
            /**
             * 矢量的时间刻度差
             * 
             * @param {Vector2} v 一个 Vector2 or 数字时间刻度
             * @returns {Number} 时间差
             */
            elapse: function (v) {
                if (v instanceof Vector2) {
                    return this.t - v.t;
                }
                if (E$.isNumeric(v)) {
                    return this.t - v;
                }
                throw new Error('Invalid opteration. Args[0] is not a Vector2 or Numeric.');
            },
            /**
             * 基于屏幕坐标的偏移
             * 
             * @param {Vector2} pivot 目标轴心矢量
             * @returns {Vector2} 偏移后的矢量
             */
            shift: function (pivot) {
                return this.subtract(pivot);
            },
            /**
             * 基于屏幕坐标的反偏移
             * 
             * @param {Vector2} pivot 偏移轴心
             * @returns {Vector2} 原始位置的矢量
             */
            unshift: function (pivot) {
                return this.addition(pivot);
            },
            toString: function () {
                return String.format("{ x:{0}, y:{1} }", this.x, this.y);
            },
            valueOf: function () {
                return {
                    x: this.x,
                    y: this.y,
                    t: this.t
                };
            },
        });

        //#endregion

        //#region Vector2 static method & const
        E$.extends(Vector2, {
            fromMouseEvent: function (e) {
                return new Vector2(e.clientX, e.clientY);
            },
            fromTouchEvent: function (e, touchId) {
                var t = e.touches[touchId || 0] || e.changedTouches[touchId || 0];
                return new Vector2(t.clientX, t.clientY);
            },
            fromEvent: function (e, touchId) {
                if (e.touches) {
                    return Vector2.fromTouchEvent(e, touchId);
                }
                return Vector2.fromMouseEvent(e);
            },
            /**
             * 获取2个矢量的角度
             * 
             * @param {Vector2} v1 第一个矢量
             * @param {Vector2} v2 第二个矢量
             * 
             * @returns {Number} 角度
             */
            angle: function (v1, v2) {
                var a,
                    r = v1.magnitude(),
                    t = v2.normalize().toward(r - 1);
                a = Vector2.distance(t, v1) * 0.5;
                var half = Math.asin(a / r) * 180 / Math.PI;
                return half * 2;
            },
            /**
             * 获取2个矢量的距离
             * 
             * @param {Vector2} v1 第一个矢量
             * @param {Vector2} v2 第二个矢量
             * 
             * @returns {Number} 距离
             */
            distance: function (v1, v2) {
                return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
            },
            /**
             * 比较2个矢量
             * 
             * @param {Vector2} v1 第一个矢量
             * @param {Vector2} v2 第二个矢量
             * 
             * @returns {Vector2} 结果
             */
            compare: function (v1, v2) {
                var xd = v1.x - v2.x,
                    xda = Math.abs(xd),
                    yd = v1.y - v2.y,
                    yda = Math.abs(yd);
                return new Vector2(xd / xda, yd / yda);
            },
            /**
             * 比较2个矢量是否相等
             * 
             * @param {Vector2} v1 第一个矢量
             * @param {Vector2} v2 第二个矢量
             * 
             * @returns {Boolean} 
             */
            equals: function (v1, v2) {
                var c = Vector2.compare(v1, v2);
                return c.x === 0 && c.y === 0;
            },
            /**
             * 获取2个矢量的点积
             * 
             * @param {Vector2} v1 第一个矢量
             * @param {Vector2} v2 第二个矢量
             * 
             * @returns {Number} 
             */
            dot: function (v1, v2) {
                return v1.x * v2.x + v1.y * v2.y;
            },
            /**
             * 获取2个矢量间的线性插值
             * 
             * @param {Vector2} v1 第一个矢量
             * @param {Vector2} v2 第二个矢量
             * @param {Number} amount 一个 0.00 ~ 1.00 的线性增量 0.00 = v1, 1.00 = v2
             * 
             * @returns {Vector2} 结果
             */
            lerp: function (v1, v2, amount) {
                var a = (amount > 1 ? 1 : (amount < 0 ? 0 : amount)) || 0;
                return v1.addition(v2.subtract(v1).multiply(amount));
            },
            /**
             * 矢量范围限定
             * 
             * @param {Vector2} v 矢量
             * @param {Vector2} min 最小边界矢量
             * @param {Vector2} max 最大边界矢量
             * 
             * @returns {Vector2} 
             */
            clamp: function (v, min, max) {
                var x = Math.max(Math.min(v.x, max.x), min.x),
                    y = Math.max(Math.min(v.y, max.y), min.y);
                return new Vector2(x, y);
            },
            /**
             * 获取2个矢量的最大值
             * 
             * @param {Vector2} v1 第一个矢量
             * @param {Vector2} v2 第二个矢量
             * 
             * @returns {Vector2}
             */
            max: function (v1, v2) {
                return new Vector2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
            },
            /**
            * 获取2个矢量的最小值
            * 
            * @param {Vector2} v1 第一个矢量
            * @param {Vector2} v2 第二个矢量
            * 
            * @returns {Vector2}
            */
            min: function (v1, v2) {
                return new Vector2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
            },
            /**
            * 获取2个矢量的中间值
            * 
            * @param {Vector2} v1 第一个矢量
            * @param {Vector2} v2 第二个矢量
            * 
            * @returns {Vector2}
            */
            mid: function (v1, v2) {
                var min = Vector2.min(v1, v2), max = Vector2.max(v1, v2);
                return max.subtract(min).divide(2).addition(min);
            },
            /**
             * 获取矢量的趋势
             * 
             * @param {Vector2} v 一个矢量
             * 
             * @returns {Vector2} 趋势
             */
            trend: function (v) {
                return new Vector2(v.x / Math.abs(v.x), v.y / Math.abs(v.y));
            },
            ZERO: new Vector2(0, 0),
            ORIGIN: new Vector2(0, 0),
            ONE: new Vector2(1, 1),
            LEFT: new Vector2(-1, 0),
            RIGHT: new Vector2(1, 0),
            TOP: new Vector2(0, -1),
            BOTTOM: new Vector2(0, 1),
        });

        //#endregion

        //#region Rect

        /**
        * 表示一个矩形区域
        */
        var Rect = E$.klass({
            /**
            * 构造矩形
            * 
            * @param {Vector2} position 矩形位置
            * @param {Vector2} size 矩形尺寸
            */
            ctor: function (position, size) {
                this.position = position;
                this.size = size;
            },
            /**
            * 位置
            * 
            * @type {Vector2}
            * @default Vector2.ORIGIN
            */
            position: Vector2.ORIGIN,
            /**
            * 尺寸
            * 
            * @type {Vector2}
            * @default Vector2.ORIGIN
            */
            size: Vector2.ORIGIN,
            /**
            * 触碰测试
            * 
            * @param {Vector2} position 要测试的位置
            * @returns {Boolean}
            */
            hitTest: function (position) {
                if (this.position.x > position.x || (this.position.x + this.size.x) < position.x) {
                    return false;
                }
                if (this.position.y > position.y || (this.position.y + this.size.y) < position.y) {
                    return false;
                }
                return true;
            },
        });

        Rect.NONE = new Rect(Vector2.ORIGIN, Vector2.ORIGIN);

        //#endregion

        //#region Range

        /**
        * 表示一个范围
        */
        var Range = E$.klass({
            /**
            * 构造
            * 
            * @param {Vector2} min 范围的最小值
            * @param {Vector2} max 范围的最大值
            */
            ctor: function (min, max) {
                this.min = min;
                this.max = max;
            },
            /**
            * 范围的最小值
            * 
            * @type {Vector2}
            * @default Vector2.ORIGIN
            */
            min: Vector2.ORIGIN,
            /**
            * 范围的最大值
            * 
            * @type {Vector2}
            * @default Vector2.ORIGIN
            */
            max: Vector2.ORIGIN,
        });

        Range.NONE = new Range(Vector2.ORIGIN, Vector2.ORIGIN);

        //#endregion

        E$.extends(structs, {
            Vector2: Vector2,
            Rect: Rect,
            Range: Range,
        });
    });

})(EES);

/**
 * Basic Helpers
 */
(function (E$) {
    'use strict';

    /**
     * XML对象 转换为 JSON对象
     * 网络搜集
     */
    function xmlToJson(xml) {
        // Create the return object 
        var obj = {};

        if (xml.nodeType === 1) { // element 
            // do attributes 
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType === 3) { // text 
            obj = xml.nodeValue;
        }

        // do children 
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof (obj[nodeName]) === "undefined") {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (typeof (obj[nodeName].length) === "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        }
        return obj;
    }

    S$.xmlToJson = xmlToJson;

    var formatRE = /\{(\d+)\}/ig,
        propFormatRE = /\{(\w+)\}/ig,
        advPropsFormatRE = /\{(\w+(?:\.\w+)*)\}/ig;

    E$(String).staExtra({
        /**
         * 基础字符串格式化
         * 
         * @param {String} format 字符串格式
         * @param {Array|Object...} args 
         * 
         * @returns {String}
         */
        format: function (format, args) {
            var source = E$.isArray(args) && arguments.length === 2 ? args : S$.ap.slice.call(arguments, 1);
            return S$.sp.replace.call(format || '', formatRE, function (a, b) {
                return source[parseInt(b)];
            });
        },
        /**
         * 对象属性数据字符串格式化
         *  
         * @param {String} format 字符串格式
         * @param {Object} obj 数据源对象
         * 
         * @returns {String}
         */
        propsFormat: function (format, obj) {
            return S$.sp.replace.call(format || '', propFormatRE, function (a, b) {
                return obj[b];
            });
        },
        /**
         * 高级对象属性字符串格式化
         * 
         * @param {String} format 字符串格式
         * @param {Object} obj 数据源对象
         */
        advPropsFormat: function (format, obj) {
            return S$.sp.replace.call(format || '', advPropsFormatRE, function (a, b) {
                //_Else.Event_.a1.b2.c3 format
                var s = (b || '').split('.'), last = obj;
                for (var i = 0; i < s.length; i++) {
                    last = last[s[i]];
                    if (last === null || last === undefined) {
                        return b;
                    }
                }
                return last;
            });
        },
        /**
         * 移除字符串中的空白 [\r\n\t]
         * 
         * @param {String} val 数据源字符串
         * 
         * @returns {String}
         */
        trimWhitespace: function (val) {
            return S$.sp.replace.call(val, /[\r\n\t]/g, '');
        },
    });

    E$.extends({
        /**
         * Log
         * 
         * @param {Boolean?} trace 是否输出跟踪信息
         * @param {String} format 格式字符串
         * @param {Object} args 要格式化的对象
         */
        log: function (trace, format, args) {
            if (!E$.isDebugging) {
                return;
            }

            var _params = S$.ap.slice.call(arguments), t;

            if (trace === true) {
                _params.shift();
                t = true;
            }
            console.groupCollapsed('E$.log(' + (function (p) {
                var r = []; for (var i = 0; i < p.length; i++) {
                    r.push(S$.getType(p[i]));
                }
                return r.toString();
            })(_params) + '):arguments[' + (_params.length - 1) + ']');
            if (E$.log.expandArray === true && E$.isArray(_params[0])) {
                var _p = _params.shift();
                E$.each(_p, function (i, v) {
                    console.debug.apply(this, [v].concat(_params));
                });
            } else {
                console.debug.apply(this, _params);
            }
            if (t || EES.log.tracing === true) {
                console.trace();
            }
            console.groupEnd();
        },
        defaults: function (defaultValues, values) {
            if (!E$.isObject(values)) {
                throw new Error('Values is not a object');
            }

            var result = E$.clone(defaultValues);
            if (!result) {
                throw new Error('Default values is not a object.');
            }
            if (!values) {
                return result;
            }
            return E$.extends({}, defaultValues, values);
        },
        equals: function (obj1, obj2) {
            var nullEq = obj1 === null && obj2 === null;
            var undefinedEq = obj1 === undefined && obj2 === undefined;

            if (nullEq || undefinedEq) {
                return true;
            }

            var type1 = S$.getType(obj1), type2 = S$.getType(obj2);

            if (type1 === 'object' && type2 === 'object') {
                var result = true;
                for (var key in obj1) {
                    if (!E$.equals(obj1[key], obj2[key])) {
                        result = false;
                        break;
                    }
                }
                if (!result) {
                    return false;
                }
                for (var key2 in obj2) {
                    if (!E$.equals(obj1[key2], obj2[key2])) {
                        result = false;
                        break;
                    }
                }
                return result;
            } else if (type1 === 'array' && type2 === 'array') {
                if (obj1.length !== obj2.length) {
                    return false;
                }
                for (var i = 0; i < obj1.length; i++) {
                    if (!E$.equals(obj1[i], obj2[i])) {
                        return false;
                    }
                }
                return true;
            } else if (type1 === 'function' && type2 === 'function') {
                return obj1.prototype.constructor === obj2.prototype.constructor;
            }

            return obj1 === obj2;
        },
        proxy: function (fn, context) {
            var tmp, args, proxy;

            if (typeof context === "string") {
                tmp = fn[context];
                context = fn;
                fn = tmp;
            }

            if (!E$.isFunction(fn)) {
                return undefined;
            }

            args = S$.ap.slice.call(arguments, 2);
            proxy = function () {
                return fn.apply(context || this, args.concat(S$.ap.slice.call(arguments)));
            };

            return proxy;
        },
        ready: (function (d) {

            var readyList = new E$.components.collections.List(),
                isReady = false,
                handle = function () {
                    isReady = true;
                    d.removeEventListener('DOMContentLoaded', handle);
                    window.removeEventListener('load', handle);
                    E$.each(readyList, function (i, fn) {
                        fn();
                    });
                    readyList.clear();
                    readyList = null;
                };

            d.addEventListener('DOMContentLoaded', handle);
            window.addEventListener('load', handle);

            return function (fn) {
                if (isReady) {
                    fn();
                } else {
                    readyList.add(fn);
                }
            };
        })(document),
        newId: function (prefix) {
            prefix = prefix || '';
            var ms = Date.now();
            return prefix + ms + '_' + (Math.floor(Math.random() * 100000) % 10001);
        },
        randomRange: function (min, max) {
            var _min = Math.min(min, max), _max = Math.max(min, max);
            return Math.random() * (_max - _min) + _min;
        },
        memberwiseClone: function (container, targets) {
            if (arguments.length > 2) {
                for (var i = 1; i < arguments.length; i++) {
                    EES.memberWiseClone(container, arguments[i]);
                }
            } else if (arguments.length === 2) {
                for (var key in targets) {
                    container[key] = targets[key];
                }
            }
        },
        clone: function (obj) {
            if (!EES.isObject(obj)) {
                return null;
            }
            var Fn = function () { };
            Fn.prototype = obj;
            return new Fn();
        },
        deepClone: function (obj) {
            if (!obj) {
                return null;
            }
            var objClone;
            if (obj.constructor === Object) {
                objClone = new obj.constructor();
            } else {
                objClone = new obj.constructor(obj.valueOf());
            }
            for (var key in obj) {
                if (objClone[key] !== obj[key]) {
                    if (EES.isObject(obj[key])) {
                        objClone[key] = EES.deepClone(obj[key]);
                    } else {
                        objClone[key] = obj[key];
                    }
                }
            }
            objClone.toString = obj.toString;
            objClone.valueOf = obj.valueOf;
            return objClone;
        },
    });

    E$.log.expandArray =
    E$.log.tracing = false;

})(EES);

/**
 * Basic Behavior Pattern
 */
(function (E$) {
    'use strict';

    /**
     * Observers
     * 
     * @namespace E$.observers
     */
    E$.namespace('E$.observers', function (ns) {

        var dispatch = function (listener, obj, name, act, params) {
            if (listener && E$.isObject(listener)) {
                listener = listener[name + act];
                if (E$.isFunction(listener)) {
                    listener(obj, name, act, params);
                }
            } else if (E$.isFunction(listener)) {
                listener(obj, name, act, params);
            } else {
                E$(obj).dispatch(name + act, S$.ap.slice.call(arguments, 1));
            }
        };

        var property = function (obj, name, listener) {
            if (!obj || !E$.isObject(obj) || name === 'getRegistedEvents') {
                return;
            }

            var fakeProperty = obj[name];

            Object.defineProperty(obj, name, {
                get: function () {
                    dispatch(listener, obj, name, '$get', fakeProperty);
                    return fakeProperty;
                },
                set: function (val) {
                    fakeProperty = val;
                    dispatch(listener, obj, name, '$set', fakeProperty);
                },
            });
        };

        var method = function (obj, name, listener) {
            if (!obj || !E$.isObject(obj) || name === 'getRegistedEvents') {
                return;
            }

            var fakeFn = obj[name];

            obj[name] = function () {
                var _args = S$.ap.slice.call(arguments, 0);
                dispatch(listener, obj, name, '$call', _args);
                return fakeFn && fakeFn.apply(obj, _args);
            };
        };

        var member = function (obj, name, listener) {
            if (!obj || !E$.isObject(obj) || name === 'getRegistedEvents') {
                return;
            }
            var member = obj[name];
            if (!!member) {
                var proc = E$.isFunction(member) ? method : property;
                proc(obj, name, listener);
            }
        };

        var objObservable = function (obj, listener) {
            var members = E$.reflections.utilities.getMemberInfos(obj);
            E$.each(members.properties, function (pIndex, pName) {
                property(obj, pName.name, listener);
            });
            E$.each(members.methods, function (fi, fv) {
                method(obj, fv.name, listener);
            });
        };

        E$.extends(ns, {
            property: property,
            method: method,
            member: member,
            objObservable: objObservable,
        });

        E$.oWrapper.extends({
            observable: function (listener) {
                return this.each(function (i, v) {
                    objObservable(v, listener);
                });
            },
        });

    });

    /**
     * Aspect weaver
     * 
     * @namespace E$.aop
     */
    E$.namespace('E$.aop', function (ns) {

        Function.prototype.before = function (func) {
            var _self = this;
            return function () {
                if (func.apply(this, arguments) === false) {
                    return false;
                }
                return _self.apply(this, arguments);
            };
        };

        Function.prototype.after = function (func) {
            var _self = this;
            return function () {
                var ret = _self.apply(this, arguments);
                if (ret === false) {
                    return false;
                }
                func.apply(this, arguments);
                return ret;
            };
        };

        var mergeArgs = function (a1, an) {
            var _args = arguments.length === 2 && E$.isArray(an) ? an : S$.ap.slice.call(arguments, 1);
            return _args.concat(S$.ap.slice.call(a1));
        };

        var wrapper = function (fake, scope) {
            var aspect = new E$.components.collections.List(), doneAdvisor;

            return {
                before: function (advice) {
                    if (E$.isFunction(advice)) {
                        aspect.add({
                            priority: -1,
                            callback: advice,
                            args: "advice:before",
                        });
                    }
                    return this;
                },
                after: function (advice) {
                    if (E$.isFunction(advice)) {
                        aspect.add({
                            priority: 1,
                            callback: advice,
                            args: "advice:after",
                        });
                    }
                    return this;
                },
                around: function (advice) {
                    if (E$.isFunction(advice)) {
                        aspect.add({
                            priority: -2,
                            callback: advice,
                            args: "advice:around:before",
                        }, {
                            priority: 2,
                            callback: advice,
                            args: "advice:around:after",
                        });
                    }
                    return this;
                },
                done: function (advice) {
                    if (E$.isFunction(advice)) {
                        doneAdvisor = advice;
                    }
                    return this;
                },
                error: function (advice) {
                    if (E$.isFunction(advice)) {
                        aspect.add({
                            priority: 0,
                            callback: function () {
                                try {
                                    return fake.apply(this, arguments);
                                } catch (e) {
                                    return advice.apply(this, mergeArgs(arguments, ["advice:error", e]));
                                }
                            },
                        });
                    }
                    return this;
                },
                weave: function () {
                    if (aspect.count(function (v) { return v.priority === 0; }) === 0) {
                        aspect.add({
                            priority: 0,
                            callback: function () {
                                return fake.apply(this, arguments);
                            },
                        });
                    }
                    aspect.sort(function (a, b) {
                        return a.priority - b.priority;
                    });
                    E$.log(true, 'aop.weaver: weave cut point {0}', aspect.length - 1);
                    return function () {
                        var _self = scope || this, ret, args = S$.ap.slice.call(arguments);
                        for (var i = 0; i < aspect.length; i++) {
                            var _advicsor = aspect[i];
                            if (_advicsor.priority === 0) {
                                ret = _advicsor.callback.apply(_self, args);
                            } else {
                                var ret$ = _advicsor.callback.apply(_self, mergeArgs(args, _advicsor.args));
                                if (ret$ === C$.RETURN) {
                                    if (doneAdvisor) {
                                        doneAdvisor.apply(_self, mergeArgs(args, "advice:done"));
                                    }
                                    return ret;
                                } else if (ret$ === C$.BREAK) {
                                    break;
                                }
                            }
                        }
                        if (doneAdvisor) {
                            doneAdvisor.apply(_self, mergeArgs(args, "advice:done"));
                        }
                        return ret;
                    };
                },
            };
        };

        var weaver = function (fn, context) {
            if (E$.isFunction(fn)) {
                return wrapper(fn, context);
            } else if (E$.isString(fn) && E$.notNullAndUndefined(context) && E$.isFunction(context[fn])) {
                return wrapper(context[fn], context);
            } else {
                var member = E$.isFunction(fn) ? (fn.name || "anonymous") : fn;
                E$.log("aspect weave [{0}] faild. on scope:", member);
                E$.log(context);
                return;
            }
        };

        ns.weaver = weaver;

    });

})(EES);

/**
 * Basic Encoding
 */
(function (E$) {
    'use strict';

    /**
     * UTF and Base64 convert 
     * 
     * @namespace E$.encoding.(utf|base64)
     */
    E$.namespace('E$.encoding', function (ns) {
        /**
        * 网络搜集
        * UTF16和UTF8转换对照表
        * U+00000000 – U+0000007F   0xxxxxxx
        * U+00000080 – U+000007FF   110xxxxx 10xxxxxx
        * U+00000800 – U+0000FFFF   1110xxxx 10xxxxxx 10xxxxxx
        * U+00010000 – U+001FFFFF   11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        * U+00200000 – U+03FFFFFF   111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        * U+04000000 – U+7FFFFFFF   1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
        */

        var utf16To8 = function (str) {
            var res = [], len = str.length;
            for (var i = 0; i < len; i++) {
                var code = str.charCodeAt(i), byte1, byte2, byte3;
                if (code > 0x0000 && code <= 0x007F) {
                    // 单字节，这里并不考虑0x0000，因为它是空字节
                    // U+00000000 – U+0000007F  0xxxxxxx
                    res.push(str.charAt(i));
                } else if (code >= 0x0080 && code <= 0x07FF) {
                    // 双字节
                    // U+00000080 – U+000007FF  110xxxxx 10xxxxxx
                    // 110xxxxx
                    byte1 = 0xC0 | ((code >> 6) & 0x1F);
                    // 10xxxxxx
                    byte2 = 0x80 | (code & 0x3F);
                    res.push(
                        String.fromCharCode(byte1),
                        String.fromCharCode(byte2)
                    );
                } else if (code >= 0x0800 && code <= 0xFFFF) {
                    // 三字节
                    // U+00000800 – U+0000FFFF  1110xxxx 10xxxxxx 10xxxxxx
                    // 1110xxxx
                    byte1 = 0xE0 | ((code >> 12) & 0x0F);
                    // 10xxxxxx
                    byte2 = 0x80 | ((code >> 6) & 0x3F);
                    // 10xxxxxx
                    byte3 = 0x80 | (code & 0x3F);
                    res.push(
                        String.fromCharCode(byte1),
                        String.fromCharCode(byte2),
                        String.fromCharCode(byte3)
                    );
                } else if (code >= 0x00010000 && code <= 0x001FFFFF) {
                    // 四字节
                    // U+00010000 – U+001FFFFF  11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
                } else if (code >= 0x00200000 && code <= 0x03FFFFFF) {
                    // 五字节
                    // U+00200000 – U+03FFFFFF  111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
                } else /** if (code >= 0x04000000 && code <= 0x7FFFFFFF)*/ {
                    // 六字节
                    // U+04000000 – U+7FFFFFFF  1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
                }
            }

            return res.join('');
        };
        var utf8To16 = function (str) {
            var res = [], len = str.length;
            var i = 0;
            for (; i < len; i++) {
                var code = str.charCodeAt(i), byte1, byte2, code2, code3, utf16;
                // 对第一个字节进行判断
                if (((code >> 7) & 0xFF) === 0x0) {
                    // 单字节
                    // 0xxxxxxx
                    res.push(str.charAt(i));
                } else if (((code >> 5) & 0xFF) === 0x6) {
                    // 双字节
                    // 110xxxxx 10xxxxxx
                    code2 = str.charCodeAt(++i);
                    byte1 = (code & 0x1F) << 6;
                    byte2 = code2 & 0x3F;
                    utf16 = byte1 | byte2;
                    res.push(Sting.fromCharCode(utf16));
                } else if (((code >> 4) & 0xFF) === 0xE) {
                    // 三字节
                    // 1110xxxx 10xxxxxx 10xxxxxx
                    code2 = str.charCodeAt(++i);
                    code3 = str.charCodeAt(++i);
                    byte1 = (code << 4) | ((code2 >> 2) & 0x0F);
                    byte2 = ((code2 & 0x03) << 6) | (code3 & 0x3F);
                    utf16 = ((byte1 & 0x00FF) << 8) | byte2;
                    res.push(String.fromCharCode(utf16));
                } else if (((code >> 3) & 0xFF) === 0x1E) {
                    // 四字节
                    // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
                } else if (((code >> 2) & 0xFF) === 0x3E) {
                    // 五字节
                    // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
                } else /** if (((code >> 1) & 0xFF) == 0x7E)*/ {
                    // 六字节
                    // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
                }
            }

            return res.join('');
        };

        // 转码表
        var table = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
            'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
            'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
            'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
            'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
            'w', 'x', 'y', 'z', '0', '1', '2', '3',
            '4', '5', '6', '7', '8', '9', '+', '/'
        ];

        var base64 = {
            encode: function (str) {
                if (!str) {
                    return '';
                }
                var utf8 = utf16To8(str); // 转成UTF8
                var i = 0; // 遍历索引
                var len = utf8.length;
                var res = [];
                while (i < len) {
                    var c1 = utf8.charCodeAt(i++) & 0xFF;
                    res.push(table[c1 >> 2]);
                    // 需要补2个=
                    if (i === len) {
                        res.push(table[(c1 & 0x3) << 4]);
                        res.push('==');
                        break;
                    }
                    var c2 = utf8.charCodeAt(i++);
                    // 需要补1个=
                    if (i === len) {
                        res.push(table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);
                        res.push(table[(c2 & 0x0F) << 2]);
                        res.push('=');
                        break;
                    }
                    var c3 = utf8.charCodeAt(i++);
                    res.push(table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);
                    res.push(table[((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6)]);
                    res.push(table[c3 & 0x3F]);
                }

                return res.join('');
            },
            decode: function (str) {
                if (!str) {
                    return '';
                }

                var len = str.length, code1, code2, code3, code4, c1, c2, c3;
                var i = 0;
                var res = [];

                while (i < len) {
                    code1 = table.indexOf(str.charAt(i++));
                    code2 = table.indexOf(str.charAt(i++));
                    code3 = table.indexOf(str.charAt(i++));
                    code4 = table.indexOf(str.charAt(i++));

                    c1 = (code1 << 2) | (code2 >> 4);
                    c2 = ((code2 & 0xF) << 4) | (code3 >> 2);
                    c3 = ((code3 & 0x3) << 6) | code4;

                    res.push(String.fromCharCode(c1));

                    if (code3 !== 64) {
                        res.push(String.fromCharCode(c2));
                    }
                    if (code4 !== 64) {
                        res.push(String.fromCharCode(c3));
                    }

                }

                return utf8To16(res.join(''));
            }
        };

        E$.extends(ns, {
            utf: {
                utf16To8: utf16To8,
                utf8To16: utf8To16,
            },
            base64: base64,
        });

    });

})(EES);

/**
 * Modify native implement
 */
(function () {

    var __debug = console.debug || function () {
    };

    console.debug = function (format, args) {
        if (arguments.length === 1) {
            return __debug.call(console, format);
        } else if (arguments.length === 2 && E$.isObject(args)) {
            return __debug.call(console, String.propsFormat(format, args));
        } else {
            return __debug.call(console, String.format.apply(console, arguments));
        }
    };

})();

/**
 * Wrapper extensions
 */
(function (E$) {
    'use strict';

    E$.dWrapper.extends({
        addClass: function (value) {
            var clas = E$((value || '').match(/\S+/g) || [""]).trim();
            return this.each(function (i, v) {

                if (v.nodeType === 1) {
                    var ol = new E$.components.collections.List(v.classList), oc, cc;
                    ol.sort();
                    oc = ol.toString(' ');
                    clas.each(function (_i, _v) {
                        if (!ol.contains(_v)) {
                            ol.add(_v);
                        }
                    });

                    ol.sort();
                    cc = ol.toString(' ');
                    if (oc !== cc) {
                        v.className = cc;
                    }
                }
            });
        },
        removeClass: function (value) {
            var clas = E$((value || '').match(/\S+/g) || [""]).trim();
            return this.each(function (i, v) {

                if (v.nodeType === 1) {

                    var ol = new E$.components.collections.List(v.classList), oc, cc;
                    ol.sort();
                    oc = ol.toString(' ');
                    clas.each(function (_i, _v) {
                        if (ol.contains(_v)) {
                            ol.remove(_v);
                        }
                    });

                    cc = ol.toString(' ');
                    if (oc !== cc) {
                        v.className = cc;
                    }
                }

            });
        },
    });

})(EES);
