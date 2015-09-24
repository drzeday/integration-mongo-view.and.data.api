/**
 * Created by leefsmp on 2/19/15.
 */

//This sample is using a sample mongodb hosted on mongolab.com
//You can change to your own mongo database

var mongo = {

  user: '',
  pass: '',
  dbhost: 'localhost',
  port: 27017,
  db:   'mongo-stg',
  host: '/node/mongo',
  materials: 'mongo.materials',
  models: 'mongo.models'
}

module.exports = mongo;

