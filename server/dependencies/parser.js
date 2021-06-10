var nodeUtils = require('util');
var chalk = require('chalk');

function parse (inputArray) {
	var currentDepth = 1;
	var lineOfCode;
	var parentArray = [0];
	var tree = {
		depth: 0,
		id: 0,
		//parent: null,
		childs: []
	};
	var currentValue = {};

	var getToValue = function (tree, obj) {
		if (tree.id === obj.parent) {
			tree.childs.push(obj)
		} else {
			for (var i = 0; i < tree.childs.length; i++) {
				getToValue(tree.childs[i], obj)
			}
		}		
	};

	var pushToLeaf = function (obj) {
		if (obj.value === '}') return;
		getToValue(tree, obj)
	};

	inputArray = inputArray.filter(function (line) {
		return line !== '}' && line !== '';
	});
	inputArray = inputArray.map(function (line) {
		return line.trim();
	});

	console.log('after filtering', inputArray)

	for (var i = 0; i < inputArray.length; i++) {
		lineOfCode = inputArray[i];
		if (lineOfCode.startsWith('}') && lineOfCode.endsWith('{')) {
			currentDepth--;
			parentArray.pop();
			pushToLeaf({depth: currentDepth, id: i + 1, parent: parentArray[parentArray.length -1], value: lineOfCode, childs: []})
			currentDepth++;
		} else {
			pushToLeaf({depth: currentDepth, id: i + 1, parent: parentArray[parentArray.length -1], value: lineOfCode, childs: []})
		}
		if (lineOfCode.startsWith('do')) {

		} else if (lineOfCode.startsWith('if') || lineOfCode.includes('else')) {
			parentArray.push(i + 1);
		}
		lineOfCode.endsWith('{') && !lineOfCode.startsWith('}') ? ++currentDepth : null;
		lineOfCode.startsWith('}') && !lineOfCode.endsWith('{') ? parentArray.pop() && --currentDepth : null;
	}
	return tree;
}

module.exports = {
	parse: parse
};