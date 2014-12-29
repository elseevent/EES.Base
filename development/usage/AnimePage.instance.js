/// <reference path="Scripts/jQuery/jquery-2.1.0.js" />
/// <reference path="Scripts/EES/EES.Base.2.js" />

(function ($, E$) {

    E$.isDebugging = true;

    for (var i = 0; i < 20; i++) {
        window['lib' + i] = {};
    }

    var modules = {
        "img": [],
        "js": [
            //'Modules/p1',
            //'Modules/p4',
            //'Modules/p6',
            //'Modules/p7',
        ]
    };

    E$.using(['E$.ui.sliders', 'E$.ui.anime.PageBase'], function (ns, Page) {

        var data = [
            new ns.StageEl('p1', 'lib1', { replay: true }),
            new ns.ImgEl(2),
            new ns.ImgEl(3),
            new ns.StageEl('p4', 'lib4'),
            new ns.ImgEl(5),
            new ns.StageEl('p6', 'lib6', { replay: true }),
            new ns.StageEl('p7', 'lib7'),
            new ns.ImgEl(8),
        ];

        E$.each(data, function (i, v) {
            if (v.type === 'img') {
                modules.img.push(v.getPath());
            } else if (v.type === 'stage') {
                modules.js.push('Modules/' + v.key);
            }
        });

        E$.ready(function () {

            E$.resource("modules", modules).load(function () {
                var page = new Page(data, {});

                window.page = page;
            });

            $(window).one('mousedown touchstart', function () {
                $('audio').get(0).play();
            });
        });

        window.data = data;
    });

})(jQuery, EES);