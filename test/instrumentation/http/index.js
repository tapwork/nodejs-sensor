'use strict';

require('../../../')();
var express = require('express');
var app = express();

app.get('/', function root(req, res) {
  if (Math.random() > 0.5) {
    setTimeout(function() {
      res.send('Hello World!');
    }, (Math.random() + 0.3) * 3000);
  } else {
    res.send('Hello World!');
  }
});

var server = app.listen(3210, function onListen() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});