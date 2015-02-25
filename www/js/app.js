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
var AdnViewerApp = angular.module('Autodesk.ADN.AngularView.Main',
    [
        'ngRoute',
        'ui.bootstrap',
        'ui.layout',
        'ui-layout-events',
        'mgcrea.ngStrap',     //AngularStrap
        'ngMdIcons',
        'Autodesk.ADN.AngularView.View.Viewer',
        'Autodesk.ADN.AngularView.Directive.SpinningImg',
        'Autodesk.ADN.AngularView.Dialog.Navbar'
    ])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('Autodesk.ADN.AngularView.Main.Controller', function($scope) {

        $scope.staging = false;

        var url =  "http://" +
            window.location.host +
            '/node/mongo/api/token';

        $scope.viewDataClient =
            new Autodesk.ADN.Toolkit.ViewData.AdnViewDataClient(
                'https://developer.api.autodesk.com',
                url);
    })

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .config(['$routeProvider', function ($routeProvider)
    {
        $routeProvider.otherwise({redirectTo: '/viewer'});
    }]);