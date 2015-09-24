/**
 * Created by leefsmp on 2/19/15.
 */

var configClient = {
  host: '/node/mongo',
  viewAndDataUrl: 'https://developer.api.autodesk.com'
}

configClient.ApiURL = "http://" +
  window.location.host +
  configClient.host +
  '/api';

module.exports = configClient;
