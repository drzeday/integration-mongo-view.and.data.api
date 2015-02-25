///////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.PieChart = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _colors = [];

    var _viewer = viewer;

    var _productsMap = {};

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.PieChart loaded');

        $(document).bind(
            'keyup', _self.onKeyup);

        _viewer.refreshPie = _self.refreshPie;

        _self.loadProducts();

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        console.log('Autodesk.ADN.Viewing.Extension.PieChart unloaded');

        $('#overlayPieDivId').remove();

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // keyup callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onKeyup = function(event){

        if (event.keyCode == 27) {

            _viewer.isolateById([]);
            _viewer.fitToView([]);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // 
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.loadProducts = function (onSuccess) {

        _productsMap = {};

        _viewer.getAllLeafComponents(

            function(components) {

                async.each(components,

                    function (component, callback) {

                        _viewer.getPropertyValue(
                            component.dbId,
                            "ProductId",
                            function (productId) {

                                if (!_productsMap[productId]) {

                                    _colors.push('#' + Math.floor(Math.random()*16777215).toString(16));

                                    _productsMap[productId] = {
                                        unitPrice: -1.0,
                                        components: [],
                                        totalMass: 0.0
                                    };
                                }

                                _productsMap[productId].components.push(
                                    component.dbId);

                                _viewer.getPropertyValue(
                                    component.dbId,
                                    "Mass",
                                    function (mass) {

                                        if (mass === 'undefined') {

                                            mass = 1.0;
                                        }

                                        _productsMap[productId].totalMass += mass;

                                        if(_productsMap[productId].unitPrice < 0) {

                                            $.getJSON('http://' + window.location.host +
                                                '/node/mongo/api/product/' + productId,

                                                function (data) {

                                                    var product = data.product;

                                                    _productsMap[product.ProductId].unitPrice = _self.ToUSD(
                                                        product.Price,
                                                        product.Currency);

                                                    callback();
                                                }
                                            );
                                        }
                                        else {
                                            callback();
                                        }
                                    });
                            });
                    },
                    function (err) {

                        _self.loadPie(_productsMap);
                    });
            });
    };

    ///////////////////////////////////////////////////////////////////////////
    // 
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.refreshPie = function (product) {

        _productsMap[product.ProductId].unitPrice = _self.ToUSD(
            product.Price,
            product.Currency);

        _self.loadPie(_productsMap);
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.loadPie = function(map) {

        function getNameFromLabel(label) {

            return label.split(':')[0];
        }

        var raphael = _self.createOverlay();

        var data = [];

        var legend = [];

        for (var key in map) {

            var cost = map[key].totalMass * map[key].unitPrice;

            data.push(cost);

            legend.push(key + ": $ " + cost.toFixed(2) + " - %%.%");
        }

        var pie = raphael.piechart(
            120, 150, 100,
            data,
            {
                legend: legend,
                legendpos: "south",
                colors: _colors
            });

        pie.each(function() {

            this.cover.click(function () {

                var name = getNameFromLabel(
                    this.label[1].attrs.text);

                if (map[name]) {
                    _viewer.fitToView(map[name].components);
                }
            });
        });

        pie.hover(function () {

            this.sector.stop();

            this.sector.scale(1.1, 1.1, this.cx, this.cy);

            if (this.label) {
                this.label[0].stop();
                this.label[0].attr({ r: 7.5 });
                this.label[1].attr({ "font-weight": 800 });

                var name = getNameFromLabel(
                    this.label[1].attrs.text);

                if (map[name]) {
                    _viewer.isolateById(map[name].components);
                }
            }
        }, function () {

            this.sector.animate({
                transform: 's1 1 ' + this.cx + ' ' + this.cy
            }, 500, "bounce");

            if (this.label) {
                this.label[0].animate({ r: 5 }, 500, "bounce");
                this.label[1].attr({ "font-weight": 400 });
            }
        });

        raphael.text(120, 30, "Cost breakdown").attr({
            font: "20px sans-serif"
        });

        return pie;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.ToUSD = function (price, currency) {

        var pricef = parseFloat(price);

        switch (currency) {

            case 'EUR': return pricef * 1.25;
            case 'USD': return pricef * 1.0;
            case 'JPY': return pricef * 0.0085;
            case 'MXN': return pricef * 0.072;
            case 'ARS': return pricef * 0.12;
            case 'GBP': return pricef * 1.58;
            case 'CAD': return pricef * 0.88;
            case 'BRL': return pricef * 0.39;
            case 'CHF': return pricef * 1.04;
            case 'ZAR': return pricef * 0.091;
            case 'INR': return pricef * 0.016;
            case 'PLN': return pricef * 0.30;
            case 'CNY': return pricef * 0.16;
            case 'DKK': return pricef * 0.17;
            case 'RUB': return pricef * 0.019;
            default: return pricef; //'Unknown';
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createOverlay = function () {

        if (typeof Raphael === 'undefined') {
            return null;
        }

        $('#overlayPieDivId').remove();

        var overlayDiv = document.createElement("div");

        overlayDiv.id = 'overlayPieDivId';

        _viewer.clientContainer.appendChild(
            overlayDiv);

        overlayDiv.style.top = "0";
        overlayDiv.style.left = "0";
        overlayDiv.style.width = "250px";
        overlayDiv.style.height = "500px";
        overlayDiv.style.zIndex = "999";
        overlayDiv.style.position = "relative";
        overlayDiv.style.overflow = "hidden";

        var overlay = new Raphael(
            overlayDiv,
            overlayDiv.clientWidth,
            overlayDiv.clientHeight);

        return overlay;
    }
};

Autodesk.ADN.Viewing.Extension.PieChart.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.PieChart.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.PieChart;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.PieChart',
    Autodesk.ADN.Viewing.Extension.PieChart);

