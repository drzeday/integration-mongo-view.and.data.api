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

    var _self = this;

    _self.load = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Treeview loaded");

        $('#tree-container').append('<div id="tree"> </div>');

        initializeTree(viewer);

        return true;
    };

    _self.unload = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Treeview unloaded");

        $('#tree').remove();

        return true;
    };

    function initializeTree(viewer) {

        var tree = $("#tree").jstree({

            'core': {
                check_callback: true
            }
        });

        tree.on("ready.jstree",
            function (e, data) {

                var treeRef = $('#tree').jstree(true);

                viewer.getObjectTree(function (result) {

                    var rootComponent = result.root;

                    var rootNode = createNode(
                        treeRef,
                        '#',
                        rootComponent);

                    buildTreeRec(treeRef, rootNode, rootComponent);

                    $('#tree').jstree("open_node", rootNode);
                });
            });

        tree.on('before.jstree',
            function (e, data) {
                //console.log('b4');
            });

        tree.on('changed.jstree',
            function (e, data) {
                //data.selected.length
                //console.log(data.instance.get_node(data.selected[0]).text);
            });

        tree.on("select_node.jstree",
            function (event, data) {

                var node = data.node;

                //console.log(node);
            });

        tree.on("dblclick.jstree",
            function (event) {

                var ids = $('#tree').jstree('get_selected');

                var dbId = parseInt(ids[0]);

                viewer.isolate(dbId);

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