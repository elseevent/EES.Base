/// <reference path="../Scripts/jQuery/jquery-2.1.0.js" />
/// <reference path="../Scripts/EES/EES.Base.2.js" />
/// <reference path="AppEnvironment.js" />

(function ($, E$) {

    var Vector2 = E$.structs.Vector2;

    var ResponsiveBtn = E$.klass({
        ctor: function (btnTmpl, position, size, percent, onClick) {
            var p = (position || Vector2.ZERO).multiply(percent || 1),
                s = (size || Vector2.ZERO).multiply(percent || 1);

            this.el = $(btnTmpl).css({
                width: s.x,
                height: s.y,
                left: p.x,
                top: p.y,
            }).button(onClick);
        },
        el: null,
        getEl: function () {
            return this.el;
        },
    });

    E$.extends(E$.components, {
        ResponsiveBtn: ResponsiveBtn,
    });

})(jQuery, EES);