///////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2015 - ADN/Developer Technical Services
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

angular.module('Autodesk.ADN.AngularView.Directive.ViewerDiv', []).

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    directive('adnViewerDiv', function () {

        function link($scope, $element, $attributes) {

            // instanciate viewer manager and place it in directive scope

            $scope.adnViewerMng =
                new Autodesk.ADN.Toolkit.Viewer.AdnViewerManager(
                    $attributes.url,
                    $element[0],
                    ($attributes.hasOwnProperty('config') ?
                        $attributes.config :
                        {}));

            $attributes.$observe('urn', function(urn) {

                // check if urn is not empty, if empty close doc
                if(urn.length) {

                    // loads document from urn
                    $scope.adnViewerMng.loadDocument(
                        urn,
                        function (viewer) {
                            $scope.viewerInitialized({
                                viewer: viewer
                            })
                        });
                }
                else {
                    $scope.adnViewerMng.closeDocument();
                }
            });
        }

        return {
            scope: {
                url: '@',
                urn: '@',
                viewerInitialized: '&'
            },
            restrict: 'E',
            replace: true,
            template: '<div style="overflow: hidden; position: relative; {{style}}"><div/>',
            link: link
        };
    });

