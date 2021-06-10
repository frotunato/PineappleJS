
var editor = document.getElementById('editor');
var editorButton = document.getElementById('editor-button');
var editorHiddenInput = document.getElementById('editor-hidden-input');
var editorFilenameInput = document.getElementById('editor-filename');
var editorRowCounter = document.getElementById('row-counter');
var sel = document.getSelection();

var editorCtrl = {
	linterCtrl: {
		_parentTree: [],
		_idCounter: 0,
		getLineDepth: function (index) {
			index = (index) ? index : getCurrentLine().index;
		},
		getCurrentDepth: function (startIndex) {
			var currentLine;
			var res = {start: -1, end: -1};
			var closureOffset = 0;
			var upArray = [];
			var downArray = [];

			if (startIndex < 0) {
				res.start = startIndex;
				return res;
			} 
		
			for (var i = startIndex; i < editor.childNodes.length; i++) {
				currentLine = editor.childNodes[i];
				//console.log('search down', currentLine.textContent)
				//if (!currentLine) break;
				if (currentLine.textContent.includes('}')) {
					downArray.push(i);
				}
				//if (closureOffset > 0 && currentLine.textContent.indexOf('}') !== -1) {
				//	closureOffset--;
				//}
				//if (currentLine.textContent.indexOf('{') !== -1) {
				//	closureOffset++;
				//}
				//if (closureOffset === 0 && currentLine.textContent.indexOf('}') !== -1) {
				//	res.end = i;
				//	break;
				//}
			}
			//closureOffset = 0;
			//search up
			for (var j = startIndex; j >= 0; j--) {
				currentLine = editor.childNodes[j];
				//console.log('search up', currentLine.textContent)

				if (currentLine.textContent.includes('{')) {
					upArray.push(j);
				}
				//currentLine = editor.childNodes[j];
				//if (!currentLine) break;
				////console.log('closureOffset', closureOffset, currentLine.textContent.indexOf('{') !== -1)
				//if (currentLine.textContent.indexOf('}') !== -1) {
				//	closureOffset++;
				//}
				//if (closureOffset > 0 && currentLine.textContent.indexOf('{') !== -1) {
				//	closureOffset--;
				//}
				//if (closureOffset === 0 && currentLine.textContent.indexOf('{') !== -1) {
				//	res.start = j;
				//	break;
				//} 
				
			}

			upArray = upArray.filter(function(val) {
  				return downArray.indexOf(val) === -1;
			});

			downArray = downArray.filter(function (val) {
				return upArray.indexOf(val) === -1;
			});

			res = Math.min(upArray.length, downArray.length);
			console.log(res, upArray, downArray);
			/*
			for (var i = startIndex; i < editor.childNodes.length; i++) {
				currentLine = editor.childNodes[i];
				if (closureOffset > 0) {
				 	if (currentLine.textContent.includes('}')) {
				 		closureOffset--;
				 		if (closureOffset === 0) {
				 			res.end = i;
				 			break;
				 		}
				 	}
				 	if (currentLine.textContent.includes('{')) {
				 		closureOffset++;
				 		if (closureOffset === 0) {
				 			res.end = i;
				 			break;
				 		}

				 	}
				} else {
					res.end = i;
					break;
				}
				
			}
			closureOffset = 0;
			for (var j = startIndex - 1; j >= 0; j--) {
				currentLine = editor.childNodes[j];
				if (!currentLine) break;

				if (closureOffset > 0) {
					if (currentLine.textContent.includes('}')) {
						closureOffset++;
						if (closureOffset === 0) {
							res.start = j;
							break;
						}
					}
					if (currentLine.textContent.includes('{')) {
						closureOffset--;
						if (closureOffset === 0) {
							res.start = j;
							break;
						}

					}
				} else {
					res.start = j;
					break;
				}
			}

			
			//search down
			for (var i = startIndex + 1; i < editor.childNodes.length; i++) {
				currentLine = editor.childNodes[i];
				if (!currentLine) break;
				
				if (closureOffset > 0 && currentLine.textContent.indexOf('}') !== -1) {
					closureOffset--;
				}
				if (currentLine.textContent.indexOf('{') !== -1) {
					closureOffset++;
				}
				if (closureOffset === 0 && currentLine.textContent.indexOf('}') !== -1) {
					res.end = i;
					break;
				}
			}
			closureOffset = 0;
			//search up
			for (var j = startIndex - 1; j >= 0; j--) {
				currentLine = editor.childNodes[j];
				if (!currentLine) break;
				//console.log('closureOffset', closureOffset, currentLine.textContent.indexOf('{') !== -1)
				if (currentLine.textContent.indexOf('}') !== -1) {
					closureOffset++;
				}
				if (closureOffset > 0 && currentLine.textContent.indexOf('{') !== -1) {
					closureOffset--;
				}
				if (closureOffset === 0 && currentLine.textContent.indexOf('{') !== -1) {
					res.start = j;
					break;
				} 
				
			}*/
			//console.log(upArray, downArray)
			//console.log('returned', res);
			return res;
		},/*
		getCurrentDepth: function (startIndex) {
			var parentIndex = startIndex;
			var depth = 0;
			var roof = 5;
			//console.log('currentDepth with startIndex of', startIndex)
			while (parentIndex > 0 && roof > 0) {
				res = this.getParentClosure(parentIndex);
				console.log(res)
				if (res.start < 0) break;
				parentIndex = res.start;
				depth++;
				roof--;
			}
			console.log('DEPTH COUNTER WAS', depth, 'roof', roof);
			return depth;
		},*/
		getIndention: function (depth) {
			var tabSpacer = '\u00A0\u00A0\u00A0\u00A0';
			//var spacer = document.createTextNode('');
			var spacerStr = '';
			for (var i = depth - 1; i >= 0; i--) {
				spacerStr += tabSpacer;
			}
			return spacerStr;
		},
		getSameDepthClosure: function (startIndex) {
			var closureOffset = 0;
			var currentLine;
			var closureIndex = -1;
			for (var i = startIndex; i < editor.childNodes.length; i++) {
				currentLine = editor.childNodes[i];
				console.log('searching...', currentLine.textContent, i);
				if (closureOffset === 0 && currentLine.textContent.indexOf('}') !== -1) {
					closureIndex = i;
					break;
				} else if (closureOffset > 0 && currentLine.textContent.indexOf('}') !== -1) {
					closureOffset--;
				}
				if (currentLine.textContent.indexOf('{') !== -1) {
					closureOffset++;
				}
			}
			//console.log('closure index was', closureIndex);
			return closureIndex;
		},
		registerLine: function (addedNodes) {
			var addedLine = editorCtrl.getCurrentLine(addedNodes);
			//console.log(addedNodes, editorCtrl.getCurrentLine(addedNodes))
			var depth = this.getCurrentDepth(addedLine.index);
			var indentation = this.getIndention(depth);
			if (addedLine.node.textContent.includes ('}')) return;
			addedLine.node.insertBefore(document.createTextNode(indentation), editor.childNodes[addedLine.index].firstChild)
			//console.log(this.getCurrentDepth(addedLine.index));
			//var currentLine = editorCtrl.getCurrentLine();
			//var addedLine = currentLine.node.nextSibling;
			//console.log(addedLine.textContent.includes('}'))
			//if (addedLine.textContent.includes('}')) return;
			////var previousLine = currentLine.node.previousElementSibling;
			//var depth = this.getCurrentDepth(currentLine.index + 1);
			//var indentation = document.createTextNode(this.getIndention(depth));
			////console.log('registerLine call', depth, addedNodes)
			////this.getParentClosure(currentLine.index);
			//console.log('depth', addedLine)
			//addedLine.appendChild(indentation);
			






			//if (editor.childNodes[currentLine.index].textContent.includes('}')) {
			//	return;
			//}
			//if (previousLine.textContent.includes('if') || previousLine.textContent.includes('else')) return;
			//var textNode = document.createTextNode(this.getIndention(depth));
			//textNode.insertData(0, this.getIndention(depth))
			//currentLine.node.insertBefore(textNode, editor.childNodes[currentLine.index])
			//if (previousLine.textContent.includes('if') || previousLine.textContent.includes('else')) {
			//	var fragment = document.createDocumentFragment();
			//	var newLineDiv = document.createElement('div');
			//	fragment.appendChild(newLineDiv);
			//	//newLineDiv.appendChild(indentation);
			//	editor.insertBefore(fragment, previousLine.nextSiblingElement);
			//	//editorCtrl.resetCaretPosition(currentLine.node.previousElementSibling);
			//	//this._parentTree.push({from: currentLine.index - 1, to: currentLine.index + 1});
			//	//this.getSameDepthClosure(currentLine.index - 1);
			//	//this._parentTree.push({from: })
			//	//this.appendClosure(currentLine)
			////} else if (currentLine.node.textContent.includes('}')) {
			////	var closureIndentation = this.getIndention(depth - 1);
			////	currentLine.node.insertBefore(closureIndentation, currentLine.node.firstChild);
			////	console.log('bay')
			//} else {
			//	currentLine.node.insertBefore(indentation, currentLine.node.firstChild)
//
			//}
		},
		appendClosure: function (currentLine) {
			currentLine = (currentLine) ? currentLine : editorCtrl.getCurrentLine();
			var depth = this.getCurrentDepth(currentLine.index);
			var fragment = document.createDocumentFragment();
			var div = document.createElement('div');
			var textNode = document.createTextNode('}');
			fragment.appendChild(div);
			div.appendChild(textNode);
			textNode.insertData(0, this.getIndention(depth))
			currentLine.node.parentNode.insertBefore(fragment, editor.childNodes[currentLine.index + 1])
			console.log('DEEEPTH', depth)
			//nodeLine.parentNode.appendChild(fragment);
			//nodeLine.appendChild(fragment);
			//this._parentTree.push({from: currentLine.index, to: currentLine.index});
		}
	},	
	_highlightCache: 0,
	highlightRowIndex: function (index) {
		if (index === this._highlightCache) {
			return;
		} else if (index === -1) {
			editorRowCounter.childNodes[this._highlightCache].className = '';
			return;
		} else if (!index || !editorRowCounter.childNodes[index]) {
			index = this.getCurrentLine().index | 0;
		} 
		if (!editorRowCounter.childNodes[this._highlightCache]) {
			this._highlightCache = this.getCurrentLine().index;
		}
		if (editor.childNodes.length === 0) return;
		editorRowCounter.childNodes[this._highlightCache].className = '';
		//console.log('index is', index)
		editorRowCounter.childNodes[index].className = 'focus';
		this._highlightCache = index;
	},
	resetCaretPosition: function (element) {
		if (document.createRange) {
		   // var lineNode = this.getCurrentLine().node;
		    var rng = document.createRange();
		    rng.selectNodeContents(element);
		    rng.collapse(false);
		    sel.removeAllRanges();
		    sel.addRange(rng);
		    //console.log('caret at element', sel.anchorNode.tagName)
		}
	},
	getCurrentLine: function (customNode) {
		var element = customNode || sel.anchorNode;
		var i = 0;
		var roof = editor.childNodes.length;
		var res = {};
		while (true && roof > 0) {
			if ((!element.parentNode.previousElementSibling && element.nodeName === '#text') || (element.parentNode.id === 'editor' && !element.previousElementSibling) || (element.id === 'editor')) {
				//>>>>> detect if user is the in middle of a word
				var lastDelimiter = sel.anchorNode.textContent.substring(0, sel.anchorOffset).match(/[\/\s(](?!.*[\/\s(])/);
				lastDelimiter = (lastDelimiter) ? lastDelimiter.index + 1 : -1;
				res = {
					index: i, 
					currentWord: sel.anchorNode.textContent.substring(lastDelimiter, sel.anchorOffset), 
					lastSpacerOffset: lastDelimiter, 
					sourceElement: sel,
					node: editor.childNodes[i]
				};
				break;
			} else if (element.nodeName === 'DIV' && element.previousElementSibling) {
				element = element.previousElementSibling;
				i++;
			} else if (element.nodeName !== 'DIV' && element.parentNode.id !== 'editor') {
				element = element.parentNode.previousElementSibling;
				i++;
			}
			roof--;
		}
		return res;
	},
	replaceReservedWords: function () {
		var currentLine = this.getCurrentLine();
		var lineNode = currentLine.node;
		var match = lineNode.innerHTML.match(/(\bif\b|\belse\b|\bvar\b|[~=])(?!(<\/span>|"))/gi);
		if (match) {
			//var highlightRegExp;
			var span = document.createElement('span');
			var emptySpace = document.createTextNode('');
			span.contentEditable = "false";
			for (var i = match.length - 1; i >= 0; i--) {
				switch (match[i]) {
					case '~':
						span.className = 'coordinate';
						break;
					case '=':
					case 'if':
					case 'else':
						span.className = 'control-flow-statement';
						break;
					case 'var':
						span.className = 'variable';
				}
				var tA = Date.now();
				findAndReplaceDOMText(lineNode, {
					find: match[i],
					wrap: span
				});
				console.log('replace took', Date.now() - tA);
				(!sel.anchorNode.nextSibling) ? sel.anchorNode.insertBefore(emptySpace, sel.anchorNode.nextSibling) : null;
			}
			editorCtrl.resetCaretPosition(lineNode);
		}
	},
	fixEmptyParent: function () {
		if (editor.childNodes.length === 0 || (editor.childNodes.length === 1 && editor.firstChild.nodeName === 'BR')) { //if (editor.innerHTML === '<br>' || editor.innerHTML === '') {
			var fragment = document.createDocumentFragment();
			var emptyDiv = document.createElement('div');
			var br = document.createElement('br');
			//fix jump
			emptyDiv.appendChild(br);
			fragment.appendChild(emptyDiv);
			(editor.childNodes.length === 0) ? editor.appendChild(fragment/*.cloneNode(true)*/) : editor.replaceChild(fragment/*.cloneNode(true)*/, editor.firstChild);
			this.resetCaretPosition(editor.firstChild);
		}
	},
	getTextContent: function () {
		var str = '';
		for (var i = 0; i < editor.childNodes.length; i++) {
			str += editor.childNodes[i].textContent + '\n';
		}
		console.log('str is', str)
		return str;
	},
	setTextContent: function () {
		editorHiddenInput.value = this.getTextContent();
	},
	init: function () {
		var that = this;
		var fragment = document.createDocumentFragment();
		var div = document.createElement('div');
		fragment.appendChild(div);
		var observer = new MutationObserver(function (mutations) {
			for (var i = mutations.length - 1; i >= 0; i--) {
				//console.log('mutation index', i, mutations)
				if (mutations[i].addedNodes.length > 0 && editor.childElementCount > 1) {
					div.textContent = editorRowCounter.childNodes.length + 1;
					editorRowCounter.appendChild(fragment.cloneNode(true));
					console.log(mutations[i])
					//if (mutations[i].addedNodes[0].textContent.includes('}'))
					that.linterCtrl.registerLine(mutations[i].addedNodes[0]);
					that.highlightRowIndex();

				} else if (mutations[i].removedNodes.length > 0) {
					if (editor.childNodes.length > 0 && editorRowCounter.childNodes.length > 1) {
						editorRowCounter.removeChild(editorRowCounter.lastChild);
					} else {
						that.fixEmptyParent();
						that.highlightRowIndex();
					}
				}
			}
		});
		var config = {attributes: true, childList: true, characterData: true};
		observer.observe(editor, config);
		editor.focus();
		this.highlightRowIndex();
	}
};
editorCtrl.init();

var autocomplete = {
	active: false,
	matches: [],
	_lastIndex: 0,
	_lastWord: '',
	_lastOffset: 0,
	getMatchSet: function (str) {
		var commands = ['achievement','ban','ban-ip','banlist','blockdata','clear','clone','debug','defaultgamemode','deop','difficulty','effect','enchant','entitydata','execute','fill','gamemode','gamerule','give','help','kick','kill','list','me','op','pardon','particle','playsound','publish','replaceitem','save','save-all','save-off','save-on','say','scoreboard','seed','setblock','setidletimeout','setworldspawn','spawnpoint','spreadplayers','stats','stop','stopsound','summon','teleport','tell','tellraw','testfor','testforblock','testforblocks','time','title','toggledownfall','tp','trigger','weather','whitelist','worldborder','xp']
		var pool = [];
		var sanitizedStr = str.replace('/', '').replace('(', '').replace('&nbsp;', '');
		console.log('trying to match', sanitizedStr);
		for (var i = commands.length - 1; i >= 0; i--) {
			if (commands[i].startsWith(sanitizedStr)) pool.push(commands[i])
		}
		return pool;
	},
	reset: function () {
		this._lastWord = '';
		this._lastOffset = 0;
		this._lastIndex = 0;
		this.active = false;
		this.matches = [];
	},
	_replace: function (sel, offset, word) {
		var element = sel.anchorNode;
		//var offset = sel.anchorOffset;
		var newWord = this.matches[this._lastIndex];
		if (!newWord) {
			this._lastIndex = 0;
			newWord = this.matches[this._lastIndex];
		} else if (word === newWord || this.matches.length === 0) {
			return;
		}
		this._lastWord = newWord;
		this._lastIndex++;
		console.log('_replace here, working with', word, 'offset', offset, 'element', element)
		if (offset > 0) {
			element.splitText(offset);
			element = element.nextSibling;
		}
		console.log('_replace here, working with next', newWord, 'offset', offset, 'element', element)
		console.log('matches', this.matches)
		findAndReplaceDOMText(element, {
			find: word,
			replace: newWord
		});
		//zx this._lastOffset = element.nextSibling.textContent.length;
		//element.textContent = element.textContent.replace(element.textContent.substring(offset, word.length + newWord.length), newWord);
		//editorCtrl.resetCaretPosition();
		this._lastOffset = offset + word.length;
		//console.log('before normalize', element.parentNode);
		//element.parentNode.normalize();
		//console.log('after normalize', element.parentNode)
	},
	cycle: function (currentLine) {
	//	var lineElement = currentLine.node;
		//var currentLine = editorCtrl.getCurrentLine();
		if (this.active) {
			this._replace(currentLine.sourceElement, -1, this._lastWord);
		} else {
			this.matches = this.getMatchSet(currentLine.currentWord);
			this.active = true;
			//this._firstWord 
			this._replace(currentLine.sourceElement, currentLine.lastSpacerOffset, currentLine.currentWord);
		}
		//console.log(lineElement)
		//lineElement.textContent = lineElement.textContent.replace(lineElement.textContent.substring(currentLine.lastSpacerOffset, this.matches[0].length + currentLine.currentWord.length), this.matches[0])
	}
};

editor.onkeyup = function (e) {
	var charTyped = String.fromCharCode(e.which);
	switch (e.which) {
		case 37:
		case 38:
		case 39:
		case 40:
			editorCtrl.highlightRowIndex();
			break;
	}
	if (/[a-z\d]/i.test(charTyped)) {
		autocomplete.reset();
		editorCtrl.replaceReservedWords();
	}
};

editor.onclick = function (e) {
	editorCtrl.highlightRowIndex();
	editorCtrl.linterCtrl.getCurrentDepth(editorCtrl.getCurrentLine().index)
};

editor.onblur = function (e) {
	editorCtrl.highlightRowIndex(-1);
};

editor.onkeydown = function (e) {
	//editorCtrl.fixEmptyParent();
	switch (e.which) {
		case 222:
			editorCtrl.linterCtrl.appendClosure();
			break;
		case 9:
			e.preventDefault();
			var currentLine = editorCtrl.getCurrentLine();
			if (currentLine.currentWord && (currentLine.currentWord !== '' || currentLine.currentWord !== ' ')) {
				autocomplete.cycle(currentLine);
			}
			break;
	}
			//var pre = document.createElement('pre');
			//pre.className = 'tab';
			//currentLine.node.appendChild(pre);
			//console.log('currentChar', currentLine.currentWord);
			//document.execCommand('styleWithCSS',true,null);
			//document.execCommand('indent',true,null);
};