/**
 * @name Key Controll & Mouse Controll & Gamepad Controll
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.4.1
 */
//TODO jslint
export let ALLCONTROLLS = {}
, ALLCONTROLLSKEYS = []
, nowkey
,  ELSE_LOCK = false
//,  GAMEPAD_DELIMITER = '@'
;

function resetAllControlls(){
	ALLCONTROLLS = {};
	ALLCONTROLLSKEYS = [];
}

window.addEventListener('keydown', function(e){
	let enabled = true, i, c, indexes = ALLCONTROLLSKEYS, len = indexes.length;
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
	let enabled = true, i, c, indexes = ALLCONTROLLSKEYS, len = indexes.length;
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
let CKGAMEPADS = [];
let CKGAMEPADSPREVKEYSTATE = {};
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
	let pads = navigator.getGamepads != null ? navigator.getGamepads() : []
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
		ALLCONTROLLS[e.gamepad.index].initGamepad()
		
		console.log(e.gamepad);
	}else{
		delete CKGAMEPADS[e.gamepad.index];
		console.log(e.gamepad);
	}
}
function gamepadState(){
	let i, j
		, pad, len
		, buttons, blen
		, axes, alen, id, v
		, dir = ['right', 'left', 'down', 'up']
		, state = {}, st
		, isAnalog
	;
	gamepadConnect();
	len = CKGAMEPADS.length;
	for(i = 0; i < len; i++){
		pad = CKGAMEPADS[i];
//		id = pad.id;
		if(pad == null){
			continue;
		}
		id = pad.index;
		id = id % KeyControll.MAXPLAYERS;// 最大プレイヤー数で除算
		
		buttons = pad.buttons;
		blen = buttons.length;
		for(j = 0; j < blen; j++){
			st = convertGamePadKey(id, j);
			state[st] |= buttons[j].value > 0.5;
		}
		axes = pad.axes;
		alen = dir.length;
		isAnalog = axes[2] != null;
		if(isAnalog){
			for(j = 0; j < alen; j++){
				switch(dir[j]){
					case 'right': v = axes[0] + axes[2] > 0.5 | buttons[15].pressed; break;
					case 'left': v = axes[0] + axes[2] < -0.5 | buttons[14].pressed; break;
					case 'down': v = axes[1] + axes[3] > 0.5 | buttons[13].pressed; break;
					case 'up': v = axes[1] + axes[3] < -0.5 | buttons[12].pressed; break;
				}

				st = convertGamePadKey(id, dir[j]);
				state[st] |= v;
			}
		}else{
			for(j = 0; j < alen; j++){
				switch(dir[j]){
					case 'right': v = axes[0] > 0.5; break;
					case 'left': v = axes[0] < -0.5; break;
					case 'down': v = axes[1] > 0.5; break;
					case 'up': v = axes[1] < -0.5; break;
				}

				st = convertGamePadKey(id, dir[j]);
				state[st] |= v;
			}
			
		}
	}
//	CKGAMEPADSKEYSTATE = state;
	return state;
}
function applyGamepadKeys(state){
	let i, j
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

function getGamepadPrevKeyState(){
	return CKGAMEPADSPREVKEYSTATE;
}

function convertGamePadKey(index, button){
	return index + KeyControll.GAMEPAD_DELIMITER + button;
}

//選択しない
window.addEventListener('mousedown', function(e){
	// e.preventDefault();
}, false);

//ウィンドウ離れた
window.addEventListener('blur', function(){
	let enabled = true, i, c, indexes = ALLCONTROLLSKEYS, len = indexes.length;
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
let KEYSTATE_CHECKFUNC = function(){return;};
function keyStateCheck()
{
	let i, j, c, indexes = ALLCONTROLLSKEYS, len = indexes.length, codes, clen, cindex, state;
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
}

export function setKeySetCheck(func){
	KEYSTATE_CHECKFUNC = func != null ? func : function(){return;};
}
/**
 * キー操作クラス
 * @param idname
 * @returns
 */
class KeyControll{
	initCommon(idname){
		if(this.idname != null){
			return;
		}
		this.controlls = {};//操作名に対する状態
		this.statuses = {};//状態名をキーにした状態
		this.code2name = {};//codeに対応する操作名
		this.name2code = {};//操作名に対応するcode
		
		this.applyKeysConf = null; //ゲームパッド設定データ
		
		this.resetControlls();
		
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
	}
	
	resetControlls(){
		this.controlls = {};//操作名に対する状態
		this.statuses = {};//状態名をキーにした状態
		this.code2name = {};//codeに対応する操作名
		this.name2code = {};//操作名に対応するcode
		
		this.statuses.state = {};
		this.statuses.trig = {};
		this.statuses.off = {};
		this.statuses.hold = {};
		this.statuses.time = {};
		this.statuses.func = {};
	}
	/**
	 * 関数を登録
	 * @param name
	 * @param function f
	 */
	setAction(f){
		this.action = f;
		this.action.prototype.action = this.action;
//		allcontrolls[this.idname] = this;
	}

	/**
	 * 操作名でキーコードを登録
	 * @param name
	 * @param code
	 */
	setKey(name, code)
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
		
		this.statuses.state[name] = this.controlls[name].state;
		this.statuses.trig[name] = this.controlls[name].trig;
		this.statuses.off[name] = this.controlls[name].off;
		this.statuses.hold[name] = this.controlls[name].hold;
		this.statuses.time[name] = this.controlls[name].time;
		this.statuses.func[name] = this.controlls[name].func;
	}
	
	unsetKey(name)
	{
		let code;
		
		for(code in this.code2name){
			if(this.code2name[code + ""] == name){
				delete this.code2name[code + ""];
			}
		}
		delete this.name2code[name];
		delete this.controlls[name];
	}
	
	setKeydown(name, func){
		let controll = this.controlls[name]
		;
		controll.func = func;
	}

	/**
	 * キーが押された瞬間の挙動
	 * @param code
	 */
	stateDown(code, event)
	{
		let controll = this.code2name[code]
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

	}

	/**
	 * キーを離した瞬間の挙動
	 * @param code
	 */
	stateUp(code)
	{
		let controll = this.code2name[code]
			, state = this.controlls[controll].state;
		;
		this.controlls[controll].off = true;
		this.controlls[controll].state = false;
		this.controlls[controll].trig = false;

		if(state && this.controlls[controll].func != null){
//			this.controlls[controll].func();
		};
	}
	
	/**
	 * キーのホールドを確認
	 * @param code
	 */
	holdon(code)
	{
		let controll = this.code2name[code]
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

	}

	/**
	 * キーのトリガを解除
	 * @param code
	 */
	untrig(code)
	{
		let name = this.code2name[code];
		this.controlls[name].trig = false;
		this.controlls[name].off = false;
	}

	allReset()
	{
		for(let idname in this.code2name){
			this.stateUp(idname);
			this.untrig(idname);
		}
	}
	
	allState()
	{
		let name, states = {};
		for(name in this.controlls){
			states[name] = this.controlls[name].state;
		}
		return states;
	}
	/**
	 * キーの状態を取得
	 * @param name
	 * @returns
	 */
	getState(name)
	{
		let i;
		if(name == null){
			return this.controlls
		}else if(typeof name == "object"){
			let states = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				states[n] = cont[n].state;
			}
			return states;
		}else{
			if(this.controlls[name] == null){return false;}
			return this.controlls[name].state;
		}
	}

	/**
	 * キーの入力した瞬間を取得
	 * @param name
	 * @returns
	 */
	getTrig(name)
	{
		let i;
		if(typeof name == "object"){
			let trigs = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				trigs[n] = cont[n].trig;
			}
			return trigs;
		}else{
			return this.controlls[name].trig;
		}
	}

	/**
	 * キーをはなした瞬間を取得
	 * @param name
	 * @returns
	 */
	getUntrig(name)
	{
		let i;
		if(typeof name == "object"){
			let unTrigs = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				unTrigs[n] = cont[n].off;
			}
			return unTrigs;
		}else{
			return this.controlls[name].off;
		}
	}

	/**
	 * キーの固定判定を取得
	 * @param name
	 * @returns
	 */
	getHold(name)
	{
		let i;
		if(typeof name == "object"){
			let holds = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				holds[n] = cont[n].hold;
			}
			return holds;
		}else{
			return this.controlls[name].hold;
		}
	}
	
	getHoldTime(name)
	{
		let i;
		if(typeof name == "object"){
			let holds = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length, n;
			for(i = 0; i < len; i++){
				n = name[i];
				holds[n] = cont[n].time;
			}
			return holds;
		}else{
			return this.controlls[name].time;
		}
	}
	
	applyKeys(keys, padButtons, gamepadIndex){
		let keycodes = []
			, name, button, code
			, i, index
			, indexes = []
		;
		this.applyKeysConf = keys;
		
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
				code = keycodes[i].trim().split(KeyControll.GAMEPAD_DELIMITER);
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
	}
	
	initGamepad(gamepad){
		//USB Gamepad (Vendor: 04b4 Product: 010a)
		if(gamepad == null){
			gamepadConnect();
			gamepad = navigator.getGamepads()[0];
			if(gamepad == null){
				return false;
			}
		}
		
		if(this.applyKeysConf != null){
			this.applyKeys(this.applyKeysConf);
			return;
		}
		
		let index = gamepad.index
			, conv = convertGamePadKey
		;
//		console.log(gamepad);
		this.initCommon();
		this.setKey('left', conv(index, 'left'));
		this.setKey('up', conv(index, 'up'));
		this.setKey('right', conv(index, 'right'));
		this.setKey('down', conv(index, 'down'));
		this.setKey('<', conv(index, '2'));
		this.setKey('>', conv(index, '0'));
		this.setKey('select', conv(index, '8'));
		this.setKey('space', conv(index, '9'));
		this.setKey('debug', conv(index, '6'));
//		this.setKey('<', conv(index, '1'));
//		this.setKey('>', conv(index, '2'));
//		this.setKey('select', conv(index, '8'));
//		this.setKey('space', conv(index, '0'));
//		this.setKey('debug', conv(index, '6'));
		return true;
	}

	initDefaultKey(type)
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
	}

	initCommonKey()
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
		
	}
}
KeyControll.GAMEPAD_DELIMITER = '@';
KeyControll.MAXPLAYERS = 1;


//TODO 右クリック判定確認
/**
 * ポインティング(マウス・タッチ)コントロール
 */
class PointingControll{
	init(screenScroll, baseScroll){
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
	}
	
	resizeRate(screenScroll){
		if(screenScroll == null){
			return this.sizeRate;
		}
		this.sizeRate = {
			w: screenScroll.canvas.width / this.baseScroll.canvas.width,
			h: screenScroll.canvas.height / this.baseScroll.canvas.height
		};
		return this.sizeRate;
	}
	
	initTappables()
	{
		let self = this
			, tsfunc = function(e){
				let pos = self.getClientPos(e);
				
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
				let pos = self.getClientPos(e);
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
	}
	
	initMenuables()
	{
		let self = this
			, scr = this.screenScroll
		;
		scr.canvas.addEventListener('contextmenu', function(e){
			e.preventDefault();
		}, false);
	}
	
	initFlickables()
	{
		let self = this
			, mvfunc =  function(e){
				let pos = self.getClientPos(e);
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
	}
	
	getState(button)
	{
		button = button == null ? 'common' : button;
		return this.state[button];
	}
	
	getTrig(button)
	{
		button = button == null ? 'common' : button;
		return this.trig[button];
	}
	
	getMovePos(button)
	{
		button = button == null ? 'common' : button;
		return this.tapMovePos[button];
	}
	
	getStartPos(button)
	{
		button = button == null ? 'common' : button;
		return this.tapStartPos[button];
	}
	
	getClientPos(e)
	{
		let me = e.changedTouches != null ? e.changedTouches[0] : e
			, view = this.baseScroll
			, scr = this.screenScroll
			, bounds = scr.canvas.getBoundingClientRect(), w = view.canvas.width, h = view.canvas.height
			, x = ((me.clientX - bounds.left) / this.sizeRate.w) - view.x
			, y = ((me.clientY - bounds.top) / this.sizeRate.h) - view.y
		;
		x = view.mirrorH ? (x + w) % w : x | 0;
		y = view.mirrorV ? (y + h) % h: y | 0;
		return {x: x, y: y};
	}
	
	clearEventItem(items, name)
	{
		let rep = [], i;
		if(name == null){
			return [];
		}
		for(i = 0; i < items.length; i++){
			if(items[i].name == name){
				 ;
			}
			rep.push(items[i]);
		}
		items = [];
		items = rep;
		return items;
	}
	
	makeTapEvent(rect, func, cancel, name, button){
		return {
			rect: rect
			, func: func
			, cancel: cancel == null ? null : cancel
			, name: name
			, pos:{x:-1, y:-1}
			, button: button
		};
	}
	/**
	 * 各種イベントを登録する
	 * @param {Object} rect
	 * @param {Object} func
	 * @param {Object} cancel
	 * @param {Object} name
	 * @param {Object} button
	 */
	appendTappableItem(rect, func, cancel, name, button)
	{
		button = button == null ? 'left' : button;
		let item = this.makeTapEvent(rect,func, cancel == null ? null : cancel, name == null ? this.tappableItems.lengh : name, button);
		this.clearTappableItem(name);
		this.tappableItems.push(item);
		return this.tappableItems.length;
	}
	
	clearTappableItem(name){
		this.tappableItems = this.clearEventItem(this.tappableItems, name);
		return this.tappableItems.length;
	}
	
	appendFlickableItem(rect, func, cancel, name, button)
	{
		button = button == null ? 'left' : button;
		let item = this.makeTapEvent(rect,func, cancel == null ? null : cancel, name == null ? this.tappableItems.lengh : name, button);
		this.clearFlickableItem(name);
		this.flickableItems.push(item);
		return this.flickableItems.length;
	}
	
	clearFlickableItem(name){
		this.flickableItems = this.clearEventItem(this.flickableItems, name);
		return this.flickableItems.length;
	}
	
	setStartPos(x, y, button)
	{
		this.tapStartPos[button].x = x;
		this.tapStartPos[button].y = y;
	}
	
	setMovePos(x, y, button)
	{
		this.tapMovePos[button].x = x;
		this.tapMovePos[button].y = y;
	}
	
	tapStartEvent(x, y, e)
	{
		let i, item, pos, items, b = this.button
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
		
	}
	
	tapEndEvent(x, y, e)
	{
		let i, item
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
	}
	
	tapMoveEvent(x, y, e)
	{
		let i, item, isContain
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
	}
};

var intervalId = null;
export function CKSETUPKEYS(){
	let k = new KeyControll();
	k.initCommonKey();
	k.initGamepad();
	if(intervalId != null){
		clearInterval(intervalId);
	}
	intervalId = setInterval(function(){
		keyStateCheck();
	}, 16);
	
	return k
}

export {KeyControll, PointingControll, clickLock, debugLock, resetAllControlls, keyStateCheck, getGamepadPrevKeyState, convertGamePadKey};
