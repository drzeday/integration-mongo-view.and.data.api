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

Autodesk.ADN.Viewing.Extension.MongoDbPanel = function (viewer) {

    _self = this;

    this.viewer = viewer;

    Autodesk.Viewing.Extensions.ViewerPropertyPanel.call(
        this,
        this.viewer);

    _self.setNodeProperties = function (nodeId) {

        Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype.setNodeProperties.call(
            _self, nodeId);

        _self.selectedNodeId = nodeId;
    };

    _self.setProperties = function (properties) {

        Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype.setProperties.call(
            _self, properties);

        this.viewer.getPropertyValue(_self.selectedNodeId, "ProductId",

            function (productId) {

                if (productId !== 'undefined') {

                    var url = 'http://' + window.location.host +
                        '/node/mongo/api/product/' + productId;

                    $.getJSON(url, function (data) {

                            var product = data.product;

                            var category = "MongoDb Data";

                            _self.addProperty("Product Name", product.Name, category);
                            _self.addProperty("Supplier Name", product.SupplierName, category);
                            _self.addProperty("Price", product.Price, category);
                            _self.addProperty("Currency", product.Currency, category);
                            //_self.addProperty("Description", product.Description, category);
                        });
                }
            });
    };
};

Autodesk.ADN.Viewing.Extension.MongoDbPanel.prototype =
    Object.create(Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype);

Autodesk.ADN.Viewing.Extension.MongoDbPanel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.MongoDbPanel;


Autodesk.ADN.Viewing.Extension.MongoDbPanelExtension = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _viewer = viewer;

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.MongoDbPanelExtension loaded');

        var panel = new Autodesk.ADN.Viewing.Extension.MongoDbPanel(_viewer);

        _viewer.setPropertyPanel(panel);

        viewer.refreshPropertyPanel = function () {

            panel.setVisible(false, true);
            panel.setVisible(true, true);
        }

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        var panel = new Autodesk.Viewing.Extensions.ViewerPropertyPanel(
            _viewer);

        _viewer.setPropertyPanel(panel);

        return true;
    };
};

Autodesk.ADN.Viewing.Extension.MongoDbPanelExtension.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.MongoDbPanelExtension.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.MongoDbPanelExtension;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.MongoDbPanelExtension',
    Autodesk.ADN.Viewing.Extension.MongoDbPanelExtension);