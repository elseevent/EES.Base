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
/// <reference path="../../../jQuery/jquery-2.1.0.js" />
/// <reference path="../../EES.Base.2.js" />
/// <reference path="UIControlBase.js" />


(function ($, E$) {

    E$.namespace('E$.ui.controls.gridColumns', function (ns) {

        var UIGridColumnBase = E$.klass(E$.ui.controls.UIControlBase, {
            ctor: function (options) {
                UIGridColumnBase.Base.ctor.apply(this, arguments);
                this.headerText = options.headerText || '';
                this.name = options.name || '';
                this.disabled = options.disabled;
            },
            name: '',
            headerText: '',
            columnIndex: 0,
            disabled: false,
            createHeaderCell: function (headerText) {
                var $ret = $('<td />').html(headerText || this.headerText);
                this.renderBase($ret);
                return $ret;
            },
            createCell: function (rowIndex, data) { }
        });
        var UIGridCheckBoxColumn = E$.klass(UIGridColumnBase, {
            ctor: function (options) {
                UIGridCheckBoxColumn.Base.ctor.apply(this, arguments);
                this.name = options.name || 'id';
            },
            createHeaderCell: function () {
                var $ret = $('<td />').append($('<input type="checkbox" />').click(function () {
                    var selector = String.format('tbody td:nth-child({0}) :checkbox', $(this).parent().index() + 1);
                    var target = this;
                    $(this).parents('table').find(selector).each(function (i, v) {
                        v.checked = target.checked;
                        $(v).attr('checked', target.checked);
                    });
                }));
                this.renderBase($ret);
                return $ret;
            },
            createCell: function (rowIndex, data) {
                var $ret = $('<td />').append($(String.format('<input type="checkbox" name="{0}" value="{1}" />', this.name, data[this.name])));
                this.renderBase($ret);
                return $ret;
            },
        });
        var UIGridBindColumn = E$.klass(UIGridColumnBase, {
            ctor: function (options) {
                UIGridBindColumn.Base.ctor.apply(this, arguments);
            },
            createCell: function (rowIndex, data) {
                var value = data[this.name];
                var $ret = $('<td />').html(value);
                this.renderBase($ret);
                return $ret;
            },
        });
        var UIGridTmplColumn = E$.klass(UIGridColumnBase, {
            ctor: function (options) {
                UIGridTmplColumn.Base.ctor.apply(this, arguments);
                this.tmpl = options.tmpl;
                this.tmplConverter = options.tmplConverter || String.advPropsFormat;
            },
            tmpl: '',
            tmplConverter: function (formatStr, obj, rowIndex) { },
            createCell: function (rowIndex, data) {
                var value = this.tmplConverter((this.tmpl || ''), data, rowIndex);
                var $ret = $('<td />').html(value);
                this.renderBase($ret);
                return $ret;
            },
        });
        var UIGridActionColumn = E$.klass(UIGridColumnBase, {
            ctor: function (options) {
                UIGridActionColumn.Base.ctor.apply(this, arguments);
                this.htmlText = options.htmlText;
                this.onAction = options.onAction || function (sender, e) { };
            },
            htmlText: 'Action',
            onAction: function (sender, e) { },
            createCell: function (rowIndex, data) {
                var self = this;
                var value = $('<a href="javascript:;"/>').addClass('grid-action').html(this.htmlText);
                value.click(function () {
                    if (E$.isFunction(self.onAction)) {
                        self.onAction.call(this, self, data);
                    }
                });

                var $ret = $('<td />').append(value);
                this.renderBase($ret);
                return $ret;
            },
        });

        E$.extends(ns, {
            UIGridColumnBase: UIGridColumnBase,
            UICheckBoxColumn: UIGridCheckBoxColumn,
            UIBindColumn: UIGridBindColumn,
            UITmplColumn: UIGridTmplColumn,
            UIActionColumn: UIGridActionColumn,
        });
    });

    E$.using(['E$.ui.controls', 'E$.ui.controls.gridColumns'], function (ns, cols) {

        var UIGrid = E$.klass(ns.UIControlBase, {
            ctor: function (options) {
                UIGrid.Base.ctor.apply(this, arguments);
                this.columns = new E$.components.collections.List();
                this.columns.add.apply(this.columns, options.columns);
                this.container = options.container;
                this.hasHeader = (options.hasHeader === null || options.hasHeader === undefined) ? true : !!options.hasHeader;
                E$.each(this.columns, function (index, value) {
                    value.columnIndex = index;
                });
            },
            data: {},
            columns: [],
            hasHeader: true,
            createHeader: function () {
                var $ret = $('<tr />');
                E$.each(this.columns, function (index, value) {
                    if (!value.disabled)
                        $ret.append(value.createHeaderCell());
                });
                return $ret;
            },
            createRow: function (rowIndex, data) {
                var $ret = $('<tr />');
                E$.each(this.columns, function (index, value) {
                    if (!value.disabled)
                        $ret.append(value.createCell(rowIndex, data));
                });
                return $ret;
            },
            createGrid: function (dataList) {
                var self = this;
                self.data = dataList;
                var $table = $('<table />');
                if (self.hasHeader)
                    $table.append($('<thead />').append(self.createHeader()));
                var $tbody = $('<tbody />');
                E$.each(dataList, function (index, value) {
                    $tbody.append(self.createRow(index, value));
                });
                $table.append($tbody);
                return $table;
            },
            render: function (dataList) {
                if (!dataList)
                    return;

                var $table = this.createGrid(dataList);

                this.renderBase($table, self);

                $(this.container).empty().append($table);
            }
        });

        ns.UIGrid = UIGrid;

    });

})(jQuery, EES);
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
