var Promise = require("bluebird");
var redis = require('promise-redis')(function(resolver) {
  return new Promise(resolver);
});
require("redis-scanstreams")(redis);
var client = redis.createClient('6379', 'redis');
var toArray = require('stream-to-array');

module.exports = function(app) {
  app.get('/hello-world', function(req, res) {
    client.lpush(['hello-world', JSON.stringify({IP: req.ip.split(':').pop(), timestamp: Date.now()})], function(err, reply) {
      if (err) {
        console.log('Error: ' + err);
      } else {
        console.log('Reply: ' + reply);
      }
    });
    res.send({message: 'hello world'});
  });

  app.get('/hello-world/logs', function(req, res) {
    client.lrange('hello-world', 0, -1, function(err, logs) {
      if (err) {
        res.status(404).send(err);
      } else {
        res.send(parseLogs(logs));
      }
    });
  });

  app.get('/logs', function(req, res) {
    var data = {logs: {}, errs: {}};
    var promises = [];
    toArray(client.scan(), function(err, keys) {
      if (err) {
        res.status(404).send(err);
      } else {
        console.log(keys);
        keys.forEach(function(key) {
          promises.push(client.lrange(key, 0, -1)
            .catch(function(err) {
              data.err[key] = err;
            })
            .then(function(logs) {
                data.logs[key] = parseLogs(logs);
            }));
          console.log(promises);
        });
        Promise.all(promises)
          .then(function() {
            console.log(data);
            res.send(data);
          });
      }
    });
  });
};

var parseLogs = function(logs) {
  logs.forEach(function(log, ind) {
    logs[ind] = JSON.parse(log);
  });
  return logs;
}
