/**
 * @name Key Controll & Mouse Controll & Gamepad Controll
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.4.0
 */
//TODO jslint
var ALLCONTROLLS = {};
var ALLCONTROLLSKEYS = [];
var nowkey;
var ELSE_LOCK = false;
var GAMEPAD_DELIMITER = '@';
window.addEventListener('keydown', function(e){
	var enabled = true, i, c, indexes = ALLCONTROLLSKEYS, len = indexes.length;
	for(i = 0; i < len; i++){
		c = ALLCONTROLLS[indexes[i]];
		if(!(e.keyCode in c.code2name)){
			if(ELSE_LOCK) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
			return true;
		}//余計なキーは反応させない
		c.stateDown(e.keyCode, e);
		e.preventDefault();
		e.stopPropagation();
		enabled = false;
	}

	return enabled;//false: 他の処理が無効
}, false);
window.addEventListener('keyup', function(e){
	var enabled = true, i, c, indexes = ALLCONTROLLSKEYS, len = indexes.length;
	for(i = 0; i < len; i++){
		c = ALLCONTROLLS[indexes[i]];
		if(!(e.keyCode in c.code2name)){
			if(ELSE_LOCK) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
			return true;
		}//余計なキーは反応させない
		c.stateUp(e.keyCode);
		e.preventDefault();
		e.stopPropagation();
		enabled = false;
	}
	if(enabled && ELSE_LOCK) {
		e.preventDefault();
	}
	return enabled;
}, false);

/**
 * ゲームパッド対応
 * @type Array
 */
var CKGAMEPADS = [];
var CKGAMEPADSPREVKEYSTATE = {};
window.addEventListener('gamepadconnected', function(e){
	gamepadConnect(e, true);
}, false);
window.addEventListener('gamepaddisconnected', function(e){
	gamepadConnect(e, false);
}, false);
window.addEventListener("webkitgamepadconnected", function(e){
	gamepadConnect(e, true);
}, false);
window.addEventListener("webkitgamepaddisconnected", function(e){
	gamepadConnect(e, false);
}, false);

function gamepadConnect(e, connect){
	var pads = navigator.getGamepads != null ? navigator.getGamepads() : []
		, i
	;
	if(e == null){
		CKGAMEPADS = [];
		for(i = 0; i < pads.length; i++){
			if(pads[i] == null){
				continue;
			}
			CKGAMEPADS[i] = pads[i];
		}
	}else if(connect == null || connect){
		CKGAMEPADS[e.gamepad.index] = e.gamepad;
		console.log(e.gamepad);
	}else{
		delete CKGAMEPADS[e.gamepad.index];
		console.log(e.gamepad);
	}
}
function gamepadState(){
	var i, j
		, pad, len
		, buttons, blen
		, axes, alen, id, v
		, dir = ['right', 'left', 'down', 'up']
		, state = {}
	;
	gamepadConnect();
	len = CKGAMEPADS.length;
	for(i = 0; i < len; i++){
		pad = CKGAMEPADS[i];
//		id = pad.id;
		id = pad.index;
		buttons = pad.buttons;
		blen = buttons.length;
		for(j = 0; j < blen; j++){
			state[convertGamePadKey(id, j)] = buttons[j].value > 0.5;
		}
		axes = pad.axes;
		alen = dir.length;
		for(j = 0; j < alen; j++){
			switch(dir[j]){
				case 'right': v = axes[0] > 0.5; break;
				case 'left': v = axes[0] < -0.5; break;
				case 'down': v = axes[1] > 0.5; break;
				case 'up': v = axes[1] < -0.5; break;
			}
			
			state[convertGamePadKey(id, dir[j])] = v;
		}
		
	}
//	CKGAMEPADSKEYSTATE = state;
	return state;
}
function applyGamepadKeys(state){
	var i, j
		, pad, len = CKGAMEPADS.length
		, cont, c, clen = ALLCONTROLLSKEYS.length
		, buttons, blen
		, axes, alen, id, v, code, name
		, dir = ['right', 'left', 'down', 'up']
//		, state = {}
	;
	for(c = 0; c < clen; c++){
		cont = ALLCONTROLLS[c];
		for(code in state){
			name = cont.code2name[code];
			if(name == null){
				continue;
			}
			if(state[code]){
				cont.stateDown(code);
			}else if(CKGAMEPADSPREVKEYSTATE[code] && cont.getState(name)){
				cont.stateUp(code);
			}
		}
	}
	CKGAMEPADSPREVKEYSTATE = state;
	return state;

}

function convertGamePadKey(index, button){
	return index + GAMEPAD_DELIMITER + button;
}

//選択しない
window.addEventListener('mousedown', function(e){
	// e.preventDefault();
}, false);

//ウィンドウ離れた
window.addEventListener('blur', function(){
	var enabled = true, i, c, indexes = ALLCONTROLLSKEYS, len = indexes.length;
	for(i = 0; i < len; i++){
		ALLCONTROLLS[indexes[i]].allReset();
	}
	// Object.keys(allcontrolls).forEach(function(idname){
	// });
}, true);
// window.addEventListener('focus', function(){
	// keyUntrig();
// }, true);


/**
 * clickをロックする 
 */
function clickLock(func)
{
	func = func == null ? function(e){
		e.preventDefault();
		return false;
	} : func;
	document.body.addEventListener('mousedown', func, false);
	document.body.addEventListener('contextmenu', func, false);
}

function debugLock()
{
	ELSE_LOCK = true;
}
/**
 * キーのトリガとホールドのチェック（設置はmainの後ろ）
 */
var KEYSTATE_CHECKFUNC = function(){return;};
function keyStateCheck()
{
	var i, j, c, indexes = ALLCONTROLLSKEYS, len = indexes.length, codes, clen, cindex, state;
	KEYSTATE_CHECKFUNC();
	state = gamepadState();

	for(i = 0; i < len; i++){
		c = ALLCONTROLLS[indexes[i]];
		codes = c.name2code;
		
		for(i in codes){
			c.holdon(codes[i]);
			c.untrig(codes[i]);
		}
	}
	
	applyGamepadKeys(state);
//	keyUntrig();
//	keyHold();
}

function setKeySetCheck(func){
	KEYSTATE_CHECKFUNC = func != null ? func : function(){return;};
}

/**
 * キー操作クラス
 * @param idname
 * @returns
 */
function KeyControll(){return;}
KeyControll.prototype = {
	initCommon: function(idname){
		if(this.idname != null){
			return;
		}
		this.controlls = {};//操作名に対する状態
		this.code2name = {};//codeに対応する操作名
		this.name2code = {};//操作名に対応するcode
		this.idname = idname == null ? Object.keys(ALLCONTROLLS).length : idname;
		this.action; //カスタム関数
		ALLCONTROLLS[this.idname] = ALLCONTROLLS[this.idname] == null ? this : ALLCONTROLLS[this.idname];
		
		ALLCONTROLLSKEYS = Object.keys(ALLCONTROLLS);
		try{
			this.holdTime = KEYCONTROLL_HOLDTIME;
		}catch(e){
			this.holdTime = 20;
			console.warn(e);
			console.log('key controll set hold on time: 20');
		}		
	},
	
	resetControlls: function(){
		this.controlls = {};//操作名に対する状態
		this.code2name = {};//codeに対応する操作名
		this.name2code = {};//操作名に対応するcode
	},
	/**
	 * 関数を登録
	 * @param name
	 * @param function f
	 */
	setAction: function(f){
		this.action = f;
		this.action.prototype.action = this.action;
//		allcontrolls[this.idname] = this;
	},

	/**
	 * 操作名でキーコードを登録
	 * @param name
	 * @param code
	 */
	setKey: function(name, code)
	{
		this.code2name[code + ""] = name;
		this.name2code[name] = code;
		this.controlls[name] = [];
		this.controlls[name].state = false;
		this.controlls[name].trig = false;
		this.controlls[name].off = false;
		this.controlls[name].hold = false;
		this.controlls[name].time = 0;
		this.controlls[name].func = null;
	},
	
	unsetKey: function(name)
	{
		var code;
		
		for(code in this.code2name){
			if(this.code2name[code + ""] == name){
				delete this.code2name[code + ""];
			}
		}
		delete this.name2code[name];
		delete this.controlls[name];
	},
	
	setKeydown: function(name, func){
		var controll = this.controlls[name]
		;
		controll.func = func;
	},

	/**
	 * キーが押された瞬間の挙動
	 * @param code
	 */
	stateDown: function(code, event)
	{
		var controll = this.code2name[code]
			, state = this.controlls[controll].state;

		if(state){
			this.controlls[controll].trig = false;
			this.controlls[controll].off = false;
		}else{
			this.controlls[controll].trig = true;
			this.controlls[controll].state = true;
			this.controlls[controll].off = false;
			
			if(this.controlls[controll].func != null){
				this.controlls[controll].func(event);
			};
		}

	},

	/**
	 * キーを離した瞬間の挙動
	 * @param code
	 */
	stateUp: function(code)
	{
		var controll = this.code2name[code]
			, state = this.controlls[controll].state;
		;
		this.controlls[controll].off = true;
		this.controlls[controll].state = false;
		this.controlls[controll].trig = false;

		if(state && this.controlls[controll].func != null){
//			this.controlls[controll].func();
		};
	},
	
	/**
	 * キーのホールドを確認
	 * @param code
	 */
	holdon: function(code)
	{
		var controll = this.code2name[code]
			, state = this.controlls[controll].state;

		if(state){
			if(this.controlls[controll].time++ > this.holdTime){
				this.controlls[controll].hold = true;
				// dulog("hold" + name);
			}
		}else{
			
			this.controlls[controll].hold = false;
			this.controlls[controll].time = 0;
		}

	},

	/**
	 * キーのトリガを解除
	 * @param code
	 */
	untrig: function(code)
	{
		var name = this.code2name[code];
		this.controlls[name].trig = false;
		this.controlls[name].off = false;
	},

	allReset: function()
	{
		for(idname in this.code2name){
			this.stateUp(idname);
			this.untrig(idname);
		}
	},
	
	allState: function()
	{
		var name, states = {};
		for(name in this.controlls){
			states[name] = this.controlls[name].state;
		}
		return states;
	},
	/**
	 * キーの状態を取得
	 * @param name
	 * @returns
	 */
	getState: function(name)
	{
		var i;
		if(typeof name == "object"){
			var states = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				states[n] = cont[n].state;
			}
			return states;
		}else{
			if(this.controlls[name] == null){return false;}
			return this.controlls[name].state;
		}
	},

	/**
	 * キーの入力した瞬間を取得
	 * @param name
	 * @returns
	 */
	getTrig: function(name)
	{
		var i;
		if(typeof name == "object"){
			var trigs = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				trigs[n] = cont[n].trig;
			}
			return trigs;
		}else{
			return this.controlls[name].trig;
		}
	},

	/**
	 * キーをはなした瞬間を取得
	 * @param name
	 * @returns
	 */
	getUntrig: function(name)
	{
		var i;
		if(typeof name == "object"){
			var unTrigs = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				unTrigs[n] = cont[n].off;
			}
			return unTrigs;
		}else{
			return this.controlls[name].off;
		}
	},

	/**
	 * キーの固定判定を取得
	 * @param name
	 * @returns
	 */
	getHold: function(name)
	{
		var i;
		if(typeof name == "object"){
			var holds = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				holds[n] = cont[n].hold;
			}
			return holds;
		}else{
			return this.controlls[name].hold;
		}
	},
	
	getHoldTime: function(name)
	{
		var i;
		if(typeof name == "object"){
			var holds = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				holds[n] = cont[n].time;
			}
			return holds;
		}else{
			return this.controlls[name].time;
		}
	},
	
	applyKeys: function(keys, padButtons, gamepadIndex){
		var keycodes = []
			, name, button, code
			, i, index
			, indexes = []
		;
		if(typeof keys == 'string'){
			keycodes = keys.trim().replace(/\n/, ' ').split(' ');
		}else{
			keycodes = keys;
		}
//		if(typeof index != 'string' && keycodes.length != index.length){
//			console.warn('controll key&id no mach length');
//			return;
//		}
		for(i = 0; i < keycodes.length; i++){
			if(padButtons == null && gamepadIndex == null){
				code = keycodes[i].trim().split(GAMEPAD_DELIMITER);
				name = code[0];
				index = code[1];
				button = code[2];
			}else{
				name = keycodes[i];
				button = padButtons[i];
				index = gamepadIndex;
			}
			this.setKey(name, convertGamePadKey(index, button));
		}
	},
	
	initGamepad: function(gamepad){
		//USB Gamepad (Vendor: 04b4 Product: 010a)
		if(gamepad == null){
			gamepadConnect();
			gamepad = navigator.getGamepads()[0];
			if(gamepad == null){
				return false;
			}
		}
		var index = gamepad.index
			, conv = convertGamePadKey
		;
//		console.log(gamepad);
		this.initCommon();
		this.setKey('left', conv(index, 'left'));
		this.setKey('up', conv(index, 'up'));
		this.setKey('right', conv(index, 'right'));
		this.setKey('down', conv(index, 'down'));
		this.setKey('<', conv(index, '1'));
		this.setKey('>', conv(index, '2'));
		this.setKey('select', conv(index, '8'));
		this.setKey('space', conv(index, '0'));
		this.setKey('debug', conv(index, '6'));
		return true;
	},

	initDefaultKey: function(type)
	{
		this.initCommon();
		if(type == "left"){
			this.setKey('left', 65);
			this.setKey('up', 87);
			this.setKey('right', 68);
			this.setKey('down', 83);
			this.setKey('<', 188);
			this.setKey('>', 190);
		}else{
			this.setKey('left', 37);
			this.setKey('up', 38);
			this.setKey('right', 39);
			this.setKey('down', 40);
			this.setKey('<', 88);
			this.setKey('>', 90);
		}
		this.setKey('select', 9);
		this.setKey('space', 32);
		this.setKey('debug', 16);
	},

	initCommonKey: function()
	{
		this.initCommon();

		//LFETCONTROLL
		this.setKey('left', 65);
		this.setKey('up', 87);
		this.setKey('right', 68);
		this.setKey('down', 83);
		this.setKey('<', 188);
		this.setKey('>', 190);
		//RIGHTCONTROLL
		this.setKey('left', 37);
		this.setKey('up', 38);
		this.setKey('right', 39);
		this.setKey('down', 40);
		this.setKey('<', 88);
		this.setKey('>', 90);

		this.setKey('select', 9);
		this.setKey('space', 32);
		this.setKey('debug', 16);
		
	},

}
//TODO 右クリック判定確認
/**
 * ポインティング(マウス・タッチ)コントロール
 */
function PointingControll(){return;}
PointingControll.prototype ={
	init: function(screenScroll, baseScroll){
		this.tapStartPos = {
			common: {x: -1, y: -1},
			left: {x: -1, y: -1},
			middle: {x: -1, y: -1},
			right: {x: -1, y: -1}
		};
		this.tapMovePos = {
			common: {x: -1, y: -1},
			left: {x: -1, y: -1},
			middle: {x: -1, y: -1},
			right: {x: -1, y: -1}
		};
		
		this.flickableItems = [];
		this.tappableItems = [];
		
		this.button = 'common';
		this.state = {
			common: false,
			left: false,
			middle: false,
			right: false,
		};
		this.trig = {
			common: false,
			left: false,
			middle: false,
			right: false,
		};
		
		this.screenScroll = screenScroll;
		this.baseScroll = baseScroll == null ? screenScroll : baseScroll;
		this.sizeRate = {
			w: screenScroll.canvas.width / baseScroll.canvas.width,
			h: screenScroll.canvas.height / baseScroll.canvas.height,
		};
		this.isContextMenu = false;
		this.initFlickables();
		this.initTappables();
		this.initMenuables();
	},
	
	resizeRate: function(screenScroll){
		if(screenScroll == null){
			return this.sizeRate;
		}
		this.sizeRate = {
			w: screenScroll.canvas.width / this.baseScroll.canvas.width,
			h: screenScroll.canvas.height / this.baseScroll.canvas.height
		};
		return this.sizeRate;
	},
	
	initTappables: function()
	{
		var self = this
			, tsfunc = function(e){
				var pos = self.getClientPos(e);
				
				switch(e.which){
					case 1: self.button = 'left'; break;
					case 2: self.button = 'middle'; break;
					case 3: self.button = 'right'; break;
					default: self.button = 'common';
				}
				self.state[self.button] = true; 
				
				self.tapStartEvent(pos.x, pos.y, e);
				if(self.button != 'common'){
					self.button = 'common';
					self.tapStartEvent(pos.x, pos.y, e);
				}
				
//				self.button = null;
				e.preventDefault();
				return false;
			}
			, tefunc = function(e){
				var pos = self.getClientPos(e);
				self.button = 'common';
				switch(e.which){
					case 1: self.button = 'left'; break;
					case 2: self.button = 'middle'; break;
					case 3: self.button = 'right'; break;
					default: self.button = 'common';
				}
				self.state[self.button] = false; 
				self.tapEndEvent(pos.x, pos.y, e);
				if(self.button != 'common'){
					self.button = 'common';
					self.tapEndEvent(pos.x, pos.y, e);
				}
//				self.button = null;
				e.preventDefault();
				return false;
			}
			, scr = this.screenScroll
		;

		scr.canvas.addEventListener('mousedown', tsfunc, false);
		scr.canvas.addEventListener('mouseup', tefunc, false);
		scr.canvas.addEventListener('touchstart', tsfunc, false);
		scr.canvas.addEventListener('touchend', tefunc, false);
	},
	
	initMenuables: function()
	{
		var self = this
			, scr = this.screenScroll
		;
		scr.canvas.addEventListener('contextmenu', function(e){
			e.preventDefault();
		}, false);
	},
	
	initFlickables: function()
	{
		var self = this
			, mvfunc =  function(e){
				var pos = self.getClientPos(e);
				self.button = 'common';
				switch(e.which){
					case 1: self.button = 'left'; break;
					case 2: self.button = 'middle'; break;
					case 3: self.button = 'right'; break;
					default: self.button = 'common';
				}
				self.tapMoveEvent(pos.x, pos.y, e);
				if(self.button != 'common'){
					self.button = 'common';
					self.tapMoveEvent(pos.x, pos.y, e);
				}
//				self.button = null;
				e.preventDefault();
				return false;
			}
			, scr = this.screenScroll
			;
		
		scr.canvas.addEventListener('mousemove', mvfunc, false);
		scr.canvas.addEventListener('touchmove', mvfunc, false);
	},
	
	getState: function(button)
	{
		button = button == null ? 'common' : button;
		return this.state[button];
	},
	
	getTrig: function(button)
	{
		button = button == null ? 'common' : button;
		return this.trig[button];
	},
	
	getMovePos: function(button)
	{
		button = button == null ? 'common' : button;
		return this.tapMovePos[button];
	},
	
	getStartPos: function(button)
	{
		button = button == null ? 'common' : button;
		return this.tapStartPos[button];
	},
	
	getClientPos: function(e)
	{
		var me = e.changedTouches != null ? e.changedTouches[0] : e
			, view = this.baseScroll
			, scr = this.screenScroll
			, bounds = scr.canvas.getBoundingClientRect(), w = view.canvas.width, h = view.canvas.height
			, x = ((me.clientX - bounds.left) / this.sizeRate.w) - view.x
			, y = ((me.clientY - bounds.top) / this.sizeRate.h) - view.y
		;
		x = view.mirrorH ? (x + w) % w : x | 0;
		y = view.mirrorV ? (y + h) % h: y | 0;
		return {x: x, y: y};
	},
	
	clearEventItem: function(items, name)
	{
		var rep = [], i;
		if(name == null){
			return [];
		}
		for(i = 0; i < items.length; i++){
			if(items[i].name == name){
				continue;
			}
			rep.push(items[i]);
		}
		items = [];
		items = rep;
		return items;
	},
	
	makeTapEvent: function(rect, func, cancel, name, button){
		return {
			rect: rect
			, func: func
			, cancel: cancel == null ? null : cancel
			, name: name
			, pos:{x:-1, y:-1}
			, button: button
		};
	},
	/**
	 * 各種イベントを登録する
	 * @param {Object} rect
	 * @param {Object} func
	 * @param {Object} cancel
	 * @param {Object} name
	 * @param {Object} button
	 */
	appendTappableItem: function(rect, func, cancel, name, button)
	{
		button = button == null ? 'left' : button;
		var item = this.makeTapEvent(rect,func, cancel == null ? null : cancel, name == null ? this.tappableItems.lengh : name, button);
		this.clearTappableItem(name);
		this.tappableItems.push(item);
		return this.tappableItems.length;
	},
	
	clearTappableItem: function(name){
		this.tappableItems = this.clearEventItem(this.tappableItems, name);
		return this.tappableItems.length;
	},
	
	appendFlickableItem: function(rect, func, cancel, name, button)
	{
		button = button == null ? 'left' : button;
		var item = this.makeTapEvent(rect,func, cancel == null ? null : cancel, name == null ? this.tappableItems.lengh : name, button);
		this.clearFlickableItem(name);
		this.flickableItems.push(item);
		return this.flickableItems.length;
	},
	
	clearFlickableItem: function(name){
		this.flickableItems = this.clearEventItem(this.flickableItems, name);
		return this.flickableItems.length;
	},
	
	setStartPos: function(x, y, button)
	{
		this.tapStartPos[button].x = x;
		this.tapStartPos[button].y = y;
	},
	
	setMovePos: function(x, y, button)
	{
		this.tapMovePos[button].x = x;
		this.tapMovePos[button].y = y;
	},
	
	tapStartEvent: function(x, y, e)
	{
		var i, item, pos, items, b = this.button
		;
		this.setStartPos(x, y, b);
		this.setMovePos(x, y, b);
		
		pos = this.tapStartPos[b];
		items = this.tappableItems;
		for(i = 0; i < items.length; i++){
			item = items[i];
			if(item.button !== b){
				continue;
			}
			if(item.rect.isContain(x, y) && item.rect.isContain(pos.x, pos.y)){
				if(item.func != null && item.func(item, x, y) == false){
					break;
				}
			}
		}
		
	},
	
	tapEndEvent: function(x, y, e)
	{
		var i, item
			, base = this.baseScroll.canvas
			, gx = x + base.x, gy = y + base.y
			, b = this.button
			, pos = this.tapStartPos[b]
			, items = this.tappableItems
		;
		for(i = 0; i < items.length; i++){
			item = items[i];
			if(item.button !== b){
				continue;
			}
			if(item.rect.isContain(x, y) === false || item.rect.isContain(pos.x, pos.y) === false){
				continue;
			}
			if(item.cancel != null && item.cancel(item, x, y) === false){
				break;
			}
			
		}
		this.setStartPos(-1, -1, b);
		this.setMovePos(x, y, b);
	},
	
	tapMoveEvent: function(x, y, e)
	{
		var i, item, isContain
			, base = this.baseScroll.canvas
			, gx = x + base.x, gy = y + base.y
			, b = this.button
			, tpos = this.tapStartPos[b]
			, mpos = this.tapMovePos[b]
			, items = this.flickableItems
		;
		for(i = 0; i < items.length; i++){
			item = items[i];
			if(item.button !== b){
				continue;
			}
			isContain = item.rect.isContain(x, y);
			item.pos.x = x;
			item.pos.y = y;
			if(item.rect.isContain(tpos.x, tpos.y) === false){
				continue;
			}
			if(isContain){
				if(item.func != null && item.func(item, x, y) == false){
					break;
				};
			}else{
				if(item.cancel != null && item.cancel(item, x, y) == false){
					break;
				};
			}
		}
		this.setMovePos(x, y, b);
	},
};
