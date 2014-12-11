/// <reference path="../../jQuery/jquery-1.9.1.js" />
/// <reference path="../EES.Base.js" />
/// <reference path="EES.UI.Controls.Base.js" />

(function ($, E$) {

    E$.namespace('E$.ui.controls', function (ns) {

        var UIPagination = E$.klass(ns.UIControlBase, {
            ctor: function (options) {
                UIPagination.Base.ctor.apply(this, arguments);

                this.pageSize = options.pageSize || 25;
                this.numberLength = options.numberLength || 7;
                this.onChange = options.onChange || function (sender, e) { };
            },
            numberLength: 7,
            pageSize: 25,
            currentPage: 1,
            totalPage: 0,
            allCount: 0,
            onChange: function (sender, e) { },
            getExNumberLength: function () {
                return (this.numberLength - 1) / 2;
            },
            setTotalCount: function (count) {
                this.totalPage = parseInt(count / this.pageSize);
                if (count % this.pageSize > 0)
                    this.totalPage += 1;
                this.allCount = count;
            },
            createNumber: function (text, index, clas) {
                var self = this;
                var $ret = $(String.format('<a href="javascript:;">{0}</a>', text)).click(function () {
                    if (E$.isFunction(self.onChange))
                        self.onChange.call(this, self, index);
                });
                if (!!clas)
                    $ret.addClass(clas);
                return $ret;
            },
            render: function (index) {
                var self = this, $container = $('<div />'), tmp;

                if (index < 1)
                    index = 1;
                if (index > self.totalPage)
                    index = self.totalPage;

                self.currentPage = index;
                $container.append(self.createNumber('<<', 1, 'first'));
                if ((tmp = index - 1) < 1)
                    tmp = 1;
                $container.append(self.createNumber('<', tmp, 'prev'));

                var lp, gp;
                lp = gp = self.getExNumberLength();

                if (self.totalPage > self.numberLength) {
                    if ((tmp = index - 1 - lp) < 0) {
                        gp += 0 - tmp;
                    }
                    if ((tmp = index + gp) > self.totalPage) {
                        lp += tmp - self.totalPage;
                    }
                }

                for (var i = lp; i > 0; i--) {
                    if ((tmp = index - i) > 0) {
                        $container.append(self.createNumber(tmp, tmp));
                    }
                }

                $container.append(self.createNumber(index, index, 'current'));

                for (var i = 1; i <= gp; i++) {
                    if ((tmp = index + i) <= self.totalPage) {
                        $container.append(self.createNumber(tmp, tmp));
                    }
                }

                if ((tmp = index + 1) > self.totalPage)
                    tmp = self.totalPage;

                $container.append(self.createNumber('>', tmp, 'next'));

                $container.append(self.createNumber('>>', self.totalPage, 'last'));

                //$container.append("<span>总条目:" + self.allCount + "</span>");

                self.renderBase($container);

                $(self.container).empty().append($container);
            }
        });

        ns.UIPagination = UIPagination;

    });

})(jQuery, EES);