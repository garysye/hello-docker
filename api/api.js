module.exports = function(app) {
  app.get('/hello-world', function(req, res) {
    console.log('beep boop');
    res.send({message: 'hello world'});
  });

  app.get('/hello-world/logs', function(req, res) {

  });

  app.get('/logs', function(req, res) {

  });
};
