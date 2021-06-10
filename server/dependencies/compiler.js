var chalk = require('chalk');
var nodeUtils = require('util');

function compile (tree) {
	var output = [];
	var conditionCounter = 0;
	var aliasArray = [];
	var isNode = function (element) {
		return (element.childs.length !== 0) ? true : false;
	};
	var blocks = (function (tree) {
		var arr = [];
		var parseInput = function (node) {
			if (!node.visited) {
				node.visited = true;
				arr.push({
					value: node.value,
				 	parent: node.parent, 
				 	id: node.id,
				 	depth: node.depth, 
				 	isNode: isNode(node)
				 });
			}
			for (var i = 0; i < node.childs.length; i++) {
				parseInput(node.childs[i])
			}
		}
		parseInput(tree);
		arr.shift();
		return arr;
	})(tree);
	var sanitizeCommand = function (command) {
		if (command.charAt(command.length - 1) === '{') {
			if (command.includes('if') && !command.includes('else')) {
				command = command.substring(0, command.lastIndexOf('{'));
				command = command.replace('if', '');
			} else if (command.includes('else') && !command.includes('else if')) {
				command = command.replace('}', '').replace('else', '');
				command = command.substring(0, command.lastIndexOf('{'));
			} else if (command.includes('else if')) {
				command = command.replace('}', '').replace('else if', '');
				command = command.substring(0, command.lastIndexOf('{'));
			}
			command = command.includes('!') ? command.replace('!', '') : command;
			command = command.replace('(', '');
			command = command.substring(0, command.lastIndexOf(')'));
		} else if (command.includes('::')) {
			command = command.replace('::', '');
		}
		command = alias.replace(command);
		return command.trim();
	};
	var coords = {
		x: 0,
		y: 0,
		z: 0,
		value: null,
		orientation: 'south',
		conditional: false,
		_isCorner: false,
		_counter: 0,
		_isTurn: function (optCoords) {
			var res;
			var _x = (optCoords) ? optCoords.x : this.x;
			var _y = (optCoords) ? optCoords.y : this.y;
			var _z = (optCoords) ? optCoords.z : this.z;
			if (_x + _y + _z === 0) {
				res = false;
			} else {
				res = (_z === 15 && !this._isOdd(_x)) || (_z === 0 && this._isOdd(_x));
			}
			return res;
		},
		_isOdd: function (num) {
			return (num % 2 === 1) ? true : false;
		},
		update: function (optCoords, simulation) {
			var _x = (optCoords) ? optCoords.x : this.x;
			var _y = (optCoords) ? optCoords.y : this.y;
			var _z = (optCoords) ? optCoords.z : this.z;
			var _orientation = (optCoords) ? optCoords.orientation : this.orientation;
			var _isCorner = (optCoords) ? optCoords._isCorner : this._isCorner;
			if (_isCorner) {
				console.log('up', _isCorner);
				_orientation = 'south';
				_isCorner = false;
				_y++;
			} else {
				if (!this._isOdd(_y)) {
					if (_z <= 14 && !this._isOdd(_x)) {
						_z++;
						_orientation = (_z === 15) ? 'right' : _orientation;
					} else if (this._isOdd(_x) && _z > 0){
						_z--;
						_orientation = (_z === 0) ? 'right' : _orientation;
					} else if (_z === 15 || _z === 0) {
						_orientation = (_z > 0) ? 'north' : 'south';
						_x++;
					}
				} else {
					if (_z <= 14 && this._isOdd(_x)) {
						_z++;
						_orientation = (_z === 15) ? 'left' : _orientation;
					} else if (_z > 0 && !this._isOdd(_x)) {
						_z--;
						_orientation = (_z === 0) ? 'left' : _orientation;
					} else if (_z === 15 || _z === 0) {
						_x--;
						_orientation = (_z > 0) ? 'north' : 'south';
					}
				}
				_isCorner = (_x === 0 && _z === 0) || (_x === 15 && _z === 0);
				_orientation = (_isCorner) ? 'up' : _orientation;
			}
			if (simulation) {
				return {x: _x, y: _y, z: _z, orientation: _orientation, _isCorner: _isCorner};
			}
			this.x = _x;
			this.y = _y;
			this.z = _z;
			this.orientation = _orientation;
			this._isCorner = _isCorner;
		},
		add: function (data, bypass) {
			var obj = {};
			//if (output.length > 0)
			//	console.log('checking', output[output.length - 1].orientation === ('up' || 'left' || 'right'))
			//console.log('adding', data.value)
			if (!bypass && (data.conditional && (this._isTurn() || this._isTurn(output[output.length - 1])))) {
				//console.log(data.value, 'uou')
				obj = addSpacerBlock(output[output.length - 1], data);
				console.log(chalk.red.bold('WARNING!, conditional block at corner... reallocated.', data.value, data.conditional))
			} else {
				obj = {
					x: this.x,
					y: this.y,
					z: this.z,
					conditional: data.conditional,
					orientation: this.orientation,
					value: sanitizeCommand(data.value)
				};
				if (status.firstNodeFound && this._counter > 80 && obj.conditional === false) {
					obj.type = 'repeating';
					console.log(chalk.green.bold('added repeating command block to increment the strength of the signal, command was', data.value));
					this._counter = 0;
				} else {
					obj.type = data.type;
					this._counter++;
				}
				output.push(obj);
				this.update();
			}
			return obj;
		},
		getOffset: function (offset, optCoords) {
			var that = this;
			optCoords = optCoords || this;
			for (var i = 0; i < offset; i++) {
				optCoords = this.update(optCoords, true);
			}
			return optCoords;
		}
	};
	var block;
	var getJumpSize = function (source, end) {
		var str = '';
		if (end.conditional && ((end.z === 15 && coords._isOdd(end.x)) || (end.z === 0 && !coords._isOdd(end.x)))) {
			end = coords.getOffset(1, coords);
			//console.log('offset of 1', source.value)
		} else if (end.conditional && coords._isTurn(end)) {	
			var value = 2;
			//console.log('offset of 2', source.value)
			end = coords.getOffset(2, coords);
		}
		var jump = {
			x: '~' + (source.x - end.x),
			y: ' ~' + (source.y - end.y),
			z: ' ~' + (source.z + /*(coords.getOffset())*/ - end.z)
		};
		for (var key in jump) {
			jump[key] = (jump[key].includes('~0')) ? ' ~' : jump[key];
			str = str.concat(jump[key]);
		}
		str = str.trim();
		return str;
	};
	var getCurrentParent = function (obj) {
		var parentArray = depthReferences[obj.depth - 1];
		var value;
		if (!parentArray) return null;
		for (var i = 0; i < parentArray.length; i++) {
			if (parentArray[i].id === obj.parent) {
				value = parentArray[i];
				break;
			}
		}
		return value;
	};
	var status = {
		firstNodeFound: false,
		firstSingleExecution: null
	};
	var params = {};
	var depthReferences = {};
	var addSpacerBlock = function (blockBehind, block) {
		//console.log(chalk.yellow.underline('addSpacerBlock'), coords.getOffset())
		var jumpSize;
		if (blockBehind.orientation === 'north' || blockBehind.orientation === 'south') { //-> optimization
			coords.add({
				value: '',
				type: 'chain',
				conditional: false,
				spacer: true
			}, true);
		}
		coords.conditional = false;
		jumpSize = getJumpSize(blockBehind, coords);
		coords.add({
			value: '/testforblock ' + jumpSize + ' minecraft:' + blockBehind.type + '_command_block -1 {SuccessCount: 1}',
			conditional: false,
			type: 'chain',
			spacer: true
		}, true);
		return coords.add(block, true);
	};
	var addSingleExecutionCommand = function (block) {
		var lastCommand = addCommand(block);
		var tagCheck = lastCommand[0];
		var command = lastCommand[1];
		console.log('command is', command.value)
		coords.conditional = true;
		jumpSize = getJumpSize(command, coords);
		coords.add({
			value: '/blockdata ' + jumpSize + ' {auto:0}', //kill the first
			type: 'chain',
			conditional: true
		});
		coords.conditional = false;
		jumpSize = getJumpSize(tagCheck, coords);
		coords.add({
			value: '/testforblock ' + jumpSize + ' minecraft:' + tagCheck.type + '_command_block -1 {SuccessCount: 0}', //check parent
			type: 'chain',
			conditional: false
		});
		coords.conditional = true;
		jumpSize = getJumpSize(command, coords);
		coords.add({
			value: '/blockdata ' + jumpSize + ' {auto:1}', //revive the first
			type: 'chain',
			conditional: true
		});
	};
	var addConditionalBlocks = function (currentParent, inverted) {
		//var currentParent = output[output.length - 1];
		coords.add({
			value: '/scoreboard players tag @e[type=ArmorStand,score_PineAppleJS_min=1,c=1] ' + ((inverted) ? 'remove' : 'add') + ' condition' + block.id,
			conditional: true,
			type: 'chain'
		});
		coords.conditional = false;
		var jumpSize = getJumpSize(currentParent, coords);
		coords.add({
			value: '/testforblock ' + jumpSize + ' minecraft:' + currentParent.type + '_command_block -1 {SuccessCount: 0}', //check parent
			conditional: false,
			type: 'chain'
		});
		coords.add({
			value: '/scoreboard players tag @e[type=ArmorStand,score_PineAppleJS_min=1,c=1] ' + ((inverted) ? 'add' : 'remove') + ' condition' + block.id,
			conditional: true,
			type: 'chain'
		});
	};
	var getTags = function (block) {
		var tags = (function (block) {
			var conditionsIds = [];
			var getParentChain = function (parent) {
				if (!parent) return;
				conditionsIds.push("condition" + parent.id);
				console.log('condition', parent.id, 'equals', parent.value);
				getParentChain(getCurrentParent(parent));
			};
			getParentChain(getCurrentParent(block));
			return conditionsIds;
		})(block);
		return tags;
	};
	var addCommand = function (block) {
		var tags = getTags(block);
		var tagCheck = coords.add({
			value: '/testfor @e[type=ArmorStand,score_PineAppleJS_min=1,c=1] {Tags:' + JSON.stringify(tags) + '}',
			type: 'chain', //we need to cover first block case!!!
			conditional: false
		});
		block.conditional = true;
		block.type = 'chain';
		var command = coords.add(block);
		return [tagCheck, command];
	};
	var alias = {
		_aliasNames: [],
		_aliasValues: [],
		add: function (alias) {
			if (!/@a|@r|@p|@e/.test(alias)) throw new Error('Alias does not contains a target selector');
			else if (!alias.includes('var') || !alias.includes('=')) throw new Error('Malformed alias');
			else {
				var separatorIndex = alias.indexOf('=');
				this._aliasNames.push(alias.substring(0, separatorIndex).replace('var', '').trim());
				this._aliasValues.push(alias.substring(separatorIndex).replace('=', '').trim());
			}
		},
		replace: function (string) {
			for (var i = this._aliasNames.length - 1; i >= 0; i--) {
				if (string.indexOf(this._aliasNames[i]) > 0) {
					string = string.replace(this._aliasNames[i], this._aliasValues[i]);
				}
			}
			return string;
		}
	};
	var init = (function () {
		coords.add({
			value: '/scoreboard objectives add PineAppleJS dummy',
			conditional: false,
			type: 'impulse'
		});
		coords.add({
			value: '/summon ArmorStand ~ ~1 ~ {NoGravity:1b}',
			conditional: true,
			type: 'chain'
		});
		coords.add({
			value: '/scoreboard players add @e[type=ArmorStand,c=1] PineAppleJS 1',
			conditional: true,
			type: 'chain'
		});
	})();
	var targetSelectors = [];
	for (var i = 0; i < blocks.length; i++) {
		block = blocks[i];
		params.type = 'chain';
		if (block.isNode) {
			if (!status.firstNodeFound) {
				status.firstNodeFound = true;
				params.conditional = false;
				params.type = 'repeating';
				params.isFirstNode = true;
				coords._counter = output.length - 1;
			}
			if (!depthReferences[block.depth]) {
				depthReferences[block.depth] = [];
			}
			var pBlock = coords.add({
				value: block.value,
				type: params.type,
				conditional: params.conditional
			});
			depthReferences[block.depth].push({
				x: coords.x,
				y: coords.y,
				z: coords.z,
				value: block.value,
				conditional: params.conditional,
				parent: block.parent,
				id: block.id,
				type: params.type,
				isFirstNode: block.isFirstNode,
				depth: block.depth
			});
			block.inverted = (block.value.includes('!')) ? true : false;
			addConditionalBlocks(pBlock, block.inverted);
		} else {
			if (block.value.includes('::')) {
				addSingleExecutionCommand(block);
			} else if (block.value.includes('var')) {
				alias.add(block.value);
			} else {
				addCommand(block);
			}
		}
	}
	//console.log(nodeUtils.inspect(depthReferences, {showHidden: false, depth: null, colors: true}));
	return output;
}

module.exports = {
	compile: compile
};