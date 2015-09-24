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

require("../../../extensions/Autodesk.ADN.Viewing.Extension.Treeview");
require("../../../extensions/Autodesk.ADN.Viewing.Extension.Chart");
require("../../../extensions/Autodesk.ADN.Viewing.Extension.PieChart");
require("../../../extensions/Autodesk.ADN.Viewing.Extension.CustomPropertyPanel");

var configClient = require("../../../config-client");

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
angular.module('Autodesk.ADN.Mongo.View.Viewer',
  [
    'ngRoute',
    'ui.grid',
    'ui.grid.edit',
    'ui.grid.saveState',
    'ui.grid.selection',
    'ui.grid.cellNav',
    'ui.grid.resizeColumns',
    'ui.grid.moveColumns',
    'ui.grid.pinning',
    'ui.grid.autoResize',
    'Autodesk.ADN.Mongo.Service.AppState',
    'Autodesk.ADN.Toolkit.Directive.Viewer',
  ])

  ///////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////
  .config(['$routeProvider',

    function($routeProvider) {

      $routeProvider.when('/viewer', {
        templateUrl: './js/ui/views/viewer/viewer.html',
        controller: 'Autodesk.ADN.Mongo.View.Viewer.Controller'
      });
    }])

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  .controller('Autodesk.ADN.Mongo.View.Viewer.Controller',
  ['$scope', '$http', 'uiGridConstants', 'ViewAndData', function(
    $scope, $http, uiGridConstants, ViewAndData) {

    $scope.tokenUrl = configClient.ApiURL + '/token';

    String.prototype.replaceAll = function (find, replace) {
      var str = this;
      return str.replace(new RegExp(
          find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
        replace);
    };

    var _materialMap = {};

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.searchFilter = function (model) {

      var regExp = new RegExp($scope.modelsFilterValue, 'i');

      return !$scope.modelsFilterValue ||
        regExp.test(model.name);
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function initialize() {

      $scope.viewer = null;

      $scope.selectedPath = [];

      $scope.selectedModel = null;

      $scope.inProgress = false;

      $scope.viewerContainerConfig = {

        environment: 'AutodeskProduction'
        //environment: 'AutodeskStaging'
      }

      $scope.viewerConfig = {

        lightPreset: 8,
        viewerType: 'GuiViewer3D',
        qualityLevel: [true, true],
        navigationTool:'freeorbit',
        progressiveRendering: true,
        backgroundColor:[3,4,5, 250, 250, 250]
      };

      $scope.$on('ui.layout.resize', function (event, data) {

        if ($scope.viewer)
          $scope.viewer.resize();
      });

      $scope.gridItems = [];

      $scope.appScopeProvider = {

        onRowClicked: function (row) {
          $scope.viewer.fitToView();
          $scope.viewer.isolate(row.entity.components);
        },

        onRowDoubleClicked: function (row) {
          $scope.viewer.fitToView(
            row.entity.components);
        }
      };

      $scope.gridOptions = {
        data: 'gridItems',
        showFooter: true,
        enableSorting: true,
        multiSelect: false,
        enableFiltering: true,
        enableRowSelection: true,
        enableSelectAll: false,
        enableRowHeaderSelection: false,
        selectionRowHeaderWidth: 35,
        noUnselect: true,
        enableGridMenu: true,
        enableCellEditOnFocus: true,
        columnDefs: [
          {
            field: 'material.name',
            displayName: 'Material',
            enableCellEdit: false,
            sort: {
              direction: uiGridConstants.ASC,
              priority: 0
            }
          },
          {
            field: 'material.supplier',
            displayName: 'Supplier',
            enableCellEdit: true
          },
          {
            field: 'material.currency',
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
            field: 'material.price',
            displayName: 'Price',
            enableCellEdit: true
          }],
        appScopeProvider: $scope.appScopeProvider,
        rowTemplate: "<div ng-click=\"grid.appScope.onRowClicked(row)\" ng-dblclick=\"grid.appScope.onRowDoubleClicked(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"
      };

      $scope.gridOptions.onRegisterApi = function(gridApi){

        $scope.gridApi = gridApi;

        gridApi.edit.on.afterCellEdit(
          $scope, function(rowEntity, colDef, newValue, oldValue){

            if(colDef.name === 'material.price') {

              if (isNaN(newValue) || newValue < 0){
                rowEntity.material.price = oldValue;
              }
            }

            var material = {
              _id: rowEntity.material._id,
              name: rowEntity.material.name,
              supplier: rowEntity.material.supplier,
              currency: rowEntity.material.currency,
              price: rowEntity.material.price
            }

            _materialMap[material.name].material = material;

            $scope.viewer.loadPie(_materialMap);

            if($scope.viewer.refreshPropertyPanel)
              $scope.viewer.refreshPropertyPanel();

            $scope.$apply();

            var url = configClient.host +
              '/api/materials/' + rowEntity.material._id;

            $http.put(url, material).
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
                console.log('error updating material: ' +
                rowEntity.material.name)
              });
          });
      };
    }

    ///////////////////////////////////////////////////////////////////////////
    // events
    //
    ///////////////////////////////////////////////////////////////////////////
    $scope.$on('event.dbReset', function (event, data) {

      $http.post(configClient.host + '/api/materials/reset').
        then(function (response) {

          $scope.inProgress = true;

          loadMaterials(function() {

            $scope.inProgress = false;

            updateGrid({inProgress: $scope.inProgress});

            $scope.viewer.reloadGraph();
          });
        });
    });

    $scope.$on('event.cost', function (event, data) {

      $scope.viewer.setPieVisibility(data.visibility);
    });

    $scope.$on('event.graph', function (event, data) {

      $scope.viewer.setGraphVisibility(data.visibility);
    });

    ///////////////////////////////////////////////////////////////////////////
    // Get property value from display name
    //
    ///////////////////////////////////////////////////////////////////////////
    Autodesk.Viewing.Viewer3D.prototype.getComponentMaterial = function(
      dbId, result) {

      if(!$scope.selectedModel.initialized) {

        this.getPropertyValue(dbId, "Material", result);
      }
      else {

        $http.get(configClient.host +
        '/api/models/' + $scope.selectedModel._id +
        '/component/' + dbId + '/material').then(function (response) {

          result(response.data);
        });
      }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Get property value from display name
    //
    ///////////////////////////////////////////////////////////////////////////
    Autodesk.Viewing.Viewer3D.prototype.getPropertyValue = function(
      dbId, displayName, callback) {

      function _cb(result) {

        if (result.properties) {

          for (var i = 0; i < result.properties.length; i++) {

            var prop = result.properties[i];

            if (prop.displayName === displayName) {

              callback(prop.displayValue);
              return;
            }
          }

          callback('undefined');
        }
      }

      this.getProperties(dbId, _cb);
    };

    ///////////////////////////////////////////////////////////////////////////
    // Get all leaf components
    //
    ///////////////////////////////////////////////////////////////////////////
    Autodesk.Viewing.Viewer3D.prototype.getAllLeafComponents =
      function(callback) {

        function getLeafComponentsRec(parent) {

          var components = [];

          if (typeof parent.children !== "undefined") {

            var children = parent.children;

            for (var i = 0; i < children.length; i++) {

              var child = children[i];

              if (typeof child.children !== "undefined") {

                var subComps = getLeafComponentsRec(child);

                components.push.apply(components, subComps);
              }
              else {
                components.push(child);
              }
            }
          }

          return components;
        }

        this.getObjectTree(function (result) {

          var allLeafComponents = getLeafComponentsRec(result.root);

          callback(allLeafComponents);
        });
      }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function loadChartExtension() {

      $scope.viewer.loadExtension(
        'Autodesk.ADN.Viewing.Extension.Chart', {
          top: 400, left: 20,
          width: 200, height: 200,
          extraProperties:[
            'Currency', 'Supplier'
          ],
          Material: {
            getPropertyValue: function (dbId, callback) {

              $scope.viewer.getComponentMaterial(dbId,
                function (materialName) {

                  callback(materialName);
                });
            }
          },
          Currency:{
            getPropertyValue: function(dbId, callback) {

              $scope.viewer.getComponentMaterial(dbId,
                function (materialName) {

                  $http.get(configClient.host +
                  '/api/materials/byName/' + materialName).then(

                    function(response) {

                      callback(response.data.currency);
                    })
                });
            },
            Supplier: {
              getPropertyValue: function (dbId, callback) {

                $scope.viewer.getComponentMaterial(dbId,
                  function (materialName) {

                    $http.get(configClient.host +
                    '/api/materials/byName/' + materialName).then(
                      function (response) {

                        callback(response.data.supplier);
                      })
                  });
              }
            }
          }}
      );
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function onGeometryLoaded(event) {

      $scope.viewer.removeEventListener(
        Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
        onGeometryLoaded);

      $scope.viewer.loadExtension(
        'Autodesk.ADN.Viewing.Extension.Treeview');

      loadChartExtension();

      $scope.viewer.loadExtension(
        'Autodesk.ADN.Viewing.Extension.PieChart');

      loadMaterials(function() {

        $scope.inProgress = false;

        updateGrid({inProgress: $scope.inProgress});

        $scope.viewer.loadExtension(
          'Autodesk.ADN.Viewing.Extension.CustomPropertyPanel', {
            apiUrl: configClient.host + '/api',
            menuItems: buildPropertyPanelMenuItems()
          });

        //viewer + table header + nb.items x size.item
        var size = 700 + 70 + Object.keys(_materialMap).length * 30;

        //resize page to fit table
        $('#main-container').css({
          'height':size + 'px'
        });

        $(window).trigger('resize');
      });
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function buildPropertyPanelMenuItems() {

      var menuItems = [];

      var materials = _.sortBy(Object.keys(_materialMap), function(name) {
        return name;
      });

      materials.forEach(function(materialName){

        menuItems.push({
          label: materialName,
          handler: function(dbId, oldMaterial, newMaterial) {

            $scope.viewer.getPropertyValue(
              dbId,
              "Mass",
              function (mass) {

                if (mass === 'undefined') {
                  mass = 1.0;
                }

                _materialMap[newMaterial].components.push(dbId);

                _materialMap[newMaterial].totalMass += mass;

                _materialMap[oldMaterial].components = _.remove(
                  _materialMap[oldMaterial].components, function(id) {
                  return id == dbId;
                });

                _materialMap[oldMaterial].totalMass -= mass;

                updateGrid({inProgress: false});
              });

            $http.post(configClient.host +
            '/api/models/' + $scope.selectedModel._id +
            '/component/' + dbId + '/material', {name: newMaterial}).then(
              function (response) {

            });
          }
        });
      });

      return menuItems;
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function onObjectTreeCreated(event) {

      $scope.viewer.removeEventListener(
        Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
        onObjectTreeCreated);
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function loadMaterials(onSuccess) {

      _materialMap = {};

      $scope.viewer.getAllLeafComponents(
        function(components) {

          var tasks = [];

          components.forEach(function(component){

            var task = function(callback) {

              $scope.viewer.getComponentMaterial(
                component.dbId,
                function (materialName) {

                  materialName = materialName.replaceAll('/', '-');

                  if (!_materialMap[materialName]) {

                    _materialMap[materialName] = {
                      color: '#' + Math.floor(Math.random()*16777215).toString(16),
                      components: [],
                      totalMass: 0.0
                    };
                  }

                  _materialMap[materialName].components.push(
                    component.dbId);

                  var getUrl = configClient.ApiURL +
                    '/materials/byName/' +
                    materialName;

                  $http.get(getUrl).
                    success(function (material) {

                      _materialMap[materialName].material = material;

                      $scope.viewer.getPropertyValue(
                        component.dbId,
                        "Mass",
                        function (mass) {

                          if (mass === 'undefined') {
                            mass = 1.0;
                          }

                          _materialMap[materialName].totalMass += mass;

                          updateGrid({inProgress: $scope.inProgress});

                          callback(null, 'done');
                        });
                    }).
                    error(function () {

                      _materialMap[materialName].material = null;

                      callback(null, 'done');
                    });
                });
            };

            tasks.push(task);
          });

          async.parallelLimit(tasks, 100,
            function(error, results) {

              onSuccess();

              //TODO: remove
              onSuccess();

              addMissingMaterialsToDB(onSuccess);
            });
        });
    };

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function addMissingMaterialsToDB(onSuccess) {

      for(var name in _materialMap) {

        //add material to db
        if(!_materialMap[name].material) {

          var url = configClient.ApiURL + '/materials/';

          var newMaterial = {
            name: name,
            supplier: "Autodesk",
            currency: "USD",
            price: 1.0
          };

          $http.post(url, newMaterial).
            then(function(response) {

              _materialMap[name].material = newMaterial;

              _materialMap[name].components.forEach(

                function(component){

                  $scope.viewer.getPropertyValue(
                    component.dbId,
                    "Mass",
                    function (mass) {

                      if (mass === 'undefined') {
                        mass = 1.0;
                      }

                      _materialMap[name].totalMass += mass;

                      updateGrid({inProgress: $scope.inProgress});

                      //callback();
                    });
                });

            }, function(error) {

              //callback();
            });
        }
      }
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function afterViewerEvents(viewer, events, onAfter) {

      async.each(events,
        function (event, callback) {

          var handler = function(ev){

            viewer.removeEventListener(
              event, handler);

            callback();
          };

          viewer.addEventListener(
            event, handler);
        },
        function (err) {

          onAfter();
        });
    }

    function saveModelStructure(model) {

      var events = [
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT
      ];

      afterViewerEvents(
        $scope.viewer,
        events,
        function(){

          getModelStructure(
            $scope.viewer,
            model.name, function(rootNode, nodes) {

              async.each(nodes,
                function (node, callback) {

                  $scope.viewer.getPropertyValue(
                    node.dbId,
                    "Material",
                    function (material) {

                      node.material =
                        material.replaceAll('/', '-');

                      callback();
                    });
                },
                function (err) {

                  var url = configClient.host +
                    '/api/models/structure/' + model._id;

                  $http.post(url, rootNode).
                    then(function(response) {

                    });
                });
            })
        });
    }

    function getModelStructureRec(viewer, node, nodes) {

      var children = [];

      if(node.children) {

        node.children.forEach(function (child) {

          var newNode = {
            name: child.name,
            dbId: child.dbId,
            material: null
          };

          children.push(newNode);

          nodes.push(newNode);

          newNode.children = getModelStructureRec(
            viewer, child, nodes);
        });
      }

      return children;
    }

    function getModelStructure(viewer, modelName, onSuccess) {

      viewer.getObjectTree(function (rootComponent) {

        var rootNode = {
          name: modelName,
          children: []
        };

        var nodes = [];

        rootNode.children = getModelStructureRec(
          viewer,
          rootComponent.root,
          nodes);

        onSuccess(rootNode, nodes);
      });
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function _updateGrid(options) {

      $scope.gridItems = _.filter(_.values(_materialMap),
        function(material) {
          return material !== null;
        });

      $scope.viewer.loadPie(_materialMap, options);
    }

    var updateGrid = _.throttle(_updateGrid, 1000);

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onViewablePath = function(pathInfoCollection) {

      $scope.gridItems = [];

      $scope.selectedPath = [pathInfoCollection.path3d[0].path];
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onViewerFactoryInitialized = function (factory) {

      $http.get(configClient.host + '/api/models').then(

        function(response) {

          $scope.models = response.data;

          $scope.models.forEach(function(model){

            model.thumbnail = 'resources/img/adsk.png';

            var fileId = ViewAndData.client.fromBase64(model.urn);

            ViewAndData.client.getThumbnail(fileId, function(data){

              model.thumbnail = "data:image/png;base64," + data;
            });
          });

          $scope.onModelSelected($scope.models[1])
        });
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onPathLoaded = function (viewer, path) {

    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onViewerInitialized = function (viewer) {

      $scope.viewer = viewer;

      viewer.addEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        onGeometryLoaded);

      viewer.addEventListener(
        Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
        onObjectTreeCreated);

      if (!$scope.selectedModel.initialized) {

        saveModelStructure($scope.selectedModel);
      }
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onModelSelected = function(model) {

      if(!$scope.selectedModel || $scope.selectedModel._id !== model._id) {

        $scope.inProgress = true;

        $scope.selectedModel = model;

        $scope.selectedPath = [];
      }
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onDestroy = function (viewer) {

      viewer.finish();

      viewer = null;

      $scope.viewer = null;
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    initialize();

  }]);