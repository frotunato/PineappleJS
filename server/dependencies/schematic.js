var fs = require('fs');
var inputFile = __dirname + '/alpha.schematic';
var outputFile = __dirname + '/omega.schematic';
var mcnbt = require('./mcnbt/nbt.js');
var nodeUtils = require('util');
var nbt = new mcnbt();
var chalk = require('chalk');
var schematic = {
	blocksByteArray: null,
	dataByteArray: null,
	biomesByteArray: null,
	widthByte: null,
	lengthByte: null,
	heightByte: null,
	tileEntities: null,
	commandsBlocksIds: {
		'impulse': -119,
		'chain': -45,
		'repeating': -46
	},
	addBlockV2: function (block) {
		
		var blockID = (block.type) ? this.commandsBlocksIds[block.type] : 12; //12 = arena
		var blockData = block.orientation ? this._getBlockData(block) : 0x00;
		var blockBiome = 0;
		var index = this._getBlockIndex({
			x: block.x,
			y: block.y,
			z: block.z
		});
		//console.log('x:', block.x, 'y:', block.y, 'z:', block.z, 'id:', blockID, 'index', index, block.orientation, 'length', this.biomesByteArray.getValue().length)
		this.blocksByteArray.insert(blockID, index);
		(blockID.y === 0) ? this.biomesByteArray.push(blockBiome) : undefined;
		this.dataByteArray.insert(blockData, index);

	}, //biomas cascan
	_getBlockIndex: function (coords) {
		return (coords.y * this.lengthByte.getValue() + coords.z) * this.widthByte.getValue() + coords.x;
	},
	_getBlockData: function (block) {
		var value;
		switch (block.orientation) {
			case 'down':
				value = 0x00;
				break;
			case 'up':
				value = 0x01;
				break;
			case 'north':
				value = 0x02;
				break;
			case 'south':
				value = 0x03;
				break;
			case 'left':
				value = 0x04;
				break;
			case 'right':
				value = 0x05;
				break;
			default:
				value = 0x00;
		}
		value = (block.conditional) ? value + 8 : value;
		return value;
	},
	addBlocksV2: function (blockArray) {
		if (!Array.isArray(blockArray)) throw new Error('addBlockV2: parameter is not an array');
		var currentBlock;
		//console.log(blockArray.length, 'aaayy')
		schematic.lengthByte.setValue((blockArray.length >= 16) ? 16 : blockArray.length);
		schematic.widthByte.setValue((Math.ceil(blockArray.length / 16) < 16) ? Math.ceil(blockArray.length / 16) : 16);
		schematic.heightByte.setValue(Math.ceil(blockArray.length / 256));
		this.fillGapsV2(blockArray)
		this.blocksByteArray.fill(blockArray.length);
		this.biomesByteArray.fill(((blockArray.length) > 256) ? 256 : blockArray.length); //max biome size must be 256 bytes
		this.dataByteArray.fill(blockArray.length); //not sure
		for (var i = 0; i < blockArray.length; i++) {
			currentBlock = blockArray[i];
			this.addBlockV2(currentBlock);
			if (currentBlock.value || currentBlock.value === '') {
				this.addTileEntity({
					x: currentBlock.x,
					y: currentBlock.y,
					z: currentBlock.z,
					Command: currentBlock.value || '',
					TrackOutput: currentBlock.TrackOutput || 0,
					SuccessCount: currentBlock.SuccessCount || 0,
					id: currentBlock.id || 'Control',
					CustomName: currentBlock.CustomName || '@'
				});
			}
		}
	},
	addBlocks: function (blockIDArray) {
		if (!Array.isArray(blockIDArray)) throw new Error('addBlocks: parameter is not an array');
		var currentBlock;
		for (var i = 0; i < blockIDArray.length; i++) {
			currentBlock = blockIDArray[i];
			this.addBlockV2(currentBlock);
			this.addTileEntity({
				x: currentBlock.x,
				//x: blockDepth,
				y: currentBlock.y,
				//y: counter,
				z: currentBlock.z,
				//z: heightByte.getValue(),
				Command: currentBlock.value || '',
				TrackOutput: currentBlock.TrackOutput || 0,
				SuccessCount: currentBlock.SuccessCount || 0,
				id: currentBlock.id || 'Control',
				CustomName: currentBlock.CustomName || '@'
			});
		}
	},
	createTag: function (type, name, defaultValue) {
		//console.log(chalk.blue('tag is', defaultValue))
		if (!type) throw new Error('createTag: no type is specified!');
		var tags = require('./mcnbt/lib/tags.js');
		var BaseTag = require('./mcnbt/lib/base_tag.js');
		var tag = new tags[type];
		if (defaultValue !== undefined) {
			tag.setValue(defaultValue);
		}
		tag.id = name
		return tag;
	},
	addTileEntity: function (obj)  {
		var compoundTag = this.createTag(10, '', {});
		//console.log(nodeUtils.inspect(obj, {colors: true}));
		var entries = {
			x: this.createTag(3, 'x', obj.x),
			y: this.createTag(3, 'y', obj.y),
			z: this.createTag(3, 'z', obj.z),
			SuccessCount: this.createTag(3, 'SuccessCount', obj.SuccessCount),
			auto: this.createTag(3, 'auto', 1),
			TrackOutput: this.createTag(1, 'TrackOutput', obj.TrackOutput),
			Command: this.createTag(8, 'Command', obj.Command),
			CustomName: this.createTag(8, 'CustomName' , obj.CustomName),
			id: this.createTag(8, 'id', obj.id)
		};
		for (var key in entries) {
			compoundTag.setByName(key, entries[key], true);
		}
		//console.log(nodeUtils.inspect(compoundTag.toJSON(), {colors: true}));
		this.tileEntities.push(compoundTag);
	},
	fillGapsV2: function (blockArray) {
		var isOdd = function (num) {
			return (num % 2 === 1) ? true : false;
		};
		var coords = {
			x: 0,
			y: 0,
			z: 0,
			_isCorner: false,
			update: function () {
				if (this._isCorner) {
					this._isCorner = false;
					this.y++;
				} else {
					if (!isOdd(this.y)) {
						if (this.z <= 14 && !isOdd(this.x)) {
							this.z++;
						} else if (isOdd(this.x) && this.z > 0){
							this.z--;
						} else if (this.z === 15 || this.z === 0) {
							this.x++;
						}
					} else {
						if (this.z <= 14 && isOdd(this.x)) {
							this.z++;

						} else if (this.z > 0 && !isOdd(this.x)) {
							this.z--;

						} else if (this.z === 15 || this.z === 0) {
							this.x--;
						}
					}
					this._isCorner = (this.x === 0 && this.z === 0) || (this.x === 15 && this.z === 0);
				} 	
			}
		};
		//console.log('[fillGapsV2]: ', 'length', this.lengthByte.getValue(), 'width', this.widthByte.getValue(), 'array length', blockArray.length);
		var numberOfGaps = this.lengthByte.getValue() * this.widthByte.getValue() - blockArray.length;
		//console.log('yoyoyyo', numberOfGaps)
		numberOfGaps = (numberOfGaps < 0) ? (256 + numberOfGaps) : numberOfGaps;
		//console.log('we need to fill:', numberOfGaps)

		var lastCoords = blockArray[blockArray.length - 1];
		coords.x = lastCoords.x;
		coords.y = lastCoords.y;
		coords.z = lastCoords.z;
		for (var i = 0; i < numberOfGaps; i++) {
			coords.update();
			blockArray.push({
				x: coords.x,
				y: coords.y,
				z: coords.z,
			});
		}
	},
	init: function (nbt) {
		console.log('this is nbt', nbt.select('Schematic'))
		this.blocksByteArray = nbt.select('Schematic').select('Blocks');
		this.dataByteArray = nbt.select('Schematic').select('Data');
		this.biomesByteArray = nbt.select('Schematic').select('Biomes');
		this.widthByte = nbt.select('Schematic').select('Width');
		this.lengthByte = nbt.select('Schematic').select('Length');
		this.heightByte = nbt.select('Schematic').select('Height');
		this.tileEntities = nbt.select('Schematic').select('TileEntities');
	}
};

function create (source, callback) {
	nbt.loadFromFile(inputFile, function (err) {
		if (err) console.log(err)
		schematic.init(nbt);
		schematic.addBlocksV2(source);
		nbt.writeToCompressedBuffer(function (err, buffer) {
			if (err) console.log(err, chalk.red('Schematic file cannot be generated!!'));
			console.log(chalk.green('Schematic file written successfully'));
			callback(err, buffer);	
		});
	});
}

module.exports = {
	create: create
};