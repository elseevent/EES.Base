/// <reference path="../jquery-1.8.3.min.js" />
/// <reference path="../jQuery/plugin/tmpl/jquery.tmpl.js" />
/// <reference path="../jQuery/plugin/tmpl/jquery.tmplPlus.js" />
/// <reference path="../EES.Base.2.js" />

(function ($, E$) {

    E$.namespace('E$.helpers.tmpl', function (tmpl) {

        E$(tmpl).extra({
            safeRemove: function (root, callback) {
                this.removeImagesUnder(root);
                setTimeout(function () {
                    $(root).remove();
                    if (callback)
                        callback();
                }, 10);
            },
            safeEmpty: function (root, callback) {
                this.removeImagesUnder(root);
                setTimeout(function () {
                    $(root).empty();
                    if (callback) {
                        setTimeout(callback, 10);
                    }

                }, 10);
            },
            removeImagesUnder: function (root) {
                $('img', root).each(function () {
                    this.src = "";
                });
            },
            whenLoaded: function (element, callback) {
                $(element).load(function () {
                    var el = this;
                    setTimeout(function () {
                        if (callback)
                            callback(el);
                    }, 10);

                    return false;
                }).each(function () {
                    if (this.complete && this.naturalWidth != 0)
                        $(this).trigger('load');
                });
            },
            whenFuckingLoaded: function (element, callback) {
                $(element).load(function () {
                    var el = this;
                    setTimeout(function () {
                        if (callback)
                            callback(el);
                    }, 10);

                    return false;
                }).each(function () {
                    if (this.complete)
                        $(this).trigger('load');
                });
            },
            procTmpl: function (tmpl, data, options, callback) {
                var $result = $.tmpl(tmpl, data, options);
                if ($result.length > 0) {
                    if (callback)
                        callback($result);
                    return;
                }

                var timer = setInterval(function () {
                    var $result = $.tmpl(tmpl, data, options);
                    if ($result.length > 0) {
                        clearInterval(timer);
                        if (callback)
                            callback($result);
                    }
                }, 100);
            },
            procTmpl_: function (optionsObj) {
                return this.procTmpl(optionsObj.tmpl, optionsObj.data, optionsObj.options, optionsObj.callback);
            },
            whenAllImagesLoaded: function (root, callback) {
                var images = $(root).find('img');
                var count = images.length;
                for (var i = 0; i < images.length; i++) {
                    this.whenLoaded($(images[i]), function () {
                        count--;
                        if (count == 0 && callback)
                            setTimeout(callback, 10);
                    });
                }
            }
        });
    });

})(jQuery, EES);