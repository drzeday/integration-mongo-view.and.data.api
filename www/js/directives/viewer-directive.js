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

angular.module('Autodesk.ADN.Toolkit.Directive.Viewer', [])

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
.directive('adnViewerContainer', function () {

  function link($scope, $element, $attributes) {

    $scope.viewerFactory =
      new Autodesk.ADN.Toolkit.Viewer.ViewerFactory(
        $attributes.url,
        ($attributes.hasOwnProperty('config') ?
          JSON.parse($attributes.config) :
        {}));

    $scope.viewerFactory.onInitialized(function () {

      $scope.$broadcast('factoryInitialized', {
        viewerFactory: $scope.viewerFactory
      });

      $scope.onViewerFactoryInitialized({
        factory: $scope.viewerFactory
      });

      $attributes.$observe('urn', function (urn) {

        if (urn.length) {

          $scope.viewerFactory.getViewablePath(
            urn,
            function (pathInfoCollection) {

              $scope.onViewablePath({
                pathInfoCollection: pathInfoCollection
              });

              $scope.$broadcast('forceApply', {

              });

            },
            function (error) {
              $scope.onError({
                error: error
              });
            });
        }
      });
    });
  }

  function controller($scope) {

    this.getViewerFactory = function () {

      return $scope.viewerFactory;
    };
  }

  return {

    scope: {
      url: '@',
      urn: '@',
      onViewablePath: '&',
      onViewerFactoryInitialized: '&',
      onError: '&'
    },

    link: link,
    replace: true,
    restrict: 'E',
    transclude: true,
    controller: controller,
    template: '<div style="overflow:auto;position:relative;{{style}}">' +
    '<div ng-transclude></div><div/>'
  };
})

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
.directive('adnViewer', function () {

  function postlink($scope, $element, $attributes, parentController) {

    function onFactoryInitialized(viewerFactory) {

      var config = ($attributes.hasOwnProperty('config') ?
        JSON.parse($attributes.config) : {});

      $scope.viewer = viewerFactory.createViewer(
        $element[0],
        config);

      $scope.onViewerInitialized({
        viewer: $scope.viewer
      });

      $scope.$on('$destroy', function () {

        $scope.onDestroy({
          viewer: $scope.viewer
        });
      });

      $scope.$on('forceApply', function (event, data) {

        $scope.$apply();
      });

      $attributes.$observe('path', function (path) {

        if (path.length) {

          $scope.viewer.load(path);

          $scope.onPathLoaded({
            viewer: $scope.viewer,
            path: path
          });
        }
      });
    }

    $scope.viewer = null;

    var viewerFactory = parentController.getViewerFactory();

    if (viewerFactory) {

      onFactoryInitialized(viewerFactory);
    }
    else {

      $scope.$on('factoryInitialized', function (event, data) {

        onFactoryInitialized(data.viewerFactory);
      });
    }
  }

  return {

    scope: {

      path: '@',
      onDestroy: '&',
      onPathLoaded: '&',
      onViewerInitialized: '&',
      onError: '&'
    },
    link: {
      post: postlink
    },
    restrict: 'E',
    replace: true,
    require: '^adnViewerContainer',
    template: '<div style="overflow:auto;position:relative;{{style}}"> <div/>'
  };
});

