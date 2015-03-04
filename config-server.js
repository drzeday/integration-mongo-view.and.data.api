/**
 * Created by leefsmp on 2/19/15.
 */

//This sample is using a sample mongodb hosted on mongolab.com
//You can change to your own mongo database

var config = {};

config.user = 'adnviewermongodbuser';
config.pass = 'V&DApiRocks!';
config.host = 'ds031701.mongolab.com';
config.port = 31701;
config.db = 'adn-viewer-mongodb-public';
config.productsCollection = 'invproducts';

module.exports = config;