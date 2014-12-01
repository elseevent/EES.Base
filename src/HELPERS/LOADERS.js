/// <reference path="../EES.Base.2.js" />

(function (E$) {
    'use strict';

    E$.namespace('E$.helpers.loaders', function (loaders) {

        loaders.$GetPath = function (path, extension) {
            var regex = new RegExp("(?:(?:\\.min)?\\." + extension + ")$");
            var ret = S$.sp.replace.call(path, regex, "");
            return ret + (!E$.isDebugging ? ".min." + extension : "." + extension);
        };

        E$(loaders).extra({
            "img": function (src, onLoad) {
                var img = new Image();
                img.onload = onLoad;
                img.src = src;
                return img;
            },
            "css": function (href, onLoad) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.onload = onLoad;
                link.href = loaders.$GetPath(href, "css");
                document.head.appendChild(link);
                return link;
            },
            "js": function (src, onLoad) {
                var script = document.createElement('script');
                script.onload = onLoad;
                script.src = loaders.$GetPath(src, "js");
                document.body.appendChild(script);
                return script;
            },
            //"xml": function (src, onLoad) { },
            //"json": function (src, onLoad) { },
        });
    });

    E$.sWrapper.extends({
        /**
         * 转换为资源
         * 
         * @param {String} type 资源类型
         */
        toResource: function (type) {
            var ret = this.pushStack(this);
            ret.extends((function (loader) {
                return {
                    /**
                     * 加载资源
                     * 
                     * @param {Function} onLoad 完成加载后回调
                     */
                    load: function (onLoad) {
                        if (E$.isFunction(loader)) {
                            var queue = new E$.components.collections.Queue(this.toArray());
                            var func = function (str) {
                                loader(str, function () {
                                    if (E$.isFunction(onLoad)) {
                                        onLoad.call(this);
                                    }
                                    if (queue.count() !== 0) {
                                        func(queue.dequeue());
                                    }
                                });
                            };
                            func(queue.dequeue());
                        } else {
                            E$.log('no {0} type loader.', type);
                        }
                    },
                };
            })(E$.helpers.loaders[(type || '').toLowerCase()]));
            return ret;
        },
    });

    E$.extends({
        resource: function (name, map) {
            return {
                load: function (onLoad) {
                    var count = 0;
                    E$(map).map(function (d) {
                        var ret = [];
                        E$.each(d, function (i, v) {
                            var res = E$(v).toResource(i);
                            count += res.length;
                            ret.push(res);
                        });
                        return ret;
                    }).execute(function (v, i) {
                        var ret = [];
                        v.load(function () {
                            ret.push(this);
                            count -= 1;
                            if (0 === count) {
                                E$.log('Resource [{0}] all ok', name);
                                if (E$.isFunction(onLoad)) {
                                    onLoad(ret);
                                }
                            }
                        });
                    });
                }
            };
        }
    });

})(EES);