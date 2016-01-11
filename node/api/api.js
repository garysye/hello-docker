var Promise = require("bluebird");
var redis = require('promise-redis')(function(resolver) {
  return new Promise(resolver);
});
require("redis-scanstreams")(redis);
var client = redis.createClient('6379', 'redis');
var toArray = require('stream-to-array');

module.exports = function(app) {
  // For GET at this endpoint, push it to Redis and sends a message
  app.get('/hello-world', function(req, res) {
    client.lpush(['hello-world', JSON.stringify({IP: req.ip.split(':').pop(), timestamp: Date.now()})], function(err, reply) {
      if (err) {
        console.error('Error: ' + err);
      }
    });
    res.send({message: 'hello world'});
  });

  // For GET at this endpoint, gets all logs stored in Redis for the endpoint and responds with it
  app.get('/hello-world/logs', function(req, res) {
    client.lrange('hello-world', 0, -1, function(err, logs) {
      if (err) {
        res.status(404).send(err);
      } else {
        res.send(parseLogs(logs));
      }
    });
  });

  // For GET at this endpoint, gets all logs stored for every endpoint in Redis and responds with it
  app.get('/logs', function(req, res) {
    var data = {logs: {}, errs: {}};
    var promises = [];
    // Gets all keys stored in Redis
    toArray(client.scan(), function(err, keys) {
      if (err) {
        res.status(404).send(err);
      } else {
        // For each key, gets data stored for each key and builds it up
        keys.forEach(function(key) {
          promises.push(client.lrange(key, 0, -1)
            .catch(function(err) {
              data.err[key] = err;
            })
            .then(function(logs) {
                data.logs[key] = parseLogs(logs);
            }));
        });
        // When data is retrieved for all keys, resonds with it
        Promise.all(promises)
          .then(function() {
            res.send(data);
          });
      }
    });
  });
};

// Since logs are stored as stringified hashes, parse each one
var parseLogs = function(logs) {
  logs.forEach(function(log, ind) {
    logs[ind] = JSON.parse(log);
  });
  return logs;
}
