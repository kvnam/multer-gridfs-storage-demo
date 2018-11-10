const controller = require('./controller');

module.exports = app => {
  app.get('/', controller.loadHome);
  app.post('/upload', controller.uploadFile);
  app.post('/getfile', controller.getFile);
}