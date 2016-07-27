/**
 * Key Controll
 * Since 2013-11-19 07:43:37
 * @author しふたろう
 */
//TODO jslint
var allcontrolls = {};
var allcontrollsKeys = {};
var nowkey;
var ELSE_LOCK = false;
window.onkeydown = function(e){
	var enabled = true, i, c, indexes = Object.keys(allcontrolls), len = indexes.length;
	for(i = 0; i < len; i++){
		c = allcontrolls[indexes[i]];
		if(!(e.keyCode in c.code2name)){
			if(ELSE_LOCK) {
				e.preventDefault();
				return false;
			}
			return true;
		}//余計なキーは反応させない
		c.stateDown(e.keyCode);
		enabled = false;
	}

	return enabled;//false: 他の処理が無効
};
window.onkeyup = function(e){
	var enabled = true, i, c, indexes = Object.keys(allcontrolls), len = indexes.length;
	for(i = 0; i < len; i++){
		c = allcontrolls[indexes[i]];
		if(!(e.keyCode in c.code2name)){
			if(ELSE_LOCK) {
				e.preventDefault();
				return false;
			}
			return true;
		}//余計なキーは反応させない
		c.stateUp(e.keyCode);
		enabled = false;
	}
	if(enabled && ELSE_LOCK) {
		e.preventDefault();
	}
	return enabled;
};


//選択しない
window.onmousedown = function(e){
	// e.preventDefault();
};

//ウィンドウ離れた
window.addEventListener('blur', function(){
	var enabled = true, i, c, indexes = Object.keys(allcontrolls), len = indexes.length;
	for(i = 0; i < len; i++){
		allcontrolls[indexes[i]].allReset();
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
	KEYSTATE_CHECKFUNC();
	keyUntrig();
	keyHold();
}

function setKeySetCheck(func){
	KEYSTATE_CHECKFUNC = func;
}

/**
 * キーのホールドを確認
 */
function keyHold(){
	var enabled = true, i, j, c, indexes = Object.keys(allcontrolls), len = indexes.length, codes, clen, cindex;
	for(i = 0; i < len; i++){
		c = allcontrolls[indexes[i]];
		codes = c.name2code;
		cindex =  Object.keys(codes);
		clen = cindex.length;
		for(j = 0; j < clen; j++){
			c.holdon(codes[cindex[j]]);
		}
	}
	// Object.keys(allcontrolls).forEach(function(idname){
		// Object.keys(c.name2code).forEach(function(name){
		// });
	// });
}
/**
 * キーのトリガを解除
 */
function keyUntrig(){
	var enabled = true, i, j, c, indexes = Object.keys(allcontrolls), len = indexes.length, codes, clen, cindex;
	for(i = 0; i < len; i++){
		c = allcontrolls[indexes[i]];
		codes = c.name2code;
		cindex =  Object.keys(codes);
		clen = cindex.length;
		for(j = 0; j < clen; j++){
			c.untrig(codes[cindex[j]]);
		}
	}
}

/**
 * キー操作クラス
 * @param idname
 * @returns
 */
function KeyControll(){return;}
KeyControll.prototype = {
	initCommon: function(idname){
		this.controlls = {};//操作名に対する状態
		this.code2name = {};//codeに対応する操作名
		this.name2code = {};//操作名に対応するcode
		this.idname = idname == null ? allcontrolls.length : idname;
		this.action; //カスタム関数
		allcontrolls[this.idname] = this;
		try{
			this.holdTime = KEYCONTROLL_HOLDTIME;
		}catch(e){
			this.holdTime = 20;
			console.warn(e);
			console.log('key controll set hold on time: 20');
		}		
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

	/**
	 * キーが押された瞬間の挙動
	 * @param code
	 */
	stateDown: function(code)
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
		}

	},

	/**
	 * キーを離した瞬間の挙動
	 * @param code
	 */
	stateUp: function(code)
	{
		var controll = this.code2name[code];
		this.controlls[controll].off = true;
		this.controlls[controll].state = false;
		this.controlls[controll].trig = false;

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
		var idnamename, states = {};
		for(idname in this.code2name){
			this.stateUp(idname);
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
		if(typeof name == "object"){
			var states = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length;
			for(i = 0; i < len; i++){
				n = name[i];
				states[n] = cont[n].state;
			}
			return states;
			// name.forEach(function(n, i){
			// }, this);
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
		if(typeof name == "object"){
			var trigs = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length;
			for(i = 0; i < len; i++){
				n = name[i];
				trigs[n] = cont[n].trig;
			}
			// var trigs = {};
			// name.forEach(function(n, i){
				// trigs[n] = this.controlls[n].trig;
			// }, this);
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
		if(typeof name == "object"){
			var unTrigs = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length;
			for(i = 0; i < len; i++){
				n = name[i];
				unTrigs[n] = cont[n].off;
			}
			// var unTrigs = {};
			// name.forEach(function(n, i){
				// unTrigs[n] = this.controlls[n].off;
			// }, this);
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
		if(typeof name == "object"){
			var holds = {}, cont = this.controlls, nIndex = Object.keys(name), len = nIndex.length;
			for(i = 0; i < len; i++){
				n = name[i];
				holds[n] = cont[n].hold;
			}
			// var holds = {};
			// name.forEach(function(n, i){
				// holds[n] = this.controlls[n].hold;
			// }, this);
			return holds;
		}else{
			return this.controlls[name].hold;
		}
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
			l: false,
			m: false,
			r: false,
		};
		this.trig = {
			l: false,
			m: false,
			r: false,
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
	
	initTappables: function()
	{
		var self = this
			, tsfunc = function(e){
				var pos = self.getClientPos(e);
				self.button = 'common';
				switch(e.which){
					case 1: self.state.l = true; self.button = 'left'; break;
					case 2: self.state.m = true; self.button = 'middle'; break;
					case 3: self.state.r = true; self.button = 'right'; break;
				}
				self.tapStartEvent(pos.x, pos.y, e);
				self.button = null;
				e.preventDefault();
				return false;
			}
			, tefunc = function(e){
				var pos = self.getClientPos(e);
				self.button = 'common';
				switch(e.which){
					case 1: self.state.l = false; self.button = 'left'; break;
					case 2: self.state.m = false; self.button = 'middle'; break;
					case 3: self.state.r = false; self.button = 'right'; break;
				}
				self.tapEndEvent(pos.x, pos.y, e);
				self.button = null;
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
				}
				self.tapMoveEvent(pos.x, pos.y, e);
				self.button = null;
				e.preventDefault();
				return false;
			}
			, scr = this.screenScroll
			;
		
		scr.canvas.addEventListener('mousemove', mvfunc, false);
		scr.canvas.addEventListener('touchmove', mvfunc, false);
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
		pos = this.tapStartPos[b];
		pos.x = x;
		pos.y = y;
		this.tapMovePos[b].x = x;
		this.tapMovePos[b].y = y;
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
		pos.x = -1;
		pos.y = -1;
		this.tapMovePos[b].x = x;
		this.tapMovePos[b].y = y;
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
		mpos.x = x;
		mpos.y = y;
		
	},
};
