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
var credentials = require('../credentials');
var config = require('../config-server');
var express = require('express');
var request = require('request');
var mongo = require('mongodb');
var util = require('util');

var router = express.Router();

var mongoClient = mongo.MongoClient,
    BSON = mongo.BSONPure;

var url = util.format('mongodb://%s:%s@%s:%d/%s',
    config.user,
    config.pass,
    config.host,
    config.port,
    config.db);

var db = null;

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
mongoClient.connect(url, function(err, mongoDb) {

    if(err) {

        console.log(err);
    }
    else {

        console.log("Connected to " + config.db);

        db = mongoDb;
    }
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.get('/product/:productId', function (req, res) {

    var productId = req.params.productId;

    db.collection(config.productsCollection, function (err, collection) {

        collection.findOne(

            { 'ProductId': productId },

            function (err, item) {

                var response = {
                    product: item
                };

                res.status((item ? 200 : 404));
                res.send(response);
            });
    });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.post('/product/:id', function (req, res) {

    var id = req.params.id;

    var item = req.body;

    item._id = new BSON.ObjectID(id);

    db.collection(config.productsCollection, function (err, collection) {
        collection.update(
            { '_id': new BSON.ObjectID(id) },
            item,
            { safe: true },
            function (err, result) {
                if (err) {
                    res.send({ 'error': err });
                } else {
                    res.send(item);
                }
            });
    });
});

///////////////////////////////////////////////////////////////////////////////
// Generates access token (production)
//
///////////////////////////////////////////////////////////////////////////////
router.get('/token', function (req, res) {

    var params = {
        client_id: credentials.ClientId,
        client_secret: credentials.ClientSecret,
        grant_type: 'client_credentials'
    }

    request.post(
        credentials.BaseUrl + '/authentication/v1/authenticate',
        { form: params },

        function (error, response, body) {

            if (!error && response.statusCode == 200) {

                res.send(body);
            }
        });
});

///////////////////////////////////////////////////////////////////////////////
// Generates access token (staging)
//
///////////////////////////////////////////////////////////////////////////////
router.get('/tokenstg', function (req, res) {

    var params = {
        client_id: credentialsStg.ClientId,
        client_secret: credentialsStg.ClientSecret,
        grant_type: 'client_credentials'
    }

    request.post(
        credentialsStg.BaseUrl + '/authentication/v1/authenticate',
        { form: params },

        function (error, response, body) {

            if (!error && response.statusCode == 200) {

                res.send(body);
            }
        });
});

module.exports = router;
