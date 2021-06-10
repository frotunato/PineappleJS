var config = require('./config');
process.env.NODE_ENV = config.enviroment;
var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app);
var compress = require('compression');
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
app.use(compress());
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(config.views));
app.set('view engine', 'jade');
app.set('views', config.views);

require('./routes')(app);   

server.listen(config.port, config.ip, function () {
  console.log('Express server (' + app.get('env') + ') running at', config.ip, 'port', config.port, 'in', config.enviroment, 'mode');
});