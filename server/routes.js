var path = require('path');
var chalk = require('chalk');
module.exports = function (app) {
	app.use('/schematic', require('./dependencies'));
	app.route('/').get(function (req, res) {
		res.render('index.jade');
	});
};