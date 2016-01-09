var express = require('express');
var app = express();

var apiRouter = express.Router();

app.use('/v1', apiRouter);

require('./api/api')(apiRouter);

app.listen(3000, function () {
  console.log('Hello Docker listening on port 3000');
});
