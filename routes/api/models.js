/////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////

var config = require('../../config/config-server');
var express = require('express');
var mongo = require('mongodb');

module.exports = function(db) {

  var router = express.Router();

  ///////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/full', function (req, res) {

    var pageQuery = {};

    var fieldQuery = {};

    db.collection(config.models, function (err, collection) {
      collection.find(fieldQuery, pageQuery)
        .sort({name: 1}).toArray(
        function (err, items) {

          if (err) {
            res.status(204); //HTTP 204: NO CONTENT
            res.err = err;
          }

          res.jsonp(items);
        });
    });
  });

  ///////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/:id/component/:dbId', function (req, res) {

    var id = req.params.id;

    var dbId = req.params.dbId;

    if (id.length !== 24) {
      res.status(404);
      res.send(null);
      return;
    }

    db.collection(config.models, function (err, collection) {

      collection.findOne(
        {'_id': new mongo.ObjectId(id)},
        {structure: 1},

        function (err, model) {

          if(model) {

            var component = getComponentByDbIdRec(
              model.structure, dbId);

            res.status((component ? 200 :404));
            res.jsonp(component);
          }
          else {
            res.status(404);
            res.jsonp();
          }
        });
    });
  });

  function getComponentByDbIdRec(parent, dbId) {

    for(var i = 0; i<parent.children.length; ++i) {

      var child = parent.children[i];

      if(child.dbId.toString() === dbId){

        return child;
      }

      var res = getComponentByDbIdRec(child, dbId);

      if(res !== null) {

        return res;
      }
    }

    return null;
  }

  ///////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/:id/component/:dbId/material', function (req, res) {

    var id = req.params.id;

    var dbId = req.params.dbId;

    if (id.length !== 24) {
      res.status(404);
      res.send(null);
      return;
    }

    db.collection(config.models, function (err, collection) {

      collection.findOne(
        {'_id': new mongo.ObjectId(id)},
        {structure: 1},

        function (err, model) {

          if(model) {

            var component = getComponentByDbIdRec(
              model.structure, dbId);

            res.status((component ? 200 :404));
            res.jsonp((component ? component.material : null));
          }
          else {
            res.status(404);
            res.jsonp();
          }
        });
    });
  });

  ///////////////////////////////////////////////////////////////////////////////
  // set new material for component
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.post('/:id/component/:dbId/material', function (req, res) {

    var id = req.params.id;

    var dbId = req.params.dbId;

    if (id.length !== 24) {
      res.status(404);
      res.send(null);
      return;
    }

    var material = req.body;

    db.collection(config.models, function (err, collection) {

      collection.findOne(
        {'_id': new mongo.ObjectId(id)},
        {structure: 1},

        function (err, model) {

          if(model) {

            var component = getComponentByDbIdRec(
              model.structure, dbId);

            if(component) {

              component.material = material.name;
            }
  
            collection.update(
              { '_id': new mongo.ObjectID(id) },
              {$set: {"structure": model.structure}},
              {safe: true},
              function (err, result) {
                if (err) {
                  res.status((component ? 200 :404));
                  res.send({ 'error': err });
                } else {
                  res.status((component ? 200 :404));
                  res.send('ok');
                }
              });
          }
          else {
            res.status(404);
            res.jsonp();
          }
        });
    });
  });

  ///////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/:id', function (req, res) {

    var id = req.params.id;

    if (id.length !== 24) {
      res.status(404);
      res.send(null);
      return;
    }

    db.collection(config.models, function (err, collection) {

      collection.findOne(
        {'_id': new mongo.ObjectId(id)},
        {name: 1, urn: 1},

        function (err, model) {

          res.status((model ? 200 : 404));
          res.jsonp(model);
        });
    });
  });

  ///////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/', function (req, res) {

    var pageQuery = {
      initialized: 1,
      name: 1,
      urn: 1
    };

    var fieldQuery = {};

    db.collection(config.models, function (err, collection) {
      collection.find(fieldQuery, pageQuery)
        .sort({name: 1}).toArray(
        function (err, models) {

          if (err) {
            res.status(204); //HTTP 204: NO CONTENT
            res.err = err;
          }

          res.jsonp(models);
        });
    });
  });

  ///////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.post('/structure/:id', function (req, res) {

    var id = req.params.id;

    var structure = req.body;

    db.collection(config.models, function (err, collection) {
      collection.update(
        { '_id': new mongo.ObjectID(id) },
        {$set: {"structure": structure, "initialized": true}},
        {safe: true},
        function (err, result) {
          if (err) {
            res.send({ 'error': err });
          } else {
            res.send('ok');
          }
        });
    });
  });

  return router;
}
