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

require("./ui/views/viewer/viewer");

require("./directives/spinning-img-directive");
require("./directives/viewer-directive");

require("./services/view.and.data-service");

require("./ui/dialogs/navbar/navbar");
require("./ui/dialogs/about/about");

var configClient = require("./config-client");

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
angular.module('ui-layout-events', [
    'ui.layout'
])
  .directive('uiLayout', function($timeout, $rootScope) {

      var methods = ['updateDisplay',
            'toggleBefore',
            'toggleAfter',
            'mouseUpHandler',
            'mouseMoveHandler'],
        timer;

      function fireEvent() {
          if(timer) $timeout.cancel(timer);
          timer = $timeout(function() {
              $rootScope.$broadcast('ui.layout.resize');
              timer = null;
          }, 0);
      }

      return {
          restrict: 'AE',
          require: '^uiLayout',
          link: function(scope, elem, attrs, uiLayoutCtrl) {
              angular.forEach(methods, function(method) {
                  var oldFn = uiLayoutCtrl[method];
                  uiLayoutCtrl[method] = function() {
                      oldFn.apply(uiLayoutCtrl, arguments);
                      fireEvent();
                  };
              });
          }
      };
  });

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
angular.module('Autodesk.ADN.Mongo.Main',
  [
      'ngRoute',
      'ui.bootstrap',
      'ui.layout',
      'ui-layout-events',
      'Autodesk.ADN.Mongo.View.Viewer',
      'Autodesk.ADN.Mongo.Dialog.Navbar',
      'Autodesk.ADN.Toolkit.UI.Directive.SpinningImg',
      'Autodesk.ADN.Toolkit.ViewData.Service.ViewAndData'
  ])

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
  .config(['$routeProvider', 'ViewAndDataProvider',
      function ($routeProvider, ViewAndDataProvider) {

          ViewAndDataProvider.setTokenUrl(
            configClient.ApiURL + '/token');

          $routeProvider.otherwise({redirectTo: '/viewer'});
      }])

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
  .controller('Autodesk.ADN.Mongo.Main.Controller', function($scope) {

    $scope.$on('app.EmitMessage', function (event, data) {

      $scope.$broadcast(data.msgId, data.msgArgs);
    });
  });