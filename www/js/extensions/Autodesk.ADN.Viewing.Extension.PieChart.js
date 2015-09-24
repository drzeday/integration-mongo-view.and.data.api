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

    var _visibility = true;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.PieChart loaded');

        $(document).bind('keyup', onKeyup);

        viewer.loadPie = loadPie;

        viewer.setPieVisibility = function(visibility){

            _visibility = visibility;

            $('#overlayPieDivId').css({
                'visibility':(visibility ? 'visible' :'hidden')
            });
        };

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
    function onKeyup(event){

        if (event.keyCode == 27) {

            viewer.isolate([]);
            viewer.fitToView([]);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function toUSD(price, currency) {

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
    function loadPie(map, options) {

        function getNameFromLabel(label) {

            return label.split(':')[0];
        }

        var raphael = createOverlay();

        var data = [];

        var legend = [];

        var colors = [];

        for (var key in map) {

            if(map[key].material) {

                var cost = map[key].totalMass * toUSD(
                    map[key].material.price,
                    map[key].material.currency);

                data.push(cost);

                legend.push(key + ": $ " + cost.toFixed(2) + " - %%.%");

                colors.push(map[key].color);
            }
        }

        var pie = raphael.piechart(
          120, 150, 100,
          data,
          {
              legend: legend,
              legendpos: "east",
              colors: colors
          });

        pie.each(function() {

            this.cover.click(function () {

                var name = getNameFromLabel(
                  this.label[1].attrs.text);

                if (map[name]) {
                    viewer.isolate(map[name].components);
                    viewer.fitToView(map[name].components);
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
                    //viewer.isolate(map[name].components);
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

        raphael.text(120, 30, 'Cost breakdown').attr({
            font: "20px sans-serif"
        });

        if(options && options.inProgress) {

            raphael.text(270, 30, '(in progress...)').attr({
                font: "20px sans-serif"
            });
        }

        return pie;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function createOverlay() {

        //var html = [
        //    '<div id="overlayPieDivId">',
        //    '</div>',
        //].join('\n');
        //
        //$(viewer.clientContainer).append(html);
        //
        //$('#overlayPieDivId').css({
        //    'top' : '0',
        //    'left': '0',
        //    'width' : '620px',
        //    'height' : '300px',
        //    'zIndex' : '1',
        //    'position' : 'relative',
        //    'overflow' : 'hidden'
        //});

        //var div = $('#overlayPieDivId')[0];

        if (typeof Raphael === 'undefined') {
            return null;
        }

        $('#overlayPieDivId').remove();

        var div = document.createElement("div");

        div.id = 'overlayPieDivId';

        viewer.clientContainer.appendChild(div);

        div.style.top = "0";
        div.style.left = "0";
        div.style.width = "620px";
        div.style.height = "300px";
        div.style.zIndex = "1";
        div.style.position = "relative";
        div.style.overflow = "hidden";

        $('#overlayPieDivId').css({
            'visibility':(_visibility ? 'visible' :'hidden')
        });

        var overlay = new Raphael(
          div,
          div.clientWidth,
          div.clientHeight);

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

