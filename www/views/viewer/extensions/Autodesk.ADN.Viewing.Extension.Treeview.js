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

Autodesk.ADN.Viewing.Extension.Treeview = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _treeId = '#treeview';

    var _self = this;

    _self.viewer = viewer;

    _self.load = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Treeview loaded");

        initializeTree(_self.viewer);

        return true;
    };

    _self.unload = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Treeview unloaded");

        Autodesk.Viewing.theExtensionManager.unregisterExtension(
            "Autodesk.ADN.Viewing.Extension.Treeview");

        return true;
    };

    function initializeTree(viewer) {

        $(_treeId).jstree({

            'core': {
                check_callback: true
            }
        });

        $(_treeId).on("ready.jstree",
            function (e, data) {

                var treeRef = $(_treeId).jstree(true);

                viewer.getObjectTree(function (rootComponent) {

                    var rootNode = createNode(
                        treeRef,
                        '#',
                        rootComponent);

                    buildTreeRec(treeRef, rootNode, rootComponent);

                    $(_treeId).jstree("open_node", rootNode);
                });
            });

        $(_treeId).on('before.jstree',
            function (e, data) {
                //console.log('b4');
            });

        $(_treeId).on('changed.jstree',
            function (e, data) {
                //data.selected.length
                //console.log(data.instance.get_node(data.selected[0]).text);
            });

        $(_treeId).on("select_node.jstree",
            function (event, data) {

                var node = data.node;

                //console.log(node);
            });

        $(_treeId).on("dblclick.jstree",
            function (event) {

                var ids = $(_treeId).jstree('get_selected');

                var dbId = parseInt(ids[0]);

                viewer.isolateById(dbId);

                viewer.fitToView(dbId);
            });

        function createNode(tree, parentNode, component) {

            var icon = (component.children ?
                'resources/img/tree/parent.png':
                'resources/img/tree/child.png');

            var nodeData = {
                'text': component.name,
                'id': component.dbId,
                'icon': icon
            };

            var node = tree.create_node(
                parentNode,
                nodeData,
                'last',
                false,
                false);

            return node;
        }

        function buildTreeRec(tree, parentNode, component) {

            if (component.children) {

                var children = component.children;

                for (var i = 0; i < children.length; i++) {

                    var childComponent = children[i];

                    var childNode = createNode(
                        tree,
                        parentNode,
                        childComponent);

                    if (childComponent.children) {

                        buildTreeRec(tree, childNode, childComponent);
                    }
                }
            }
        }
    }
};

Autodesk.ADN.Viewing.Extension.Treeview.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Treeview.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Treeview;

Autodesk.Viewing.theExtensionManager.registerExtension(
    "Autodesk.ADN.Viewing.Extension.Treeview",
    Autodesk.ADN.Viewing.Extension.Treeview);