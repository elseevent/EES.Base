(function (w) {

    var ua = w.navigator.userAgent, p = w.navigator.platform;

    w.browser = {
        getVersion: function () { return (ua.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || []); },
        isSafari: function () { return (/Safari/gi).test(w.navigator.appVersion); },
        isWebkit: function () { return (/webkit/i).test(ua); },
        isOpera: function () { return (/opera/i).test(ua); },
        isMsIE: function () { return (/msie/i).test(ua) && !this.opera; },
        isChrome: function () { return (/Chrome/i).test(ua); },
        isFirefox: function () { return (/Firefox/i).test(ua); },
        isFennec: function () { return (/Fennec/i).test(ua); },
        isMozilla: function () { return (/mozilla/i).test(ua) && !/(compatible|webkit)/.test(ua); },
        isAndroid: function () { return (/android/i).test(ua); },
        isAndroidMobile: function () { return (/armv\d/gi).test(p); },
        isBlackBerry: function () { return (/blackberry/i).test(ua); },
        isIOS: function () { return (/iphone|ipod|ipad/gi).test(p); },
        isIPhone: function () { return (/ipad/gi).test(p); },
        isIPad: function () { return (/iphone/gi).test(p); },
        isIPod: function () { return (/ipod/gi).test(p); },
    };

    if (w.jQuery)
        w.jQuery.browser = w.browser;

    if (w.EES && w.EES.helpers) {
        w.EES.helpers.browser = browser;
    }

})(window);