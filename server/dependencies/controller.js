var parser = require('./parser.js');
var compiler = require('./compiler.js');
var schematic = require('./schematic.js');
var lineReader = require('readline');

function generateSchematic (req, res) {
	var code = [];
	console.log('hey, generateSchematic', req.body);
	code = req.body.source.split('\n');
	var tree = parser.parse(code);
	var output = compiler.compile(tree);
	schematic.create(output, function (err, buffer) {
		console.log('done');
		if (err) {
			res.status(200).send(JSON.stringify({msg: 'Error: incorrect input'}));
			return;
		}
		res.set({
			'Content-Type': 'application/octet-stream',
       		'Content-Disposition': 'attachment; filename=' + req.body.filename + '.schematic' || Date.now() + '.schematic',
       		'Content-Length': buffer.length
        })
		res.status(200).send(buffer);
	});
}

module.exports = {
	generateSchematic: generateSchematic
}