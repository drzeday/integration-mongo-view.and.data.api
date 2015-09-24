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

require("../../../services/appState-service");

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
angular.module('Autodesk.ADN.Mongo.Dialog.Navbar',
    [
        'Autodesk.ADN.Mongo.Dialog.About',
        'Autodesk.ADN.Mongo.Service.AppState'
    ])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('Autodesk.ADN.Mongo.Dialog.Navbar.Controller',

    function($scope) {

        $scope.brand = "View & Data API - MongoDB";

        $scope.brandImg = "resources/img/adsk/adsk-32x32-32.png";

        $scope.costLoaded = true;
        $scope.graphLoaded = true;

        $scope.costBreakdown = "Hide Cost breakdown";
        $scope.propertyGraph = "Hide Property graph";

        $scope.aboutItems = [
            {
                text: 'Get an API key',
                href: 'http://developer.autodesk.com',
                icon: 'glyphicon glyphicon-check'
            },
            {
                text: 'API Support',
                href: 'http://forums.autodesk.com/t5/Web-Services-API/ct-p/94',
                icon: 'glyphicon glyphicon-thumbs-up'
            },
            {
                text: 'Autodesk',
                href: 'http://www.autodesk.com',
                icon: 'glyphicon glyphicon-text-background'
            },
            {
                class: 'divider'
            },
            {
                text: 'Source on Github',
                href: 'https://github.com/Developer-Autodesk/integration-mongo-view.and.data.api',
                icon: 'glyphicon glyphicon-floppy-save'
            },
            {
                text: 'About that sample',
                href: '',
                icon: 'glyphicon glyphicon-info-sign',
                onClick: function() {
                    $('#aboutDlg').modal('show');
                }
            }
        ];

        $scope.reset = function() {

            $scope.$emit('app.EmitMessage', {
                msgId:'event.dbReset',
                msgArgs: {}
            });
        };

        $scope.toggleCost = function() {

            $scope.costLoaded = !$scope.costLoaded;

            if( $scope.costLoaded) {

                $scope.costBreakdown = "Hide Cost breakdown";
            }
            else {

                $scope.costBreakdown = "Show Cost breakdown";
            }

            $scope.$emit('app.EmitMessage', {
                msgId:'event.cost',
                msgArgs: {
                    visibility: $scope.costLoaded
                }
            });
        };

        $scope.toggleGraph = function() {

            $scope.graphLoaded = !$scope.graphLoaded;

            if( $scope.graphLoaded) {

                $scope.propertyGraph = "Hide Property graph";
            }
            else {

                $scope.propertyGraph = "Show Property graph";
            }

            $scope.$emit('app.EmitMessage', {
                msgId:'event.graph',
                msgArgs: {
                    visibility: $scope.graphLoaded
                }
            });
        };
    });