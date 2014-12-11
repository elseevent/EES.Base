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