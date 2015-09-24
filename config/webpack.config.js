/**
 * Created by leefsmp on 4/6/15.
 */
var path = require('path');

module.exports = {

  entry: {
    app: "./www/js/app.js"
  },

  output: {
    path: path.join(__dirname, '/www/build/'),
    filename: "[name].min.js"
  },

  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style!css"
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel?optional[]=runtime'
      }
    ]
  },

  resolve: {
    // enables require('file') instead of require('file.ext')
    extensions: ['', '.js', '.json', '.css']
  },

  plugins: []
};