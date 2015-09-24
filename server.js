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
var credentials = require('./config/credentials');
var ViewAndDataClient = require('./routes/view-and-data-client');

var viewAndDataClient = new ViewAndDataClient(
  credentials.BaseUrl,
  credentials.ConsumerKey,
  credentials.SecretKey);

var dbConnector = require('./routes/dbConnector');
var config = require('./config/config-server');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var express = require('express');

var app = express();

app.use(config.host, express.static(__dirname + '/www'));
app.use(favicon(__dirname + '/www/resources/img/favicon.ico'));

app.use(bodyParser.urlencoded({ extended: false, limit: '500mb' }));
app.use(bodyParser.json({limit: '500mb'}));

var connector = new dbConnector(config);

connector.initializeDb(

  function(db){

      app.use(config.host + '/api/materials', require('./routes/api/materials')(db));
      app.use(config.host + '/api/models', require('./routes/api/models')(db));

      viewAndDataClient.onInitialized(function() {

          app.use(config.host + '/api/token', require('./routes/api/token')(viewAndDataClient));
      });

  }, function(error) {

      console.log(error);
  });

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {

    console.log('Server listening on port ' +
        server.address().port);
});
