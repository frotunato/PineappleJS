var path = require('path');
var config = {
	ip: process.env.IP || 'localhost' || '192.168.1.4',
	enviroment: process.env.NODE_ENV || 'development',
	root: path.normalize(__dirname + '/..'),
	views: path.join(path.normalize(__dirname + '/..'), 'client'),
	port: 4000
};
module.exports = config;