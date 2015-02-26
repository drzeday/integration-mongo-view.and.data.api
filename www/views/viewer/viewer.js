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
'use strict';

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
angular.module('Autodesk.ADN.AngularView.View.Viewer',
    [
        'ngRoute',
        'ui.grid',
        'ui.grid.edit',
        'Autodesk.ADN.AngularView.Directive.ViewerDiv'
    ])

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
    .config(['$routeProvider',

        function($routeProvider) {

            $routeProvider.when('/viewer', {
                templateUrl: './views/viewer/viewer.html',
                controller: 'Autodesk.ADN.AngularView.View.Viewer.Controller'
            });
        }])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('Autodesk.ADN.AngularView.View.Viewer.Controller',
        ['$scope', '$http', 'uiGridConstants', function(
            $scope, $http, uiGridConstants) {

            $scope.staging = false;

            ///////////////////////////////////////////////////////////////////
            //
            //
            ///////////////////////////////////////////////////////////////////
            function initializeView() {

                $scope.viewer = null;

                $scope.onGeometryLoaded = function (event) {

                    $scope.viewer.loadExtension(
                        'Autodesk.ADN.Viewing.Extension.Treeview');

                    $scope.viewer.loadExtension(
                        'Autodesk.ADN.Viewing.Extension.PieChart');

                    $scope.viewer.loadExtension(
                        'Autodesk.ADN.Viewing.Extension.MongoDbPanelExtension');

                    $scope.viewer.getAllLeafComponents(

                        function (components) {

                            var productMap = {};

                            components.forEach(function(component) {

                                $scope.viewer.getPropertyValue(
                                    component.dbId,
                                    "ProductId",
                                    function (productId) {

                                        var url = 'http://' + window.location.host +
                                            '/node/mongo/api/product/' + productId

                                        $http.get(url).
                                            success(function (data,
                                                              status,
                                                              headers,
                                                              config) {

                                                productMap[data.product.ProductId] =
                                                    data.product;

                                                $scope.data = $scope.hashToArray(productMap);
                                            }).
                                            error(function (data,
                                                            status,
                                                            headers,
                                                            config) {
                                                console.log('error retrieving product ' + productId)
                                            });
                                    });
                            });
                        });
                }

                $scope.onViewerInitialized = function (viewer) {

                    $scope.viewer = viewer;

                    $scope.viewer.addEventListener(
                        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                        $scope.onGeometryLoaded);

                    $scope.viewer.loadExtension(
                        'Autodesk.ADN.Viewing.Extension.API');
                }

                $scope.tokenUrl = 'http://' + window.location.host +
                '/node/mongo/api/' + ($scope.staging ? 'tokenstg' : 'token');

                $scope.$on('ui.layout.resize', function (event, data) {

                    if ($scope.viewer)
                        $scope.viewer.resize();
                });

                $scope.docUrn = config.defaultUrn;
            }

            ///////////////////////////////////////////////////////////////////
            //
            //
            ///////////////////////////////////////////////////////////////////


            $scope.hashToArray = function (hash) {
                var array = [];
                for (var key in hash) {
                    array.push(hash[key]);
                }
                return array;
            };

            $scope.data = [];

            $scope.gridOptions = {
                data: 'data',
                enableRowSelection: false,
                enableCellEditOnFocus: true,
                multiSelect: false,
                columnDefs: [
                    {
                        field: 'ProductId',
                        displayName: 'Product Id',
                        enableCellEdit: false,
                        sort: {
                            direction: uiGridConstants.ASC,
                            priority: 0
                        }
                    },
                    {
                        field: 'Name',
                        displayName: 'Name',
                        enableCellEdit: false
                    },
                    {
                        field: 'Description',
                        displayName: 'Description',
                        enableCellEdit: false
                    },
                    {
                        field: 'SupplierName',
                        displayName: 'Supplier Name',
                        enableCellEdit: false
                    },
                    {
                        field: 'Currency',
                        displayName: 'Currency',
                        enableCellEdit: true,
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        editDropdownValueLabel: 'Currency',
                        editDropdownOptionsArray: [
                            { id: 'EUR', Currency: 'EUR'},
                            { id: 'USD', Currency: 'USD'},
                            { id: 'JPY', Currency: 'JPY'},
                            { id: 'MXN', Currency: 'MXN'},
                            { id: 'ARS', Currency: 'ARS'},
                            { id: 'GBP', Currency: 'GBP'},
                            { id: 'CAD', Currency: 'CAD'},
                            { id: 'BRL', Currency: 'BRL'},
                            { id: 'CHF', Currency: 'CHF'},
                            { id: 'ZAR', Currency: 'ZAR'},
                            { id: 'INR', Currency: 'INR'},
                            { id: 'PLN', Currency: 'PLN'},
                            { id: 'CNY', Currency: 'CNY'},
                            { id: 'DKK', Currency: 'DKK'},
                            { id: 'RUB', Currency: 'RUB'},
                        ]
                    },
                    {
                        field: 'Price',
                        displayName: 'Price',
                        enableCellEdit: true
                    }]
            };

            $scope.gridOptions.onRegisterApi = function(gridApi){

                $scope.gridApi = gridApi;

                gridApi.edit.on.afterCellEdit(
                    $scope, function(rowEntity, colDef, newValue, oldValue){

                        if(colDef.name === 'Price') {

                            if (isNaN(newValue) || newValue < 0){
                                rowEntity.Price = oldValue;
                            }
                        }

                        var product = {
                            _id: rowEntity._id,
                            ProductId: rowEntity.ProductId,
                            Name: rowEntity.Name,
                            Description: rowEntity.Description,
                            SupplierName: rowEntity.SupplierName,
                            Currency: rowEntity.Currency,
                            Price: rowEntity.Price
                        }

                        $scope.viewer.refreshPie(product);

                        $scope.viewer.refreshPropertyPanel();

                        $scope.$apply();

                        var url = 'http://' + window.location.host +
                            '/node/mongo/api/product/' + rowEntity._id;

                        $http.post(url, JSON.stringify(product)).
                            success(function (
                                data,
                                status,
                                headers,
                                config) {

                            }).
                            error(function (
                                data,
                                status,
                                headers,
                                config) {
                                console.log('error updating product ' +
                                    rowEntity.ProductId)
                            });
                });
            };

            initializeView();
    }]);