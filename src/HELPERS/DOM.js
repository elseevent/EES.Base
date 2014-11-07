/// <reference path="../jQuery/jquery-1.9.1.js" />
/// <reference path="../EES.Base.2.js" />

(function ($, E$) {

    E$.namespace('E$.helpers.dom', function (dom) {

        var SCRIPTCREATIONDEF = {
            id: '',
            src: '',
            type: 'text/javascript',
            anchor: document.body,
        };
        var LINKCREATIONDEF = {
            id: '',
            href: '',
            type: 'text/css',
            rel: 'stylesheet',
            anchor: document.head,
        };


        E$(dom).extra({
            removeLinkReference: function (id, callback) {
                $('link[id="' + id + '"]').remove();
                if (callback)
                    callback();
            },
            removeScriptReference: function (id, callback) {
                $('script[id="' + id + '"]').remove();
                if (callback)
                    callback();
            },
            removeStyleReference: function (id, callback) {
                $('style[id="' + id + '"]').remove();
                if (callback)
                    callback();
            },
            createScriptReference: function (options) {
                if (E$.isString(options))
                    options = { href: options };
                var _opt = E$.defaults(SCRIPTCREATIONDEF, options);
                var tag = document.createElement("script");
                if (_opt.id)
                    tag.id = _opt.id;
                tag.src = _opt.src;
                tag.type = _opt.type;
                (_opt.anchor && _opt.anchor.nodeName != 'HEAD') ? _opt.anchor.parentNode.insertBefore(tag, _opt.anchor) : document.body.appendChild(tag);
            },
            createLinkReference: function (options) {
                if (E$.isString(options))
                    options = { href: options };
                var _opt = E$.defaults(LINKCREATIONDEF, options);
                var tag = document.createElement("link");
                if (_opt.id)
                    tag.id = _opt.id;
                tag.href = _opt.href;
                tag.type = _opt.type;
                tag.rel = _opt.rel;
                (_opt.anchor && _opt.anchor.nodeName != 'HEAD') ? _opt.anchor.parentNode.insertBefore(tag, _opt.anchor) : document.head.appendChild(tag);
            },
        });

    });

})(jQuery, EES);