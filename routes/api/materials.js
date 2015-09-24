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
var util = require('util');
var async = require('async');

module.exports = function(db, viewAndDataClient) {

    var router = express.Router();

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.get('/byName/:name', function (req, res) {

        var name = req.params.name;

        db.collection(config.materials, function (err, collection) {

            collection.findOne(
              { 'name': name },
              { },

              function (err, item) {

                  res.status((item ? 200 : 404));
                  res.jsonp(item);
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

        db.collection(config.materials, function (err, collection) {

            collection.findOne(
              {'_id': new mongo.ObjectId(id)},
              { },

              function (err, item) {

                  res.status((item ? 200 : 404));
                  res.jsonp(item);
              });
        });
    });

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.get('/', function (req, res) {

        var pageQuery = {};

        var fieldQuery = {};

        db.collection(config.materials, function (err, collection) {
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
    router.put('/:id', function (req, res) {

        var id = req.params.id;

        var material = req.body;

        db.collection(config.materials, function (err, collection) {
            collection.update(
              { '_id': new mongo.ObjectID(id) },
              {$set: {
                "price": material.price,
                "supplier": material.supplier,
                "currency": material.currency
              }},
              {safe: true},
              function (err, result) {
                  if (err) {
                      res.send({ 'error': err });
                  } else {
                      res.send(material);
                  }
              });
        });
    });

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.post('/', function (req, res) {

        var material = req.body;

        db.collection(config.materials, function (err, collection) {
            collection.insert(
              material,
              {safe: true},
                function (err, result) {
                    if (err) {
                        res.send({ 'error': err });
                    } else {
                        res.send(material);
                    }
                });
        });
    });

    ///////////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////////
    router.post('/reset', function (req, res) {

      var pageQuery = {};

      var fieldQuery = {};

      db.collection(config.materials, function (err, collection) {
        collection.find(fieldQuery, pageQuery)
          .sort({name: 1}).toArray(
          function (err, items) {

            if (err) {
              res.status(204); //HTTP 204: NO CONTENT
              res.err = err;
            }

            async.each(items,

              function (item, callback) {

                item.price = 1.0;
                item.currency = 'USD';

                collection.update(
                  {'_id': item._id},
                  item,
                  {safe: true},
                  function (err2, result) {

                    callback();
                  });
              },
              function (err) {

                res.send('ok')
              });
          });
      });
    });

    return router;
}
