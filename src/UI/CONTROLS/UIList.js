/// <reference path="../../../jQuery/jquery-2.1.0.js" />
/// <reference path="../../EES.Base.2.js" />
/// <reference path="UIControlBase.js" />

(function ($, E$) {

    E$.namespace('E$.ui.controls', function (ns) {

        var UIList = E$.klass(ns.UIControlBase, {
            ctor: function (options) {
                UIList.Base.ctor.apply(this, arguments);
                var self = this;
                this.tmpl = options.tmpl || '';
                this.tmplConverter = options.tmplConverter || String.propsFormat;
                this.useRowCreator = !!options.useRowCreator;
                this.rowCreator = options.rowCreator || function (data) {
                    var str = self.tmplConverter(self.tmpl || '', value);
                    return $('<div />').addClass('list-item').html(str);
                };
            },
            tmpl: '',
            tmplConverter: function (formatStr, obj) { },
            useRowCreator: false,
            rowCreator: function (data) { },
            createList: function (dataList) {
                var self = this;
                var $ret = $('<div />');
                E$.each(dataList, function (index, value) {
                    var $row;
                    if (!self.useRowCreator) {
                        var str = self.tmplConverter(self.tmpl || '', value);
                        $row = $('<div />').addClass('list-item').html(str);
                    } else {
                        $row = self.rowCreator(value);
                    }
                    $ret.append($($row));
                });
                return $ret;
            },
            render: function (dataList) {
                if (!dataList)
                    return;
                var $ret = this.createList(dataList);
                this.renderBase($ret);
                $(this.container).empty().append($ret);
            },
        });

        ns.UIList = UIList;

    });

})(jQuery, EES);