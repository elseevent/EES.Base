/// <reference path="../../../jQuery/jquery-2.1.0.js" />
/// <reference path="../../EES.Base.2.js" />

(function ($, E$) {

    E$.namespace('E$.ui.controls', function (ns) {

        var UIControlBase = E$.klass({
            ctor: function (options) {
                this.container = options.container;
                this.attr = options.attr || {};
                this.clas = options.clas || '';
                this.style = options.style || {};
                this.options = options;
            },
            attr: {},
            container: null,
            clas: '',
            style: {},
            options: {},
            renderBase: function ($item) {
                if (!!this.clas) {
                    $item.addClass(this.clas);
                }

                if (!!this.style) {
                    $item.css(this.style);
                }

                if (!!this.attr) {
                    $item.attr(this.attr);
                }
            },
        });

        UIControlBase.renderBase = function (container, attr, clas, style) {

            if (arguments.length === 2 && arguments[1] instanceof UIControlBase) {
                var ctrl = arguments[1];
                $(container).addClass(ctrl.clas).css(ctrl.css).attr(ctrl.attr);
            } else if (!!container) {
                $(container).addClass(clas).css(style).attr(attr);
            }

        };

        ns.UIControlBase = UIControlBase;

    });

})(jQuery, EES);